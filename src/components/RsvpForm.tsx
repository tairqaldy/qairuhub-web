import { useCallback, useState } from 'react'
import { Field, Honeypot, Turnstile, useSubmit } from './form-kit'

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
	const [token, setToken] = useState('')
	const onToken = useCallback((value: string) => setToken(value), [])

	if (state.status === 'success') {
		return (
			<div className="rsvp-done" role="status">
				<p className="d5">You are on the list.</p>
				<p className="small rsvp-done__body">
					We have your place for {eventTitle}. If you cannot make it, reply to the confirmation
					email so someone else can take the spot.
				</p>
			</div>
		)
	}

	return (
		<form
			className="rsvp"
			noValidate
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

			{state.status === 'error' && state.message && (
				<p className="field__error m-note" role="alert">
					{state.message}
				</p>
			)}

			<button
				className="cta-primary m-button rsvp__submit"
				type="submit"
				disabled={state.status === 'submitting' || !token}
			>
				{state.status === 'submitting' ? 'Sending…' : 'Reserve'}
			</button>

			{!token && (
				<p className="m-note" role="status">
					Complete the check above to enable the button.
				</p>
			)}
		</form>
	)
}
