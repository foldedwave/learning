import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { getSkill, getTopic, questionFromItemId } from '#lib/content/index.ts';
import type { LearnCard, TopicDefinition } from '#lib/content/types.ts';
import {
	CHECK_QUESTIONS,
	REVIEW_QUESTIONS,
	WEAK_SCORE,
	WEAK_WINDOW_DAYS
} from '#lib/engine/config.ts';
import {
	applyAttempt,
	applyCheckResult,
	atLeast,
	completeLearn,
	emptyMastery,
	levelRank,
	type AttemptMode,
	type MasteryState
} from '#lib/engine/mastery.ts';
import { award, type Award, type RewardKind } from '#lib/engine/rewards.ts';
import { detectStuck, weakPrerequisites } from '#lib/engine/stuck.ts';
import { dayKey, daysBetween } from '#lib/engine/time.ts';
import type { Conn as Db } from './db/client.ts';
import { attempt, learningSession, mastery, rewardEvent, type Tab } from './db/schema.ts';

export class LearningError extends Error {
	constructor(
		public status: 400 | 403 | 404 | 409,
		message: string
	) {
		super(message);
	}
}

// ---------------------------------------------------------------------------
// Mastery records

function toState(row: typeof mastery.$inferSelect | undefined): MasteryState {
	if (!row) return emptyMastery();
	return {
		level: row.level,
		score: row.score,
		attempts: row.attempts,
		correct: row.correct,
		practiseAttempts: row.practiseAttempts,
		practiseCorrect: row.practiseCorrect,
		lastPractisedAt: row.lastPractisedAt,
		secureAt: row.secureAt,
		masteredAt: row.masteredAt,
		demotedAt: row.demotedAt,
		reviewStep: row.reviewStep,
		nextReviewAt: row.nextReviewAt,
		provisional: row.provisional
	};
}

export function getMastery(db: Db, childId: number, skillId: string): MasteryState {
	return toState(
		db
			.select()
			.from(mastery)
			.where(and(eq(mastery.childId, childId), eq(mastery.skillId, skillId)))
			.get()
	);
}

/** All of a child's mastery records; skills with no record read as Not started. */
export function masteryLookup(db: Db, childId: number): (skillId: string) => MasteryState {
	const rows = db.select().from(mastery).where(eq(mastery.childId, childId)).all();
	const map = new Map(rows.map((r) => [r.skillId, toState(r)]));
	return (skillId) => map.get(skillId) ?? emptyMastery();
}

function saveMastery(db: Db, childId: number, skillId: string, state: MasteryState, now: string) {
	const values = { ...state, updatedAt: now };
	db.insert(mastery)
		.values({ childId, skillId, ...values })
		.onConflictDoUpdate({ target: [mastery.childId, mastery.skillId], set: values })
		.run();
}

// ---------------------------------------------------------------------------
// Stars

function todaysRewards(db: Db, childId: number, now: string) {
	// London days start at most an hour before UTC midnight, so 26 hours always covers "today"
	const since = new Date(Date.parse(now) - 26 * 3_600_000).toISOString();
	const today = dayKey(now);
	return db
		.select()
		.from(rewardEvent)
		.where(and(eq(rewardEvent.childId, childId), gte(rewardEvent.createdAt, since)))
		.all()
		.map((e) => ({ ...e, day: dayKey(e.createdAt) }))
		.filter((e) => e.day === today);
}

function grant(
	db: Db,
	childId: number,
	kind: RewardKind,
	context: { skillId?: string; topicId?: string; reason: string },
	now: string
): number {
	const result: Award | null = award(kind, context, todaysRewards(db, childId, now));
	if (!result) return 0;
	db.insert(rewardEvent)
		.values({
			childId,
			kind: result.kind,
			stars: result.stars,
			reason: result.reason,
			skillId: result.skillId ?? null,
			topicId: result.topicId ?? null,
			createdAt: now
		})
		.run();
	return result.stars;
}

export function starBalance(db: Db, childId: number): number {
	const row = db
		.select({ total: sql<number>`coalesce(sum(${rewardEvent.stars}), 0)` })
		.from(rewardEvent)
		.where(eq(rewardEvent.childId, childId))
		.get();
	return row?.total ?? 0;
}

// ---------------------------------------------------------------------------
// Learning sessions

function requireTopic(topicId: string): TopicDefinition {
	const topic = getTopic(topicId);
	if (!topic) throw new LearningError(404, 'Unknown topic');
	return topic;
}

