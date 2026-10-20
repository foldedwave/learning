import { STRANDS, TOPICS, getSkill, topicPath } from '#lib/content/index.ts';
import type { Subject, TopicDefinition } from '#lib/content/types.ts';
import { focusSkill, isUnlocked } from '#lib/engine/focus.ts';
import {
	atLeast,
	emptyMastery,
	isReviewDue,
	levelRank,
	type MasteryLevel,
	type MasteryState
} from '#lib/engine/mastery.ts';
import type { Conn } from './db/client.ts';
import { masteryLookup } from './learning.ts';

export type Lookup = (skillId: string) => MasteryState;

/** Mastery for the signed-in child, or all Not started for a parent previewing. */
export function lookupFor(db: Conn, childId: number | null): Lookup {
	return childId === null ? () => emptyMastery() : masteryLookup(db, childId);
}

/** A topic's overall level for stepping stones: the lowest level among its started skills. */
export function topicLevel(topic: TopicDefinition, lookup: Lookup): MasteryLevel {
	const levels = topic.skills.map((s) => lookup(s.id).level);
	if (levels.every((l) => l === 'not-started')) return 'not-started';
	if (levels.every((l) => atLeast(l, 'mastered'))) return 'mastered';
	if (levels.every((l) => atLeast(l, 'secure'))) return 'secure';
	return levels.some((l) => atLeast(l, 'developing')) ? 'developing' : 'learning';
}

/** Which prerequisite (by title) a topic is waiting on, or null when it is open. */
export function topicLockedBy(topic: TopicDefinition, lookup: Lookup): string | null {
	const first = topic.skills[0];
	if (isUnlocked(first, lookup)) return null;
	const missing = first.prerequisites.find((id) => !atLeast(lookup(id).level, 'secure'))!;
	return getSkill(missing)?.skill.title ?? missing;
}

export function strandSummaries(subject: Subject, lookup: Lookup) {
	return STRANDS.filter((s) => s.subject === subject).map((strand) => {
		const skills = strand.topics.flatMap((id) => TOPICS.find((t) => t.id === id)?.skills ?? []);
		return {
			...strand,
			skillCount: skills.length,
			secureCount: skills.filter((s) => atLeast(lookup(s.id).level, 'secure')).length
		};
	});
}

export function topicSkills(topic: TopicDefinition, lookup: Lookup, now: string) {
	const focus = focusSkill(topic.skills, lookup, now);
	return {
		skills: topic.skills.map((s) => {
			const m = lookup(s.id);
			return {
				id: s.id,
				title: s.title,
				level: m.level,
				unlocked: isUnlocked(s, lookup),
				reviewDue: isReviewDue(m, now)
			};
		}),
		focus: { skillId: focus.skill.id, review: focus.review }
	};
}

/** Skills whose review date has arrived, most overdue first. */
export function reviewsDue(lookup: Lookup, now: string) {
	return TOPICS.flatMap((topic) =>
		topic.skills
			.filter((s) => isReviewDue(lookup(s.id), now))
			.map((s) => ({
				skillId: s.id,
				title: s.title,
				topicTitle: topic.title,
				href: `${topicPath(topic)}/check`,
				subject: topic.subject,
				nextReviewAt: lookup(s.id).nextReviewAt!
			}))
	).sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
}

/** Topics with work still to do, in ladder order: the "pick something myself" list. */
export function nextTopics(lookup: Lookup) {
	return TOPICS.filter(
		(t) => !topicLockedBy(t, lookup) && levelRank(topicLevel(t, lookup)) < levelRank('secure')
	);
}
