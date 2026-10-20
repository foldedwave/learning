import { describe, expect, it } from 'vitest';
import {
	applyAttempt,
	applyCheckResult,
	completeLearn,
	emptyMastery,
	evidence,
	isReviewDue,
	type AttemptEvidence,
	type MasteryState
} from './mastery.ts';
import { detectStuck, weakPrerequisites } from './stuck.ts';
import { award, CAPS, type RewardEventLike } from './rewards.ts';
import { focusSkill, isUnlocked } from './focus.ts';
import { isAhead, isStrong, isWeak, type SkillEvidence } from './insights.ts';
import { addDays, dayKey, daysBetween } from './time.ts';

const NOW = '2026-10-20T10:00:00.000Z';
const attempt = (over: Partial<AttemptEvidence> = {}): AttemptEvidence => ({
	mode: 'practise',
	correct: true,
	hintsUsed: 0,
	scaffolded: false,
	timeMs: 5000,
	targetSeconds: 15,
	...over
});
const state = (over: Partial<MasteryState> = {}): MasteryState => ({ ...emptyMastery(), ...over });

describe('evidence', () => {
	it.each([
		[{ correct: true }, 1],
		[{ correct: true, hintsUsed: 1 }, 0.7],
		[{ correct: true, hintsUsed: 2 }, 0.4],
		[{ correct: true, scaffolded: true }, 0.4],
		[{ correct: false }, 0],
		[{ correct: false, hintsUsed: 3 }, 0],
		[{ correct: true, timeMs: 46_000 }, 0.8],
		[{ correct: true, timeMs: 45_000 }, 1],
		[{ correct: true, hintsUsed: 1, timeMs: 60_000 }, 0.56]
	])('%o → %f', (over, e) => {
		expect(evidence(attempt(over))).toBeCloseTo(e);
	});
});

describe('applyAttempt', () => {
	it.each([
		['practise', 20],
		['check', 30],
		['review', 30],
		['diagnostic', 30],
		['stretch', 10]
	] as const)('%s moves the score by α', (mode, expected) => {
		expect(applyAttempt(state(), attempt({ mode }), NOW).score).toBe(expected);
	});

	it('weights recent answers more', () => {
		const s = applyAttempt(state({ score: 50 }), attempt({ correct: false }), NOW);
		expect(s.score).toBe(40);
	});

	it('marks a not-started skill as learning', () => {
		expect(applyAttempt(state(), attempt(), NOW).level).toBe('learning');
	});

	it('promotes Learning to Developing at 60% over 5+ practise attempts', () => {
		let s = state({ level: 'learning' });
		const results = [true, false, true, false];
		for (const correct of results) s = applyAttempt(s, attempt({ correct }), NOW);
		expect(s.level).toBe('learning');
		s = applyAttempt(s, attempt({ correct: true }), NOW);
		expect(s.practiseAttempts).toBe(5);
		expect(s.level).toBe('developing');
	});

	it('does not count heavily-hinted answers as correct for the 60% rule', () => {
		let s = state({ level: 'learning' });
		for (let i = 0; i < 5; i++) s = applyAttempt(s, attempt({ hintsUsed: 2 }), NOW);
		expect(s.practiseCorrect).toBe(0);
		expect(s.level).toBe('learning');
	});

	it('does not promote from check attempts', () => {
		let s = state({ level: 'learning' });
		for (let i = 0; i < 6; i++) s = applyAttempt(s, attempt({ mode: 'check' }), NOW);
		expect(s.level).toBe('learning');
	});
});

describe('completeLearn', () => {
	it('only moves Not started to Learning', () => {
		expect(completeLearn(state()).level).toBe('learning');
		expect(completeLearn(state({ level: 'secure' })).level).toBe('secure');
	});
});

