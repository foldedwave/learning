import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Teach first: open on Learn until the topic has been started, then on Practise. */
export const load: PageServerLoad = async ({ parent }) => {
	const { base, skills } = await parent();
	redirect(303, `${base}/${skills.every((s) => s.level === 'not-started') ? 'learn' : 'practise'}`);
};
