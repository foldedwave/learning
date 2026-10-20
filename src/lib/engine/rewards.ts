/** Star values and caps. See docs/spec.md, "Rewards". */
export const STARS = {
	correct: 1,
	learnCompleted: 5,
	sessionCompleted: 5,
	diagnosticSection: 10,
	levelUp: 15,
	weakToSecure: 25,
	beatBestCheck: 10,
	stretchAttempted: 10,
	plannedDay: 20
} as const;

export const CAPS = {
	/** Correct-answer stars per skill per day. */
	correctPerSkillPerDay: 20,
	/** Stretch-attempt awards per day. */
	stretchPerDay: 3
} as const;

export type RewardKind =
	| 'correct'
	| 'learn-completed'
	| 'session-completed'
	| 'level-up'
	| 'weak-to-secure'
	| 'beat-best-check'
	| 'stretch-attempted';

export interface RewardEventLike {
	kind: string;
	stars: number;
	skillId: string | null;
	topicId: string | null;
	/** Europe/London day of the event. */
	day: string;
}

export interface Award {
	kind: RewardKind;
	stars: number;
	reason: string;
	skillId?: string;
	topicId?: string;
}

/**
 * Decides whether an event earns stars today, given today's earlier events.
 * Returns null when a cap has been reached. Stars are never taken away.
 */
export function award(
	kind: RewardKind,
	context: { skillId?: string; topicId?: string; reason: string },
	today: RewardEventLike[]
): Award | null {
	const make = (stars: number): Award => ({ kind, stars, ...context });
	switch (kind) {
		case 'correct': {
			const earned = today
				.filter((e) => e.kind === 'correct' && e.skillId === context.skillId)
				.reduce((sum, e) => sum + e.stars, 0);
			return earned + STARS.correct <= CAPS.correctPerSkillPerDay ? make(STARS.correct) : null;
		}
		case 'learn-completed':
			return today.some((e) => e.kind === kind && e.topicId === context.topicId)
				? null
				: make(STARS.learnCompleted);
		case 'beat-best-check':
			return today.some((e) => e.kind === kind && e.skillId === context.skillId)
				? null
				: make(STARS.beatBestCheck);
		case 'stretch-attempted':
			return today.filter((e) => e.kind === kind).length < CAPS.stretchPerDay
				? make(STARS.stretchAttempted)
				: null;
		case 'session-completed':
			return make(STARS.sessionCompleted);
		case 'level-up':
			return make(STARS.levelUp);
		case 'weak-to-secure':
			return make(STARS.weakToSecure);
	}
}
