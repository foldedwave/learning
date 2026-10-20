/** Every tunable threshold in the learning engine. See docs/spec.md, "Learning engine". */

/** Evidence (0–1) for a single attempt. */
export const EVIDENCE = {
	correctNoHints: 1,
	correctOneHint: 0.7,
	correctManyHintsOrScaffold: 0.4,
	wrong: 0,
	/** Multiplier for a correct answer slower than SLOW_FACTOR × targetSeconds. */
	slowMultiplier: 0.8
} as const;
export const SLOW_FACTOR = 3;

/** Learning rate α for the exponentially weighted mastery score, per attempt mode. */
export const ALPHA = {
	practise: 0.2,
	check: 0.3,
	review: 0.3,
	diagnostic: 0.3,
	stretch: 0.1
} as const;

/** Learning → Developing: practise accuracy at or above this, over at least PRACTISE_MIN_ATTEMPTS. */
export const DEVELOPING_ACCURACY = 0.6;
export const PRACTISE_MIN_ATTEMPTS = 5;
/** An attempt counts as "correct" for the 60% rule when its evidence is at least this. */
export const PRACTISE_CORRECT_EVIDENCE = 0.7;

/** Check and review score needed for Secure, and for moving up a review step. */
export const SECURE_SCORE = 0.8;
/** Review scores from this up to SECURE_SCORE repeat the current step; below it resets and demotes. */
export const REVIEW_REPEAT_SCORE = 0.6;
/** Secure → Mastered needs a passing review at least this many days after reaching Secure. */
export const MASTERED_AFTER_DAYS = 7;

export const CHECK_QUESTIONS = 10;
export const REVIEW_QUESTIONS = 5;

/** Days until the next review at each step. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const;

/** Stuck detection, within one learning session. */
export const STUCK_SAME_MISCONCEPTION = 2;
export const STUCK_WRONG_IN_A_ROW = 3;
/** A prerequisite below this score (or below Secure) is offered as a quick check when stuck. */
export const PREREQUISITE_WEAK_SCORE = 60;

/** Strengths and weaknesses. */
export const WEAK_SCORE = 50;
export const WEAK_MIN_SESSIONS = 2;
export const WEAK_MISCONCEPTION_COUNT = 3;
export const WEAK_WINDOW_DAYS = 14;
export const STRONG_ACCURACY = 0.85;
export const STRONG_RECENT_ATTEMPTS = 20;
export const STRONG_STRETCH_TASKS = 2;

/** "A day" for caps, streaks and reviews. */
export const TIME_ZONE = 'Europe/London';
