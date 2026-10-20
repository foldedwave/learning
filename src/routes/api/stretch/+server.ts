import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { readJson, requireLearner, respond } from '#lib/server/http.ts';
import { recordStretch, type StretchResult } from '#lib/server/learning.ts';
import { getTopic } from '#lib/content/index.ts';
import type { RequestHandler } from './$types';

const body = z.object({
	sessionId: z.number().int(),
	topicId: z.string(),
	taskId: z.string(),
	response: z.string().max(2000),
	timeMs: z.number().min(0)
});

export const POST: RequestHandler = async (event) => {
	const learner = requireLearner(event);
	const input = await readJson(event, body);
	if ('preview' in learner) {
		return respond((): StretchResult => {
			const task = getTopic(input.topicId)?.stretch.find((t) => t.id === input.taskId);
			return { correct: null, modelAnswer: task?.modelAnswer ?? '', stars: 0 };
		});
	}
	return respond(() => recordStretch(db, learner.childId, input, new Date().toISOString()));
};
