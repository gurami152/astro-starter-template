import { test, expect } from '@playwright/test';

test('Layout elements are displayed', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header.sticky');
    await expect(header).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
})