export function startSession(
	db: Db,
	childId: number,
	input: { topicId: string; tab: Tab; skillId?: string | null },
	now: string
): number {
	const topic = requireTopic(input.topicId);
	if (input.skillId && !topic.skills.some((s) => s.id === input.skillId)) {
		throw new LearningError(400, 'Skill is not part of this topic');
	}
	const row = db
		.insert(learningSession)
		.values({
			childId,
			topicId: topic.id,
			skillId: input.skillId ?? null,
			tab: input.tab,
			startedAt: now
		})
		.returning({ id: learningSession.id })
		.get();
	return row.id;
}

function getOpenSession(db: Db, childId: number, sessionId: number) {
	const session = db.select().from(learningSession).where(eq(learningSession.id, sessionId)).get();
	// A child can only ever touch their own rows
	if (!session || session.childId !== childId) throw new LearningError(404, 'Unknown session');
	if (session.endedAt) throw new LearningError(409, 'Session already finished');
	return session;
}

export interface StuckHelp {
	reason: 'same-misconception' | 'wrong-in-a-row';
	cards: LearnCard[];
	/** Prerequisites worth a quick check, with where to practise them. */
	prerequisites: { skillId: string; title: string; topicId: string }[];
}

export interface AttemptResult {
	correct: boolean;
	misconceptionId: string | null;
	/** Child-facing feedback (markdown). */
	feedback: string;
	explanation: string;
	answer: string;
	stars: number;
	level: MasteryState['level'];
	levelUp: boolean;
	stuck: StuckHelp | null;
}

export interface AttemptInput {
	sessionId: number;
	itemId: string;
	response: unknown;
	hintsUsed: number;
	scaffolded: boolean;
	timeMs: number;
}

const NOT_QUITE = "Not quite – let's look again.";

/** Marks one answer, records it and updates the mastery record. */
export function recordAttempt(
	db: Db,
	childId: number,
	input: AttemptInput,
	now: string
): AttemptResult {
	const session = getOpenSession(db, childId, input.sessionId);
	if (session.tab === 'stretch') throw new LearningError(400, 'Use the stretch endpoint');
	const topic = requireTopic(session.topicId);
	const question = questionFromItemId(input.itemId);
	if (!question || !topic.skills.some((s) => s.id === question.skillId)) {
		throw new LearningError(400, 'Unknown question');
	}
	const skill = getSkill(question.skillId)!.skill;
	const before = getMastery(db, childId, skill.id);

	const isCheck = session.tab === 'check';
	const mode: AttemptMode = isCheck
		? atLeast(before.level, 'secure')
			? 'review'
			: 'check'
		: 'practise';
	// Checks are unaided, whatever the client claims
	const hintsUsed = isCheck ? 0 : Math.max(0, Math.floor(input.hintsUsed));
	const scaffolded = isCheck ? false : input.scaffolded;
	const timeMs = Math.max(0, Math.min(Math.floor(input.timeMs), 3_600_000));

	const mark = question.mark(input.response);
	const misconceptionId = mark.correct ? null : (mark.misconceptionId ?? null);

	return db.transaction((tx) => {
		tx.insert(attempt)
			.values({
				childId,
				learningSessionId: session.id,
				skillId: skill.id,
				itemId: question.itemId,
				mode,
				response: input.response ?? null,
				correct: mark.correct,
				hintsUsed,
				scaffolded,
				timeMs,
				misconceptionId,
				createdAt: now
			})
			.run();

		const after = applyAttempt(
			before,
			{
				mode,
				correct: mark.correct,
				hintsUsed,
				scaffolded,
				timeMs,
				targetSeconds: skill.targetSeconds
			},
			now
		);
		saveMastery(tx, childId, skill.id, after, now);

		let stars = 0;
		if (mark.correct)
			stars += grant(tx, childId, 'correct', { skillId: skill.id, reason: 'Correct answer' }, now);
		const levelUp =
			levelRank(after.level) > levelRank(before.level) && before.level !== 'not-started';
		if (levelUp) {
			stars += grant(
				tx,
				childId,
				'level-up',
				{ skillId: skill.id, reason: `${skill.title}: ${after.level}` },
				now
			);
		}

		let stuck: StuckHelp | null = null;
		if (!isCheck) {
			const answers = tx
				.select({ correct: attempt.correct, misconceptionId: attempt.misconceptionId })
				.from(attempt)
				.where(and(eq(attempt.learningSessionId, session.id), eq(attempt.skillId, skill.id)))
				.orderBy(attempt.id)
				.all();
			const signal = detectStuck(answers);
			if (signal) {
				const misconception = topic.misconceptions.find((m) => m.id === signal.misconceptionId);
				const lookup = masteryLookup(tx, childId);
				stuck = {
					reason: signal.reason,
					cards: misconception?.reteach ?? topic.alternative,
					prerequisites: weakPrerequisites(skill.prerequisites, lookup).flatMap((id) => {
						const found = getSkill(id);
						return found
							? [{ skillId: id, title: found.skill.title, topicId: found.topic.id }]
							: [];
					})
				};
			}
		}

		const misconception = topic.misconceptions.find((m) => m.id === misconceptionId);
		return {
			correct: mark.correct,
			misconceptionId,
			feedback: mark.correct ? 'Correct!' : (misconception?.feedback ?? NOT_QUITE),
			explanation: question.explanation,
			answer: question.answer,
			stars,
			level: after.level,
			levelUp,
			stuck
		};
	});
}

