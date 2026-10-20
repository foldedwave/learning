import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { PIN_PICTURES, hasParent, isDigitPin, isPicturePin } from '#lib/server/auth.ts';
import { AVATARS, createChild, createParent } from '#lib/server/family.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (hasParent(db)) redirect(303, '/');
	return { avatars: AVATARS, pictures: PIN_PICTURES };
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (hasParent(db)) redirect(303, '/');
		const form = await request.formData();
		const pin = String(form.get('pin') ?? '');
		const confirm = String(form.get('confirm') ?? '');
		const name = String(form.get('name') ?? '').trim();
		const avatar = String(form.get('avatar') ?? '');
		const yearGroup = Number(form.get('yearGroup'));
		const childPin = String(form.get('childPin') ?? '');

		const values = { name, avatar, yearGroup };
		if (!isDigitPin(pin))
			return fail(400, { ...values, message: 'The parent PIN must be 4 to 6 digits.' });
		if (pin !== confirm) return fail(400, { ...values, message: 'The two PINs do not match.' });
		if (!name || name.length > 30)
			return fail(400, { ...values, message: "Enter the child's first name or a nickname." });
		if (!(AVATARS as readonly string[]).includes(avatar))
			return fail(400, { ...values, message: 'Choose an avatar.' });
		if (!Number.isInteger(yearGroup) || yearGroup < 3 || yearGroup > 11) {
			return fail(400, { ...values, message: 'Choose a year group.' });
		}
		if (childPin && !isPicturePin(childPin))
			return fail(400, { ...values, message: 'Pick three pictures, or none.' });

		await createParent(db, pin);
		await createChild(db, { displayName: name, avatar, yearGroup, picturePin: childPin || null });
		redirect(303, '/');
	}
};
