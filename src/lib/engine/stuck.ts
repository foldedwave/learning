import {
	PREREQUISITE_WEAK_SCORE,
	STUCK_SAME_MISCONCEPTION,
	STUCK_WRONG_IN_A_ROW
} from './config.ts';
import { atLeast, type MasteryState } from './mastery.ts';

export interface SessionAnswer {
	correct: boolean;
	misconceptionId: string | null;
}

export interface StuckSignal {
	reason: 'same-misconception' | 'wrong-in-a-row';
	/** Set when the trigger was a repeated misconception. */
	misconceptionId?: string;
}

/**
 * Checks the answers so far in one learning session (oldest first).
 * Only fires on the answer that tips it over, so the child is not offered help on every later answer.
 */
export function detectStuck(answers: SessionAnswer[]): StuckSignal | null {
	const last = answers.at(-1);
	if (!last || last.correct) return null;

	if (last.misconceptionId) {
		const count = answers.filter(
			(a) => !a.correct && a.misconceptionId === last.misconceptionId
		).length;
		if (count === STUCK_SAME_MISCONCEPTION) {
			return { reason: 'same-misconception', misconceptionId: last.misconceptionId };
		}
	}

	let run = 0;
	for (let i = answers.length - 1; i >= 0 && !answers[i].correct; i--) run++;
	if (run > 0 && run % STUCK_WRONG_IN_A_ROW === 0) return { reason: 'wrong-in-a-row' };

	return null;
}

/** Prerequisites worth a quick check when a child is stuck: low score or below Secure. */
export function weakPrerequisites(
	prerequisites: string[],
	mastery: (skillId: string) => MasteryState
): string[] {
	return prerequisites.filter((id) => {
		const m = mastery(id);
		return m.score < PREREQUISITE_WEAK_SCORE || !atLeast(m.level, 'secure');
	});
}
