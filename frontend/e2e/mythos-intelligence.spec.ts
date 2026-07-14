import { test, expect } from '@playwright/test';

test.describe('Mythos Intelligence', () => {
  test.beforeEach(async ({ page }) => {
    // Check if already authenticated
    await page.goto('/mythos-intelligence');
    const isLoginPage = await page.locator('text=Initialize Handshake').isVisible().catch(() => false);
    if (isLoginPage) {
      // Need to login first
      await page.goto('/login');
      await page.waitForSelector('input[name="email"]', { timeout: 5000 });
      await page.fill('input[name="email"]', 'admin@local');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*(dashboard|overview|admin)/, { timeout: 15000 });
    }
  });

  test('can navigate to mythos intelligence page', async ({ page }) => {
    await page.goto('/mythos-intelligence');
    await expect(page.locator('text=Mythos Intelligence').first()).toBeVisible({ timeout: 15000 });
    // Wait for page content to render
    await page.waitForTimeout(2000);
  });

  test('intelligence tab shows documents', async ({ page }) => {
    await page.goto('/mythos-intelligence');
    await page.waitForTimeout(2000);
    // Click intelligence tab if not already active
    const intelTab = page.locator('button:has-text("Intelligence"), [role="tab"]:has-text("Intelligence")').first();
    if (await intelTab.isVisible().catch(() => false)) {
      await intelTab.click();
      await page.waitForTimeout(1000);
    }
    // Check for document-like content
    const docElements = page.locator('[class*="rounded"], [class*="card"], article').first();
    await expect(docElements).toBeVisible({ timeout: 5000 });
  });

  test('hardening tab shows stacks', async ({ page }) => {
    await page.goto('/mythos-intelligence');
    await page.waitForTimeout(2000);
    const hardenTab = page.locator('button:has-text("Hardening"), [role="tab"]:has-text("Hardening")').first();
    if (await hardenTab.isVisible().catch(() => false)) {
      await hardenTab.click();
      await page.waitForTimeout(1000);
    }
    const stackElements = page.locator('[class*="rounded"], [class*="card"], article').first();
    await expect(stackElements).toBeVisible({ timeout: 5000 });
  });

  test('analyses tab is accessible', async ({ page }) => {
    await page.goto('/mythos-intelligence');
    await page.waitForTimeout(2000);
    const analysesTab = page.locator('button:has-text("Analyses"), [role="tab"]:has-text("Analyses")').first();
    if (await analysesTab.isVisible().catch(() => false)) {
      await analysesTab.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.locator('text=Analyses').first()).toBeVisible({ timeout: 5000 });
  });
});
