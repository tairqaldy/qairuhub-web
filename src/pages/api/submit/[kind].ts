import { env } from 'cloudflare:workers'
import type { APIContext } from 'astro'
import { checkRateLimit, DuplicateSubmissionError, insertSubmission } from '../../../lib/db'
import { FORM_SCHEMAS, type FormKind, toFieldErrors } from '../../../lib/forms'
import { notify } from '../../../lib/notify'
import { verifyTurnstile } from '../../../lib/turnstile'

/**
 * The single endpoint behind every form on the site.
 *
 * POST /api/submit/membership | accelerator | hackathon | rsvp | contact
 *
 * Order matters. Cheap rejections come first so an abusive client costs us as
 * little as possible, and the expensive network call to Turnstile only happens
 * for requests that already look plausible:
 *
 *   1. known form kind
 *   2. honeypot and schema validation      (free)
 *   3. rate limit                          (one indexed D1 write)
 *   4. Turnstile verification              (one outbound request)
 *   5. insert
 *   6. notify, after the response, via waitUntil
 *
 * This route must not be prerendered — a fully static build ships no Worker at
 * all, and the endpoint would silently not exist.
 */
export const prerender = false

interface ErrorBody {
	ok: false
	message: string
	errors?: Record<string, string>
}

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	})

const fail = (message: string, status: number, errors?: Record<string, string>) =>
	json({ ok: false, message, errors } satisfies ErrorBody, status)

/** Human-readable labels used in the notification, per form kind. */
const KIND_LABELS: Record<FormKind, string> = {
	membership: 'Membership application',
	accelerator: 'Accelerator application',
	hackathon: 'Hackathon signup',
	rsvp: 'Event RSVP',
	contact: 'Contact message',
}

export async function POST(context: APIContext): Promise<Response> {
	const kind = context.params.kind as FormKind | undefined
	if (!kind || !(kind in FORM_SCHEMAS)) {
		return fail('Unknown form.', 404)
	}

	// Accept both a normal form post and a JSON fetch from the island.
	let raw: Record<string, unknown>
	const contentType = context.request.headers.get('content-type') ?? ''
	try {
		if (contentType.includes('application/json')) {
			raw = (await context.request.json()) as Record<string, unknown>
		} else {
			const form = await context.request.formData()
			raw = Object.fromEntries(form.entries())
			// The widget names its field `cf-turnstile-response`.
			if (form.has('cf-turnstile-response')) {
				raw.turnstileToken = form.get('cf-turnstile-response')
			}
		}
	} catch {
		return fail('Could not read that submission.', 400)
	}

	// A filled honeypot means a bot. Answer 200 so it learns nothing.
	if (typeof raw.website === 'string' && raw.website.length > 0) {
		return json({ ok: true })
	}

	const parsed = FORM_SCHEMAS[kind].safeParse(raw)
	if (!parsed.success) {
		return fail('Please check the highlighted fields.', 422, toFieldErrors(parsed.error))
	}
	const data = parsed.data

	const db = env.DB as D1Database | undefined
	if (!db) {
		// Better to tell the student plainly than to drop their application.
		return fail('The form is temporarily unavailable. Please email us instead.', 503)
	}

	const clientIp =
		context.request.headers.get('CF-Connecting-IP') ??
		context.request.headers.get('X-Forwarded-For') ??
		'unknown'

	const withinLimit = await checkRateLimit(db, `${kind}:${clientIp}`, {
		limit: 5,
		windowSeconds: 600,
	})
	if (!withinLimit) {
		return fail('Too many submissions from this connection. Please try again later.', 429)
	}

	const turnstile = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET, clientIp)
	if (!turnstile.ok) {
		console.warn(`turnstile rejected (${kind}): ${turnstile.reason}`)
		return fail('The anti-spam check did not pass. Please reload the page and try again.', 400, {
			turnstileToken: 'Please complete the check again.',
		})
	}

	// Everything that is not a shared column goes into the JSON payload.
	const {
		name,
		email,
		telegram,
		turnstileToken: _token,
		website: _hp,
		...rest
	} = data as Record<string, unknown> & {
		name: string
		email: string
		telegram?: string
		turnstileToken: string
	}

	const eventSlug = typeof rest.eventSlug === 'string' ? rest.eventSlug : undefined

	let submissionId: string
	try {
		submissionId = await insertSubmission(db, {
			kind,
			name,
			email,
			telegram,
			payload: rest,
			eventSlug,
			country: context.request.cf?.country as string | undefined,
			userAgent: context.request.headers.get('user-agent') ?? undefined,
		})
	} catch (error) {
		if (error instanceof DuplicateSubmissionError) {
			return fail('We already have a submission from that email address.', 409)
		}
		console.error('submission insert failed', error)
		return fail('Something went wrong saving that. Please try again.', 500)
	}

	// Notify after responding: nobody should wait on an email provider.
	const fields: Array<[string, string]> = [
		['Name', name],
		['Email', email],
		...(telegram ? ([['Telegram', telegram]] as Array<[string, string]>) : []),
		...Object.entries(rest).map(
			([key, value]) =>
				[key, Array.isArray(value) ? value.join(', ') : String(value)] as [string, string],
		),
	]

	context.locals.cfContext.waitUntil(
		notify(
			{
				resendApiKey: env.RESEND_API_KEY,
				emailFrom: env.NOTIFY_EMAIL_FROM,
				emailTo: env.NOTIFY_EMAIL_TO,
				telegramBotToken: env.TELEGRAM_BOT_TOKEN,
				telegramChatId: env.TELEGRAM_CHAT_ID,
				webhookUrl: env.N8N_WEBHOOK_URL,
			},
			{
				kind: KIND_LABELS[kind],
				subject: `${KIND_LABELS[kind]} — ${name}`,
				fields,
				submissionId,
			},
		).then((outcomes) => {
			for (const outcome of outcomes) {
				if (!outcome.ok && outcome.detail !== 'not configured') {
					console.error(`notify ${outcome.channel} failed: ${outcome.detail}`)
				}
			}
		}),
	)

	return json({ ok: true, id: submissionId })
}

/** Anything other than POST is a mistake worth naming. */
export function GET(): Response {
	return fail('This endpoint accepts POST only.', 405)
}
