import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { getStrand, getTopic, subjectTitle, topicPath } from '#lib/content/index.ts';
import { lookupFor, topicLevel, topicLockedBy } from '#lib/server/progress.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	const strand = getStrand(params.subject, params.strand);
	if (!strand) error(404, 'Not found');
	const lookup = lookupFor(db, locals.child?.id ?? null);
	return {
		subject: params.subject,
		subjectTitle: subjectTitle(params.subject),
		strand: { title: strand.title, icon: strand.icon },
		stones: strand.topics.flatMap((id) => {
			const topic = getTopic(id);
			if (!topic) return [];
			return [
				{
					title: `${topic.icon} ${topic.title}`,
					level: topicLevel(topic, lookup),
					href: topicPath(topic),
					lockedBy: topicLockedBy(topic, lookup) ?? undefined
				}
			];
		})
	};
};
