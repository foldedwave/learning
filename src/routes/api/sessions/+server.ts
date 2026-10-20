import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { readJson, requireLearner, respond } from '#lib/server/http.ts';
import { startSession } from '#lib/server/learning.ts';
import { getTopic } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const body = z.object({
	topicId: z.string(),
	tab: z.enum(['learn', 'practise', 'check', 'stretch']),
	skillId: z.string().nullish()
});

/** Starts a learning session (one per tab visit). */
export const POST: RequestHandler = async (event) => {
	const learner = requireLearner(event);
	const input = await readJson(event, body);
	if ('preview' in learner) {
		if (!getTopic(input.topicId)) error(404, 'Unknown topic');
		return respond(() => ({ id: 0 }));
	}
	return respond(() => ({
		id: startSession(db, learner.childId, input, new Date().toISOString())
	}));
};
