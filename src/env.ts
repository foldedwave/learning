import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_PATH: {
		description: 'Path to the SQLite database file. Keep it outside the app directory in production.',
		schema: (value) => value || 'data/learning.db'
	}
});
