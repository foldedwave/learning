import { expect, test } from '@playwright/test';

test('loads the quest and answers a multiple-choice question', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'ROMAN QUEST' })).toBeVisible();
	await expect(page.getByText('0 / 5 to next star')).toBeVisible();

	// Any choice resolves the question and reveals the next-challenge button
	await page.locator('.choice').first().click();
	await expect(page.getByRole('button', { name: /Next Challenge/ })).toBeVisible();
});

test('persists the selected level in browser storage', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /Lvl 3/ }).click();
	await page.reload();
	await expect(page.getByRole('button', { name: /Lvl 3/ })).toHaveAttribute('aria-pressed', 'true');
});

test('converter machine translates numbers', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByLabel('Number to convert')).toHaveValue('1984');
	await expect(page.locator('output')).toHaveText('MCMLXXXIV');
});
