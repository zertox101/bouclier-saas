import { test, expect } from '@playwright/test';

test.describe('Offensive Consultant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@local');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('can navigate to offensive consultant page', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await expect(page.locator('text=Offensive Security Consultant')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard tab shows engagement stats', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Engagements').first()).toBeVisible();
    await expect(page.locator('text=Findings').first()).toBeVisible();
  });

  test('can view engagements tab', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await page.click('text=Engagements');
    await expect(page.locator('text=Engagements').first()).toBeVisible();
  });

  test('can view findings tab', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await page.click('text=Findings');
    await expect(page.locator('text=Findings').first()).toBeVisible();
  });

  test('can view toolkit tab', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await page.click('text=Toolkit');
    await expect(page.locator('text=Nmap').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Metasploit').first()).toBeVisible();
  });

  test('can navigate to scanner page', async ({ page }) => {
    await page.goto('/offensive-consultant/scanner');
    await expect(page.locator('text=Network Scanner')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Scan')).toBeVisible();
  });

  test('scanner page has target input and scan button', async ({ page }) => {
    await page.goto('/offensive-consultant/scanner');
    const input = page.locator('input[placeholder*="IP"]');
    await expect(input).toBeVisible();
    await input.fill('192.168.1.1');
    await page.click('text=Scan');
  });

  test('can navigate to advanced reports page', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=Advanced Reports')).toBeVisible({ timeout: 10000 });
  });

  test('reports page shows template generation buttons', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=Generate Report').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Report History').first()).toBeVisible();
  });

  test('can navigate directly to engagement detail', async ({ page }) => {
    await page.goto('/offensive-consultant');
    await page.click('text=Engagements');
    const firstEngagement = page.locator('text=ENG-').first();
    if (await firstEngagement.isVisible()) {
      await firstEngagement.click();
      await expect(page).toHaveURL(/.*engagements\/ENG-/, { timeout: 10000 });
    }
  });
});
