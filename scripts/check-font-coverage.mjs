#!/usr/bin/env node
/**
 * Verifies that every font the site ships can actually render Kazakh.
 *
 * qairuhub.com is trilingual (English, Russian, Kazakh). Kazakh Cyrillic needs
 * nine letter pairs that plain Russian Cyrillic does not have:
 *
 *     Ә ә  Ғ ғ  Қ қ  Ң ң  Ө ө  Ұ ұ  Ү ү  Һ һ  І і
 *
 * A font can advertise a "cyrillic" subset and still be missing all of them —
 * Google's subset labels describe unicode-ranges, not the glyphs actually in
 * the file. This script downloads every woff2 Google Fonts serves for a family,
 * decompresses it, and reads the real `cmap` table. Nothing here is inferred.
 *
 * Run with no arguments to check the families the site uses:
 *     node scripts/check-font-coverage.mjs
 *
 * Run with arguments to audit a candidate before adopting it:
 *     node scripts/check-font-coverage.mjs "Spectral:wght@200..800"
 *
 * Requires network access, so it is not part of `pnpm check`. Run it whenever
 * the type stack changes.
 */
import { decompress } from 'wawoff2'

/**
 * Families the site actually loads. Keep in sync with `src/styles/fonts.css`.
 *
 * Use Google's exact axis syntax: a static family like Spectral must list its
 * discrete weights (`wght@200;400;700`), not a variable range (`wght@200..800`),
 * or the API returns no files at all.
 */
const SITE_FAMILIES = [
	// Display — carries every headline in all three scripts.
	'Onest:wght@500;600;700;800',
	// Body and UI.
	'Geist:wght@100..900',
	// The institutional voice: eyebrows, labels, data.
	'Geist+Mono:wght@100..900',
]

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** The nine Kazakh-specific letter pairs, plus Russian and Latin controls. */
const REQUIRED = {
	Ә: 0x04d8,
	ә: 0x04d9,
	Ғ: 0x0492,
	ғ: 0x0493,
	Қ: 0x049a,
	қ: 0x049b,
	Ң: 0x04a2,
	ң: 0x04a3,
	Ө: 0x04e8,
	ө: 0x04e9,
	Ұ: 0x04b0,
	ұ: 0x04b1,
	Ү: 0x04ae,
	ү: 0x04af,
	Һ: 0x04ba,
	һ: 0x04bb,
	І: 0x0406,
	і: 0x0456,
	'Я (ru)': 0x042f,
	'ж (ru)': 0x0436,
	'Ё (ru)': 0x0401,
	'A (latin)': 0x0041,
}

const u16 = (buf, o) => buf.readUInt16BE(o)
const u32 = (buf, o) => buf.readUInt32BE(o)

/** Every codepoint mapped to a non-zero glyph id in a TTF's cmap. */
function cmapCodepoints(ttf) {
	const covered = new Set()
	const numTables = u16(ttf, 4)
	let cmapOff = null
	for (let i = 0; i < numTables; i++) {
		const rec = 12 + i * 16
		if (ttf.subarray(rec, rec + 4).toString('latin1') === 'cmap') cmapOff = u32(ttf, rec + 8)
	}
	if (cmapOff == null) return covered

	const subtables = u16(ttf, cmapOff + 2)
	for (let i = 0; i < subtables; i++) {
		const subOff = cmapOff + u32(ttf, cmapOff + 4 + i * 8 + 4)
		const format = u16(ttf, subOff)

		if (format === 4) {
			const segX2 = u16(ttf, subOff + 6)
			const endO = subOff + 14
			const startO = endO + segX2 + 2
			const deltaO = startO + segX2
			const rangeO = deltaO + segX2
			for (let s = 0; s < segX2 / 2; s++) {
				const end = u16(ttf, endO + s * 2)
				const start = u16(ttf, startO + s * 2)
				const delta = u16(ttf, deltaO + s * 2)
				const rangeOffset = u16(ttf, rangeO + s * 2)
				if (start === 0xffff) continue
				for (let c = start; c <= end && c !== 0x10000; c++) {
					let gid
					if (rangeOffset === 0) {
						gid = (c + delta) & 0xffff
					} else {
						const gi = rangeO + s * 2 + rangeOffset + (c - start) * 2
						if (gi + 1 >= ttf.length) continue
						gid = u16(ttf, gi)
						if (gid !== 0) gid = (gid + delta) & 0xffff
					}
					if (gid !== 0) covered.add(c)
				}
			}
		} else if (format === 12) {
			const groups = u32(ttf, subOff + 12)
			for (let g = 0; g < groups; g++) {
				const go = subOff + 16 + g * 12
				const start = u32(ttf, go)
				const end = u32(ttf, go + 4)
				if (u32(ttf, go + 8) === 0) continue
				for (let c = start; c <= end; c++) covered.add(c)
			}
		}
	}
	return covered
}

async function coverage(family) {
	const css = await (
		await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, {
			headers: { 'User-Agent': UA },
		})
	).text()
	const urls = [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1])
	if (!urls.length) return { error: 'Google Fonts returned no woff2 files for this family' }

	const covered = new Set()
	for (const url of urls) {
		try {
			const bytes = new Uint8Array(
				await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer(),
			)
			for (const c of cmapCodepoints(Buffer.from(await decompress(bytes)))) covered.add(c)
		} catch {
			// One unreadable subset should not invalidate the whole family.
		}
	}
	return { files: urls.length, covered }
}

const families = process.argv.slice(2).length ? process.argv.slice(2) : SITE_FAMILIES
let failed = 0

for (const family of families) {
	const label = decodeURIComponent(family).split(':')[0].replace(/\+/g, ' ')
	const result = await coverage(family)

	if (result.error) {
		console.error(`${label}: ${result.error}`)
		failed++
		continue
	}

	const missing = Object.entries(REQUIRED).filter(([, cp]) => !result.covered.has(cp))
	if (missing.length) {
		console.error(
			`FAIL  ${label} — missing ${missing.length} required glyph(s): ${missing.map(([n]) => n).join(' ')}`,
		)
		failed++
	} else {
		console.log(`ok    ${label} — Latin + Russian + Kazakh (${result.covered.size} codepoints)`)
	}
}

if (failed) {
	console.error(
		`\n${failed} font(s) cannot render Kazakh. Pick a different face — do not ship a font that` +
			" renders our own students' names as empty boxes.",
	)
	process.exit(1)
}
