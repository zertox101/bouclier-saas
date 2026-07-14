# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mythos-intelligence.spec.ts >> Mythos Intelligence >> intelligence tab shows documents
- Location: e2e\mythos-intelligence.spec.ts:18:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e10]:
        - heading "CYBERSHIELD" [level=1] [ref=e11]
        - paragraph [ref=e12]: Secure Access Portal v10.0
    - generic [ref=e16]:
      - generic [ref=e18]:
        - img [ref=e19]
        - generic [ref=e21]: Université Ibn Tofail - Cyber Lab
      - generic [ref=e22]:
        - generic [ref=e24]:
          - generic [ref=e25]:
            - img [ref=e29]
            - heading "Sentinel Node" [level=1] [ref=e31]
            - generic [ref=e32]:
              - img [ref=e33]
              - text: AUTHORIZATION REQUIRED
          - generic [ref=e35]:
            - generic [ref=e36]:
              - generic [ref=e37]: Operative ID / Email
              - generic [ref=e38]:
                - img [ref=e39]
                - textbox "user@uit.ac.ma" [ref=e42]: admin@local
            - generic [ref=e43]:
              - generic [ref=e44]:
                - generic [ref=e45]: Security Key
                - link "Lost Key?" [ref=e46] [cursor=pointer]:
                  - /url: "#"
              - generic [ref=e47]:
                - img [ref=e48]
                - textbox "••••••••••••" [ref=e51]: admin123
                - button [ref=e52] [cursor=pointer]:
                  - img [ref=e53]
            - generic [ref=e56]:
              - img [ref=e57]
              - text: Invalid credentials. Please try again.
            - button "Initialize Handshake" [ref=e59] [cursor=pointer]:
              - generic [ref=e60]:
                - img [ref=e61]
                - text: Initialize Handshake
                - img [ref=e70]
        - generic [ref=e73]:
          - generic [ref=e74]: SECURE CHANNEL
          - generic [ref=e76]: "ENC: AES-256-GCM"
      - generic [ref=e77]:
        - paragraph [ref=e78]: Projet Académique — Université Ibn Tofail
        - link "Request Student Access (Undergrad)" [ref=e79] [cursor=pointer]:
          - /url: /register
    - generic [ref=e80]:
      - paragraph [ref=e81]: RESTRICTED ACCESS. UNAUTHORIZED ENTRY LOGGED.
      - paragraph [ref=e82]: "ID: GMVJNP"
  - alert [ref=e83]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Mythos Intelligence', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/login');
  6   |     await page.fill('input[name="email"]', 'admin@local');
  7   |     await page.fill('input[name="password"]', 'admin123');
  8   |     await page.click('button[type="submit"]');
> 9   |     await page.waitForURL(/.*dashboard/, { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  10  |   });
  11  | 
  12  |   test('can navigate to mythos intelligence page', async ({ page }) => {
  13  |     await page.goto('/mythos-intelligence');
  14  |     await expect(page.locator('text=Mythos Intelligence')).toBeVisible({ timeout: 10000 });
  15  |     await expect(page.locator('text=Cyber Kill Chain')).toBeVisible();
  16  |   });
  17  | 
  18  |   test('intelligence tab shows documents', async ({ page }) => {
  19  |     await page.goto('/mythos-intelligence');
  20  |     await expect(page.locator('text=Intelligence').first()).toBeVisible({ timeout: 10000 });
  21  |     await page.click('text=Intelligence');
  22  |     await expect(page.locator('text=Intelligence').first()).toBeVisible();
  23  |     const docCards = page.locator('[class*="rounded-lg"][class*="border"]');
  24  |     const count = await docCards.count();
  25  |     expect(count).toBeGreaterThan(0);
  26  |   });
  27  | 
  28  |   test('hardening tab shows stacks', async ({ page }) => {
  29  |     await page.goto('/mythos-intelligence');
  30  |     await page.click('text=Hardening');
  31  |     await expect(page.locator('text=OSSEC').first()).toBeVisible({ timeout: 10000 });
  32  |     const stackCards = page.locator('[class*="rounded-lg"][class*="border"]');
  33  |     const count = await stackCards.count();
  34  |     expect(count).toBeGreaterThan(0);
  35  |   });
  36  | 
  37  |   test('analyses tab is accessible', async ({ page }) => {
  38  |     await page.goto('/mythos-intelligence');
  39  |     await page.click('text=Analyses');
  40  |     await expect(page.locator('text=Analyses').first()).toBeVisible({ timeout: 10000 });
  41  |   });
  42  | 
  43  |   test('analyses tab shows phases grid when no analyses exist', async ({ page }) => {
  44  |     await page.goto('/mythos-intelligence');
  45  |     await page.click('text=Analyses');
  46  |     const phases = ['RECONNAISSANCE', 'SCAN & ENUMERATION', 'GAIN ACCESS', 'MAINTAIN ACCESS', 'COVER TRACKS'];
  47  |     for (const phase of phases) {
  48  |       await expect(page.locator(`text=${phase}`).first()).toBeVisible({ timeout: 10000 });
  49  |     }
  50  |   });
  51  | 
  52  |   test('intelligence document modal opens on click', async ({ page }) => {
  53  |     await page.goto('/mythos-intelligence');
  54  |     await page.click('text=Intelligence');
  55  |     const firstDoc = page.locator('[class*="rounded-lg"][class*="border"]').first();
  56  |     if (await firstDoc.isVisible()) {
  57  |       await firstDoc.click();
  58  |     }
  59  |   });
  60  | 
  61  |   test('hardening stack content modal opens on click', async ({ page }) => {
  62  |     await page.goto('/mythos-intelligence');
  63  |     await page.click('text=Hardening');
  64  |     const firstStack = page.locator('[class*="rounded-lg"][class*="border"]').first();
  65  |     if (await firstStack.isVisible()) {
  66  |       await firstStack.click();
  67  |     }
  68  |   });
  69  | 
  70  |   test('can navigate from sidebar', async ({ page }) => {
  71  |     await page.goto('/dashboard');
  72  |     const mythosLink = page.locator('text=Mythos Intelligence').first();
  73  |     if (await mythosLink.isVisible()) {
  74  |       await mythosLink.click();
  75  |       await expect(page).toHaveURL(/.*mythos-intelligence/, { timeout: 10000 });
  76  |     }
  77  |   });
  78  | 
  79  |   test('global command terminal accepts /mythos command', async ({ page }) => {
  80  |     await page.goto('/mythos-intelligence');
  81  |     await expect(page.locator('text=Mythos Intelligence')).toBeVisible({ timeout: 10000 });
  82  |   });
  83  | 
  84  |   test('page has elite badge', async ({ page }) => {
  85  |     await page.goto('/mythos-intelligence');
  86  |     await expect(page.locator('text=Elite').first()).toBeVisible({ timeout: 10000 });
  87  |   });
  88  | 
  89  |   test('page shows kill chain phase descriptions', async ({ page }) => {
  90  |     await page.goto('/mythos-intelligence');
  91  |     const descriptions = [
  92  |       'Identify exposed services',
  93  |       'Map open ports',
  94  |       'Exploit vulnerabilities',
  95  |       'Establish persistence',
  96  |       'Clean logs'
  97  |     ];
  98  |     for (const desc of descriptions) {
  99  |       await expect(page.locator(`text=${desc}`).first()).toBeVisible({ timeout: 5000 });
  100 |     }
  101 |   });
  102 | });
  103 | 
```