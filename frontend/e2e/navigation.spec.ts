import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@local');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('sidebar has expected sections', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Incidents')).toBeVisible();
    await expect(page.locator('text=Assets')).toBeVisible();
    await expect(page.locator('text=Reports')).toBeVisible();
  });

  test('can navigate to datasets page', async ({ page }) => {
    await page.click('text=Available Datasets');
    await expect(page).toHaveURL(/.*datasets/, { timeout: 10000 });
    await expect(page.locator('text=CIC-IDS 2017')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to SOC dashboard', async ({ page }) => {
    await page.click('text=SOC Dashboard');
    await expect(page).toHaveURL(/.*soc/, { timeout: 10000 });
  });
});
