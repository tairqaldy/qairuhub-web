import type { CollectionEntry } from 'astro:content'
import { getCollection, getEntries } from 'astro:content'

/**
 * Content query helpers.
 *
 * Always read content through these rather than calling `getCollection`
 * directly. They enforce two project rules:
 *
 *  1. Draft entries never leave `astro dev`.
 *  2. Placeholder entries — structural samples that describe nothing real —
 *     never reach a production build. The site shows a designed empty state
 *     instead of inventing members, events, or statistics.
 *
 * See `src/content.config.ts` for the flags themselves.
 */

/** True only in `astro dev`, where contributors want to preview everything. */
const SHOW_UNPUBLISHED = import.meta.env.DEV

type Flagged = { data: { draft?: boolean; placeholder?: boolean } }

/** Whether an entry may be shown in the current build. */
export function isPublished(entry: Flagged): boolean {
	if (SHOW_UNPUBLISHED) return true
	return !entry.data.draft && !entry.data.placeholder
}

/** True when an entry is a structural sample rather than real data. */
export function isPlaceholder(entry: Flagged): boolean {
	return entry.data.placeholder === true
}

type Collections =
	| 'events'
	| 'programs'
	| 'projects'
	| 'people'
	| 'posts'
	| 'learn'
	| 'partners'
	| 'docs'

/** `getCollection`, with the draft/placeholder rules applied. */
export async function getPublished<C extends Collections>(
	collection: C,
): Promise<CollectionEntry<C>[]> {
	const entries = await getCollection(collection)
	return entries.filter(isPublished)
}

// ── Events ────────────────────────────────────────────────────────────────

/** Whether an event is still ahead of us, accounting for multi-day events. */
export function isUpcoming(event: CollectionEntry<'events'>, now = new Date()): boolean {
	const end = event.data.ends ?? event.data.starts
	return end.getTime() >= now.getTime()
}

/** Upcoming events, soonest first. */
export async function getUpcomingEvents(now = new Date()) {
	const events = await getPublished('events')
	return events
		.filter((event) => isUpcoming(event, now))
		.sort((a, b) => a.data.starts.getTime() - b.data.starts.getTime())
}

/** Past events, most recent first. */
export async function getPastEvents(now = new Date()) {
	const events = await getPublished('events')
	return events
		.filter((event) => !isUpcoming(event, now))
		.sort((a, b) => b.data.starts.getTime() - a.data.starts.getTime())
}

// ── Programmes ────────────────────────────────────────────────────────────

/** Programmes in display order, active before upcoming. */
export async function getPrograms() {
	const programs = await getPublished('programs')
	const rank = { active: 0, upcoming: 1, paused: 2 } as const
	return programs.sort(
		(a, b) => rank[a.data.status] - rank[b.data.status] || a.data.order - b.data.order,
	)
}

// ── Projects ──────────────────────────────────────────────────────────────

/** Projects, newest first, with launched work surfaced ahead of ideas. */
export async function getProjects() {
	const projects = await getPublished('projects')
	const rank = { launched: 0, prototype: 1, idea: 2, archived: 3 } as const
	return projects.sort(
		(a, b) =>
			rank[a.data.stage] - rank[b.data.stage] ||
			b.data.started.getTime() - a.data.started.getTime(),
	)
}

export async function getFeaturedProjects(limit = 4) {
	const projects = await getProjects()
	const featured = projects.filter((project) => project.data.featured)
	return (featured.length ? featured : projects).slice(0, limit)
}

// ── People ────────────────────────────────────────────────────────────────

/** Active members in display order. */
export async function getPeople() {
	const people = await getPublished('people')
	return people
		.filter((person) => person.data.active)
		.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name))
}

export async function getAlumni() {
	const people = await getPublished('people')
	return people
		.filter((person) => !person.data.active)
		.sort((a, b) => a.data.name.localeCompare(b.data.name))
}

// ── Writing ───────────────────────────────────────────────────────────────

export async function getPosts() {
	const posts = await getPublished('posts')
	return posts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
}

export async function getLearnEntries() {
	const entries = await getPublished('learn')
	return entries.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
}

export async function getPartners() {
	const partners = await getPublished('partners')
	return partners.sort(
		(a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
	)
}

export async function getDocs() {
	const docs = await getPublished('docs')
	return docs.sort(
		(a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
	)
}

// ── References ────────────────────────────────────────────────────────────

/**
 * Resolve an array of `reference()` values to their entries, dropping any that
 * are unpublished in this build so a placeholder person cannot leak onto a
 * production page through a project's team list.
 *
 * A reference can also dangle if the target file was deleted — those are
 * dropped rather than crashing the page.
 */
export async function resolveReferences<C extends Collections>(
	refs: { collection: C; id: string }[] | undefined,
): Promise<CollectionEntry<C>[]> {
	if (!refs?.length) return []
	const entries = (await getEntries(refs)) as (CollectionEntry<C> | undefined)[]
	return entries.filter((entry): entry is CollectionEntry<C> => {
		if (!entry) return false
		return isPublished(entry)
	})
}

/** Resolve a single optional `reference()`, or `undefined` if unpublished. */
export async function resolveReference<C extends Collections>(
	ref: { collection: C; id: string } | undefined,
): Promise<CollectionEntry<C> | undefined> {
	if (!ref) return undefined
	const [entry] = await resolveReferences([ref])
	return entry
}
