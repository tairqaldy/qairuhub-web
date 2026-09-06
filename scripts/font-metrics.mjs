#!/usr/bin/env node
/**
 * Reads real vertical metrics out of a font's `head`, `hhea` and `OS/2` tables,
 * and computes the `size-adjust` / `ascent-override` / `descent-override`
 * values needed to splice a Cyrillic face onto a Latin one under a single
 * CSS family name.
 *
 * The display family is a composite: Space Grotesk carries Latin, Onest carries
 * Cyrillic. Without overrides, a Kazakh headline sets at a visibly different
 * size and sits on a different baseline from the English one beside it.
 *
 * These numbers must be measured, not guessed. Run:
 *     node scripts/font-metrics.mjs "Space+Grotesk:wght@500" "Onest:wght@600"
 * The first family is the reference; every following family is matched to it.
 */
import { decompress } from 'wawoff2'

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const u16 = (b, o) => b.readUInt16BE(o)
const i16 = (b, o) => b.readInt16BE(o)
const u32 = (b, o) => b.readUInt32BE(o)

function tables(ttf) {
	const found = {}
	const count = u16(ttf, 4)
	for (let i = 0; i < count; i++) {
		const rec = 12 + i * 16
		found[ttf.subarray(rec, rec + 4).toString('latin1')] = u32(ttf, rec + 8)
	}
	return found
}

/** unitsPerEm, cap height, x-height, and both ascent/descent pairs. */
function metrics(ttf) {
	const t = tables(ttf)
	const unitsPerEm = u16(ttf, t.head + 18)

	const os2 = t['OS/2']
	const version = u16(ttf, os2)
	const typoAscender = i16(ttf, os2 + 68)
	const typoDescender = i16(ttf, os2 + 70)
	const winAscent = u16(ttf, os2 + 74)
	const winDescent = u16(ttf, os2 + 76)
	// sCapHeight and sxHeight only exist from OS/2 version 2 onwards.
	const xHeight = version >= 2 ? i16(ttf, os2 + 86) : 0
	const capHeight = version >= 2 ? i16(ttf, os2 + 88) : 0

	const hheaAscender = i16(ttf, t.hhea + 4)
	const hheaDescender = i16(ttf, t.hhea + 6)
	const lineGap = i16(ttf, t.hhea + 8)

	return {
		unitsPerEm,
		capHeight,
		xHeight,
		typoAscender,
		typoDescender,
		hheaAscender,
		hheaDescender,
		lineGap,
		winAscent,
		winDescent,
	}
}

async function loadFirstSubset(family) {
	const css = await (
		await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, {
			headers: { 'User-Agent': UA },
		})
	).text()
	const url = css.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
	if (!url) throw new Error(`no woff2 for ${family}`)
	const bytes = new Uint8Array(
		await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer(),
	)
	return Buffer.from(await decompress(bytes))
}

const families = process.argv.slice(2)
if (families.length < 1) {
	console.error(
		'usage: node scripts/font-metrics.mjs "Reference+Family:wght@500" [Other:wght@600 ...]',
	)
	process.exit(1)
}

const measured = []
for (const family of families) {
	const label = decodeURIComponent(family).split(':')[0].replace(/\+/g, ' ')
	measured.push({ label, family, m: metrics(await loadFirstSubset(family)) })
}

const pct = (n) => `${(n * 100).toFixed(2)}%`

for (const { label, m } of measured) {
	console.log(`\n### ${label}`)
	console.log(`  unitsPerEm     ${m.unitsPerEm}`)
	console.log(`  capHeight      ${m.capHeight}  (${pct(m.capHeight / m.unitsPerEm)} of em)`)
	console.log(`  xHeight        ${m.xHeight}  (${pct(m.xHeight / m.unitsPerEm)} of em)`)
	console.log(`  hhea asc/desc  ${m.hheaAscender} / ${m.hheaDescender}  gap ${m.lineGap}`)
	console.log(`  typo asc/desc  ${m.typoAscender} / ${m.typoDescender}`)
}

const [reference, ...others] = measured
if (others.length) {
	const refCap = reference.m.capHeight / reference.m.unitsPerEm
	console.log(`\n=== CSS overrides, matching cap height to ${reference.label} (${pct(refCap)}) ===`)

	for (const { label, m } of others) {
		const cap = m.capHeight / m.unitsPerEm
		// Scale the Cyrillic face so its capitals match the reference's.
		const sizeAdjust = refCap / cap
		// Ascent/descent are expressed against the ALREADY-SCALED em, so divide
		// the raw ratio by the size-adjust factor.
		const ascent = m.hheaAscender / m.unitsPerEm / sizeAdjust
		const descent = Math.abs(m.hheaDescender) / m.unitsPerEm / sizeAdjust

		console.log(`\n/* ${label} spliced onto ${reference.label} */`)
		console.log(`size-adjust: ${pct(sizeAdjust)};`)
		console.log(`ascent-override: ${pct(ascent)};`)
		console.log(`descent-override: ${pct(descent)};`)
		console.log(`line-gap-override: 0%;`)
		console.log(
			`/* cap ${pct(cap)} -> ${pct(cap * sizeAdjust)}, x-height ${pct(m.xHeight / m.unitsPerEm)} -> ${pct((m.xHeight / m.unitsPerEm) * sizeAdjust)} */`,
		)
	}

	const refX = reference.m.xHeight / reference.m.unitsPerEm
	console.log(
		`\n/* reference x-height ${pct(refX)} — compare against the adjusted values above; */`,
	)
	console.log(`/* a large mismatch after cap-matching means the pairing is a poor fit.  */`)
}
