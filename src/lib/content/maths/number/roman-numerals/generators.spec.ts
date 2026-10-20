import { describe, expect, it } from 'vitest';
import { createRng } from '../../../rng.ts';
import { makeQuestion } from '../../../index.ts';
import type { Difficulty } from '../../../types.ts';
import { fromRoman, toRoman } from './convert.ts';
import {
	GENERATORS,
	MISCONCEPTIONS,
	RANGES,
	markNumberAnswer,
	markRomanAnswer,
	pickValue
} from './generators.ts';

const DIFFICULTIES: Difficulty[] = [1, 2, 3];

describe('pickValue', () => {
	it.each(Object.entries(RANGES))('%s stays within its declared ranges', (skill, ranges) => {
		for (const d of DIFFICULTIES) {
			const rng = createRng(d * 101);
			for (let i = 0; i < 500; i++) {
				const n = pickValue(skill as keyof typeof RANGES, d, rng);
				expect(Number.isInteger(n)).toBe(true);
				expect(n).toBeGreaterThanOrEqual(ranges[d][0]);
				expect(n).toBeLessThanOrEqual(ranges[d][1]);
			}
		}
	});
});

describe.each(GENERATORS.map((g) => [g.id, g] as const))('generator %s', (_, generator) => {
	it.each(DIFFICULTIES)('difficulty %i: 500 questions mark their own answer correct', (d) => {
		for (let seed = 0; seed < 500; seed++) {
			const q = makeQuestion(generator, seed, d);
			expect(q.prompt.trim()).not.toBe('');
			expect(q.prompt).not.toMatch(/NaN|undefined|Invalid/);
			expect(q.answer).not.toMatch(/NaN|undefined|Invalid/);
			expect(q.hints.length).toBeGreaterThan(0);
			expect(q.mark(q.answer)).toEqual({ correct: true });
			if (q.type === 'choice') {
				const values = q.choices!.map((c) => c.value);
				expect(new Set(values).size).toBe(values.length);
				expect(values).toContain(q.answer);
				expect(values.length).toBeGreaterThanOrEqual(3);
				for (const c of q.choices!) {
					if (c.value !== q.answer) expect(q.mark(c.value).correct).toBe(false);
				}
			}
		}
	});

	it.each(DIFFICULTIES)('difficulty %i: repeats stay low across 50 runs', (d) => {
		// Some ranges are small (only ~24 numbers under 40 avoid 4s and 9s), so compare against
		// the distinct count expected from 50 fair draws over the generator's actual answer space.
		const space = new Set(
			Array.from({ length: 2000 }, (_, seed) => makeQuestion(generator, seed, d).prompt)
		).size;
		const expected = space * (1 - (1 - 1 / space) ** 50);
		const unique = new Set(
			Array.from({ length: 50 }, (_, i) => makeQuestion(generator, i * 7919 + 1, d).prompt)
		).size;
		expect(unique).toBeGreaterThanOrEqual(Math.floor(0.8 * expected));
		if (space >= 500) expect(50 - unique).toBeLessThan(10);
	});

	it('is deterministic for a seed', () => {
		expect(makeQuestion(generator, 99, 2).prompt).toBe(makeQuestion(generator, 99, 2).prompt);
	});
});

describe('markRomanAnswer', () => {
	it.each([
		[49, 'xlix', { correct: true }],
		[49, 'IL', { correct: false, misconceptionId: MISCONCEPTIONS.acrossPlaces }],
		[99, 'IC', { correct: false, misconceptionId: MISCONCEPTIONS.acrossPlaces }],
		[4, 'IIII', { correct: false, misconceptionId: MISCONCEPTIONS.fourRepeats }],
		[40, 'XXXX', { correct: false, misconceptionId: MISCONCEPTIONS.fourRepeats }],
		[4, 'VI', { correct: false, misconceptionId: MISCONCEPTIONS.reversed }],
		[49, 'LXXI', { correct: false, misconceptionId: MISCONCEPTIONS.reversed }],
		[5000, 'V', { correct: false, misconceptionId: MISCONCEPTIONS.vinculumIgnored }],
		[49, 'XLVIII', { correct: false }],
		[49, 'hello', { correct: false }]
	])('%i answered as %s', (value, answer, expected) => {
		expect(markRomanAnswer(value, answer)).toEqual(expected);
	});
});

describe('markNumberAnswer', () => {
	it.each([
		['XLIX', 49, '49', { correct: true }],
		['MMXXVI', 2026, '2,026', { correct: true }],
		['IV', 4, '6', { correct: false, misconceptionId: MISCONCEPTIONS.additiveOnly }],
		['XC', 90, '110', { correct: false, misconceptionId: MISCONCEPTIONS.additiveOnly }],
		[toRoman(5000), 5000, '5', { correct: false, misconceptionId: MISCONCEPTIONS.vinculumIgnored }],
		['VI', 6, '4', { correct: false }],
		['VI', 6, '', { correct: false }],
		['VI', 6, 'six', { correct: false }]
	])('%s answered as %s', (roman, value, answer, expected) => {
		expect(fromRoman(roman)).toBe(value);
		expect(markNumberAnswer(roman, value, answer)).toEqual(expected);
	});
});
