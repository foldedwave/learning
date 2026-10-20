import type { Rng } from '../../../rng.ts';
import type { Difficulty, Mark, QuestionGenerator, ScaffoldStep } from '../../../types.ts';
import {
	BAR,
	additiveValue,
	formatNumber,
	getPlaceValueBreakdown,
	hasSubtractivePair,
	lenientValue,
	normaliseRoman,
	toAcrossPlacesRoman,
	toAdditiveRoman,
	toReversedRoman,
	toRoman
} from './convert.ts';

export const SKILLS = {
	to100: 'maths.number.roman.read-to-100',
	to1000: 'maths.number.roman.read-to-1000',
	years: 'maths.number.roman.years',
	vinculum: 'maths.number.roman.vinculum'
} as const;

export const MISCONCEPTIONS = {
	additiveOnly: 'roman.additive-only',
	acrossPlaces: 'roman.subtract-across-places',
	fourRepeats: 'roman.four-repeats',
	reversed: 'roman.reversed-subtraction',
	vinculumIgnored: 'roman.vinculum-ignored'
} as const;

type SkillKey = keyof typeof SKILLS;

const hasTrickyDigit = (n: number) => /[49]/.test(String(n));

/** Picks a value for a skill and difficulty. Every range is listed in RANGES for the fuzz tests. */
export function pickValue(skill: SkillKey, difficulty: Difficulty, rng: Rng): number {
	const until = (make: () => number, ok: (n: number) => boolean) => {
		for (let i = 0; i < 50; i++) {
			const n = make();
			if (ok(n)) return n;
		}
		return make();
	};
	switch (skill) {
		case 'to100':
			if (difficulty === 1)
				return until(
					() => rng.int(1, 39),
					(n) => !hasTrickyDigit(n)
				);
			if (difficulty === 2)
				return until(
					() => rng.int(1, 39),
					(n) => hasTrickyDigit(n) || rng.chance(0.25)
				);
			return rng.chance(0.15)
				? 100
				: until(
						() => rng.int(40, 99),
						(n) => hasTrickyDigit(n) || rng.chance(0.3)
					);
		case 'to1000':
			if (difficulty === 1) return rng.int(1, 9) * 100 + rng.pick([0, 10, 20, 50, 60, 70]);
			if (difficulty === 2) return rng.int(100, 999);
			return until(
				() => rng.int(400, 999),
				(n) => /[49].*[49]/.test(String(n))
			);
		case 'years':
			if (difficulty === 1) return rng.int(1900, 2030);
			if (difficulty === 2) return rng.int(1000, 1899);
			return until(
				() => rng.int(1000, 3999),
				(n) => /[49].*[49]/.test(String(n))
			);
		case 'vinculum':
			if (difficulty === 1) return rng.int(4, 9) * 1000;
			if (difficulty === 2)
				return until(
					() => rng.int(4000, 99_999),
					(n) => n % 1000 !== 0 || rng.chance(0.3)
				);
			return rng.int(100_000, 3_999_999);
	}
}

/** Inclusive value ranges per skill and difficulty, checked by the fuzz tests. */
export const RANGES: Record<SkillKey, Record<Difficulty, [number, number]>> = {
	to100: { 1: [1, 39], 2: [1, 39], 3: [40, 100] },
	to1000: { 1: [100, 970], 2: [100, 999], 3: [400, 999] },
	years: { 1: [1900, 2030], 2: [1000, 1899], 3: [1000, 3999] },
	vinculum: { 1: [4000, 9000], 2: [4000, 99_999], 3: [100_000, 3_999_999] }
};

const show = (n: number, skill: SkillKey) => (skill === 'years' ? String(n) : formatNumber(n));

const chunks = (n: number) => getPlaceValueBreakdown(n);

function explanationFor(n: number, skill: SkillKey): string {
	const parts = chunks(n);
	if (parts.length === 1) return `${show(n, skill)} is written **${toRoman(n)}**.`;
	return `${show(n, skill)} = ${parts.map((p) => formatNumber(p.placeValue)).join(' + ')} = ${parts
		.map((p) => p.roman)
		.join(' + ')} = **${toRoman(n)}**`;
}