describe('applyCheckResult', () => {
	it('reaches Secure at 80% and schedules a review tomorrow', () => {
		const out = applyCheckResult(state({ level: 'developing' }), 8, 10, NOW);
		expect(out.to).toBe('secure');
		expect(out.state.reviewStep).toBe(0);
		expect(out.state.nextReviewAt).toBe(addDays(NOW, 1));
		expect(out.state.secureAt).toBe(NOW);
	});

	it('stays put below 80%', () => {
		expect(applyCheckResult(state({ level: 'developing' }), 7, 10, NOW).to).toBe('developing');
	});

	it.each([
		[0, 1, 3],
		[1, 2, 7],
		[4, 5, 60],
		[5, 5, 60]
	])('a passing review moves step %i to %i (%i days)', (step, nextStep, days) => {
		const s = state({ level: 'secure', reviewStep: step, secureAt: NOW });
		const out = applyCheckResult(s, 4, 5, NOW);
		expect(out.state.reviewStep).toBe(nextStep);
		expect(out.state.nextReviewAt).toBe(addDays(NOW, days));
	});

	it('promotes to Mastered on a passing review 7+ days after Secure', () => {
		const s = state({ level: 'secure', reviewStep: 2, secureAt: addDays(NOW, -7) });
		expect(applyCheckResult(s, 4, 5, NOW).to).toBe('mastered');
		const early = state({ level: 'secure', reviewStep: 2, secureAt: addDays(NOW, -6) });
		expect(applyCheckResult(early, 5, 5, NOW).to).toBe('secure');
	});

	it('repeats the step at 60–79%', () => {
		const s = state({ level: 'secure', reviewStep: 2, secureAt: NOW });
		const out = applyCheckResult(s, 3, 5, NOW);
		expect(out.to).toBe('secure');
		expect(out.state.reviewStep).toBe(2);
		expect(out.state.nextReviewAt).toBe(addDays(NOW, 7));
	});

	it('demotes Mastered to Secure and resets the review ladder below 60%', () => {
		const s = state({
			level: 'mastered',
			reviewStep: 4,
			secureAt: addDays(NOW, -40),
			masteredAt: addDays(NOW, -30)
		});
		const out = applyCheckResult(s, 2, 5, NOW);
		expect(out.to).toBe('secure');
		expect(out.state.reviewStep).toBe(0);
		expect(out.state.demotedAt).toBe(NOW);
		expect(out.state.masteredAt).toBeNull();
	});

	it('demotes Secure (and provisional) to Developing below 60%', () => {
		const s = state({ level: 'secure', reviewStep: 0, provisional: true, secureAt: NOW });
		const out = applyCheckResult(s, 1, 5, NOW);
		expect(out.to).toBe('developing');
		expect(out.state.provisional).toBe(false);
		expect(out.state.nextReviewAt).toBeNull();
	});

	it('clears the provisional flag on a passing review', () => {
		const s = state({ level: 'secure', reviewStep: 0, provisional: true, secureAt: NOW });
		expect(applyCheckResult(s, 5, 5, NOW).state.provisional).toBe(false);
	});
});

describe('isReviewDue', () => {
	it('is due from the review day onwards, only for Secure+', () => {
		const s = state({ level: 'secure', nextReviewAt: addDays(NOW, 1) });
		expect(isReviewDue(s, NOW)).toBe(false);
		expect(isReviewDue(s, addDays(NOW, 1))).toBe(true);
		expect(isReviewDue(state({ level: 'developing', nextReviewAt: NOW }), NOW)).toBe(false);
	});
});

describe('detectStuck', () => {
	const w = (misconceptionId: string | null = null) => ({ correct: false, misconceptionId });
	const r = { correct: true, misconceptionId: null };

	it('fires on the second wrong answer with the same misconception', () => {
		expect(detectStuck([w('a'), r, w('a')])).toEqual({
			reason: 'same-misconception',
			misconceptionId: 'a'
		});
		expect(detectStuck([w('a'), r, w('b')])).toBeNull();
	});

	it('fires after three wrong in a row', () => {
		expect(detectStuck([w(), w()])).toBeNull();
		expect(detectStuck([r, w(), w(), w()])).toEqual({ reason: 'wrong-in-a-row' });
		expect(detectStuck([w(), w(), r])).toBeNull();
	});

	it('does not fire again on every later wrong answer', () => {
		expect(detectStuck([w('a'), w('a'), w('a')])).toEqual({ reason: 'wrong-in-a-row' });
		expect(detectStuck([w(), w(), w(), w()])).toBeNull();
	});
});

