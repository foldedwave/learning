import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		// A fresh database for every run, so first-run setup is exercised too
		command: 'rm -f data/e2e.db* && npm run build && npm run preview',
		port: 4173,
		env: { DATABASE_PATH: 'data/e2e.db' }
	},
	testMatch: '**/*.e2e.{ts,js}'
});
