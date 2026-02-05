import { test, expect } from '@playwright/test';

test('Burger menu is visible on mobile phones', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const burgerMenu = page.getByRole('button', { name: 'Toggle menu' });
    await expect(burgerMenu).toBeVisible();
})