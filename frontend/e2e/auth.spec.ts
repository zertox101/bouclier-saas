import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@local');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });
});