/** Marks a Roman numeral written by the child, spotting the classic mistakes. */
export function markRomanAnswer(value: number, response: unknown): Mark {
	const answer = normaliseRoman(String(response ?? ''));
	const target = toRoman(value);
	if (answer === target) return { correct: true };
	const lenient = lenientValue(answer);
	if (lenient === null) return { correct: false };
	if (target.includes(BAR) && !answer.includes(BAR) && lenient * 1000 === value) {
		return { correct: false, misconceptionId: MISCONCEPTIONS.vinculumIgnored };
	}
	if (lenient === value && /(.)\1\1\1/.test(answer.replaceAll(BAR, ''))) {
		return { correct: false, misconceptionId: MISCONCEPTIONS.fourRepeats };
	}
	if (lenient === value) return { correct: false, misconceptionId: MISCONCEPTIONS.acrossPlaces };
	if (value <= 3999 && answer === toReversedRoman(value)) {
		return { correct: false, misconceptionId: MISCONCEPTIONS.reversed };
	}
	return { correct: false };
}

/** Marks a number read from a numeral, spotting "added every symbol" and "ignored the bar". */
export function markNumberAnswer(roman: string, value: number, response: unknown): Mark {
	const n = Number(String(response ?? '').replace(/[\s,]/g, ''));
	if (!Number.isFinite(n) || String(response ?? '').trim() === '') return { correct: false };
	if (n === value) return { correct: true };
	if (hasSubtractivePair(roman) && n === additiveValue(roman)) {
		return { correct: false, misconceptionId: MISCONCEPTIONS.additiveOnly };
	}
	if (roman.includes(BAR) && n === lenientValue(roman.replaceAll(BAR, ''))) {
		return { correct: false, misconceptionId: MISCONCEPTIONS.vinculumIgnored };
	}
	return { correct: false };
}

function toRomanGenerator(skill: SkillKey): QuestionGenerator {
	return {
		id: `roman.to-roman.${skill}`,
		skillId: SKILLS[skill],
		generate(rng, difficulty) {
			const n = pickValue(skill, difficulty, rng);
			const parts = chunks(n);
			const label = show(n, skill);
			const scaffold: ScaffoldStep[] = [
				{ text: `${label} = ${parts.map((p) => formatNumber(p.placeValue)).join(' + ')}` },
				...parts.map((p, i) =>
					i === parts.length - 1
						? { text: `${formatNumber(p.placeValue)} → `, blank: p.roman }
						: { text: `${formatNumber(p.placeValue)} → ${p.roman}` }
				)
			];
			return {
				type: 'text',
				keypad: skill === 'vinculum' ? 'roman-vinculum' : 'roman',
				prompt:
					skill === 'years'
						? `Write the year **${label}** in Roman numerals.`
						: `Write **${label}** in Roman numerals.`,
				speak: `Write ${label} in Roman numerals.`,
				hints: [
					parts.length > 1
						? `Split ${label} into place-value chunks: ${parts.map((p) => formatNumber(p.placeValue)).join(' + ')}.`
						: `Which symbols make ${label}? Remember the subtraction pairs IV, IX, XL, XC, CD and CM.`,
					`Write each chunk on its own: ${parts
						.slice(0, -1)
						.map((p) => `${formatNumber(p.placeValue)} = ${p.roman}`)
						.concat(`${formatNumber(parts[parts.length - 1].placeValue)} = ?`)
						.join(', ')}`
				],
				scaffold,
				explanation: explanationFor(n, skill),
				answer: toRoman(n),
				mark: (response) => markRomanAnswer(n, response)
			};
		}
	};
}

