import { redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { starBalance } from '#lib/server/learning.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (locals.child) {
		return {
			learner: {
				name: locals.child.displayName,
				avatar: locals.child.avatar,
				fontScale: locals.child.settings.fontScale ?? 100
			},
			stars: starBalance(db, locals.child.id),
			preview: false
		};
	}
	// The parent can preview any page; nothing they do is recorded
	if (locals.parent) return { learner: null, stars: 0, preview: true };
	redirect(303, '/');
};
