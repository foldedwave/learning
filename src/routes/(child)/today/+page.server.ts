import { db } from '#lib/server/db/index.ts';
import { getTopic, SUBJECTS, topicPath } from '#lib/content/index.ts';
import { lastTopicId } from '#lib/server/learning.ts';
import { lookupFor, nextTopics, reviewsDue } from '#lib/server/progress.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const childId = locals.child?.id ?? null;
	const lookup = lookupFor(db, childId);
	const now = new Date().toISOString();
	const last = childId === null ? undefined : getTopic(lastTopicId(db, childId) ?? '');
	return {
		name: locals.child?.displayName ?? 'there',
		continueTopic: last
			? { title: last.title, icon: last.icon, subject: last.subject, href: topicPath(last) }
			: null,
		reviews: reviewsDue(lookup, now),
		suggestions: nextTopics(lookup)
			.filter((t) => t.id !== last?.id)
			.slice(0, 3)
			.map((t) => ({
				title: t.title,
				icon: t.icon,
				summary: t.summary,
				subject: t.subject,
				href: topicPath(t)
			})),
		subjects: SUBJECTS
	};
};
