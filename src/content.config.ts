import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Content model for qairuhub.com.
 *
 * Everything the site displays lives here as Markdown/MDX, so contributors can
 * add an event or a project with a pull request and no code. Schemas are
 * validated at build time — a missing field fails CI rather than shipping a
 * broken page.
 *
 * NOTE: `z` comes from `astro/zod` (Zod v4). The `z` re-export from
 * `astro:content` is deprecated and goes away in Astro 8.
 *
 * ── The placeholder rule ──────────────────────────────────────────────────
 * The site must never present invented people, numbers, or outcomes as real.
 * Every collection carries `draft` and `placeholder` flags:
 *
 *   draft:       work in progress. Hidden everywhere except `astro dev`.
 *   placeholder: a structural sample showing contributors the shape of an
 *                entry. Hidden in production builds, visibly badged in dev.
 *
 * Query helpers in `src/lib/content.ts` apply this filter — always go through
 * them rather than calling `getCollection` directly.
 */

/** Fields every collection shares. */
const base = {
	/**
	 * Which language this entry is written in. The site never mixes languages
	 * inside one viewport, so this is what a page checks before rendering.
	 */
	lang: z.enum(['en', 'ru', 'kk']).default('en'),
	/** Links the language versions of one entry together. Defaults to the slug. */
	translationKey: z.string().optional(),
	/**
	 * Last substantive change. The margin change-bar marks anything edited in
	 * the last seven days, and has no data source without this.
	 */
	updatedDate: z.coerce.date().optional(),
	/** Hidden outside `astro dev`. */
	draft: z.boolean().default(false),
	/**
	 * Structural sample, not real data. Excluded from production builds.
	 * Remove this line once the entry describes something that actually happened.
	 */
	placeholder: z.boolean().default(false),
}

/** The sub-units QairuHub is organised into. */
const unit = z.enum(['core', 'qairu-ai', 'hackathons', 'accelerator', 'education', 'space'])

const events = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
	schema: ({ image }) =>
		z.object({
			...base,
			title: z.string().min(3).max(90),
			/** Machine-readable start. Drives upcoming/past sorting. */
			starts: z.coerce.date(),
			ends: z.coerce.date().optional(),
			location: z.string().default('QAIRU, Astana'),
			/** Specific room, so someone can actually find it. */
			room: z.string().max(60).optional(),
			/** The capacity rule renders only with a live count to compare against. */
			capacity: z.number().int().positive().optional(),
			/** Open to anyone, no application. The lowest-commitment door. */
			walkIn: z.boolean().default(false),
			/** Which programme this event belongs to, if any. */
			program: reference('programs').optional(),
			summary: z.string().min(20).max(220),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			rsvpUrl: z.url().optional(),
			recordingUrl: z.url().optional(),
			/** People who ran it. */
			hosts: z.array(reference('people')).default([]),
			tags: z.array(z.string()).default([]),
		}),
})

const programs = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/programs' }),
	schema: ({ image }) =>
		z.object({
			...base,
			name: z.string().min(2).max(60),
			tagline: z.string().min(10).max(120),
			/** Controls display order across the site. Lower comes first. */
			order: z.number().int().default(0),
			status: z.enum(['active', 'upcoming', 'paused']).default('active'),
			/** Shown next to an `upcoming` programme, e.g. "Spring 2027". */
			startsLabel: z.string().optional(),
			/** Time commitment, stated plainly: "4 hours a week, 8 weeks". */
			commitment: z.string().max(80).optional(),
			/** The entry bar, stated plainly. Say when there isn't one. */
			requirements: z.string().max(160).optional(),
			cohortSize: z.number().int().positive().optional(),
			/** Absent or past means the row renders "closed" and shows no CTA. */
			intakeCloses: z.coerce.date().optional(),
			unit: unit,
			lead: reference('people').optional(),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			/** Short, concrete outcomes. Not marketing adjectives. */
			outcomes: z.array(z.string()).default([]),
		}),
})

const projects = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
	schema: ({ image }) =>
		z.object({
			...base,
			name: z.string().min(2).max(60),
			oneLiner: z.string().min(10).max(140),
			team: z.array(reference('people')).default([]),
			repo: z.url().optional(),
			demo: z.url().optional(),
			stage: z.enum(['idea', 'prototype', 'launched', 'archived']).default('idea'),
			/** When the project started, for the registry index. */
			started: z.coerce.date(),
			program: reference('programs').optional(),
			tags: z.array(z.string()).default([]),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			featured: z.boolean().default(false),
		}),
})

const people = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
	schema: ({ image }) =>
		z.object({
			...base,
			name: z.string().min(2).max(60),
			role: z.string().min(2).max(60),
			unit: unit.default('core'),
			avatar: image().optional(),
			/** Handles, not URLs — the site builds the links. */
			github: z.string().optional(),
			telegram: z.string().optional(),
			linkedin: z.string().optional(),
			site: z.url().optional(),
			order: z.number().int().default(0),
			/** Alumni still appear on /people, in a separate group. */
			active: z.boolean().default(true),
		}),
})

const posts = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			...base,
			title: z.string().min(3).max(110),
			publishDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			author: reference('people'),
			excerpt: z.string().min(20).max(260),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			tags: z.array(z.string()).default([]),
		}),
})

/** AI Fridays notes, guides, and other teaching material. */
const learn = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/learn' }),
	schema: () =>
		z.object({
			...base,
			title: z.string().min(3).max(110),
			kind: z.enum(['note', 'guide', 'recording', 'reading-list']),
			publishDate: z.coerce.date(),
			summary: z.string().min(20).max(260),
			/** Roughly how long this takes to work through. */
			minutes: z.number().int().positive().optional(),
			level: z.enum(['intro', 'intermediate', 'advanced']).default('intro'),
			event: reference('events').optional(),
			authors: z.array(reference('people')).default([]),
			tags: z.array(z.string()).default([]),
			recordingUrl: z.url().optional(),
		}),
})

const partners = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/partners' }),
	schema: ({ image }) =>
		z.object({
			...base,
			name: z.string().min(2).max(60),
			url: z.url(),
			logo: image().optional(),
			logoAlt: z.string().optional(),
			kind: z.enum(['university', 'company', 'community', 'sponsor']),
			/** One sentence on what the partnership actually is. */
			relationship: z.string().min(10).max(200),
			order: z.number().int().default(0),
		}),
})

/** Governance and reference documents: charter, decisions, how-we-work. */
const docs = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
	schema: () =>
		z.object({
			...base,
			title: z.string().min(3).max(110),
			summary: z.string().min(20).max(260),
			category: z.enum(['governance', 'process', 'reference']),
			order: z.number().int().default(0),
			updatedDate: z.coerce.date(),
		}),
})

export const collections = { events, programs, projects, people, posts, learn, partners, docs }
