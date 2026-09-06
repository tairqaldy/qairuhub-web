import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

/**
 * CI configuration is the one part of the repository that cannot test itself:
 * a broken workflow is only discovered after it is pushed, and a workflow that
 * silently no-ops looks exactly like a passing one.
 *
 * These tests are cheap and catch the mistakes that actually happened here —
 * a deploy job that failed on every push for want of a secret, and action
 * versions pinned from memory that were several majors out of date.
 */

const WORKFLOW_DIR = '.github/workflows'

const workflows = readdirSync(WORKFLOW_DIR)
	.filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
	.map((file) => ({ file, doc: parse(readFileSync(join(WORKFLOW_DIR, file), 'utf8')) }))

describe('GitHub workflows', () => {
	it('finds at least the CI and deploy workflows', () => {
		expect(workflows.map((w) => w.file).sort()).toEqual(['ci.yml', 'deploy.yml'])
	})

	it.each(workflows.map((w) => w.file))('%s parses and declares jobs', (file) => {
		const { doc } = workflows.find((w) => w.file === file) ?? {}
		expect(doc).toBeTruthy()
		expect(Object.keys(doc.jobs ?? {}).length).toBeGreaterThan(0)
	})

	it('pins every action to a major version, never a floating ref', () => {
		const floating: string[] = []
		for (const { file, doc } of workflows) {
			for (const job of Object.values(doc.jobs ?? {}) as { steps?: { uses?: string }[] }[]) {
				for (const step of job.steps ?? []) {
					if (!step.uses) continue
					// A bare owner/repo, or @main / @master, moves under us without warning.
					if (!/@v\d/.test(step.uses)) floating.push(`${file}: ${step.uses}`)
				}
			}
		}
		expect(floating).toEqual([])
	})

	it('reads the Node version from .nvmrc rather than repeating it', () => {
		const hardcoded: string[] = []
		for (const { file, doc } of workflows) {
			for (const job of Object.values(doc.jobs ?? {}) as {
				steps?: { uses?: string; with?: Record<string, unknown> }[]
			}[]) {
				for (const step of job.steps ?? []) {
					if (!step.uses?.startsWith('actions/setup-node')) continue
					if (step.with?.['node-version'] !== undefined) {
						hardcoded.push(`${file}: node-version: ${step.with['node-version']}`)
					}
				}
			}
		}
		expect(hardcoded, 'a second copy of the Node version will drift').toEqual([])
	})

	it('gates the deploy job so a missing credential skips rather than fails', () => {
		const deploy = workflows.find((w) => w.file === 'deploy.yml')?.doc.jobs?.deploy
		expect(deploy).toBeTruthy()
		// Without a gate, every push to a repository without the secrets set
		// shows a red cross for a deploy nobody asked for.
		expect(String(deploy.if)).toContain('CD_ENABLED')
	})

	it('never prints a secret into the log', () => {
		const leaks: string[] = []
		for (const { file } of workflows) {
			const text = readFileSync(join(WORKFLOW_DIR, file), 'utf8')
			for (const [i, line] of text.split('\n').entries()) {
				if (/echo\s+.*secrets\./.test(line)) leaks.push(`${file}:${i + 1}`)
			}
		}
		expect(leaks).toEqual([])
	})
})