describe('weakPrerequisites', () => {
	it('flags prerequisites below 60 or below Secure', () => {
		const records: Record<string, MasteryState> = {
			a: state({ level: 'secure', score: 90 }),
			b: state({ level: 'secure', score: 50 }),
			c: state({ level: 'developing', score: 80 })
		};
		expect(weakPrerequisites(['a', 'b', 'c'], (id) => records[id])).toEqual(['b', 'c']);
	});
});

describe('award', () => {
	const ev = (over: Partial<RewardEventLike>): RewardEventLike => ({
		kind: 'correct',
		stars: 1,
		skillId: 's',
		topicId: 't',
		day: '2026-10-20',
		...over
	});

	it('caps correct-answer stars per skill per day', () => {
		const today = Array.from({ length: CAPS.correctPerSkillPerDay - 1 }, () => ev({}));
		expect(award('correct', { skillId: 's', reason: '' }, today)?.stars).toBe(1);
		expect(award('correct', { skillId: 's', reason: '' }, [...today, ev({})])).toBeNull();
		expect(award('correct', { skillId: 'other', reason: '' }, [...today, ev({})])?.stars).toBe(1);
	});

	it('awards Learn completion once per topic per day', () => {
		expect(award('learn-completed', { topicId: 't', reason: '' }, [])?.stars).toBe(5);
		expect(
			award('learn-completed', { topicId: 't', reason: '' }, [ev({ kind: 'learn-completed' })])
		).toBeNull();
	});

	it('caps stretch awards at 3 per day', () => {
		const today = Array.from({ length: 3 }, () => ev({ kind: 'stretch-attempted', stars: 10 }));
		expect(award('stretch-attempted', { reason: '' }, today.slice(0, 2))?.stars).toBe(10);
		expect(award('stretch-attempted', { reason: '' }, today)).toBeNull();
	});

	it('never caps level-ups or sessions', () => {
		const lots = Array.from({ length: 50 }, () => ev({ kind: 'level-up', stars: 15 }));
		expect(award('level-up', { reason: '' }, lots)?.stars).toBe(15);
		expect(award('session-completed', { reason: '' }, lots)?.stars).toBe(5);
	});
});

describe('focusSkill', () => {
	const skills = [
		{ id: 'a', prerequisites: [] },
		{ id: 'b', prerequisites: ['a'] },
		{ id: 'c', prerequisites: ['b'] }
	];

	it('picks the first unlocked skill below Secure', () => {
		const m: Record<string, MasteryState> = {
			a: state({ level: 'secure', nextReviewAt: addDays(NOW, 3) }),
			b: state(),
			c: state()
		};
		expect(focusSkill(skills, (id) => m[id], NOW)).toEqual({ skill: skills[1], review: false });
		expect(isUnlocked(skills[2], (id) => m[id])).toBe(false);
	});

	it('prefers a skill due for review', () => {
		const m: Record<string, MasteryState> = {
			a: state({ level: 'secure', nextReviewAt: NOW }),
			b: state(),
			c: state()
		};
		expect(focusSkill(skills, (id) => m[id], NOW)).toEqual({ skill: skills[0], review: true });
	});

	it('falls back to the last skill when all are Secure', () => {
		const secure = state({ level: 'secure', nextReviewAt: addDays(NOW, 5) });
		expect(focusSkill(skills, () => secure, NOW).skill.id).toBe('c');
	});
});

