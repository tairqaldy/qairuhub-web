import { useCallback, useRef, useState } from 'react'
import type { FormKind } from '../lib/forms'
import { ErrorSummary, Field, Honeypot, Turnstile, useSubmit } from './form-kit'

/**
 * The application forms: membership, accelerator, hackathon, and contact.
 *
 * One component rather than four near-identical ones. The fields differ but the
 * submission mechanics — Turnstile lifecycle, per-field errors, the success
 * state — are the same, and duplicating them four times is how they drift.
 */

type Variant = Extract<FormKind, 'membership' | 'accelerator' | 'hackathon' | 'contact'>

const SUCCESS: Record<Variant, { title: string; body: string }> = {
	membership: {
		title: 'Application received.',
		body: 'We read applications weekly and reply either way. In the meantime, the Friday sessions are open — you do not have to wait for an answer to turn up.',
	},
	accelerator: {
		title: 'Application received.',
		body: 'We will be in touch before the cohort opens. If your prototype changes substantially in the meantime, send us the new link.',
	},
	hackathon: {
		title: 'You are signed up.',
		body: 'Details and the room go out by email a few days before. Bring a laptop and a charger.',
	},
	contact: {
		title: 'Message sent.',
		body: 'Someone from the core team will reply. For anything time-sensitive, the Telegram group is faster.',
	},
}

/**
 * The steps differ per form. Showing a contact message the membership
 * application ladder ("we invite you to a session to meet people") describes
 * something that is simply not going to happen.
 */
const NEXT_STEPS: Record<Variant, string[]> = {
	membership: [
		'We read it. Every application gets a human reply.',
		'If it is a fit, we invite you to a session to meet people.',
		'You pick something to work on and start.',
	],
	accelerator: [
		'We read it and look at whatever you linked.',
		'We talk to the teams that fit, before the cohort opens.',
		'Selected teams start with a kickoff and a deadline.',
	],
	hackathon: [
		'You are on the list for this one.',
		'Details and the room go out by email a few days before.',
		'Turn up with a laptop. Teams form on the day.',
	],
	contact: [
		'Someone from the core team reads it.',
		'You get a reply at the address you gave.',
		'For anything faster, the Telegram group is the better route.',
	],
}

export default function ApplyForm({
	variant,
	eventSlug,
}: {
	variant: Variant
	/** Required for hackathon signups, so the entry is tied to its event. */
	eventSlug?: string
}) {
	const { state, submit, resetSignal } = useSubmit(variant)
	const formRef = useRef<HTMLFormElement>(null)
	const [token, setToken] = useState('')
	const onToken = useCallback((value: string) => setToken(value), [])

	/** Move the keyboard to the first control the server rejected. */
	const focusFirstInvalid = useCallback(() => {
		formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
	}, [])

	if (state.status === 'success') {
		const copy = SUCCESS[variant]
		return (
			<div className="done" role="status">
				<p className="m-eyebrow">Received</p>
				<p className="d3 done__title">{copy.title}</p>
				<p className="body done__body">{copy.body}</p>
				<p className="m-eyebrow done__next-heading">What happens next</p>
				<ol className="done__next">
					{NEXT_STEPS[variant].map((step, i) => (
						<li className="small" key={step}>
							{String(i + 1).padStart(2, '0')} — {step}
						</li>
					))}
				</ol>
			</div>
		)
	}

	const busy = state.status === 'submitting'

	return (
		<form
			className="apply"
			noValidate
			ref={formRef}
			onSubmit={(event) => {
				event.preventDefault()
				const form = new FormData(event.currentTarget)
				const values = Object.fromEntries(form.entries()) as Record<string, unknown>
				if (eventSlug) values.eventSlug = eventSlug
				values.turnstileToken = token
				submit(values)
			}}
		>
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
				hint="Most of our day-to-day happens there."
				error={state.errors.telegram}
			/>

			{variant === 'membership' && (
				<>
					<Field
						label="Year and faculty"
						name="studyYear"
						hint="For example: second year, computer science."
						error={state.errors.studyYear}
					/>
					<Field
						label="Links"
						name="links"
						hint="GitHub, a project, anything you have made. Nothing is fine too."
						error={state.errors.links}
					/>
					<Field
						label="What do you want to build?"
						name="motivation"
						rows={6}
						required
						hint="A couple of paragraphs. Be specific rather than impressive — we are not marking this."
						error={state.errors.motivation}
					/>
				</>
			)}

			{variant === 'accelerator' && (
				<>
					<Field
						label="Project name"
						name="projectName"
						required
						error={state.errors.projectName}
					/>
					<Field
						label="Team size"
						name="teamSize"
						type="number"
						min={1}
						max={20}
						required
						error={state.errors.teamSize}
					/>
					<Field label="Repository" name="repo" type="url" error={state.errors.repo} />
					<Field label="Demo" name="demo" type="url" error={state.errors.demo} />
					<Field
						label="Stage"
						name="stage"
						required
						error={state.errors.stage}
						options={[
							{ value: 'idea', label: 'Idea' },
							{ value: 'prototype', label: 'Prototype' },
							{ value: 'launched', label: 'Launched' },
						]}
					/>
					<Field
						label="What have you built so far?"
						name="pitch"
						rows={6}
						required
						hint="What works today, what does not, and what you would do with eight weeks."
						error={state.errors.pitch}
					/>
				</>
			)}

			{variant === 'hackathon' && (
				<>
					<Field label="Team name" name="teamName" error={state.errors.teamName} />
					<Field
						label="Experience"
						name="experience"
						required
						error={state.errors.experience}
						options={[
							{ value: 'first-time', label: 'This would be my first' },
							{ value: 'some', label: 'I have done one or two' },
							{ value: 'experienced', label: 'I have done several' },
						]}
					/>
					<Field
						label="Anything we should know?"
						name="notes"
						rows={4}
						hint="Dietary requirements, accessibility needs, or who you want to be on a team with."
						error={state.errors.notes}
					/>
				</>
			)}

			{variant === 'contact' && (
				<>
					<Field label="Organisation" name="organisation" error={state.errors.organisation} />
					<Field
						label="Topic"
						name="topic"
						required
						error={state.errors.topic}
						options={[
							{ value: 'partnership', label: 'Partnership or sponsorship' },
							{ value: 'joining', label: 'Joining QairuHub' },
							{ value: 'press', label: 'Press' },
							{ value: 'other', label: 'Something else' },
						]}
					/>
					<Field label="Message" name="message" rows={6} required error={state.errors.message} />
				</>
			)}

			<Honeypot />

			<div className="apply__check">
				<Turnstile onToken={onToken} resetSignal={resetSignal} />
			</div>

			{/*
			  aria-disabled rather than disabled: a disabled control cannot hold
			  focus, so disabling the button the instant it is pressed drops the
			  keyboard to the top of the document. It also keeps the control in
			  the tab order, so it can still be found and its state read.
			*/}
			<button
				className="cta-primary m-button apply__submit"
				type="submit"
				aria-disabled={busy || !token}
				onClick={(event) => {
					if (busy || !token) event.preventDefault()
				}}
			>
				{busy ? 'Sending…' : 'Send'}
			</button>

			<p className="m-note" aria-live="polite">
				{busy
					? 'Sending your application…'
					: token
						? ''
						: 'Complete the anti-spam check above, then this button will send.'}
			</p>
		</form>
	)
}
