import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { makeQuestion, getGenerator } from '#lib/content/index.ts';
import { SKILLS } from '#lib/content/maths/number/roman-numerals/generators.ts';
import { createDb, type Db } from './db/client.ts';
import { attempt, mastery, rewardEvent } from './db/schema.ts';
import { createSession, isLockedOut, signInChild, signInParent, validateSession } from './auth.ts';
import { createChild, createParent, listChildren } from './family.ts';
import {
	LearningError,
	finishSession,
	getMastery,
	recordAttempt,
	recordStretch,
	starBalance,
	startSession
} from './learning.ts';

const TOPIC = 'maths.number.roman';
const NOW = '2026-10-20T10:00:00.000Z';
const gen = getGenerator('roman.to-roman.to100')!;

let db: Db;
let ada: number;
let ben: number;

beforeEach(async () => {
	db = createDb(':memory:');
	await createParent(db, '2468');
	ada = await createChild(db, {
		displayName: 'Ada',
		avatar: '🦉',
		yearGroup: 6,
		picturePin: '1-2-3'
	});
	ben = await createChild(db, { displayName: 'Ben', avatar: '🐉', yearGroup: 7, picturePin: null });
});

const answer = (
	sessionId: number,
	seed: number,
	correct: boolean,
	extra: Partial<Parameters<typeof recordAttempt>[2]> = {}
) => {
	const q = makeQuestion(gen, seed, 2);
	return recordAttempt(
		db,
		ada,
		{
			sessionId,
			itemId: q.itemId,
			response: correct ? q.answer : 'ZZZ',
			hintsUsed: 0,
			scaffolded: false,
			timeMs: 4000,
			...extra
		},
		NOW
	);
};

describe('auth', () => {
	it('lists children without PIN hashes', () => {
		const kids = listChildren(db);
		expect(kids.map((k) => [k.displayName, k.hasPin])).toEqual([
			['Ada', true],
			['Ben', false]
		]);
		expect(JSON.stringify(kids)).not.toContain('argon2');
	});

	it('signs in a child with the right picture PIN only', async () => {
		expect(await signInChild(db, ada, '3-2-1')).toEqual({ ok: false, reason: 'wrong' });
		const ok = await signInChild(db, ada, '1-2-3');
		expect(ok.ok).toBe(true);
		expect((await signInChild(db, ben, null)).ok).toBe(true);
	});

	it('locks a profile for 10 minutes after 5 failures', async () => {
		const t0 = new Date(NOW);
		for (let i = 0; i < 5; i++) await signInParent(db, '0000', new Date(t0.getTime() + i * 1000));
		const t1 = new Date(t0.getTime() + 60_000);
		expect(isLockedOut(db, 'parent', null, t1)).toBe(true);
		expect(await signInParent(db, '2468', t1)).toEqual({ ok: false, reason: 'locked' });
		// The child profiles are unaffected
		expect(isLockedOut(db, 'child', ada, t1)).toBe(false);
		const t2 = new Date(t0.getTime() + 4000 + 10 * 60_000);
		expect((await signInParent(db, '2468', t2)).ok).toBe(true);
	});

	it('expires idle sessions and slides active ones', () => {
		const t0 = new Date(NOW);
		const { token } = createSession(db, { role: 'parent', childId: null }, t0);
		expect(validateSession(db, token, new Date(t0.getTime() + 20 * 60_000))?.role).toBe('parent');
		// Still valid 40 minutes after start because the last visit slid the expiry
		expect(validateSession(db, token, new Date(t0.getTime() + 40 * 60_000))).not.toBeNull();
		expect(validateSession(db, token, new Date(t0.getTime() + 80 * 60_000))).toBeNull();
		expect(validateSession(db, 'not-a-token', t0)).toBeNull();
	});
});

