import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	subject: (param) =>
		param === 'maths' || param === 'english' || param === 'science' ? param : undefined
});
