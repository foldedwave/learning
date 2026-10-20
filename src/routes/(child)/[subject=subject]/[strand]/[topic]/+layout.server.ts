import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { getStrand, getTopicBySlug, subjectTitle, topicPath } from '#lib/content/index.ts';
import { atLeast } from '#lib/engine/mastery.ts';
import { lookupFor, topicSkills } from '#lib/server/progress.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, params }) => {
	const topic = getTopicBySlug(params.subject, params.strand, params.topic);
	const strand = getStrand(params.subject, params.strand);
	if (!topic || !strand) error(404, 'Not found');
	const lookup = lookupFor(db, locals.child?.id ?? null);
	const progress = topicSkills(topic, lookup, new Date().toISOString());
	return {
		topicId: topic.id,
		topicTitle: topic.title,
		topicIcon: topic.icon,
		base: topicPath(topic),
		subject: topic.subject,
		crumbs: [
			{ label: subjectTitle(topic.subject), href: `/${topic.subject}` },
			{ label: strand.title, href: `/${topic.subject}/${strand.slug}` },
			{ label: topic.title }
		],
		...progress,
		stretchLocked: !progress.skills.some((s) => atLeast(s.level, 'secure'))
	};
};
