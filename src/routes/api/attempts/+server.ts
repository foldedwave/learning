import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { readJson, requireLearner, respond } from '#lib/server/http.ts';
import { previewAttempt, recordAttempt } from '#lib/server/learning.ts';
import type { RequestHandler } from './$types';

const body = z.object({
	sessionId: z.number().int(),
	topicId: z.string(),
	itemId: z.string().max(200),
	response: z.string().max(200),
	hintsUsed: z.number().int().min(0).max(20),
	scaffolded: z.boolean(),
	timeMs: z.number().min(0)
});

/** Marks an answer, records it and returns feedback plus the mastery change. */
export const POST: RequestHandler = async (event) => {
	const learner = requireLearner(event);
	const input = await readJson(event, body);
	if ('preview' in learner) return respond(() => previewAttempt(input, input.topicId));
	return respond(() => recordAttempt(db, learner.childId, input, new Date().toISOString()));
};
