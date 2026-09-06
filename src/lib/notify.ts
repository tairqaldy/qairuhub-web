/**
 * Outbound notifications for a new submission: email, Telegram, and an
 * optional automation webhook.
 *
 * These run inside `ctx.waitUntil()` after the response has already been sent,
 * so a slow mail provider never makes a student wait. Two consequences:
 *
 *  - `waitUntil` gives us about 30 seconds. Keep each call quick.
 *  - Use `Promise.allSettled`, never `Promise.all` — one failing notifier must
 *    not hide whether the others worked.
 *
 * Resend is called over plain `fetch` rather than through its SDK. The SDK
 * needs `nodejs_compat`, which this Worker does not otherwise require, and the
 * REST call is four lines. Note that REST uses snake_case (`reply_to`) while
 * the SDK uses camelCase — mixing them silently drops the field.
 */

export interface NotifyConfig {
	resendApiKey?: string
	emailFrom?: string
	emailTo?: string
	telegramBotToken?: string
	telegramChatId?: string
	webhookUrl?: string
}

export interface NotifyPayload {
	/** Which form this came from, e.g. "membership application". */
	kind: string
	/** Human-readable subject line. */
	subject: string
	/** Ordered field/value pairs to show in the notification. */
	fields: Array<[label: string, value: string]>
	/** The submission's database id, for cross-referencing. */
	submissionId: string
}

export interface NotifyOutcome {
	channel: string
	ok: boolean
	detail?: string
}

/** Minimal HTML escaping for the email body. */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

/** Escape the subset of characters Telegram's MarkdownV2 requires. */
function escapeMarkdownV2(value: string): string {
	return value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (c) => `\\${c}`)
}

async function sendEmail(config: NotifyConfig, payload: NotifyPayload): Promise<NotifyOutcome> {
	const { resendApiKey, emailFrom, emailTo } = config
	if (!resendApiKey || !emailFrom || !emailTo) {
		return { channel: 'email', ok: false, detail: 'not configured' }
	}

	const rows = payload.fields
		.map(
			([label, value]) =>
				`<tr><td style="padding:4px 12px 4px 0;vertical-align:top;color:#666">${escapeHtml(label)}</td>` +
				`<td style="padding:4px 0">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`,
		)
		.join('')

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: emailFrom,
			to: [emailTo],
			subject: payload.subject,
			html:
				`<h2 style="font-family:system-ui,sans-serif">${escapeHtml(payload.kind)}</h2>` +
				`<table style="font-family:system-ui,sans-serif;font-size:14px">${rows}</table>` +
				`<p style="color:#999;font-size:12px">Submission ${escapeHtml(payload.submissionId)}</p>`,
		}),
	})

	// Resend returns a JSON error body rather than throwing, so check explicitly.
	if (!response.ok) {
		const body = await response.text()
		return { channel: 'email', ok: false, detail: `${response.status}: ${body.slice(0, 200)}` }
	}
	return { channel: 'email', ok: true }
}

async function sendTelegram(config: NotifyConfig, payload: NotifyPayload): Promise<NotifyOutcome> {
	const { telegramBotToken, telegramChatId } = config
	if (!telegramBotToken || !telegramChatId) {
		return { channel: 'telegram', ok: false, detail: 'not configured' }
	}

	const lines = [
		`*${escapeMarkdownV2(payload.kind)}*`,
		'',
		...payload.fields.map(
			([label, value]) => `*${escapeMarkdownV2(label)}:* ${escapeMarkdownV2(value)}`,
		),
	].join('\n')

	// No slash between "bot" and the token.
	const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chat_id: telegramChatId,
			text: lines,
			parse_mode: 'MarkdownV2',
			disable_web_page_preview: true,
		}),
	})

	// Telegram answers 200 with `{"ok": false}` for many failures, so checking
	// the HTTP status alone is not enough.
	const body = (await response.json().catch(() => null)) as {
		ok?: boolean
		description?: string
	} | null
	if (!response.ok || !body?.ok) {
		return {
			channel: 'telegram',
			ok: false,
			detail: body?.description ?? `http ${response.status}`,
		}
	}
	return { channel: 'telegram', ok: true }
}

async function sendWebhook(config: NotifyConfig, payload: NotifyPayload): Promise<NotifyOutcome> {
	if (!config.webhookUrl) return { channel: 'webhook', ok: false, detail: 'not configured' }

	const response = await fetch(config.webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			kind: payload.kind,
			submissionId: payload.submissionId,
			fields: Object.fromEntries(payload.fields),
		}),
	})
	return response.ok
		? { channel: 'webhook', ok: true }
		: { channel: 'webhook', ok: false, detail: `http ${response.status}` }
}

/**
 * Fire every configured notifier. Never rejects: an unconfigured or failing
 * channel is reported in the result rather than thrown, because this runs
 * after the response has already gone out and there is nobody left to catch it.
 */
export async function notify(
	config: NotifyConfig,
	payload: NotifyPayload,
): Promise<NotifyOutcome[]> {
	const results = await Promise.allSettled([
		sendEmail(config, payload),
		sendTelegram(config, payload),
		sendWebhook(config, payload),
	])

	return results.map((result, index) => {
		if (result.status === 'fulfilled') return result.value
		const channel = ['email', 'telegram', 'webhook'][index] ?? 'unknown'
		return { channel, ok: false, detail: String(result.reason).slice(0, 200) }
	})
}
