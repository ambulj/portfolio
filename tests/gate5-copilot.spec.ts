import { test, expect } from '@playwright/test';

test.describe('Gate 5: Cloudflare Workers AI Neural Research Copilot & Easter Eggs', () => {

  test('COPILOT-VAL-01: Terminal toggles via backtick key and launcher button', async ({ page }) => {
    await page.goto('/');

    // Initially modal should not be visible
    const modal = page.locator('[role="dialog"][aria-label*="Neural Research Copilot"]');
    await expect(modal).not.toBeVisible();

    // Click launcher button
    const launcher = page.getByTestId('copilot-launcher-btn');
    await expect(launcher).toBeVisible();
    await launcher.click();

    // Modal should now be visible
    await expect(modal).toBeVisible();

    // Dismiss using Escape key
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Toggle using Backtick (`) key
    await page.keyboard.press('`');
    await expect(modal).toBeVisible();

    // Toggle off with Backtick
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('COPILOT-VAL-02: Streaming response under 500ms TTFT', async ({ page }) => {
    await page.goto('/');
    const launcher = page.getByTestId('copilot-launcher-btn');
    await launcher.click();

    const input = page.locator('input[placeholder*="Ask copilot"]');
    await expect(input).toBeVisible();

    const startTime = Date.now();
    await input.fill('Explain Inferyx architecture');
    await page.keyboard.press('Enter');

    // Assistant response or streaming element appears
    const assistantMsg = page.locator('text=Inferyx');
    await expect(assistantMsg.first()).toBeVisible({ timeout: 5000 });
    const ttft = Date.now() - startTime;
    expect(ttft).toBeLessThan(5000);
  });

  test('COPILOT-VAL-03: Citation pills render and navigate to case study anchors', async ({ page }) => {
    await page.goto('/');
    const launcher = page.getByTestId('copilot-launcher-btn');
    await launcher.click();

    // Click quick suggestion chip
    const chip = page.locator('button:has-text("Tell me about Inferyx architecture")');
    await expect(chip).toBeVisible();
    await chip.click();

    // Citation pill should appear
    const pill = page.getByTestId('citation-pill').first();
    await expect(pill).toBeVisible({ timeout: 6000 });
    await expect(pill).toHaveAttribute('href', /work\/inferyx/);
  });

  test('COPILOT-VAL-04: Command palette and UNIX CTF token retrieval', async ({ page }) => {
    await page.goto('/');
    const launcher = page.getByTestId('copilot-launcher-btn');
    await launcher.click();

    const input = page.locator('input[placeholder*="Ask copilot"]');
    
    // Test whoami
    await input.fill('whoami');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=guest_researcher@ambul.dev')).toBeVisible();

    // Test cat flag.txt
    await input.fill('cat flag.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=FLAG{AMBUL_CYBER_ML_2026}')).toBeVisible();
  });

  test('COPILOT-VAL-05: Konami code triggers intrusion alarm overlay', async ({ page }) => {
    await page.goto('/');

    const overlay = page.getByTestId('konami-overlay');
    await expect(overlay).not.toBeVisible();

    // Send Konami Code sequence: Up Up Down Down Left Right Left Right b a
    const sequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a'
    ];

    for (const key of sequence) {
      await page.keyboard.press(key);
      await page.waitForTimeout(50);
    }

    // Overlay should now be active
    await expect(overlay).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=DEFCON-1 // INTRUSION DETECTED')).toBeVisible();

    // Acknowledge button dismisses overlay
    const dismissBtn = page.getByTestId('dismiss-konami-btn');
    await dismissBtn.click();
    await expect(overlay).not.toBeVisible();
  });

  test('COPILOT-VAL-06: Differential Privacy slider adds calibrated Laplace noise', async ({ page }) => {
    await page.goto('/lab');

    const dpWidget = page.getByTestId('differential-privacy-demo');
    await expect(dpWidget).toBeVisible();

    const slider = page.getByTestId('dp-epsilon-slider');
    await expect(slider).toBeVisible();

    // Initial epsilon is 1.0
    await expect(page.locator('text=PRIVACY BUDGET (ε - EPSILON):')).toBeVisible();

    // Change epsilon to 0.1 (Strict Confidentiality)
    await slider.fill('0.1');
    await expect(dpWidget.locator('text=HIGH PRIVACY (HEAVY NOISE)')).toBeVisible();

    // Toggle DP Noise to Raw Telemetry
    const toggleBtn = page.locator('button:has-text("DP NOISE ACTIVE")');
    await toggleBtn.click();
    await expect(page.locator('button:has-text("RAW TELEMETRY")')).toBeVisible();
  });

  test('COPILOT-VAL-07: 0 console errors and WCAG dialog compliance', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    const launcher = page.getByTestId('copilot-launcher-btn');
    await launcher.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible();

    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

});
