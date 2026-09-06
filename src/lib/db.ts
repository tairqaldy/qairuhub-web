/**
 * D1 access for form submissions.
 *
 * Notes on D1 that shape this file:
 *  - Placeholders are positional `?`. Named `:params` are not supported.
 *  - `batch()` is the only transaction primitive — you cannot send BEGIN/COMMIT
 *    through the binding.
 *  - `exec()` takes no bindings and is for schema work only. User input always
 *    goes through `prepare().bind()`.
 */

import type { FormKind } from './forms'

export interface SubmissionRow {
	id: string
	kind: FormKind
	name: string
	email: string
	telegram: string | null
	payload: string
	event_slug: string | null
	status: 'new' | 'reviewing' | 'accepted' | 'declined' | 'spam'
	country: string | null
	user_agent: string | null
	created_at: string
	reviewed_at: string | null
	notes: string | null
}

export interface NewSubmission {
	kind: FormKind
	name: string
	email: string
	telegram?: string
	payload: Record<string, unknown>
	eventSlug?: string
	country?: string
	userAgent?: string
}

export class DuplicateSubmissionError extends Error {
	constructor() {
		super('This form has already been submitted with that email address.')
		this.name = 'DuplicateSubmissionError'
	}
}

/**
 * Insert a submission.
 *
 * @returns the new row's id
 * @throws DuplicateSubmissionError if the unique index rejects it
 */
export async function insertSubmission(db: D1Database, input: NewSubmission): Promise<string> {
	const id = crypto.randomUUID()
	try {
		await db
			.prepare(
				`INSERT INTO submissions
				   (id, kind, name, email, telegram, payload, event_slug, country, user_agent)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				id,
				input.kind,
				input.name,
				input.email.toLowerCase(),
				input.telegram ?? null,
				JSON.stringify(input.payload),
				input.eventSlug ?? null,
				input.country ?? null,
				input.userAgent?.slice(0, 300) ?? null,
			)
			.run()
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		if (/UNIQUE constraint failed/i.test(message)) throw new DuplicateSubmissionError()
		throw error
	}
	return id
}

/**
 * A fixed-window rate limiter backed by D1.
 *
 * Coarse by design: it exists to stop a script hammering the endpoint, not to
 * be a precise quota. The bucket is a hash of the caller's IP so no address is
 * ever written to the database.
 *
 * @returns true when the request is within the limit
 */
export async function checkRateLimit(
	db: D1Database,
	bucketSeed: string,
	{ limit = 5, windowSeconds = 600 }: { limit?: number; windowSeconds?: number } = {},
): Promise<boolean> {
	const bucket = await hashBucket(bucketSeed)
	const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds

	// Upsert then read back, so concurrent requests cannot both see a stale count.
	const row = await db
		.prepare(
			`INSERT INTO rate_limits (bucket, window_start, hits)
			 VALUES (?, ?, 1)
			 ON CONFLICT (bucket, window_start)
			 DO UPDATE SET hits = hits + 1
			 RETURNING hits`,
		)
		.bind(bucket, windowStart)
		.first<{ hits: number }>()

	return (row?.hits ?? 1) <= limit
}

/** Delete rate-limit rows from windows that have already closed. */
export async function pruneRateLimits(db: D1Database, olderThanSeconds = 3600): Promise<void> {
	const cutoff = Math.floor(Date.now() / 1000) - olderThanSeconds
	await db.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(cutoff).run()
}

/** SHA-256 of the seed, hex-encoded, so raw IPs are never stored. */
async function hashBucket(seed: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed))
	return [...new Uint8Array(digest)]
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('')
		.slice(0, 32)
}

/** Recent submissions for the admin view, newest first. */
export async function listSubmissions(
	db: D1Database,
	{ kind, limit = 100 }: { kind?: FormKind; limit?: number } = {},
): Promise<SubmissionRow[]> {
	const query = kind
		? db
				.prepare('SELECT * FROM submissions WHERE kind = ? ORDER BY created_at DESC LIMIT ?')
				.bind(kind, limit)
		: db.prepare('SELECT * FROM submissions ORDER BY created_at DESC LIMIT ?').bind(limit)

	const { results } = await query.all<SubmissionRow>()
	return results ?? []
}

/** How many people have signed up for one event. */
export async function countForEvent(db: D1Database, eventSlug: string): Promise<number> {
	const row = await db
		.prepare("SELECT COUNT(*) AS n FROM submissions WHERE event_slug = ? AND status != 'spam'")
		.bind(eventSlug)
		.first<{ n: number }>()
	return row?.n ?? 0
}
