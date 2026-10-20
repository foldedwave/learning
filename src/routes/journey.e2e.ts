import { expect, test, type Page } from '@playwright/test';
import { fromRoman, toRoman } from '../lib/content/maths/number/roman-numerals/convert.ts';

// One family, set up once; the journeys build on each other
test.describe.configure({ mode: 'serial' });

/** Works out the right answer from the question on screen, then gives it. */
async function answerCorrectly(page: Page) {
	const prompt = (await page.locator('#question-prompt').innerText()).trim();
	const number = /(?:Write (?:the year )?|write )([\d,]+)/i.exec(prompt);
	if (/Which is the correct way/.test(prompt)) {
		await page
			.getByRole('button', { name: toRoman(Number(number![1].replace(/,/g, ''))), exact: true })
			.click();
		return;
	}
	const answer = number
		? toRoman(Number(number[1].replace(/,/g, '')))
		: String(fromRoman(/(?:number is|finished in) ([^\s?.]+)/.exec(prompt)![1]));
	await page.getByLabel('Your answer').fill(answer);
	await page.getByRole('button', { name: 'Check my answer' }).click();
}

async function pickPictures(page: Page, pictures: number[]) {
	for (const p of pictures)
		await page.getByRole('button', { name: new RegExp(`^Picture ${p}:`) }).click();
}

async function signInAsAda(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: /Ada/ }).click();
	await pickPictures(page, [1, 2, 3]);
	await expect(page).toHaveURL(/\/today$/);
}

test('first-run setup creates the parent PIN and first child', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/setup$/);
	await page.getByLabel('PIN (4 to 6 digits)').fill('2468');
	await page.getByLabel('Type it again').fill('2468');
	await page.getByLabel('First name or nickname').fill('Ada');
	await pickPictures(page, [1, 2, 3]);
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(page.getByRole('heading', { name: "Who's learning today?" })).toBeVisible();
});

test('a child signs in, learns, practises and levels up through a Check', async ({ page }) => {
	await signInAsAda(page);

	// Three taps: subject → strand → topic
	await page.getByRole('link', { name: 'Maths' }).click();
	await page.getByRole('link', { name: /Number & place value/ }).click();
	await page.getByRole('link', { name: /Roman numerals/ }).click();
	await expect(page).toHaveURL(/roman-numerals\/learn$/);

	for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Next →' }).click();
	await answerCorrectly(page);
	await expect(page.getByText("Yes! You've got the idea.")).toBeVisible();
	await page.getByRole('button', { name: "I'm done learning ✓" }).click();
	await expect(page.getByText('Nice learning!')).toBeVisible();

	await page.getByRole('link', { name: 'Start practising →' }).click();
	for (let i = 0; i < 5; i++) {
		await answerCorrectly(page);
		await expect(page.getByText('Correct!')).toBeVisible();
		// Dismiss the level-up celebration if it appears
		const celebration = page.getByRole('button', { name: /Tap to carry on/ });
		if (await celebration.isVisible()) await celebration.click();
		if (i < 4) await page.getByRole('button', { name: 'Next question →' }).click();
	}
	await page.getByRole('button', { name: "I'm finished" }).click();
	await page.getByRole('link', { name: 'Try the Check →' }).click();

	for (let i = 0; i < 10; i++) {
		await answerCorrectly(page);
		if (i < 9) await page.getByRole('button', { name: 'Next question →' }).click();
	}
	await page.getByRole('button', { name: 'See my result →' }).click();
	await expect(page.getByText('10 out of 10')).toBeVisible();
	await expect(page.getByText(/to Secure/)).toBeVisible();
});

test('a wrong answer gets kind, targeted feedback', async ({ page }) => {
	await signInAsAda(page);
	await page.goto('/maths/number/roman-numerals/practise');
	await page.getByLabel('Working on').selectOption({ label: 'Roman numerals to 1,000' });
	await expect(page.locator('#question-prompt')).toBeVisible();
	const choice = page.locator('.choice').first();
	if (await choice.isVisible()) {
		await choice.click();
	} else {
		await page.getByLabel('Your answer').fill('0');
		await page.getByRole('button', { name: 'Check my answer' }).click();
	}
	await expect(page.getByRole('status').first()).toBeVisible();
	await expect(page.locator('.feedback')).not.toContainText('✖');
});

test('the parent sees the skill record and children cannot reach it', async ({ page }) => {
	await signInAsAda(page);
	await page.goto('/parent');
	await expect(page).toHaveURL(/\/today$/);
	await page.getByRole('button', { name: /sign out/ }).click();

	await page.getByRole('button', { name: /Parent/ }).click();
	for (const d of '2468') await page.getByRole('button', { name: d, exact: true }).click();
	await page.getByRole('button', { name: 'Unlock' }).click();
	await expect(page.getByRole('heading', { name: 'Parent area' })).toBeVisible();
	const row = page.getByRole('row', { name: /Roman numerals to 100/ });
	await expect(row).toContainText('Secure');
});

test('a wrong picture PIN is refused', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /Ada/ }).click();
	await pickPictures(page, [3, 2, 1]);
	await expect(page.getByRole('alert')).toContainText("didn't match");
});
