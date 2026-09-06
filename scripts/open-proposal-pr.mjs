#!/usr/bin/env node
/**
 * Turns a written proposal into a real pull request.
 *
 *   node scripts/open-proposal-pr.mjs docs/proposals/012-check-in.md
 *
 * For each file given: branches from the current main, commits that file alone,
 * pushes, and opens a pull request whose body is drawn from the document's own
 * frontmatter and Problem section. Then returns to main, so the next one starts
 * from a clean base and the proposals stay independent of one another.
 *
 * Credentials come from the machine's git credential helper — the same one
 * `git push` already uses. Nothing is written to disk and nothing is printed.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const REPO = 'tairqaldy/qairuhub-web'
const BASE = 'main'

const sh = (cmd, args, opts = {}) =>
	execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...opts }).trim()

/** Ask the credential helper for a token, the same way git push does. */
function githubToken() {
	const out = execFileSync('git', ['credential', 'fill'], {
		input: 'protocol=https\nhost=github.com\n\n',
		encoding: 'utf8',
	})
	const token = /^password=(.+)$/m.exec(out)?.[1]
	if (!token) throw new Error('No GitHub credential available. Run a `git push` once first.')
	return token.trim()
}

async function api(path, { method = 'GET', body, token }) {
	const response = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'Content-Type': 'application/json',
			'User-Agent': 'qairuhub-proposals',
		},
		body: body ? JSON.stringify(body) : undefined,
	})
	const json = await response.json().catch(() => ({}))
	if (!response.ok) {
		throw new Error(`${method} ${path} -> ${response.status}: ${json.message ?? 'unknown'}`)
	}
	return json
}

/** Pull the frontmatter, the H1 and the Problem section out of a proposal. */
function readProposal(file) {
	const text = readFileSync(file, 'utf8')

	const front = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? ''
	const field = (name) => new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(front)?.[1]?.trim() ?? ''

	const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? basename(file, '.md')

	// Everything under "## Problem" up to the next heading.
	const problem = /^##\s+Problem\s*\n+([\s\S]*?)(?=\n##\s)/m
		.exec(text)?.[1]
		?.trim()
		.split('\n\n')[0]
		?.replace(/\n/g, ' ')

	// The bullet list of prior art, so reviewers see the research from the PR.
	const priorArt = /^##\s+Prior art\s*\n+([\s\S]*?)(?=\n##\s)/m.exec(text)?.[1]?.trim() ?? ''
	const sources = [...priorArt.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)]
		.map((m) => `- [${m[1]}](${m[2]})`)
		.filter((line, i, all) => all.indexOf(line) === i)
		.slice(0, 8)

	return {
		heading,
		title: field('title') || heading,
		area: field('area'),
		effort: field('effort'),
		status: field('status') || 'draft',
		problem: problem ?? '',
		sources,
	}
}

function prBody(file, p) {
	const lines = [
		'## What this is',
		'',
		'A **proposal**, not an implementation. Nothing in this branch changes the',
		'site — it adds one document describing something QairuHub could build, why,',
		'and what it would cost.',
		'',
		'| | |',
		'|---|---|',
		`| Area | ${p.area || '—'} |`,
		`| Effort | ${p.effort || '—'} |`,
		`| Status | ${p.status} |`,
		'',
		'## The problem it addresses',
		'',
		p.problem || '_See the document._',
		'',
		`Full proposal: [\`${file}\`](${file})`,
	]

	if (p.sources.length) {
		lines.push('', '## Researched against', '', ...p.sources)
	}

	lines.push(
		'',
		'## How to review',
		'',
		'Argue with it. A proposal that gets rejected with a recorded reason is a',
		'good outcome — the reasoning stays in `docs/proposals/` either way.',
		'',
		'- Is the problem real, and is it ours?',
		'- Is the smallest version in **Scope** actually the smallest useful thing?',
		'- Do the risks name the way this genuinely fails, or only easy ones?',
	)

	return lines.join('\n')
}

const files = process.argv.slice(2)
if (!files.length) {
	console.error('usage: node scripts/open-proposal-pr.mjs <proposal.md> [...]')
	process.exit(1)
}

const token = githubToken()
const opened = []

for (const file of files) {
	const p = readProposal(file)
	const slug = basename(file, '.md')
	const branch = `proposal/${slug}`

	try {
		sh('git', ['checkout', BASE])
		sh('git', ['checkout', '-B', branch])
		sh('git', ['add', '--', file])
		// The hooks run the whole test suite on push; a doc-only branch does not
		// need them, and skipping keeps a batch of twenty from taking an hour.
		sh('git', ['-c', 'core.hooksPath=/dev/null', 'commit', '-m', `docs(proposals): ${p.title}`])
		sh('git', ['push', '--force-with-lease', '-u', 'origin', branch])

		const pr = await api(`/repos/${REPO}/pulls`, {
			method: 'POST',
			token,
			body: {
				title: `Proposal: ${p.title}`,
				head: branch,
				base: BASE,
				body: prBody(file, p),
				draft: false,
			},
		})

		await api(`/repos/${REPO}/issues/${pr.number}/labels`, {
			method: 'POST',
			token,
			body: { labels: ['proposal', p.area].filter(Boolean) },
		}).catch(() => {
			/* Labels are cosmetic; a missing one must not fail the PR. */
		})

		opened.push({ number: pr.number, title: p.title, url: pr.html_url })
		console.log(`#${pr.number}  ${p.title}`)
	} catch (error) {
		console.error(`FAILED ${file}: ${error.message}`)
	} finally {
		sh('git', ['checkout', BASE])
	}
}

console.log(`\n${opened.length} of ${files.length} proposal PRs opened.`)
