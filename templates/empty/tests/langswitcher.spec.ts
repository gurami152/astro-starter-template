import { test, expect } from '@playwright/test';

test('Language switcher is visible', async ({ page }) => {
    await page.goto('/');

    const langSwitcherEN = page.getByRole('button', { name: 'en' });
    await expect(langSwitcherEN).toBeVisible();

    const langSwitcherUA = page.getByRole('button', { name: 'ua' });
    await expect(langSwitcherUA).toBeVisible();

    // const langSwitcherPL = page.getByRole('button', { name: 'pl' });
    // await expect(langSwitcherPL).toBeVisible();
})