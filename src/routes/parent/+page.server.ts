import { fail } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { PIN_PICTURES, isPicturePin } from '#lib/server/auth.ts';
import { AVATARS, createChild, listChildren } from '#lib/server/family.ts';
import { TOPICS } from '#lib/content/index.ts';
import { LEVEL_LABELS } from '#lib/engine/mastery.ts';
import { lookupFor } from '#lib/server/progress.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const children = listChildren(db).map((kid) => {
		const lookup = lookupFor(db, kid.id);
		return {
			...kid,
			skills: TOPICS.flatMap((topic) =>
				topic.skills.map((skill) => {
					const m = lookup(skill.id);
					return {
						id: skill.id,
						title: skill.title,
						topic: topic.title,
						level: LEVEL_LABELS[m.level],
						score: Math.round(m.score),
						attempts: m.attempts,
						accuracy: m.attempts ? Math.round((100 * m.correct) / m.attempts) : null,
						nextReviewAt: m.nextReviewAt
					};
				})
			)
		};
	});
	return { children, avatars: AVATARS, pictures: PIN_PICTURES };
};

export const actions: Actions = {
	addChild: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const avatar = String(form.get('avatar') ?? '');
		const yearGroup = Number(form.get('yearGroup'));
		const childPin = String(form.get('childPin') ?? '');
		if (!name || name.length > 30) return fail(400, { message: 'Enter a first name or nickname.' });
		if (!(AVATARS as readonly string[]).includes(avatar))
			return fail(400, { message: 'Choose an avatar.' });
		if (!Number.isInteger(yearGroup) || yearGroup < 3 || yearGroup > 11)
			return fail(400, { message: 'Choose a year group.' });
		if (childPin && !isPicturePin(childPin))
			return fail(400, { message: 'Pick three pictures, or none.' });
		await createChild(db, { displayName: name, avatar, yearGroup, picturePin: childPin || null });
		return { added: name };
	}
};
