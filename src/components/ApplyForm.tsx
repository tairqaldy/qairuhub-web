import { useCallback, useState } from 'react'
import type { FormKind } from '../lib/forms'
import { Field, Honeypot, Turnstile, useSubmit } from './form-kit'

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

export default function ApplyForm({
	variant,
	eventSlug,
}: {
	variant: Variant
	/** Required for hackathon signups, so the entry is tied to its event. */
	eventSlug?: string
}) {
	const { state, submit, resetSignal } = useSubmit(variant)
	const [token, setToken] = useState('')
	const onToken = useCallback((value: string) => setToken(value), [])

	if (state.status === 'success') {
		const copy = SUCCESS[variant]
		return (
			<div className="done" role="status">
				<p className="m-eyebrow">Received</p>
				<p className="d3 done__title">{copy.title}</p>
				<p className="body done__body">{copy.body}</p>
				<p className="m-eyebrow done__next-heading">What happens next</p>
				<ol className="done__next">
					<li className="small">01 — We read it. Every application gets a human reply.</li>
					<li className="small">02 — If it is a fit, we invite you to a session to meet people.</li>
					<li className="small">03 — You pick something to work on and start.</li>
				</ol>
			</div>
		)
	}

	const busy = state.status === 'submitting'

	return (
		<form
			className="apply"
			noValidate
			onSubmit={(event) => {
				event.preventDefault()
				const form = new FormData(event.currentTarget)
				const values = Object.fromEntries(form.entries()) as Record<string, unknown>
				if (eventSlug) values.eventSlug = eventSlug
				values.turnstileToken = token
				submit(values)
			}}
		>
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

			{state.status === 'error' && state.message && (
				<p className="field__error m-note apply__alert" role="alert">
					{state.message}
				</p>
			)}

			<button
				className="cta-primary m-button apply__submit"
				type="submit"
				disabled={busy || !token}
			>
				{busy ? 'Sending…' : 'Send'}
			</button>

			{!token && (
				<p className="m-note" role="status">
					Complete the check above to enable the button.
				</p>
			)}
		</form>
	)
}
