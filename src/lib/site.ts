/**
 * Site-wide constants and the navigation model.
 *
 * The section index is numbered because the eyebrow grammar is `NN — WORD`
 * everywhere, and the numbers must agree between the nav, the rail numerals and
 * the section heads. One source, so they cannot drift.
 */

export const SITE = {
	name: 'QairuHub',
	/** The split wordmark: two weights, one word. */
	wordmark: { strong: 'Qairu', light: 'Hub' },
	tagline: 'Learn it. Build it. Launch it.',
	description:
		'The student-driven builder and AI community at Qazaq AI Research University in Astana. We turn ideas into shipped products.',
	locale: 'en',
	university: { name: 'QAIRU', motto: 'Alma-mater of AI', url: 'https://qairu.edu.kz' },
	location: 'Astana, Kazakhstan',
	social: {
		github: 'https://github.com/qairuhub',
		telegram: 'https://t.me/qairuhub',
	},
} as const

export interface NavItem {
	/** Two-digit ordinal, shown in the eyebrow and the rail. */
	n: string
	label: string
	href: string
}

export const NAV: readonly NavItem[] = [
	{ n: '01', label: 'Programmes', href: '/programs' },
	{ n: '02', label: 'Events', href: '/events' },
	{ n: '03', label: 'Projects', href: '/projects' },
	{ n: '04', label: 'Learn', href: '/learn' },
	{ n: '05', label: 'People', href: '/people' },
	{ n: '06', label: 'Charter', href: '/docs' },
	{ n: '07', label: 'Contact', href: '/contact' },
] as const

/**
 * Languages the site is actually published in.
 *
 * Routing for `ru` and `kk` is configured in astro.config.mjs, but neither is
 * listed here until a human has written the copy. The design rule is that a
 * page never mixes languages and never shows a machine translation — an
 * unfinished locale must not be reachable, only promised.
 */
export const LOCALES = [{ code: 'en', label: 'ENG', published: true }] as const

export const PLANNED_LOCALES = [
	{ code: 'kk', label: 'ҚАЗ' },
	{ code: 'ru', label: 'РУС' },
] as const

/** Whether an entry was changed recently enough to earn a margin change-bar. */
export function isRecentlyChanged(date: Date | undefined, now = new Date()): boolean {
	if (!date) return false
	const sevenDays = 7 * 24 * 60 * 60 * 1000
	return now.getTime() - date.getTime() <= sevenDays && date.getTime() <= now.getTime()
}

/** `14.09` — the site's date format, always tabular. */
export function formatShortDate(date: Date, locale = 'en-GB'): string {
	return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date)
}

/** `14 September 2026` */
export function formatLongDate(date: Date, locale = 'en-GB'): string {
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date)
}

/** `17:00` in Astana, where the events happen. */
export function formatTime(date: Date, locale = 'en-GB'): string {
	return new Intl.DateTimeFormat(locale, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'Asia/Almaty',
	}).format(date)
}