/** Marks an answer without recording anything, for a parent previewing a topic. */
export function previewAttempt(input: Pick<AttemptInput, 'itemId' | 'response'>, topicId: string) {
	const topic = requireTopic(topicId);
	const question = questionFromItemId(input.itemId);
	if (!question || !topic.skills.some((s) => s.id === question.skillId)) {
		throw new LearningError(400, 'Unknown question');
	}
	const mark = question.mark(input.response);
	const misconception = topic.misconceptions.find((m) => m.id === mark.misconceptionId);
	return {
		correct: mark.correct,
		misconceptionId: mark.misconceptionId ?? null,
		feedback: mark.correct ? 'Correct!' : (misconception?.feedback ?? NOT_QUITE),
		explanation: question.explanation,
		answer: question.answer,
		stars: 0,
		level: 'not-started' as const,
		levelUp: false,
		stuck: null
	} satisfies AttemptResult;
}

export interface StretchResult {
	/** Null for open tasks, which the child checks against the model answer. */
	correct: boolean | null;
	modelAnswer: string;
	stars: number;
}

const normaliseAnswer = (s: string) => s.toUpperCase().replace(/[\s,.]/g, '');

export function recordStretch(
	db: Db,
	childId: number,
	input: { sessionId: number; taskId: string; response: string; timeMs: number },
	now: string
): StretchResult {
	const session = getOpenSession(db, childId, input.sessionId);
	if (session.tab !== 'stretch') throw new LearningError(400, 'Not a stretch session');
	const topic = requireTopic(session.topicId);
	const task = topic.stretch.find((t) => t.id === input.taskId);
	if (!task) throw new LearningError(400, 'Unknown task');
	const skill = getSkill(task.skillId)!.skill;
	const correct =
		task.answer === undefined
			? null
			: normaliseAnswer(input.response) === normaliseAnswer(task.answer);

	return db.transaction((tx) => {
		tx.insert(attempt)
			.values({
				childId,
				learningSessionId: session.id,
				skillId: skill.id,
				itemId: `stretch:${task.id}`,
				mode: 'stretch',
				response: input.response,
				correct: correct ?? true,
				timeMs: Math.max(0, Math.min(Math.floor(input.timeMs), 3_600_000)),
				createdAt: now
			})
			.run();
		if (correct !== null) {
			const before = getMastery(tx, childId, skill.id);
			const after = applyAttempt(
				before,
				{
					mode: 'stretch',
					correct,
					hintsUsed: 0,
					scaffolded: false,
					timeMs: input.timeMs,
					targetSeconds: skill.targetSeconds * 10
				},
				now
			);
			saveMastery(tx, childId, skill.id, after, now);
		}
		const stars = grant(
			tx,
			childId,
			'stretch-attempted',
			{ skillId: skill.id, reason: `Stretch: ${task.title}` },
			now
		);
		return { correct, modelAnswer: task.modelAnswer, stars };
	});
}

export interface FinishResult {
	completed: boolean;
	stars: number;
	/** Set for a finished Check or Review. */
	check?: {
		skillId: string;
		correct: number;
		total: number;
		from: MasteryState['level'];
		to: MasteryState['level'];
		review: boolean;
	};
}

/** Minimum answers for a Practise session to count as completed. */
export const PRACTISE_MIN_FOR_COMPLETE = 5;

