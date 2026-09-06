import { useCallback, useRef, useState } from 'react'
import { ErrorSummary, Field, Honeypot, Turnstile, useSubmit } from './form-kit'

/**
 * The lightest form on the site: name, email, and the event. Anything more is
 * friction on a free student event.
 */
export default function RsvpForm({
	eventSlug,
	eventTitle,
}: {
	eventSlug: string
	eventTitle: string
}) {
	const { state, submit, resetSignal } = useSubmit('rsvp')
	const formRef = useRef<HTMLFormElement>(null)
	const [token, setToken] = useState('')
	const onToken = useCallback((value: string) => setToken(value), [])

	/** Move the keyboard to the first control the server rejected. */
	const focusFirstInvalid = useCallback(() => {
		formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
	}, [])

	if (state.status === 'success') {
		return (
			<div className="rsvp-done" role="status">
				<p className="d5">You are on the list.</p>
				<p className="small rsvp-done__body">
					We have your place for {eventTitle}. If you cannot make it, let us know in the Telegram
					group so someone else can take the spot.
				</p>
			</div>
		)
	}

	return (
		<form
			className="rsvp"
			noValidate
			ref={formRef}
			onSubmit={(event) => {
				event.preventDefault()
				const form = new FormData(event.currentTarget)
				submit({
					name: form.get('name'),
					email: form.get('email'),
					telegram: form.get('telegram'),
					website: form.get('website'),
					eventSlug,
					turnstileToken: token,
				})
			}}
		>
			<h2 className="m-eyebrow rsvp__heading">Reserve a place</h2>

			{state.status === 'error' && state.message && (
				<ErrorSummary message={state.message} errors={state.errors} onJump={focusFirstInvalid} />
			)}

			<Field label="Name" name="name" required autoComplete="name" error={state.errors.name} />
			<Field
				label="Email"
				name="email"
				type="email"
				required
				autoComplete="email"
				error={state.errors.email}
			/>
			<Field
				label="Telegram"
				name="telegram"
				hint="So we can reach you if the room changes."
				error={state.errors.telegram}
			/>

			<Honeypot />
			<Turnstile onToken={onToken} resetSignal={resetSignal} />

			{/* See ApplyForm: aria-disabled preserves focus and tab order. */}
			<button
				className="cta-primary m-button rsvp__submit"
				type="submit"
				aria-disabled={state.status === 'submitting' || !token}
				onClick={(event) => {
					if (state.status === 'submitting' || !token) event.preventDefault()
				}}
			>
				{state.status === 'submitting' ? 'Sending…' : 'Reserve'}
			</button>

			<p className="m-note" aria-live="polite">
				{state.status === 'submitting'
					? 'Sending…'
					: token
						? ''
						: 'Complete the anti-spam check above, then this button will send.'}
			</p>
		</form>
	)
}