describe('learning', () => {
	it('records attempts, updates mastery and awards stars', () => {
		const sessionId = startSession(
			db,
			ada,
			{ topicId: TOPIC, tab: 'practise', skillId: SKILLS.to100 },
			NOW
		);
		const result = answer(sessionId, 1, true);
		expect(result.correct).toBe(true);
		expect(result.stars).toBe(1);
		expect(getMastery(db, ada, SKILLS.to100).score).toBe(20);
		expect(db.select().from(attempt).all()).toHaveLength(1);
		expect(starBalance(db, ada)).toBe(1);
	});

	it('returns misconception feedback for a known mistake', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'practise' }, NOW);
		const q = makeQuestion(getGenerator('roman.which-is-correct.to100')!, 5, 2);
		const wrong = q.choices!.find((c) => c.misconceptionId)!;
		const base = { sessionId, itemId: q.itemId, hintsUsed: 0, scaffolded: false, timeMs: 1000 };
		const result = recordAttempt(db, ada, { ...base, response: wrong.value }, NOW);
		expect(result).toMatchObject({
			correct: false,
			misconceptionId: wrong.misconceptionId,
			answer: q.answer
		});
		expect(result.feedback).not.toMatch(/Not quite/);
		const plain = recordAttempt(
			db,
			ada,
			{ ...base, itemId: makeQuestion(gen, 9, 2).itemId, response: 'ZZZ' },
			NOW
		);
		expect(plain.feedback).toMatch(/Not quite/);
	});

	it('offers help after three wrong answers in a row', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'practise' }, NOW);
		expect(answer(sessionId, 1, false).stuck).toBeNull();
		expect(answer(sessionId, 2, false).stuck).toBeNull();
		const third = answer(sessionId, 3, false);
		expect(third.stuck?.reason).toBe('wrong-in-a-row');
		expect(third.stuck?.cards.length).toBeGreaterThan(0);
	});

	it('promotes to Developing through practise and Secure through a 10-question Check', () => {
		const practise = startSession(
			db,
			ada,
			{ topicId: TOPIC, tab: 'practise', skillId: SKILLS.to100 },
			NOW
		);
		let last;
		for (let i = 0; i < 5; i++) last = answer(practise, i, i !== 0);
		expect(last!.level).toBe('developing');
		expect(last!.levelUp).toBe(true);
		expect(finishSession(db, ada, practise, NOW).completed).toBe(true);

		const check = startSession(
			db,
			ada,
			{ topicId: TOPIC, tab: 'check', skillId: SKILLS.to100 },
			NOW
		);
		for (let i = 0; i < 9; i++) answer(check, 100 + i, i !== 0, { hintsUsed: 3 });
		// Too few questions: nothing changes yet
		const early = startSession(
			db,
			ada,
			{ topicId: TOPIC, tab: 'check', skillId: SKILLS.to100 },
			NOW
		);
		expect(finishSession(db, ada, early, NOW).completed).toBe(false);
		answer(check, 200, true);
		const result = finishSession(db, ada, check, NOW);
		expect(result.check).toMatchObject({ correct: 9, total: 10, from: 'developing', to: 'secure' });
		expect(getMastery(db, ada, SKILLS.to100).nextReviewAt).not.toBeNull();
		// Hints are ignored in a Check
		const rows = db.select().from(attempt).where(eq(attempt.learningSessionId, check)).all();
		expect(rows.every((r) => r.hintsUsed === 0 && r.mode === 'check')).toBe(true);
	});

	it('caps correct-answer stars at 20 per skill per day', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'practise' }, NOW);
		for (let i = 0; i < 25; i++) answer(sessionId, i, true);
		const correctStars = db.select().from(rewardEvent).where(eq(rewardEvent.kind, 'correct')).all();
		expect(correctStars.reduce((s, e) => s + e.stars, 0)).toBe(20);
	});

	it('awards Learn completion once per topic per day and moves skills to Learning', () => {
		const a = startSession(db, ada, { topicId: TOPIC, tab: 'learn' }, NOW);
		expect(finishSession(db, ada, a, NOW).stars).toBe(10);
		const b = startSession(db, ada, { topicId: TOPIC, tab: 'learn' }, NOW);
		expect(finishSession(db, ada, b, NOW).stars).toBe(5);
		expect(getMastery(db, ada, SKILLS.vinculum).level).toBe('learning');
	});

	it('keeps each child to their own sessions', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'practise' }, NOW);
		const q = makeQuestion(gen, 1, 2);
		expect(() =>
			recordAttempt(
				db,
				ben,
				{
					sessionId,
					itemId: q.itemId,
					response: q.answer,
					hintsUsed: 0,
					scaffolded: false,
					timeMs: 1
				},
				NOW
			)
		).toThrow(LearningError);
		expect(() => finishSession(db, ben, sessionId, NOW)).toThrow(LearningError);
		expect(db.select().from(mastery).where(eq(mastery.childId, ben)).all()).toHaveLength(0);
	});

	it('rejects questions from another topic or with a forged id', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'practise' }, NOW);
		expect(() =>
			recordAttempt(
				db,
				ada,
				{
					sessionId,
					itemId: 'roman.to-roman.to100:abc:2',
					response: 'I',
					hintsUsed: 0,
					scaffolded: false,
					timeMs: 1
				},
				NOW
			)
		).toThrow(LearningError);
		expect(() => startSession(db, ada, { topicId: 'maths.nope', tab: 'learn' }, NOW)).toThrow(
			LearningError
		);
	});

	it('marks stretch tasks with an exact answer and caps stretch stars', () => {
		const sessionId = startSession(db, ada, { topicId: TOPIC, tab: 'stretch' }, NOW);
		const r = recordStretch(
			db,
			ada,
			{ sessionId, taskId: 'roman.stretch.one-of-each', response: '1,666', timeMs: 5000 },
			NOW
		);
		expect(r).toMatchObject({ correct: true, stars: 10 });
		const open = recordStretch(
			db,
			ada,
			{ sessionId, taskId: 'roman.stretch.clock', response: 'It looks balanced', timeMs: 5000 },
			NOW
		);
		expect(open.correct).toBeNull();
		recordStretch(
			db,
			ada,
			{ sessionId, taskId: 'roman.stretch.add-numerals', response: 'C', timeMs: 5000 },
			NOW
		);
		expect(
			recordStretch(
				db,
				ada,
				{ sessionId, taskId: 'roman.stretch.longest', response: '1888', timeMs: 5000 },
				NOW
			).stars
		).toBe(0);
	});
});
