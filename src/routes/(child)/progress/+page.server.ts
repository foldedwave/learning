import { db } from '#lib/server/db/index.ts';
import { STRANDS, SUBJECTS, getTopic, topicPath } from '#lib/content/index.ts';
import { lookupFor } from '#lib/server/progress.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const lookup = lookupFor(db, locals.child?.id ?? null);
	return {
		subjects: SUBJECTS.map((subject) => ({
			...subject,
			strands: STRANDS.filter((s) => s.subject === subject.id && s.topics.length).map((strand) => ({
				title: strand.title,
				stones: strand.topics.flatMap((id) => {
					const topic = getTopic(id);
					return (topic?.skills ?? []).map((skill) => ({
						title: skill.title,
						level: lookup(skill.id).level,
						href: `${topicPath(topic!)}/practise?skill=${skill.id}`
					}));
				})
			}))
		}))
	};
};