export function finishSession(
	db: Db,
	childId: number,
	sessionId: number,
	now: string
): FinishResult {
	const session = getOpenSession(db, childId, sessionId);
	const topic = requireTopic(session.topicId);

	return db.transaction((tx) => {
		const answers = tx
			.select()
			.from(attempt)
			.where(eq(attempt.learningSessionId, session.id))
			.orderBy(attempt.id)
			.all();
		let stars = 0;
		let completed = false;
		let check: FinishResult['check'];

		if (session.tab === 'learn') {
			completed = true;
			for (const skill of topic.skills) {
				const before = getMastery(tx, childId, skill.id);
				const after = completeLearn(before);
				if (after !== before) saveMastery(tx, childId, skill.id, after, now);
			}
			stars += grant(
				tx,
				childId,
				'learn-completed',
				{ topicId: topic.id, reason: `Learned ${topic.title}` },
				now
			);
		} else if (session.tab === 'practise') {
			completed = answers.length >= PRACTISE_MIN_FOR_COMPLETE;
		} else if (session.tab === 'stretch') {
			completed = answers.length > 0;
		} else if (session.tab === 'check' && answers.length) {
			const skillId = session.skillId ?? answers[0].skillId;
			const own = answers.filter((a) => a.skillId === skillId);
			const review = own.some((a) => a.mode === 'review');
			const needed = review ? REVIEW_QUESTIONS : CHECK_QUESTIONS;
			if (own.length >= needed) {
				completed = true;
				const correct = own.filter((a) => a.correct).length;
				const before = getMastery(tx, childId, skillId);
				const outcome = applyCheckResult(before, correct, own.length, now);
				saveMastery(tx, childId, skillId, outcome.state, now);
				check = { skillId, correct, total: own.length, from: outcome.from, to: outcome.to, review };
				const title = getSkill(skillId)?.skill.title ?? skillId;

				if (levelRank(outcome.to) > levelRank(outcome.from) && outcome.from !== 'not-started') {
					stars += grant(
						tx,
						childId,
						'level-up',
						{ skillId, reason: `${title}: ${outcome.to}` },
						now
					);
				}
				const wasWeak =
					(before.score < WEAK_SCORE && before.attempts > 0) ||
					(before.demotedAt !== null && daysBetween(before.demotedAt, now) <= WEAK_WINDOW_DAYS);
				if (
					wasWeak &&
					outcome.to === 'secure' &&
					outcome.from !== 'secure' &&
					outcome.from !== 'mastered'
				) {
					stars += grant(
						tx,
						childId,
						'weak-to-secure',
						{ skillId, reason: `${title}: weak to Secure` },
						now
					);
				}
				const best = bestCheckScore(tx, childId, skillId, session.id);
				if (best !== null && outcome.result > best) {
					stars += grant(
						tx,
						childId,
						'beat-best-check',
						{ skillId, reason: `${title}: new best Check` },
						now
					);
				}
			}
		}

		if (completed) {
			stars += grant(
				tx,
				childId,
				'session-completed',
				{ topicId: topic.id, reason: `Finished ${session.tab}` },
				now
			);
		}
		tx.update(learningSession)
			.set({ endedAt: now, completed })
			.where(eq(learningSession.id, session.id))
			.run();
		return { completed, stars, check };
	});
}

/** Best previous completed Check or Review score (0–1) on a skill, excluding one session. */
function bestCheckScore(
	db: Db,
	childId: number,
	skillId: string,
	excludeSessionId: number
): number | null {
	const sessions = db
		.select({ id: learningSession.id })
		.from(learningSession)
		.where(
			and(
				eq(learningSession.childId, childId),
				eq(learningSession.tab, 'check'),
				eq(learningSession.completed, true),
				eq(learningSession.skillId, skillId)
			)
		)
		.all()
		.map((s) => s.id)
		.filter((id) => id !== excludeSessionId);
	if (!sessions.length) return null;
	const rows = db
		.select({ sessionId: attempt.learningSessionId, correct: attempt.correct })
		.from(attempt)
		.where(and(inArray(attempt.learningSessionId, sessions), eq(attempt.skillId, skillId)))
		.all();
	const bySession = new Map<number, { correct: number; total: number }>();
	for (const r of rows) {
		const s = bySession.get(r.sessionId!) ?? { correct: 0, total: 0 };
		s.total++;
		if (r.correct) s.correct++;
		bySession.set(r.sessionId!, s);
	}
	return Math.max(...[...bySession.values()].map((s) => s.correct / s.total));
}

/** The most recent topic the child worked on, for "Continue" cards. */
export function lastTopicId(db: Db, childId: number): string | null {
	return (
		db
			.select({ topicId: learningSession.topicId })
			.from(learningSession)
			.where(eq(learningSession.childId, childId))
			.orderBy(desc(learningSession.id))
			.limit(1)
			.get()?.topicId ?? null
	);
}
