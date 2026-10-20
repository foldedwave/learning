import { error, json, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { LearningError } from './learning.ts';

/** Parses a same-origin JSON request body, or throws a 4xx. */
export async function readJson<T>(event: RequestEvent, schema: z.ZodType<T>): Promise<T> {
	const origin = event.request.headers.get('origin');
	if (origin && origin !== event.url.origin) error(403, 'Cross-origin requests are not allowed');
	if (!event.request.headers.get('content-type')?.startsWith('application/json')) {
		error(415, 'Expected application/json');
	}
	const parsed = schema.safeParse(await event.request.json().catch(() => undefined));
	if (!parsed.success) error(400, 'Invalid request');
	return parsed.data;
}

/** Runs a learning operation, turning LearningErrors into HTTP errors. */
export function respond<T>(run: () => T) {
	try {
		return json(run());
	} catch (e) {
		if (e instanceof LearningError) error(e.status, e.message);
		throw e;
	}
}

/** The signed-in child for an API call; parents previewing get null. */
export function requireLearner(event: RequestEvent): { childId: number } | { preview: true } {
	if (event.locals.child) return { childId: event.locals.child.id };
	if (event.locals.parent) return { preview: true };
	error(401, 'Sign in first');
}
