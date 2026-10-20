import {
	STRONG_ACCURACY,
	STRONG_RECENT_ATTEMPTS,
	STRONG_STRETCH_TASKS,
	WEAK_MIN_SESSIONS,
	WEAK_MISCONCEPTION_COUNT,
	WEAK_SCORE,
	WEAK_WINDOW_DAYS
} from './config.ts';
import { atLeast, type MasteryState } from './mastery.ts';
import { daysBetween } from './time.ts';

export interface SkillEvidence {
	mastery: MasteryState;
	stage: number;
	targetSeconds: number;
	/** Learning sessions that included this skill. */
	sessions: number;
	/** Most frequent misconception count within the last 14 days. */
	topMisconceptionCount: number;
	/** Most recent attempts, newest first. */
	recent: { correct: boolean; timeMs: number }[];
	stretchCompleted: number;
}

const median = (values: number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function isWeak(s: SkillEvidence, now: string): boolean {
	const m = s.mastery;
	if (!atLeast(m.level, 'learning')) return false;
	return (
		(m.score < WEAK_SCORE && s.sessions >= WEAK_MIN_SESSIONS) ||
		s.topMisconceptionCount >= WEAK_MISCONCEPTION_COUNT ||
		(m.demotedAt !== null && daysBetween(m.demotedAt, now) <= WEAK_WINDOW_DAYS)
	);
}

export function isStrong(s: SkillEvidence): boolean {
	if (!atLeast(s.mastery.level, 'secure')) return false;
	if (s.stretchCompleted >= STRONG_STRETCH_TASKS) return true;
	const recent = s.recent.slice(0, STRONG_RECENT_ATTEMPTS);
	if (!recent.length) return false;
	const accuracy = recent.filter((a) => a.correct).length / recent.length;
	return (
		accuracy >= STRONG_ACCURACY && median(recent.map((a) => a.timeMs)) <= s.targetSeconds * 1000
	);
}

/** Secure above the child's year group. */
export function isAhead(s: SkillEvidence, yearGroup: number): boolean {
	return atLeast(s.mastery.level, 'secure') && s.stage > yearGroup;
}
