import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { FieldErrors, FormKind } from '../lib/forms'

/**
 * Shared pieces for the three form islands.
 *
 * These are the only React on the site, and they are here because a form needs
 * client state: per-field errors, a submitting state, and the Turnstile widget's
 * lifecycle. Everything else is static Astro.
 */

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

declare global {
	interface Window {
		turnstile?: {
			render: (
				el: HTMLElement,
				options: {
					sitekey: string
					theme?: 'auto' | 'light' | 'dark'
					callback: (token: string) => void
					'expired-callback'?: () => void
					'error-callback'?: () => void
				},
			) => string
			reset: (id?: string) => void
			remove: (id?: string) => void
		}
	}
}

let scriptPromise: Promise<void> | null = null

/** Load the Turnstile script once, however many forms are on the page. */
function loadTurnstile(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve()
	if (window.turnstile) return Promise.resolve()
	if (scriptPromise) return scriptPromise

	scriptPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = TURNSTILE_SRC
		script.async = true
		script.defer = true
		script.onload = () => resolve()
		script.onerror = () => reject(new Error('Turnstile failed to load'))
		document.head.appendChild(script)
	})
	return scriptPromise
}

/**
 * The anti-spam widget.
 *
 * A token is single-use and expires after about five minutes, so the widget
 * resets itself after every submission — otherwise a second attempt fails with
 * `timeout-or-duplicate` and the user sees an error they cannot act on.
 */
export function Turnstile({
	onToken,
	resetSignal,
}: {
	onToken: (token: string) => void
	/** Increment to force a fresh challenge. */
	resetSignal: number
}) {
	const ref = useRef<HTMLDivElement>(null)
	const widgetId = useRef<string | null>(null)
	const [failed, setFailed] = useState(false)

	/*
	 * Cloudflare's documented always-passes test sitekey, used only in dev.
	 * Without this a contributor who has not set up a Turnstile account sees a
	 * dead form and cannot test the flow at all. In production an unset key
	 * disables the form rather than silently accepting unchecked submissions.
	 */
	const configured = import.meta.env.PUBLIC_TURNSTILE_SITEKEY as string | undefined
	const sitekey = configured ?? (import.meta.env.DEV ? '1x00000000000000000000AA' : undefined)

	useEffect(() => {
		if (!ref.current || !sitekey) return
		let cancelled = false

		loadTurnstile()
			.then(() => {
				if (cancelled || !ref.current || !window.turnstile) return
				widgetId.current = window.turnstile.render(ref.current, {
					sitekey,
					theme: 'auto',
					callback: onToken,
					'expired-callback': () => onToken(''),
					'error-callback': () => setFailed(true),
				})
			})
			.catch(() => setFailed(true))

		return () => {
			cancelled = true
			if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
			widgetId.current = null
		}
	}, [sitekey, onToken])

	useEffect(() => {
		if (resetSignal > 0 && widgetId.current && window.turnstile) {
			window.turnstile.reset(widgetId.current)
			onToken('')
		}
	}, [resetSignal, onToken])

	if (!sitekey) {
		return (
			<p className="m-note" role="status">
				Anti-spam check is not configured, so this form cannot be submitted yet.
			</p>
		)
	}

	if (failed) {
		return (
			<p className="field__error m-note" role="alert">
				The anti-spam check could not load. Check your connection and reload the page.
			</p>
		)
	}

	return <div ref={ref} />
}

/** A labelled input with its error wired up for screen readers. */
export function Field({
	label,
	name,
	error,
	hint,
	type = 'text',
	required,
	rows,
	options,
	...rest
}: {
	label: string
	name: string
	error?: string
	hint?: string
	type?: string
	required?: boolean
	rows?: number
	options?: { value: string; label: string }[]
	[key: string]: unknown
}) {
	const id = useId()
	const errorId = `${id}-error`
	const hintId = `${id}-hint`
	const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

	const shared = {
		id,
		name,
		required,
		className: 'field__input',
		'aria-invalid': error ? true : undefined,
		'aria-describedby': describedBy || undefined,
		...rest,
	}

	return (
		<p className="field">
			<label className="field__label m-label" htmlFor={id}>
				{label}
				{!required && <span className="field__optional"> — optional</span>}
			</label>

			{hint && (
				<span className="m-note field__hint" id={hintId}>
					{hint}
				</span>
			)}

			{options ? (
				// biome-ignore lint/a11y/useSemanticElements: this IS the select element
				<select {...shared}>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			) : rows ? (
				<textarea {...shared} rows={rows} />
			) : (
				<input {...shared} type={type} />
			)}

			{error && (
				<strong className="field__error m-note" id={errorId}>
					{error}
				</strong>
			)}
		</p>
	)
}

/** The hidden field bots fill in and people never see. */
export function Honeypot() {
	return (
		<div className="honeypot" aria-hidden="true">
			<label htmlFor="website-url">Leave this field empty</label>
			<input id="website-url" name="website" type="text" tabIndex={-1} autoComplete="off" />
		</div>
	)
}

export interface SubmitState {
	status: 'idle' | 'submitting' | 'success' | 'error'
	message?: string
	errors: FieldErrors
}

/**
 * Posts a form to the Worker and normalises the outcome.
 *
 * Field errors come back keyed by field name so each one can be rendered beside
 * its input rather than in a summary the user has to map back themselves.
 */
export function useSubmit(kind: FormKind) {
	const [state, setState] = useState<SubmitState>({ status: 'idle', errors: {} })
	const [resetSignal, setResetSignal] = useState(0)

	const submit = useCallback(
		async (values: Record<string, unknown>) => {
			setState({ status: 'submitting', errors: {} })
			try {
				const response = await fetch(`/api/submit/${kind}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(values),
				})
				const body = (await response.json().catch(() => ({}))) as {
					ok?: boolean
					message?: string
					errors?: FieldErrors
				}

				if (response.ok && body.ok) {
					setState({ status: 'success', errors: {} })
					return true
				}

				// A used token cannot be replayed, so always demand a fresh challenge.
				setResetSignal((n) => n + 1)
				setState({
					status: 'error',
					message: body.message ?? 'Something went wrong. Please try again.',
					errors: body.errors ?? {},
				})
				return false
			} catch {
				setResetSignal((n) => n + 1)
				setState({
					status: 'error',
					message: 'Could not reach the server. Check your connection and try again.',
					errors: {},
				})
				return false
			}
		},
		[kind],
	)

	return { state, submit, resetSignal }
}
