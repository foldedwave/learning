import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import {
	PIN_PICTURES,
	SESSION_COOKIE,
	signInChild,
	signInParent,
	type SignInResult
} from '#lib/server/auth.ts';
import { listChildren } from '#lib/server/family.ts';
import type { Actions, PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.child) redirect(303, '/today');
	return { children: listChildren(db), pictures: PIN_PICTURES, parent: locals.parent };
};

const MESSAGES = {
	wrong: "That PIN didn't match. Try again.",
	locked: 'Too many tries. Please wait 10 minutes.',
	unknown: 'Profile not found.'
};

function finish(result: SignInResult, cookies: Cookies, secure: boolean, to: string, who: string) {
	if (!result.ok)
		return fail(result.reason === 'locked' ? 429 : 400, { who, message: MESSAGES[result.reason] });
	cookies.set(SESSION_COOKIE, result.token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure
		// Session cookie; the server enforces the idle timeout
	});
	redirect(303, to);
}

export const actions: Actions = {
	child: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const childId = Number(form.get('childId'));
		const pin = String(form.get('pin') ?? '') || null;
		return finish(
			await signInChild(db, childId, pin),
			cookies,
			url.protocol === 'https:',
			'/today',
			`child-${childId}`
		);
	},
	parent: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const pin = String(form.get('pin') ?? '');
		return finish(
			await signInParent(db, pin),
			cookies,
			url.protocol === 'https:',
			'/parent',
			'parent'
		);
	}
};
