import {
	MAX_ROMAN,
	formatNumber,
	toRoman
} from '#lib/content/maths/number/roman-numerals/convert.ts';
import type { Question } from './types';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const shuffle = <T>(items: T[]): T[] => items.sort(() => Math.random() - 0.5);

/** Picks a number appropriate for the given curriculum level. */
export function generateNumberForLevel(conceptId: number): number {
	switch (conceptId) {
		case 1:
			// Strictly non-subtractive basics
			return pick([1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18]);
		case 2: {
			// Subtraction magic, focused on 4, 9, 14, 19, ...
			const subtractive = [4, 9, 14, 19, 24, 29, 34, 39, 4, 9, 14];
			return Math.random() < 0.75 ? pick(subtractive) : randInt(4, 33);
		}
		case 3: {
			// Tens titans (XL, L, XC, C up to 99)
			const tricky = [40, 50, 60, 70, 80, 90, 45, 95, 42, 99];
			return Math.random() < 0.6 ? pick(tricky) : randInt(40, 99);
		}
		case 4: {
			// Chunking traps (49, 99, 44, 94, ...)
			const traps = [49, 99, 44, 94, 48, 98, 74, 89, 59, 64];
			return Math.random() < 0.7 ? pick(traps) : randInt(44, 98);
		}
		case 5: {
			// Hundreds (CD, D, CM, M)
			const traps = [400, 500, 900, 444, 999, 450, 950, 499, 749, 890];
			return Math.random() < 0.5 ? pick(traps) : randInt(100, 999);
		}
		case 6:
			return randInt(1000, 3999);
		case 7: {
			// Vinculum introduction
			const special = [4000, 5000, 9000, 4500, 9500, 4999, 7500];
			return Math.random() < 0.4 ? pick(special) : randInt(4000, 9999);
		}
		case 8:
			// High thousands: round thousands 40% of the time
			return Math.random() < 0.4 ? randInt(10, 99) * 1000 : randInt(10000, 899999);
		case 9:
			return randInt(1, 3) * 1_000_000 + randInt(0, 899999);
		default:
			// Grand master: mixed ranges
			return pick([
				randInt(1, 39),
				randInt(40, 138),
				randInt(100, 999),
				randInt(1000, 3999),
				randInt(10000, 99999),
				randInt(1_000_000, 3_999_999)
			]);
	}
}

/** Builds a question, avoiding an immediate repeat of `previousValue`. */
export function createQuestion(conceptId: number, previousValue?: number): Question {
	let value: number;
	let attempts = 0;
	do {
		value = generateNumberForLevel(conceptId);
		attempts++;
	} while (value === previousValue && attempts < 25);

	// 60% number → Roman, 40% Roman → number
	const direction = Math.random() < 0.6 ? 'toRoman' : 'toDecimal';
	const roman = toRoman(value);
	const decimal = formatNumber(value);

	return {
		conceptId,
		value,
		roman,
		direction,
		promptText: direction === 'toRoman' ? decimal : roman,
		correctTarget: direction === 'toRoman' ? roman : decimal
	};
}

/** Multiple-choice options, all in the same format as the correct answer. */
export function generateChoices(q: Question): string[] {
	const distractors = new Set<number>();

	// Plausible near-misses first
	for (const d of shuffle([-1, 1, -10, 10, -5, 5, -2, 2, -100, 100, -1000, 1000])) {
		const candidate = q.value + d;
		if (candidate > 0 && candidate <= MAX_ROMAN) distractors.add(candidate);
		if (distractors.size >= 3) break;
	}

	// Fallback randoms
	for (let guard = 0; distractors.size < 3 && guard < 30; guard++) {
		const delta = randInt(1, 12);
		const candidate = Math.random() < 0.5 ? q.value + delta : Math.max(1, q.value - delta);
		if (candidate !== q.value && candidate <= MAX_ROMAN) distractors.add(candidate);
	}

	const format = q.direction === 'toRoman' ? toRoman : formatNumber;
	return shuffle([q.correctTarget, ...[...distractors].map(format)]);
}
