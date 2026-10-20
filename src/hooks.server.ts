import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { db } from '#lib/server/db/index.ts';
import { SESSION_COOKIE, hasParent, validateSession } from '#lib/server/auth.ts';
import { getChild } from '#lib/server/family.ts';

let setupDone = false;

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.child = null;
	event.locals.parent = false;

	// First run: nothing works until the parent PIN and first child exist
	setupDone ||= hasParent(db);
	const path = event.url.pathname;
	// Remote-function and asset requests live under /_app and must keep working for /legacy
	const exempt = ['/setup', '/legacy', '/_app'].some((p) => path.startsWith(p));
	if (!setupDone && !exempt) {
		redirect(303, '/setup');
	}

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = validateSession(db, token);
		if (!session) {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		} else if (session.role === 'parent') {
			event.locals.parent = true;
		} else if (session.childId !== null) {
			const row = getChild(db, session.childId);
			if (row) {
				event.locals.child = {
					id: row.id,
					displayName: row.displayName,
					avatar: row.avatar,
					yearGroup: row.yearGroup,
					settings: row.settings
				};
			}
		}
	}

	return resolve(event);
};
