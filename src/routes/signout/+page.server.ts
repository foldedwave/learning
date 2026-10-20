import { redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { SESSION_COOKIE, deleteSession } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => redirect(303, '/');

export const actions: Actions = {
	default: ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) deleteSession(db, token);
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
