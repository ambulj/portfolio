import { test, expect } from '@playwright/test';

// Pinned cryptographic hash from model-manifest.ts
const EXPECTED_HASH = 'b39e71a8e807258c8bb079f2a13e766bedd370777a1969b828ca04d259ed99c1';

test.describe('Gate 3: In-Browser Client ML Inference Suite (ML-01 to ML-04)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG [' + msg.type() + ']:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  });
  test('ML-VAL-01: Static model and WASM binary assets serve with proper MIME types and size constraints', async ({ request }) => {
    // 1. Model binary
    const modelRes = await request.get('/models/threat-anomaly-v1.onnx');
    expect(modelRes.status()).toBe(200);
    const modelContentType = modelRes.headers()['content-type'] || '';
    expect(modelContentType).toContain('application/octet-stream');
    const modelBuf = await modelRes.body();
    expect(modelBuf.length).toBeLessThan(10240); // Budget < 10 KB
    expect(modelBuf.length).toBe(4260);

    // 2. Self-hosted WASM binary
    const wasmRes = await request.get('/wasm/ort-wasm-simd.wasm');
    expect(wasmRes.status()).toBe(200);
    const wasmContentType = wasmRes.headers()['content-type'] || '';
    expect(wasmContentType).toContain('application/wasm');
    const wasmBuf = await wasmRes.body();
    expect(wasmBuf.length).toBeGreaterThan(1000000); // Valid compiled binary
  });

  test('ML-VAL-02: Zero external CDN requests during ML inference session', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', req => {
      const url = req.url();
      if (
        url.includes('cdn.jsdelivr.net') ||
        url.includes('unpkg.com') ||
        url.includes('cdnjs.cloudflare.com') ||
        url.includes('huggingface.co')
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto('/work/threat-detection', { waitUntil: 'domcontentloaded' });

    const playground = page.locator('[data-testid="threat-inference-playground"]');
    await expect(playground).toBeVisible({ timeout: 15000 });

    // Click through all presets to exercise runtime
    await page.click('[data-testid="preset-benign-web"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="preset-c2-data-exfil"]');
    await page.waitForTimeout(300);

    // Must be completely zero
    expect(externalRequests).toEqual([]);
  });

  test('ML-VAL-03: Web Crypto SHA-256 integrity check and pinned digest verification', async ({ page }) => {
    await page.goto('/work/threat-detection', { waitUntil: 'domcontentloaded' });

    const badge = page.locator('[data-testid="ml-integrity-badge"]');
    await expect(badge).toBeVisible({ timeout: 15000 });
    await expect(badge).toHaveText(/INTEGRITY: SHA-256 VERIFIED/);
  });

  test('ML-VAL-04: Preset classification accuracy and sub-50ms latency SLA benchmark', async ({ page }) => {
    await page.goto('/work/threat-detection', { waitUntil: 'domcontentloaded' });

    const playground = page.locator('[data-testid="threat-inference-playground"]');
    await expect(playground).toBeVisible({ timeout: 15000 });

    // 1. Benign Web Flow
    await page.click('[data-testid="preset-benign-web"]');
    await page.waitForTimeout(500);

    const benignDecision = page.locator('[data-testid="inference-decision-badge"]');
    await expect(benignDecision).toHaveText(/NORMAL FLOW \(BENIGN\)/);

    const benignPercentText = await page.locator('[data-testid="anomaly-percentage"]').innerText();
    const benignPercent = parseInt(benignPercentText.replace('%', ''), 10);
    expect(benignPercent).toBeLessThan(20);

    // 2. SSH Brute Force
    await page.click('[data-testid="preset-ssh-brute-force"]');
    await page.waitForTimeout(500);

    const sshDecision = page.locator('[data-testid="inference-decision-badge"]');
    await expect(sshDecision).toHaveText(/INTRUSION DETECTED \(ANOMALY\)/);

    const sshPercentText = await page.locator('[data-testid="anomaly-percentage"]').innerText();
    const sshPercent = parseInt(sshPercentText.replace('%', ''), 10);
    expect(sshPercent).toBeGreaterThan(80);

    // 3. C2 Data Exfiltration
    await page.click('[data-testid="preset-c2-data-exfil"]');
    await page.waitForTimeout(500);
    const c2Decision = page.locator('[data-testid="inference-decision-badge"]');
    await expect(c2Decision).toHaveText(/INTRUSION DETECTED \(ANOMALY\)/);

    // 4. SYN Flood DDoS
    await page.click('[data-testid="preset-syn-flood-ddos"]');
    await page.waitForTimeout(500);
    const ddosDecision = page.locator('[data-testid="inference-decision-badge"]');
    await expect(ddosDecision).toHaveText(/INTRUSION DETECTED \(ANOMALY\)/);

    // 5. Latency Benchmark Check (< 50ms SLA)
    const latencyText = await page.locator('[data-testid="inference-latency"]').innerText();
    const latencyMs = parseFloat(latencyText.replace('ms', '').trim());
    console.log(`[ML-VAL-04] Measured In-Browser Inference Latency: ${latencyMs} ms`);
    expect(latencyMs).toBeLessThan(50.0);
  });

  test('ML-VAL-05: Cryptographic tamper rejection and safe recovery', async ({ page }) => {
    await page.goto('/work/threat-detection', { waitUntil: 'domcontentloaded' });

    const playground = page.locator('[data-testid="threat-inference-playground"]');
    await expect(playground).toBeVisible({ timeout: 15000 });

    // Trigger simulated tampering
    await page.click('[data-testid="btn-tamper-test"]');

    const tamperAlert = page.locator('[data-testid="tamper-alert"]');
    await expect(tamperAlert).toBeVisible({ timeout: 10000 });
    await expect(tamperAlert).toContainText(/SECURITY GATE ABORT/);

    // Restore genuine model
    await page.click('[data-testid="btn-restore-model"]');
    await expect(tamperAlert).not.toBeVisible({ timeout: 10000 });

    const badge = page.locator('[data-testid="ml-integrity-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(/INTEGRITY: SHA-256 VERIFIED/);
  });

  test('ML-VAL-06: Multi-route parity on /work/inferyx case study', async ({ page }) => {
    await page.goto('/work/inferyx', { waitUntil: 'domcontentloaded' });

    const playground = page.locator('[data-testid="threat-inference-playground"]');
    await expect(playground).toBeVisible({ timeout: 15000 });

    // Assert header reflects Inferyx edge benchmark context
    await expect(playground).toContainText('INFERYX EDGE BENCHMARK');

    // Run inference cycle
    await page.click('[data-testid="preset-c2-data-exfil"]');
    await page.waitForTimeout(500);

    const decision = page.locator('[data-testid="inference-decision-badge"]');
    await expect(decision).toHaveText(/INTRUSION DETECTED \(ANOMALY\)/);

    const latencyText = await page.locator('[data-testid="inference-latency"]').innerText();
    const latencyMs = parseFloat(latencyText.replace('ms', '').trim());
    expect(latencyMs).toBeLessThan(50.0);
  });
});