describe('insights', () => {
	const evidenceFor = (over: Partial<SkillEvidence> = {}): SkillEvidence => ({
		mastery: state({ level: 'developing', score: 70 }),
		stage: 6,
		targetSeconds: 10,
		sessions: 3,
		topMisconceptionCount: 0,
		recent: [],
		stretchCompleted: 0,
		...over
	});

	it('flags weak skills', () => {
		expect(isWeak(evidenceFor(), NOW)).toBe(false);
		expect(isWeak(evidenceFor({ mastery: state({ level: 'learning', score: 40 }) }), NOW)).toBe(
			true
		);
		expect(
			isWeak(evidenceFor({ mastery: state({ level: 'learning', score: 40 }), sessions: 1 }), NOW)
		).toBe(false);
		expect(isWeak(evidenceFor({ topMisconceptionCount: 3 }), NOW)).toBe(true);
		expect(
			isWeak(
				evidenceFor({
					mastery: state({ level: 'developing', score: 70, demotedAt: addDays(NOW, -14) })
				}),
				NOW
			)
		).toBe(true);
		expect(
			isWeak(
				evidenceFor({
					mastery: state({ level: 'developing', score: 70, demotedAt: addDays(NOW, -15) })
				}),
				NOW
			)
		).toBe(false);
		expect(isWeak(evidenceFor({ mastery: state({ score: 0 }), sessions: 5 }), NOW)).toBe(false);
	});

	it('flags strong skills', () => {
		const fast = Array.from({ length: 20 }, (_, i) => ({ correct: i > 1, timeMs: 8000 }));
		const secure = state({ level: 'secure', score: 90 });
		expect(isStrong(evidenceFor({ mastery: secure, recent: fast }))).toBe(true);
		expect(
			isStrong(
				evidenceFor({ mastery: secure, recent: fast.map((a) => ({ ...a, timeMs: 12_000 })) })
			)
		).toBe(false);
		expect(isStrong(evidenceFor({ mastery: secure, stretchCompleted: 2 }))).toBe(true);
		expect(isStrong(evidenceFor({ recent: fast }))).toBe(false);
	});

	it('flags skills ahead of year group', () => {
		expect(isAhead(evidenceFor({ mastery: state({ level: 'secure' }), stage: 7 }), 6)).toBe(true);
		expect(isAhead(evidenceFor({ mastery: state({ level: 'secure' }), stage: 6 }), 6)).toBe(false);
	});
});

describe('time', () => {
	it('uses London days', () => {
		expect(dayKey('2026-07-01T23:30:00.000Z')).toBe('2026-07-02');
		expect(dayKey('2026-12-01T23:30:00.000Z')).toBe('2026-12-01');
		expect(daysBetween('2026-07-01T23:30:00.000Z', '2026-07-02T08:00:00.000Z')).toBe(0);
	});
});

describe('practice', async () => {
	const { nextDifficulty, pickGenerator, showScaffold, startingDifficulty } =
		await import('./practice.ts');

	it('adapts difficulty', () => {
		expect(startingDifficulty('learning')).toBe(1);
		expect(startingDifficulty('developing')).toBe(2);
		expect(startingDifficulty('mastered')).toBe(3);
		expect(nextDifficulty(1, [true, true])).toBe(2);
		expect(nextDifficulty(3, [true, true])).toBe(3);
		expect(nextDifficulty(2, [true, false])).toBe(1);
		expect(nextDifficulty(1, [false])).toBe(1);
		expect(nextDifficulty(2, [false, true])).toBe(2);
	});

	it('fades scaffolds', () => {
		expect(showScaffold(0, 'learning')).toBe(true);
		expect(showScaffold(3, 'learning')).toBe(false);
		expect(showScaffold(0, 'developing')).toBe(false);
	});

	it('avoids repeating a generator', () => {
		for (const r of [0, 0.3, 0.6, 0.99]) expect(pickGenerator(3, 1, r)).not.toBe(1);
		expect(pickGenerator(1, 0, 0.5)).toBe(0);
	});
});
