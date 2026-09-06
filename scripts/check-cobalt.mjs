#!/usr/bin/env node
/**
 * Enforces the cobalt law (docs/DESIGN.md §8).
 *
 * Cobalt is ink for the live layer only: things that respond, and things that
 * changed. It is never a surface, never atmosphere, never a mood. The design
 * survives a familiar accent colour only because its use is genuinely rare — and
 * "use it sparingly" is a rule that dies the first time someone is in a hurry.
 *
 * So it is mechanised instead:
 *
 *   1. `var(--cobalt…)` may only appear in the stylesheets listed below.
 *      A reference from a .astro or .tsx file fails the build.
 *   2. Inside those stylesheets, cobalt may only appear on the selectors in
 *      ALLOWED_SELECTORS. Adding a new one is a deliberate act.
 *   3. Nothing may write a cobalt gradient, glow, shadow, or transparent wash.
 *
 * Run: node scripts/check-cobalt.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/** Only these files may name the signal colour. */
const STYLE_FILES = ['src/styles/global.css', 'src/styles/components.css']

/**
 * The complete list of things allowed to be cobalt, from §8.1 and §8.2.
 *
 * Every entry is a substring matched against the selector of the rule the
 * declaration sits in. If you are adding to this list, re-read §8.3 first.
 */
const ALLOWED_SELECTORS = [
	// §8.1 — the three fills
	'.cta-primary', // one per page, maximum
	'::selection',
	'.nav__link[aria-current]', // the 2px active-nav underline
	'.lang__current', // same device, on the language switch
	// §8.2 — cobalt as ink: 1px marks and text only
	'a:hover', // link underline colour on hover
	'a:focus-visible',
	':focus-visible', // the focus ring, on everything, always
	'.state--live', // a state that is actionable now
	'.change-bar', // the margin revision tick
	'.link-action:hover',
	// token definitions themselves
	':root',
]

const FORBIDDEN = [
	{ re: /gradient\([^)]*--cobalt/i, why: 'cobalt in a gradient' },
	{ re: /box-shadow:[^;]*--cobalt/i, why: 'cobalt in a shadow' },
	{ re: /filter:[^;]*--cobalt/i, why: 'cobalt in a filter' },
	{
		re: /color-mix\([^)]*--cobalt[^)]*transparent/i,
		why: 'cobalt as a transparent wash — this is how the no-wash rule gets broken by stealth',
	},
	{ re: /var\(--cobalt[^)]*\)\s*\/\s*0?\.\d/i, why: 'cobalt at reduced alpha' },
]

const failures = []

/* ── 1. No cobalt outside the stylesheets. ─────────────────────────────── */

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
	.split('\n')
	.filter(Boolean)
	.map((file) => file.split('\\').join('/'))

for (const file of tracked) {
	if (!/\.(astro|tsx|ts|jsx|js|css)$/.test(file)) continue
	if (STYLE_FILES.includes(file)) continue
	if (file.startsWith('scripts/') || file.startsWith('tests/')) continue

	const text = readFileSync(file, 'utf8')
	text.split('\n').forEach((line, i) => {
		if (/var\(--cobalt/.test(line)) {
			failures.push(
				`${file}:${i + 1}  names --cobalt outside the stylesheets.\n` +
					'    Add a class in src/styles/components.css instead, and list it in ALLOWED_SELECTORS.',
			)
		}
	})
}

/* ── 2. Inside the stylesheets, only allowed selectors. ────────────────── */

/**
 * Walk the file tracking the innermost selector, so a declaration can be
 * attributed to the rule it belongs to. Deliberately simple: this is a lint on
 * two files we control, not a CSS parser.
 */
for (const file of STYLE_FILES) {
	const lines = readFileSync(file, 'utf8').split('\n')
	const stack = []
	let pending = []

	lines.forEach((line, i) => {
		const trimmed = line.trim()

		if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return

		if (trimmed.endsWith('{')) {
			const selector = [...pending, trimmed.slice(0, -1).trim()].join(' ').trim()
			pending = []
			stack.push(selector)
			return
		}

		// A selector list spread over several lines, e.g. "a:hover,\n a:focus {".
		if (trimmed.endsWith(',')) {
			pending.push(trimmed)
			return
		}

		if (trimmed === '}') {
			stack.pop()
			return
		}

		if (!/var\(--cobalt/.test(trimmed)) return

		const context = stack.join(' ')
		const allowed = ALLOWED_SELECTORS.some((selector) => context.includes(selector))
		if (!allowed) {
			failures.push(
				`${file}:${i + 1}  cobalt on a selector that is not in the allowlist.\n` +
					`    selector: ${context || '(unknown)'}\n` +
					`    line:     ${trimmed}\n` +
					'    See docs/DESIGN.md §8.3 for what cobalt may never be.',
			)
		}
	})

	// 3. Forbidden constructions, wherever they appear.
	const text = readFileSync(file, 'utf8')
	text.split('\n').forEach((line, i) => {
		for (const { re, why } of FORBIDDEN) {
			if (re.test(line)) failures.push(`${file}:${i + 1}  ${why}\n    ${line.trim()}`)
		}
	})
}

if (failures.length) {
	console.error('The cobalt law is broken:\n')
	for (const failure of failures) console.error(` - ${failure}\n`)
	console.error(
		`${failures.length} violation(s). Cobalt marks what is live or what changed — nothing else.`,
	)
	process.exit(1)
}

console.log('cobalt law: ok')
