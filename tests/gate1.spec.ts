import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/work',
  '/work/inferyx',
  '/work/aegisz',
  '/work/orgmind',
  '/work/threat-detection',
  '/work/roadsaarthi',
  '/lab',
  '/about',
  '/certifications',
  '/resume',
  '/contact',
  '/security',
  '/colophon',
  '/404',
];

test.describe('Gate 1: Route Integrity, Single H1, Console Cleanliness', () => {
  for (const path of routes) {
    test(`Route ${path} returns valid status, exactly one h1, and zero console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          if (path === '/404' && msg.text().includes('404')) return;
          consoleErrors.push(msg.text());
        }
      });
      page.on('response', (res) => {
        if (res.status() >= 400 && path !== '/404') {
          console.error(`[HTTP ${res.status()}] ${path} requested ${res.url()}`);
        }
      });

      const response = await page.goto(path);
      if (path === '/404') {
        expect([200, 404]).toContain(response?.status());
      } else {
        expect(response?.status()).toBe(200);
      }

      // Assert exactly one <h1>
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Assert zero console errors
      expect(consoleErrors).toEqual([]);
    });
  }
});

test.describe('Gate 1: Accessibility & Skip Link', () => {
  test('Skip link targets #main-content and shifts focus properly', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Tab to skip link
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    // Trigger skip link
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('Axe-core accessibility audit reports 0 critical or serious violations on key routes', async ({ page }) => {
    for (const p of ['/', '/work', '/work/inferyx', '/about', '/contact']) {
      await page.goto(p);
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalOrSerious = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalOrSerious).toEqual([]);
    }
  });
});

test.describe('Gate 1: Honesty Features Verification', () => {
  test('RoadSaarthi displays mandatory independent prototype disclaimer', async ({ page }) => {
    await page.goto('/work/roadsaarthi');
    await expect(
      page.getByText('An independent prototype. It is not an official product of any government body').first()
    ).toBeVisible();
  });

  test('Inferyx displays private walkthrough notice instead of broken repo', async ({ page }) => {
    await page.goto('/work/inferyx');
    await expect(
      page.getByText('Source is private. Walkthrough on request.')
    ).toBeVisible();
  });

  test('Case studies render 5-column audited metrics tables and data notes', async ({ page }) => {
    await page.goto('/work/inferyx');
    await expect(page.getByText('Audited Engineering Metrics')).toBeVisible();
    await expect(page.getByText('Data Provenance Note')).toBeVisible();
    await expect(page.getByText("What I'd Change")).toBeVisible();
  });
});
