/**
 * Cloudflare Turnstile verification.
 *
 * The widget on the client produces a token; this verifies it server-side.
 * Nothing else proves the submission came from a browser rather than a script.
 *
 * Two things about tokens that are easy to get wrong:
 *  - They are single-use. Verifying the same token twice returns
 *    `timeout-or-duplicate`, so verify exactly once, in the handler.
 *  - They expire after about five minutes.
 *
 * Note the response field is `error-codes`, hyphenated — not `errorCodes`.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface SiteverifyResponse {
	success: boolean
	'error-codes'?: string[]
	challenge_ts?: string
	hostname?: string
	action?: string
}

export interface TurnstileResult {
	ok: boolean
	/** Machine-readable reason, for logs. Never shown to the user verbatim. */
	reason?: string
}

/**
 * Verify a Turnstile token.
 *
 * @param token   the `cf-turnstile-response` field from the submitted form
 * @param secret  the Turnstile secret key (never the sitekey)
 * @param remoteIp optional `CF-Connecting-IP`, which tightens the check
 */
export async function verifyTurnstile(
	token: string | undefined | null,
	secret: string | undefined,
	remoteIp?: string | null,
): Promise<TurnstileResult> {
	if (!secret) {
		// Failing closed is the only safe behaviour: a missing secret in
		// production would otherwise silently disable spam protection.
		return { ok: false, reason: 'missing-secret' }
	}
	if (!token) return { ok: false, reason: 'missing-input-response' }

	let response: Response
	try {
		response = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				secret,
				response: token,
				...(remoteIp ? { remoteip: remoteIp } : {}),
			}),
		})
	} catch {
		return { ok: false, reason: 'siteverify-unreachable' }
	}

	if (!response.ok) return { ok: false, reason: `siteverify-http-${response.status}` }

	const result = (await response.json()) as SiteverifyResponse
	if (result.success) return { ok: true }

	return { ok: false, reason: result['error-codes']?.join(',') ?? 'unknown' }
}

/**
 * Cloudflare's documented test keys. The sitekey always passes, so local
 * development needs no real Turnstile configuration.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const TURNSTILE_TEST_KEYS = {
	alwaysPassesSitekey: '1x00000000000000000000AA',
	alwaysPassesSecret: '1x0000000000000000000000000000000AA',
	alwaysBlocksSitekey: '2x00000000000000000000AB',
	alwaysBlocksSecret: '2x0000000000000000000000000000000AA',
} as const
