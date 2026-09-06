import { z } from 'astro/zod'

/**
 * Validation schemas shared by the client islands and the Worker endpoints.
 *
 * Client-side validation is a convenience; the server re-validates everything.
 * Keeping one schema means the two can never drift apart.
 */

/** Trim, and treat an empty string as absent rather than as a value. */
const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.optional()
		.transform((value) => (value ? value : undefined))

/**
 * A field no human ever sees. Bots fill in every input they find, so any value
 * here means the submission is automated.
 */
const honeypot = z.string().max(0, 'rejected').optional().or(z.literal(''))

const contactable = {
	name: z.string().trim().min(2, 'Please give your full name.').max(80),
	email: z.email('That does not look like an email address.').max(160),
	telegram: optionalText(40),
	turnstileToken: z.string().min(1, 'Please complete the anti-spam check.'),
	website: honeypot,
}

/** Membership: the main funnel, open continuously. */
export const membershipSchema = z.object({
	...contactable,
	/** Year of study, kept as free text — programmes vary. */
	studyYear: optionalText(40),
	links: optionalText(300),
	motivation: z
		.string()
		.trim()
		.min(40, 'Tell us a bit more — at least a couple of sentences.')
		.max(1500),
	interests: z.array(z.string().max(40)).max(8).default([]),
})

/** Accelerator: for teams that already have something running. */
export const acceleratorSchema = z.object({
	...contactable,
	projectName: z.string().trim().min(2).max(80),
	teamSize: z.coerce.number().int().min(1).max(20),
	repo: z.url().optional().or(z.literal('')),
	demo: z.url().optional().or(z.literal('')),
	stage: z.enum(['idea', 'prototype', 'launched']),
	pitch: z.string().trim().min(40, 'Describe what you have built so far.').max(2000),
})

/** Hackathon: per event, so it carries the event slug. */
export const hackathonSchema = z.object({
	...contactable,
	eventSlug: z.string().trim().min(1).max(120),
	teamName: optionalText(80),
	experience: z.enum(['first-time', 'some', 'experienced']),
	notes: optionalText(800),
})

/** RSVP: the lightest form on the site. Keep it that way. */
export const rsvpSchema = z.object({
	name: contactable.name,
	email: contactable.email,
	telegram: contactable.telegram,
	turnstileToken: contactable.turnstileToken,
	website: honeypot,
	eventSlug: z.string().trim().min(1).max(120),
})

/** General contact, including partnership enquiries. */
export const contactSchema = z.object({
	...contactable,
	organisation: optionalText(120),
	topic: z.enum(['partnership', 'press', 'joining', 'other']),
	message: z.string().trim().min(20, 'A sentence or two, please.').max(2000),
})

export type MembershipInput = z.infer<typeof membershipSchema>
export type AcceleratorInput = z.infer<typeof acceleratorSchema>
export type HackathonInput = z.infer<typeof hackathonSchema>
export type RsvpInput = z.infer<typeof rsvpSchema>
export type ContactInput = z.infer<typeof contactSchema>

export const FORM_SCHEMAS = {
	membership: membershipSchema,
	accelerator: acceleratorSchema,
	hackathon: hackathonSchema,
	rsvp: rsvpSchema,
	contact: contactSchema,
} as const

export type FormKind = keyof typeof FORM_SCHEMAS

/** Field-level errors keyed by field name, ready to render next to inputs. */
export type FieldErrors = Record<string, string>

/** Flatten a Zod v4 error into one message per field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
	const errors: FieldErrors = {}
	for (const issue of error.issues) {
		const key = issue.path.join('.') || 'form'
		if (!errors[key]) errors[key] = issue.message
	}
	return errors
}
