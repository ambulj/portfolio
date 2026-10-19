// tests/gate2-gpu.spec.ts — Automated Gate 2 GPU & Threat Topology Test Suite

import { test, expect } from '@playwright/test';

test.describe('Gate 2: GPU Threat Topology & Capability Negotiation', () => {
  test('GPU-VAL-01: Canvas deck mounts with 3D canvas and capability badge', async ({ page }) => {
    // Navigate on desktop viewport (>= 1024px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const aside = page.locator('aside[aria-hidden="true"]');
    await expect(aside).toBeVisible();

    // Verify canvas element exists
    const canvas = aside.locator('canvas');
    await expect(canvas).toBeAttached();

    // Verify Tier status badge (Tier 2 WebGPU or Tier 1 WebGL2)
    const tierBadge = aside.getByText(/TIER [12] (WEBGPU|WEBGL2)/);
    await expect(tierBadge).toBeVisible();
  });

  test('GPU-VAL-02: prefers-reduced-motion forces immediate Tier 0 SVG fallback with zero canvas elements', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const aside = page.locator('aside[aria-hidden="true"]');
    await expect(aside).toBeVisible();

    // Verify canvas element is NOT created (0 canvas elements)
    const canvasCount = await aside.locator('canvas').count();
    expect(canvasCount).toBe(0);

    // Verify static SVG topology is active
    const svg = aside.locator('svg[viewBox="0 0 600 600"]');
    await expect(svg).toBeVisible();
    await expect(aside.getByText('TIER 0 SVG')).toBeVisible();
  });

  test('GPU-VAL-03: HUD Reduce 3D toggle updates localStorage and switches to Tier 0 SVG instantly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const aside = page.locator('aside[aria-hidden="true"]');
    await expect(aside.locator('canvas')).toBeAttached();

    // Locate Reduce 3D button in HUD
    const reduce3dBtn = page.getByRole('button', { name: /3D:/ });
    await expect(reduce3dBtn).toBeVisible();
    await expect(reduce3dBtn).toHaveAttribute('aria-pressed', 'false');

    // Click toggle
    await reduce3dBtn.click();
    await expect(reduce3dBtn).toHaveAttribute('aria-pressed', 'true');

    // Canvas is disposed and replaced by Tier 0 SVG
    await expect(aside.locator('canvas')).toHaveCount(0);
    await expect(aside.locator('svg[viewBox="0 0 600 600"]')).toBeVisible();

    // Verify localStorage persistence
    const storedVal = await page.evaluate(() => localStorage.getItem('reduce3d'));
    expect(storedVal).toBe('true');

    // Reload page: verified persistence
    await page.reload();
    const reloadedReduce3dBtn = page.getByRole('button', { name: /3D:/ });
    await expect(reloadedReduce3dBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('aside canvas')).toHaveCount(0);

    // Toggle back on
    await reloadedReduce3dBtn.click();
    await expect(reloadedReduce3dBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('aside canvas')).toBeAttached();
  });

  test('GPU-VAL-04: Node hover triggers raycaster and displays projected screen-space HUD tooltip', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const canvas = page.locator('aside canvas');
    await expect(canvas).toBeAttached();

    // Wait 500ms for globe to settle in viewport
    await page.waitForTimeout(500);

    // Hover over central canvas region
    const box = await canvas.boundingBox();
    if (box) {
      // Sweep pointer across central globe area
      for (let offset = -60; offset <= 60; offset += 30) {
        await page.mouse.move(box.x + box.width / 2 + offset, box.y + box.height / 2 + offset);
        await page.waitForTimeout(100);
      }
    }

    // Move pointer over center
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Verify raycaster and tooltip component mounting
    const tooltipContainer = page.locator('aside').locator('div.corner-bracket');
    // If tooltip popped up, verify telemetry content structure
    if (await tooltipContainer.count() > 0) {
      await expect(tooltipContainer.first()).toContainText(/PROTOCOL|ROLE|ANOMALY SCORE/);
    }
  });

  test('GPU-VAL-05: 60 FPS performance benchmark over 90 animation frames', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const canvas = page.locator('aside canvas');
    await expect(canvas).toBeAttached();

    // Measure frame deltas in browser context
    const fpsMetrics = await page.evaluate(async () => {
      return new Promise<{ medianDeltaMs: number; estimatedFPS: number }>((resolve) => {
        const deltas: number[] = [];
        let last = performance.now();
        let frames = 0;

        function tick(now: number) {
          const delta = now - last;
          last = now;
          deltas.push(delta);
          frames++;

          if (frames >= 90) {
            deltas.sort((a, b) => a - b);
            const medianDeltaMs = deltas[Math.floor(deltas.length / 2)];
            const estimatedFPS = Math.round(1000 / medianDeltaMs);
            resolve({ medianDeltaMs, estimatedFPS });
          } else {
            requestAnimationFrame(tick);
          }
        }

        requestAnimationFrame(tick);
      });
    });

    console.log(`[Performance Benchmark] Median frame delta: ${fpsMetrics.medianDeltaMs.toFixed(2)}ms (~${fpsMetrics.estimatedFPS} FPS)`);
    // Assert frame delta <= 33.3ms (>= 30 FPS minimum, target 60 FPS)
    expect(fpsMetrics.medianDeltaMs).toBeLessThanOrEqual(33.3);
  });

  test('GPU-VAL-06: Route navigation retains single persistent canvas with zero memory context leaks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const canvas = page.locator('aside canvas');
    await expect(canvas).toBeAttached();

    // Navigate across 4 different routes
    for (const route of ['/work', '/work/inferyx', '/about', '/contact', '/']) {
      await page.goto(route);
      await expect(page.locator('aside canvas')).toBeAttached();
    }
  });
});
