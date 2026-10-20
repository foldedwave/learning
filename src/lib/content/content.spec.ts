import { describe, expect, it } from 'vitest';
import { TOPICS, makeQuestion, questionFromItemId, toView } from './index.ts';
import { validateContent } from './validate.ts';
import type { Difficulty, TopicDefinition } from './types.ts';

describe('content validation', () => {
	it('every topic is valid', () => {
		expect(validateContent(TOPICS)).toEqual([]);
	});

	it('reports unknown prerequisites and cycles', () => {
		const base = TOPICS[0];
		const broken: TopicDefinition = {
			...base,
			skills: [
				{ ...base.skills[0], prerequisites: [base.skills[1].id] },
				{ ...base.skills[1], prerequisites: [base.skills[0].id, 'maths.nowhere'] },
				...base.skills.slice(2)
			]
		};
		const problems = validateContent([broken]);
		expect(problems.some((p) => p.includes('unknown prerequisite maths.nowhere'))).toBe(true);
		expect(problems.some((p) => p.startsWith('Prerequisite cycle'))).toBe(true);
	});

	it('reports duplicate ids', () => {
		expect(validateContent([TOPICS[0], TOPICS[0]]).some((p) => p.startsWith('Duplicate'))).toBe(
			true
		);
	});
});

describe('item ids', () => {
	it('regenerate the same question', () => {
		for (const generator of TOPICS.flatMap((t) => t.generators)) {
			const q = makeQuestion(generator, 12345, 2);
			const again = questionFromItemId(q.itemId)!;
			expect(again.prompt).toBe(q.prompt);
			expect(again.answer).toBe(q.answer);
		}
	});

	it('reject malformed ids', () => {
		expect(questionFromItemId('nope')).toBeUndefined();
		expect(questionFromItemId('roman.unknown:1:2')).toBeUndefined();
		expect(questionFromItemId('roman.to-roman.to100:1:4')).toBeUndefined();
	});

	it('views never carry the answer', () => {
		const q = makeQuestion(TOPICS[0].generators[0], 7, 1 as Difficulty);
		const view = toView(q) as Record<string, unknown>;
		expect(view.answer).toBeUndefined();
		expect(view.mark).toBeUndefined();
		expect(JSON.stringify(view)).not.toContain(`"${q.answer}"`);
	});
});
