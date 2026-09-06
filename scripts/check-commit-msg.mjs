#!/usr/bin/env node
/**
 * Validates a commit message: Conventional Commits format, and no AI trailers.
 * Usage: node scripts/check-commit-msg.mjs <path-to-COMMIT_EDITMSG>
 */
import { readFileSync } from 'node:fs'

const path = process.argv[2]
if (!path) process.exit(0)

const raw = readFileSync(path, 'utf8')
const lines = raw.split('\n').filter((l) => !l.startsWith('#'))
const subject = (lines[0] ?? '').trim()

const errors = []

const CONVENTIONAL =
	/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9\-./]+\))?!?: .{1,80}$/
if (!subject) {
	errors.push('empty commit subject')
} else if (!/^(Merge|Revert)/.test(subject) && !CONVENTIONAL.test(subject)) {
	errors.push(
		`subject must be a Conventional Commit, e.g. "feat(nav): add mobile sheet"\n  got: ${subject}`,
	)
}

if (/co-authored-by:\s*(claude|chatgpt|gpt|copilot|gemini|openai|anthropic)/i.test(raw)) {
	errors.push('AI co-author trailer is forbidden (CLAUDE.md §0)')
}
if (/generated with|🤖/i.test(raw)) {
	errors.push('AI generation note is forbidden (CLAUDE.md §0)')
}

if (errors.length) {
	console.error(`Commit message rejected:\n - ${errors.join('\n - ')}`)
	process.exit(1)
}
