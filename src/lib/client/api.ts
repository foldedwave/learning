import type { AttemptResult, FinishResult, StretchResult } from '#lib/server/learning.ts';

async function post<T>(url: string, body: unknown): Promise<T> {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Request failed (${res.status})`);
	return res.json();
}

/** Talks to the learning API. A parent previewing a topic gets session 0 and nothing is recorded. */
export const api = {
	startSession: (body: { topicId: string; tab: string; skillId?: string | null }) =>
		post<{ id: number }>('/api/sessions', body),
	finishSession: (id: number) => post<FinishResult>(`/api/sessions/${id}/finish`, {}),
	attempt: (body: {
		sessionId: number;
		topicId: string;
		itemId: string;
		response: string;
		hintsUsed: number;
		scaffolded: boolean;
		timeMs: number;
	}) => post<AttemptResult>('/api/attempts', body),
	stretch: (body: {
		sessionId: number;
		topicId: string;
		taskId: string;
		response: string;
		timeMs: number;
	}) => post<StretchResult>('/api/stretch', body)
};
