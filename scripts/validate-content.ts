// Validates every topic file: run with `pnpm validate:content` (also covered by the unit tests).
import { TOPICS } from '#lib/content/index.ts';
import { validateContent } from '#lib/content/validate.ts';

const problems = validateContent(TOPICS);
if (problems.length) {
	console.error(`Content has ${problems.length} problem(s):`);
	for (const p of problems) console.error(`  - ${p}`);
	process.exit(1);
}
console.log(
	`Content OK: ${TOPICS.length} topic(s), ${TOPICS.reduce((n, t) => n + t.skills.length, 0)} skill(s).`
);
