import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

/** UTC ISO timestamp, set by SQLite when the row is inserted. */
const createdAt = () =>
	text('created_at')
		.notNull()
		.default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);

export type Role = 'child' | 'parent';
export type Tab = 'learn' | 'practise' | 'check' | 'stretch';
export type AttemptMode = 'practise' | 'check' | 'review' | 'diagnostic' | 'stretch';
export type MasteryLevel = 'not-started' | 'learning' | 'developing' | 'secure' | 'mastered';

export interface ChildSettings {
	voice?: string;
	sound?: boolean;
	fontScale?: 100 | 115 | 130;
}

export const child = sqliteTable('child', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	displayName: text('display_name').notNull(),
	avatar: text('avatar').notNull(),
	/** Hash of the picture PIN (picture ids joined with '-'), or null for no PIN. */
	pinHash: text('pin_hash'),
	interests: text('interests', { mode: 'json' }).$type<string[]>().notNull().default([]),
	readingAge: integer('reading_age'),
	yearGroup: integer('year_group').notNull(),
	settings: text('settings', { mode: 'json' }).$type<ChildSettings>().notNull().default({}),
	createdAt: createdAt(),
	archivedAt: text('archived_at')
});

export const parent = sqliteTable('parent', {
	id: integer('id').primaryKey(),
	pinHash: text('pin_hash').notNull(),
	settings: text('settings', { mode: 'json' })
		.$type<Record<string, unknown>>()
		.notNull()
		.default({}),
	createdAt: createdAt()
});

export const authSession = sqliteTable('auth_session', {
	/** SHA-256 of the cookie token; the raw token is never stored. */
	id: text('id').primaryKey(),
	role: text('role').$type<Role>().notNull(),
	childId: integer('child_id').references(() => child.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull(),
	lastSeenAt: text('last_seen_at').notNull()
});

export const pinAttempt = sqliteTable(
	'pin_attempt',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		role: text('role').$type<Role>().notNull(),
		childId: integer('child_id').references(() => child.id, { onDelete: 'cascade' }),
		success: integer('success', { mode: 'boolean' }).notNull(),
		createdAt: createdAt()
	},
	(t) => [index('pin_attempt_lookup').on(t.role, t.childId, t.createdAt)]
);

export const learningSession = sqliteTable(
	'learning_session',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		skillId: text('skill_id'),
		topicId: text('topic_id').notNull(),
		tab: text('tab').$type<Tab>().notNull(),
		source: text('source').$type<'own' | 'oak' | 'external'>().notNull().default('own'),
		planItemId: integer('plan_item_id'),
		startedAt: createdAt(),
		endedAt: text('ended_at'),
		completed: integer('completed', { mode: 'boolean' }).notNull().default(false)
	},
	(t) => [index('learning_session_child_started').on(t.childId, t.startedAt)]
);

export const attempt = sqliteTable(
	'attempt',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		learningSessionId: integer('learning_session_id').references(() => learningSession.id, {
			onDelete: 'cascade'
		}),
		skillId: text('skill_id').notNull(),
		itemId: text('item_id').notNull(),
		mode: text('mode').$type<AttemptMode>().notNull(),
		response: text('response', { mode: 'json' }).notNull(),
		correct: integer('correct', { mode: 'boolean' }).notNull(),
		hintsUsed: integer('hints_used').notNull().default(0),
		scaffolded: integer('scaffolded', { mode: 'boolean' }).notNull().default(false),
		timeMs: integer('time_ms').notNull(),
		misconceptionId: text('misconception_id'),
		createdAt: createdAt()
	},
	(t) => [
		index('attempt_child_skill_created').on(t.childId, t.skillId, t.createdAt),
		index('attempt_child_created').on(t.childId, t.createdAt)
	]
);

export const mastery = sqliteTable(
	'mastery',
	{
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		skillId: text('skill_id').notNull(),
		level: text('level').$type<MasteryLevel>().notNull().default('not-started'),
		score: real('score').notNull().default(0),
		attempts: integer('attempts').notNull().default(0),
		correct: integer('correct').notNull().default(0),
		/** Practise attempts and "correct" (e ≥ 0.7) ones since the last level change, for the 60% rule. */
		practiseAttempts: integer('practise_attempts').notNull().default(0),
		practiseCorrect: integer('practise_correct').notNull().default(0),
		lastPractisedAt: text('last_practised_at'),
		secureAt: text('secure_at'),
		masteredAt: text('mastered_at'),
		demotedAt: text('demoted_at'),
		reviewStep: integer('review_step'),
		nextReviewAt: text('next_review_at'),
		provisional: integer('provisional', { mode: 'boolean' }).notNull().default(false),
		updatedAt: createdAt()
	},
	(t) => [
		primaryKey({ columns: [t.childId, t.skillId] }),
		index('mastery_child_review').on(t.childId, t.nextReviewAt)
	]
);

export const plan = sqliteTable(
	'plan',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		weekStart: text('week_start').notNull(),
		status: text('status').$type<'draft' | 'approved' | 'archived'>().notNull().default('draft'),
		childNote: text('child_note'),
		parentSummary: text('parent_summary'),
		createdAt: createdAt(),
		approvedAt: text('approved_at')
	},
	(t) => [uniqueIndex('plan_child_week').on(t.childId, t.weekStart)]
);

export const planItem = sqliteTable('plan_item', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	planId: integer('plan_id')
		.notNull()
		.references(() => plan.id, { onDelete: 'cascade' }),
	day: integer('day').notNull(),
	slot: integer('slot').notNull(),
	skillId: text('skill_id'),
	topicId: text('topic_id'),
	tab: text('tab').$type<Tab>(),
	category: text('category').$type<'weak' | 'review' | 'stretch' | 'new' | 'parent'>().notNull(),
	minutes: integer('minutes').notNull().default(25),
	locked: integer('locked', { mode: 'boolean' }).notNull().default(false),
	status: text('status').$type<'todo' | 'done' | 'skipped'>().notNull().default('todo'),
	customTitle: text('custom_title')
});

export const rewardEvent = sqliteTable(
	'reward_event',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		kind: text('kind').notNull(),
		stars: integer('stars').notNull(),
		reason: text('reason').notNull(),
		skillId: text('skill_id'),
		/** Topic for caps that apply per topic (e.g. Learn tab completed). */
		topicId: text('topic_id'),
		createdAt: createdAt()
	},
	(t) => [index('reward_event_child_created').on(t.childId, t.createdAt)]
);

export const badgeAward = sqliteTable(
	'badge_award',
	{
		childId: integer('child_id')
			.notNull()
			.references(() => child.id, { onDelete: 'cascade' }),
		badgeId: text('badge_id').notNull(),
		awardedAt: createdAt()
	},
	(t) => [primaryKey({ columns: [t.childId, t.badgeId] })]
);

export const realReward = sqliteTable('real_reward', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	childId: integer('child_id').references(() => child.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	starCost: integer('star_cost').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	claimedAt: text('claimed_at'),
	approvedAt: text('approved_at')
});

export const resourceCheck = sqliteTable('resource_check', {
	url: text('url').primaryKey(),
	lastCheckedAt: text('last_checked_at').notNull(),
	statusCode: integer('status_code'),
	ok: integer('ok', { mode: 'boolean' }).notNull()
});
