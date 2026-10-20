import { db } from '#lib/server/db/index.ts';
import { subjectTitle } from '#lib/content/index.ts';
import { lookupFor, strandSummaries } from '#lib/server/progress.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	const lookup = lookupFor(db, locals.child?.id ?? null);
	return {
		subject: params.subject,
		title: subjectTitle(params.subject),
		strands: strandSummaries(params.subject, lookup)
	};
};
