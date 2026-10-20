import type { Difficulty } from '#lib/content/types.ts';
import { atLeast, type MasteryLevel } from './mastery.ts';

/** Early questions in a Practise session show partly worked steps; they fade after this many. */
export const SCAFFOLD_QUESTIONS = 3;

export function startingDifficulty(level: MasteryLevel): Difficulty {
	if (atLeast(level, 'secure')) return 3;
	return level === 'developing' ? 2 : 1;
}

/** Two right in a row steps up; a wrong answer steps down. */
export function nextDifficulty(current: Difficulty, recent: boolean[]): Difficulty {
	const last = recent.at(-1);
	if (last === false) return Math.max(1, current - 1) as Difficulty;
	if (recent.length >= 2 && recent.slice(-2).every(Boolean))
		return Math.min(3, current + 1) as Difficulty;
	return current;
}

/** Scaffolds fade: shown on the first few questions while the skill is still new. */
export function showScaffold(index: number, level: MasteryLevel): boolean {
	return index < SCAFFOLD_QUESTIONS && !atLeast(level, 'developing');
}

/** Picks a generator index, avoiding the previous one when there is a choice. */
export function pickGenerator(count: number, previous: number | null, random: number): number {
	if (count <= 1 || previous === null) return Math.floor(random * count);
	const i = Math.floor(random * (count - 1));
	return i >= previous ? i + 1 : i;
}
