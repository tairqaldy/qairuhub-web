import { z } from 'astro/zod'

const s = z.object({
	topic: z.enum(['a', 'b']),
	msg: z.string().min(20),
	name: z.string(),
})
const r = s.safeParse({ topic: 'nope', msg: 'short' })
for (const issue of r.error.issues) {
	console.log(
		JSON.stringify({
			path: issue.path,
			code: issue.code,
			message: issue.message,
			hasInput: 'input' in issue,
			input: issue.input,
			keys: Object.keys(issue),
		}),
	)
}
