import { describe, expect, it } from 'vitest';
import { createQuestion, generateChoices, generateNumberForLevel } from './questions';

const LEVEL_RANGES: Record<number, [number, number]> = {
	1: [1, 18],
	2: [4, 39],
	3: [40, 99],
	4: [44, 99],
	5: [100, 999],
	6: [1000, 3999],
	7: [4000, 9999],
	8: [10000, 999999],
	9: [1_000_000, 3_999_999],
	10: [1, 3_999_999]
};

describe('generateNumberForLevel', () => {
	it.each(Object.entries(LEVEL_RANGES))('level %s stays in range', (id, [min, max]) => {
		for (let i = 0; i < 300; i++) {
			const n = generateNumberForLevel(Number(id));
			expect(n).toBeGreaterThanOrEqual(min);
			expect(n).toBeLessThanOrEqual(max);
		}
	});
});

describe('createQuestion', () => {
	it('does not repeat the previous value back to back', () => {
		let prev: number | undefined;
		for (let i = 0; i < 200; i++) {
			const q = createQuestion(1, prev);
			expect(q.value).not.toBe(prev);
			prev = q.value;
		}
	});
});

describe('generateChoices', () => {
	it('returns 4 unique options including the answer', () => {
		for (let i = 0; i < 200; i++) {
			const q = createQuestion(1 + (i % 10));
			const choices = generateChoices(q);
			expect(choices).toHaveLength(4);
			expect(new Set(choices).size).toBe(4);
			expect(choices).toContain(q.correctTarget);
		}
	});
});
