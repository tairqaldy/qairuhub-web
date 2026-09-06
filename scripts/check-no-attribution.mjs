#!/usr/bin/env node
/**
 * Enforces the project's no-AI-attribution rule (CLAUDE.md §0).
 *
 * Scans the given files (or the whole tracked tree when called with no args)
 * for AI attribution strings that must never ship in this repository.
 *
 * Usage:  node scripts/check-no-attribution.mjs [files...]
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const PATTERNS = [
	{
		re: /co-authored-by:\s*(claude|chatgpt|gpt|copilot|gemini|openai|anthropic)/i,
		why: 'AI co-author trailer',
	},
	{
		re: /generated\s+with\s+\[?(claude|chatgpt|gpt-?[0-9]|copilot|gemini|cursor)\b/i,
		why: '"generated with <AI>" note',
	},
	{
		re: /\b(written|created|authored|built)\s+(by|with)\s+(claude|chatgpt|an?\s+ai\b|artificial intelligence)/i,
		why: 'AI authorship claim',
	},
	{ re: /🤖\s*generated/i, why: 'AI generation marker' },
	{ re: /\bclaude\s+code\b/i, why: 'assistant tool name' },
	{ re: /noreply@anthropic\.com/i, why: 'AI author email' },
]

// Paths that legitimately discuss the rule itself, plus vendored/generated files.
// Compared against forward-slash-normalised paths.
const ALLOW = [
	/^scripts\/check-no-attribution\.mjs$/,
	/^scripts\/check-commit-msg\.mjs$/,
	/^CLAUDE\.md$/,
	/^AGENTS\.md$/,
	/^docs\/research\//,
	/^\.github\/workflows\//,
	/node_modules\//,
	/^\.wrangler\//,
	/^dist\//,
	/^pnpm-lock\.yaml$/,
]

const BINARY = /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp4|webm|zip)$/i

function tracked() {
	return execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)
}

const args = process.argv.slice(2)
const files = (args.length ? args : tracked())
	.map((f) => f.split('\\').join('/'))
	.filter((f) => !ALLOW.some((a) => a.test(f)) && !BINARY.test(f))

let failed = 0
for (const file of files) {
	let text
	try {
		if (!statSync(file).isFile()) continue
		text = readFileSync(file, 'utf8')
	} catch {
		continue // deleted or unreadable in this run
	}
	text.split('\n').forEach((line, i) => {
		for (const { re, why } of PATTERNS) {
			if (re.test(line)) {
				console.error(`${file}:${i + 1}  ${why}`)
				console.error(`    ${line.trim()}`)
				failed++
			}
		}
	})
}

if (failed) {
	console.error(
		`\n${failed} AI-attribution violation(s). See CLAUDE.md section 0 — this rule is non-negotiable.`,
	)
	process.exit(1)
}
