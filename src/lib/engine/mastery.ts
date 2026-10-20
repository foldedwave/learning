import {
	ALPHA,
	DEVELOPING_ACCURACY,
	EVIDENCE,
	MASTERED_AFTER_DAYS,
	PRACTISE_CORRECT_EVIDENCE,
	PRACTISE_MIN_ATTEMPTS,
	REVIEW_INTERVALS,
	REVIEW_REPEAT_SCORE,
	SECURE_SCORE,
	SLOW_FACTOR
} from './config.ts';
import { addDays, daysBetween } from './time.ts';

export type MasteryLevel = 'not-started' | 'learning' | 'developing' | 'secure' | 'mastered';
export type AttemptMode = keyof typeof ALPHA;

export const LEVELS: MasteryLevel[] = [
	'not-started',
	'learning',
	'developing',
	'secure',
	'mastered'
];

export const LEVEL_LABELS: Record<MasteryLevel, string> = {
	'not-started': 'Not started',
	learning: 'Learning',
	developing: 'Developing',
	secure: 'Secure',
	mastered: 'Mastered'
};

export const levelRank = (level: MasteryLevel) => LEVELS.indexOf(level);
export const atLeast = (level: MasteryLevel, min: MasteryLevel) =>
	levelRank(level) >= levelRank(min);

export interface MasteryState {
	level: MasteryLevel;
	/** 0–100 */
	score: number;
	attempts: number;
	correct: number;
	practiseAttempts: number;
	practiseCorrect: number;
	lastPractisedAt: string | null;
	secureAt: string | null;
	masteredAt: string | null;
	demotedAt: string | null;
	reviewStep: number | null;
	nextReviewAt: string | null;
	provisional: boolean;
}

export const emptyMastery = (): MasteryState => ({
	level: 'not-started',
	score: 0,
	attempts: 0,
	correct: 0,
	practiseAttempts: 0,
	practiseCorrect: 0,
	lastPractisedAt: null,
	secureAt: null,
	masteredAt: null,
	demotedAt: null,
	reviewStep: null,
	nextReviewAt: null,
	provisional: false
});

export interface AttemptEvidence {
	mode: AttemptMode;
	correct: boolean;
	hintsUsed: number;
	scaffolded: boolean;
	timeMs: number;
	targetSeconds: number;
}

/** Evidence e (0–1) that the child can do the skill, from one attempt. */
export function evidence(a: AttemptEvidence): number {
	if (!a.correct) return EVIDENCE.wrong;
	let e: number =
		a.scaffolded || a.hintsUsed >= 2
			? EVIDENCE.correctManyHintsOrScaffold
			: a.hintsUsed === 1
				? EVIDENCE.correctOneHint
				: EVIDENCE.correctNoHints;
	if (a.timeMs > SLOW_FACTOR * a.targetSeconds * 1000) e *= EVIDENCE.slowMultiplier;
	return e;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Updates the score and counters after one attempt, and promotes Learning → Developing on the 60% rule. */
export function applyAttempt(state: MasteryState, a: AttemptEvidence, now: string): MasteryState {
	const e = evidence(a);
	const next: MasteryState = {
		...state,
		score: round(state.score + ALPHA[a.mode] * (100 * e - state.score)),
		attempts: state.attempts + 1,
		correct: state.correct + (a.correct ? 1 : 0),
		lastPractisedAt: now
	};
	// Answering anything means the child has at least started
	if (next.level === 'not-started') next.level = 'learning';

	if (a.mode === 'practise') {
		next.practiseAttempts += 1;
		if (e >= PRACTISE_CORRECT_EVIDENCE) next.practiseCorrect += 1;
		if (
			next.level === 'learning' &&
			next.practiseAttempts >= PRACTISE_MIN_ATTEMPTS &&
			next.practiseCorrect / next.practiseAttempts >= DEVELOPING_ACCURACY
		) {
			next.level = 'developing';
		}
	}
	return next;
}

/** The Learn tab was completed. */
export function completeLearn(state: MasteryState): MasteryState {
	return state.level === 'not-started' ? { ...state, level: 'learning' } : state;
}

const reviewAt = (now: string, step: number) =>
	addDays(now, REVIEW_INTERVALS[Math.min(step, REVIEW_INTERVALS.length - 1)]);

export interface CheckOutcome {
	state: MasteryState;
	from: MasteryState['level'];
	to: MasteryState['level'];
	/** Fraction correct, 0–1. */
	result: number;
}

/**
 * Applies the result of a finished Check or Review on one skill.
 * A Check on a skill that is already Secure counts as a review, so the record stays honest.
 */
export function applyCheckResult(
	state: MasteryState,
	correct: number,
	total: number,
	now: string
): CheckOutcome {
	const result = total ? correct / total : 0;
	const from = state.level;
	const next: MasteryState = { ...state };

	if (!atLeast(state.level, 'secure')) {
		if (result >= SECURE_SCORE) {
			next.level = 'secure';
			next.secureAt = now;
			next.reviewStep = 0;
			next.nextReviewAt = reviewAt(now, 0);
		} else if (next.level === 'not-started') {
			next.level = 'learning';
		}
		return { state: next, from, to: next.level, result };
	}

	// Review of a Secure or Mastered skill
	const step = state.reviewStep ?? 0;
	if (result >= SECURE_SCORE) {
		next.provisional = false;
		next.reviewStep = Math.min(step + 1, REVIEW_INTERVALS.length - 1);
		next.nextReviewAt = reviewAt(now, next.reviewStep);
		if (
			state.level === 'secure' &&
			state.secureAt &&
			daysBetween(state.secureAt, now) >= MASTERED_AFTER_DAYS
		) {
			next.level = 'mastered';
			next.masteredAt = now;
		}
	} else if (result >= REVIEW_REPEAT_SCORE) {
		next.reviewStep = step;
		next.nextReviewAt = reviewAt(now, step);
	} else {
		next.demotedAt = now;
		next.practiseAttempts = 0;
		next.practiseCorrect = 0;
		if (state.level === 'mastered') {
			// Slips back to Secure and starts the review ladder again
			next.level = 'secure';
			next.masteredAt = null;
			next.secureAt = now;
			next.reviewStep = 0;
			next.nextReviewAt = reviewAt(now, 0);
		} else {
			// Secure (including a provisional diagnostic placement) drops to Developing
			next.level = 'developing';
			next.provisional = false;
			next.secureAt = null;
			next.reviewStep = null;
			next.nextReviewAt = null;
		}
	}
	return { state: next, from, to: next.level, result };
}

/** True when a Secure or Mastered skill's review date has arrived. */
export function isReviewDue(state: MasteryState, now: string): boolean {
	return (
		atLeast(state.level, 'secure') &&
		state.nextReviewAt !== null &&
		daysBetween(state.nextReviewAt, now) >= 0
	);
}