function toNumberGenerator(skill: SkillKey): QuestionGenerator {
	return {
		id: `roman.to-number.${skill}`,
		skillId: SKILLS[skill],
		generate(rng, difficulty) {
			const n = pickValue(skill, difficulty, rng);
			const roman = toRoman(n);
			const parts = chunks(n);
			const scaffold: ScaffoldStep[] = [
				{ text: `${roman} = ${parts.map((p) => p.roman).join(' | ')}` },
				...parts.map((p, i) =>
					i === parts.length - 1
						? { text: `${p.roman} → `, blank: formatNumber(p.placeValue) }
						: { text: `${p.roman} → ${formatNumber(p.placeValue)}` }
				)
			];
			return {
				type: 'numeric',
				prompt:
					skill === 'years'
						? `A building says it was finished in **${roman}**. What year is that?`
						: `What number is **${roman}**?`,
				speak: `What number is ${roman.split('').join(' ')}?`,
				hints: [
					`Split ${roman} into chunks, one per place value: ${parts.map((p) => p.roman).join(' | ')}.`,
					`A smaller symbol before a bigger one means subtract, so ${parts.find((p) => hasSubtractivePair(p.roman))?.roman ?? parts[0].roman} is ${formatNumber((parts.find((p) => hasSubtractivePair(p.roman)) ?? parts[0]).placeValue)}. Now add the chunks.`
				],
				scaffold,
				explanation: explanationFor(n, skill),
				answer: skill === 'years' ? String(n) : formatNumber(n),
				mark: (response) => markNumberAnswer(roman, n, response)
			};
		}
	};
}

/** "Which is the right way to write N?" with distractors built from known mistakes. */
function whichIsCorrectGenerator(skill: 'to100' | 'to1000' | 'years'): QuestionGenerator {
	return {
		id: `roman.which-is-correct.${skill}`,
		skillId: SKILLS[skill],
		generate(rng, difficulty) {
			// Easy values have no 4s or 9s, so there would be no mistakes worth offering
			const d = Math.max(difficulty, 2) as Difficulty;
			let n = pickValue(skill, d, rng);
			for (let i = 0; i < 50 && !hasTrickyDigit(n); i++) n = pickValue(skill, d, rng);
			const target = toRoman(n);
			const options = new Map<string, string | undefined>([[target, undefined]]);
			const add = (value: string | null, misconceptionId?: string) => {
				if (value && !options.has(value) && options.size < 4) options.set(value, misconceptionId);
			};
			add(toAcrossPlacesRoman(n), MISCONCEPTIONS.acrossPlaces);
			add(toAdditiveRoman(n), MISCONCEPTIONS.fourRepeats);
			add(toReversedRoman(n), MISCONCEPTIONS.reversed);
			for (const d of rng.shuffle([1, -1, 10, -10, 2, -2, 100, -100])) {
				if (n + d > 0) add(toRoman(n + d));
			}
			const label = show(n, skill);
			return {
				type: 'choice',
				prompt: `Which is the correct way to write **${label}**?`,
				speak: `Which is the correct way to write ${label}?`,
				choices: rng
					.shuffle([...options])
					.map(([value, misconceptionId]) => ({ value, misconceptionId })),
				hints: [
					`Split ${label} into place-value chunks first: ${chunks(n)
						.map((p) => formatNumber(p.placeValue))
						.join(' + ')}.`,
					'No symbol repeats four times, and you can only subtract within one place value.'
				],
				explanation: explanationFor(n, skill),
				answer: target,
				mark: (response) => {
					if (response === target) return { correct: true };
					const misconceptionId = options.get(String(response));
					return misconceptionId ? { correct: false, misconceptionId } : { correct: false };
				}
			};
		}
	};
}

export const GENERATORS: QuestionGenerator[] = [
	toRomanGenerator('to100'),
	toNumberGenerator('to100'),
	whichIsCorrectGenerator('to100'),
	toRomanGenerator('to1000'),
	toNumberGenerator('to1000'),
	whichIsCorrectGenerator('to1000'),
	toRomanGenerator('years'),
	toNumberGenerator('years'),
	whichIsCorrectGenerator('years'),
	toRomanGenerator('vinculum'),
	toNumberGenerator('vinculum')
];
