import { z } from 'zod';
import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { readJson, requireLearner, respond } from '#lib/server/http.ts';
import { finishSession, type FinishResult } from '#lib/server/learning.ts';
import type { RequestHandler } from './$types';

/** Finishes a session: completes Learn, applies a Check result, awards session stars. */
export const POST: RequestHandler = async (event) => {
	const learner = requireLearner(event);
	await readJson(event, z.object({}));
	const id = Number(event.params.id);
	if (!Number.isInteger(id)) error(400, 'Invalid session');
	if ('preview' in learner) return respond((): FinishResult => ({ completed: true, stars: 0 }));
	return respond(() => finishSession(db, learner.childId, id, new Date().toISOString()));
};
