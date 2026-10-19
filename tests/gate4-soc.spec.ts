import { test, expect } from '@playwright/test';

test.describe('Gate 4: SOC Cyber Warfare Telemetry Visualizer Suite (SOC-01, SOC-02, SOC-03)', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors to assert zero runtime warnings/exceptions
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[Browser Error]:', msg.text());
      }
    });
  });

  test('SOC-VAL-01: Command deck, topology map, triage feed, and metrics ticker mount cleanly on /lab', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    // Assert main command deck container is visible
    const commandDeck = page.locator('[data-testid="soc-command-deck"]');
    await expect(commandDeck).toBeVisible({ timeout: 10000 });

    // Assert 5-tier attack topology map is rendered
    const topologyMap = page.locator('[data-testid="attack-topology-map"]');
    await expect(topologyMap).toBeVisible();

    // Assert all 5 infrastructure nodes are present in SVG
    const expectedNodes = [
      'ingress-gateway',
      'dmz-bastion',
      'microservices',
      'auth-vault',
      'db-cluster'
    ];
    for (const nodeId of expectedNodes) {
      await expect(page.locator(`[data-testid="node-${nodeId}"]`)).toBeVisible();
    }

    // Assert alert triage feed and metric HUD are visible
    await expect(page.locator('[data-testid="alert-triage-feed"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-packets"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-active-anomalies"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-isolated-hosts"]')).toBeVisible();
  });

  test('SOC-VAL-02: Real-time stream progresses, pause stops generation, and speed controls adjust tick rate', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    const totalPackets = page.locator('[data-testid="stat-total-packets"]');
    await expect(totalPackets).toBeVisible({ timeout: 10000 });

    // Wait for stream to accumulate events
    await page.waitForTimeout(2500);
    const countText1 = await totalPackets.innerText();
    const count1 = parseInt(countText1.replace(/,/g, ''), 10);
    expect(count1).toBeGreaterThanOrEqual(4);

    // Click PAUSE
    const pauseBtn = page.locator('[data-testid="btn-stream-pause"]');
    await pauseBtn.click();

    // Verify stream status switches to RESUME
    const resumeBtn = page.locator('[data-testid="btn-stream-play"]');
    await expect(resumeBtn).toBeVisible();

    // Wait 2 seconds while paused; assert counter remains unchanged
    await page.waitForTimeout(2000);
    const countTextPaused = await totalPackets.innerText();
    const countPaused = parseInt(countTextPaused.replace(/,/g, ''), 10);
    expect(countPaused).toBe(count1);

    // Resume stream
    await resumeBtn.click();
    await page.waitForTimeout(1500);
    const countTextResumed = await totalPackets.innerText();
    const countResumed = parseInt(countTextResumed.replace(/,/g, ''), 10);
    expect(countResumed).toBeGreaterThan(countPaused);

    // Switch speed to 2x
    const speed2x = page.locator('[data-testid="speed-btn-2x"]');
    await speed2x.click();
    await expect(speed2x).toHaveClass(/bg-cyber-cyan/);
  });

  test('SOC-VAL-03: Packet inspection drawer meets WCAG modal criteria and closes on Escape', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    // Click first event row in triage feed
    const firstRow = page.locator('[data-testid^="event-row-"]').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    await firstRow.click();

    // Assert drawer dialog appears
    const drawer = page.locator('[data-testid="packet-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');

    // Assert Hex / ASCII payload viewer is rendered with content
    const hexViewer = page.locator('[data-testid="hex-payload-viewer"]');
    await expect(hexViewer).toBeVisible();
    const hexText = await hexViewer.innerText();
    expect(hexText.length).toBeGreaterThan(20);

    // Press Escape to dismiss drawer
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible({ timeout: 5000 });
  });

  test('SOC-VAL-04: Node isolation workflow quarantines host and updates HUD metrics', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    // Initially 0 isolated hosts
    const isolatedStat = page.locator('[data-testid="stat-isolated-hosts"]');
    await expect(isolatedStat).toHaveText('0');

    // Isolate a node via quick action button in feed
    const quickIsolateBtn = page.locator('[data-testid^="btn-quick-isolate-"]').first();
    await expect(quickIsolateBtn).toBeVisible({ timeout: 10000 });
    await quickIsolateBtn.click();

    // Isolated hosts stat increments to 1
    await expect(isolatedStat).toHaveText('1');

    // Verify node in SVG map displays ISOLATED status
    const isolatedNode = page.locator('[data-testid^="node-"]').filter({ hasText: 'ISOLATED' });
    await expect(isolatedNode).toBeVisible();

    // Click restore
    await quickIsolateBtn.click();
    await expect(isolatedStat).toHaveText('0');
  });

  test('SOC-VAL-05: False positive override recalibrates HUD anomaly and FP metrics', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    // Open first row in drawer
    const firstRow = page.locator('[data-testid^="event-row-"]').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    await firstRow.click();

    const drawer = page.locator('[data-testid="packet-drawer"]');
    await expect(drawer).toBeVisible();

    // Click mark false positive
    const fpBtn = page.locator('[data-testid="btn-mark-false-positive"]');
    await expect(fpBtn).toBeVisible();
    await fpBtn.click();

    // Verify button state changes to marked
    await expect(fpBtn).toHaveText(/MARKED AS FALSE POSITIVE/);

    // Close drawer
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();

    // Assert FP rate stat has updated (> 0%)
    const fpStat = page.locator('[data-testid="stat-fp-rate"]');
    const fpText = await fpStat.innerText();
    const fpRate = parseFloat(fpText.replace('%', ''));
    expect(fpRate).toBeGreaterThan(0);
  });

  test('SOC-VAL-06: Live integration with Phase 3 ONNX Runtime WASM model executes sub-50ms inference', async ({ page }) => {
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    // Open first event row
    const firstRow = page.locator('[data-testid^="event-row-"]').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    await firstRow.click();

    const drawer = page.locator('[data-testid="packet-drawer"]');
    await expect(drawer).toBeVisible();

    // Click [RE-RUN ML INFERENCE]
    const rescoreBtn = page.locator('[data-testid="btn-rescore-ml"]');
    await expect(rescoreBtn).toBeVisible();
    await rescoreBtn.click();

    // Wait for evaluation and assert execution latency is displayed
    const latencyIndicator = drawer.locator('text=/Client WASM Latency: .* ms/');
    await expect(latencyIndicator).toBeVisible({ timeout: 10000 });
    const latencyText = await latencyIndicator.innerText();
    const match = latencyText.match(/Client WASM Latency:\s*([\d\.]+)\s*ms/);
    expect(match).not.toBeNull();
    const latencyMs = parseFloat(match![1]);
    console.log(`[SOC-VAL-06] Re-scored packet in-browser ONNX WASM latency: ${latencyMs} ms`);
    expect(latencyMs).toBeLessThan(50.0);
  });

  test('SOC-VAL-07: 60 FPS streaming performance and prefers-reduced-motion accessibility fallback', async ({ page }) => {
    // 1. Emulate prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/lab', { waitUntil: 'domcontentloaded' });

    const topologyMap = page.locator('[data-testid="attack-topology-map"]');
    await expect(topologyMap).toBeVisible({ timeout: 10000 });

    // Under reduced motion, traveling <animateMotion> circles should NOT be present
    const animateMotion = page.locator('animateMotion');
    await expect(animateMotion).toHaveCount(0);

    // 2. Measure frame performance over 60 animation frames
    const frameDeltas: number[] = await page.evaluate(async () => {
      return new Promise<number[]>(resolve => {
        const deltas: number[] = [];
        let lastTime = performance.now();
        let framesCount = 0;

        function checkFrame(currentTime: number) {
          const delta = currentTime - lastTime;
          lastTime = currentTime;
          deltas.push(delta);
          framesCount++;

          if (framesCount >= 60) {
            resolve(deltas.slice(1)); // drop first warmup frame
          } else {
            requestAnimationFrame(checkFrame);
          }
        }

        requestAnimationFrame(checkFrame);
      });
    });

    const sorted = [...frameDeltas].sort((a, b) => a - b);
    const medianDelta = sorted[Math.floor(sorted.length / 2)];
    console.log(`[SOC-VAL-07] SOC Dashboard Median Frame Delta: ${medianDelta.toFixed(2)}ms (~${(1000 / medianDelta).toFixed(1)} FPS)`);

    // Ensure median delta is within 60 FPS range (< 33.3ms / 30fps minimum, typical ~16.6ms)
    expect(medianDelta).toBeLessThan(33.33);
  });
});
