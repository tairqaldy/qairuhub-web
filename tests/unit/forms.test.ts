import { describe, expect, it } from 'vitest'
import {
	contactSchema,
	FORM_SCHEMAS,
	membershipSchema,
	rsvpSchema,
	toFieldErrors,
} from '../../src/lib/forms'

/**
 * These schemas are the only thing standing between the public internet and the
 * database, and the same objects validate on the client. Both sides depend on
 * the behaviour asserted here.
 */

const validMembership = {
	name: 'Aigerim Zhaksybek',
	email: 'aigerim@example.kz',
	turnstileToken: 'token',
	motivation:
		'I want to build a tool that helps students find lab partners, and I have been learning TypeScript for a year.',
}

describe('membership schema', () => {
	it('accepts a complete submission', () => {
		const result = membershipSchema.safeParse(validMembership)
		expect(result.success).toBe(true)
	})

	it('accepts Kazakh and Russian names', () => {
		for (const name of ['Әсел Мұқанова', 'Дмитрий Ковалёв', 'Ұлан Сағындықұлы']) {
			const result = membershipSchema.safeParse({ ...validMembership, name })
			expect(result.success, `rejected ${name}`).toBe(true)
		}
	})

	it('rejects a motivation that is too short to be useful', () => {
		const result = membershipSchema.safeParse({ ...validMembership, motivation: 'i want join' })
		expect(result.success).toBe(false)
	})

	it('rejects a malformed email', () => {
		const result = membershipSchema.safeParse({ ...validMembership, email: 'aigerim@' })
		expect(result.success).toBe(false)
	})

	it('requires a Turnstile token', () => {
		const { turnstileToken: _omitted, ...withoutToken } = validMembership
		const result = membershipSchema.safeParse(withoutToken)
		expect(result.success).toBe(false)
	})

	it('trims surrounding whitespace from names', () => {
		const result = membershipSchema.safeParse({ ...validMembership, name: '  Aigerim  ' })
		expect(result.success && result.data.name).toBe('Aigerim')
	})

	it('treats an empty optional field as absent rather than as an empty string', () => {
		const result = membershipSchema.safeParse({ ...validMembership, telegram: '' })
		expect(result.success && result.data.telegram).toBeUndefined()
	})
})

describe('honeypot', () => {
	it('rejects a submission where the hidden field was filled in', () => {
		const result = membershipSchema.safeParse({
			...validMembership,
			website: 'http://spam.example',
		})
		expect(result.success).toBe(false)
	})

	it('allows the hidden field to be absent or empty, which is what a person sends', () => {
		expect(membershipSchema.safeParse(validMembership).success).toBe(true)
		expect(membershipSchema.safeParse({ ...validMembership, website: '' }).success).toBe(true)
	})
})

describe('rsvp schema', () => {
	it('stays minimal — name, email and the event are enough', () => {
		const result = rsvpSchema.safeParse({
			name: 'Nurlan A.',
			email: 'nurlan@example.kz',
			turnstileToken: 'token',
			eventSlug: 'example-ai-friday',
		})
		expect(result.success).toBe(true)
	})

	it('requires the event slug so an RSVP cannot be orphaned', () => {
		const result = rsvpSchema.safeParse({
			name: 'Nurlan A.',
			email: 'nurlan@example.kz',
			turnstileToken: 'token',
		})
		expect(result.success).toBe(false)
	})
})

describe('contact schema', () => {
	it('constrains topic to the known set', () => {
		const base = {
			name: 'Partner Org',
			email: 'hello@example.org',
			turnstileToken: 'token',
			message: 'We would like to talk about sponsoring a hackathon this term.',
		}
		expect(contactSchema.safeParse({ ...base, topic: 'partnership' }).success).toBe(true)
		expect(contactSchema.safeParse({ ...base, topic: 'anything-else' }).success).toBe(false)
	})
})

describe('every form kind', () => {
	it('requires a Turnstile token, so no form can be submitted unchecked', () => {
		for (const [kind, schema] of Object.entries(FORM_SCHEMAS)) {
			const result = schema.safeParse({ name: 'A Person', email: 'a@example.com' })
			expect(result.success, `${kind} parsed without a token`).toBe(false)
			const errors = result.success ? {} : toFieldErrors(result.error)
			expect(Object.keys(errors), `${kind} did not flag the token`).toContain('turnstileToken')
		}
	})
})

describe('toFieldErrors', () => {
	it('returns one message per field, keyed by field name', () => {
		const result = membershipSchema.safeParse({ name: 'A', email: 'nope', turnstileToken: '' })
		expect(result.success).toBe(false)
		if (result.success) return

		const errors = toFieldErrors(result.error)
		expect(errors.name).toBeTruthy()
		expect(errors.email).toBeTruthy()
		expect(Object.values(errors).every((message) => typeof message === 'string')).toBe(true)
	})
})

describe('error messages', () => {
	it('never leaks a raw validator message to the reader', () => {
		// A missing field triggers a type error, not a length error, and Zod's
		// default text for that is "expected string, received undefined".
		const result = membershipSchema.safeParse({})
		expect(result.success).toBe(false)
		if (result.success) return

		const messages = Object.values(toFieldErrors(result.error))
		expect(messages.length).toBeGreaterThan(0)
		for (const message of messages) {
			expect(message, `raw validator text leaked: ${message}`).not.toMatch(
				/expected \w+, received|invalid_type|invalid input:/i,
			)
			// Every message should read as a sentence addressed to a person.
			expect(message[0]).toBe(message[0].toUpperCase())
		}
	})
})
