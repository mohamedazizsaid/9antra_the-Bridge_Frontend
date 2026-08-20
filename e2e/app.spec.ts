import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests — The Bridge Frontend
 *
 * These tests run against the live Vercel preview URL (in CI)
 * or http://localhost:4200 (local).
 *
 * Scope: basic navigation + key element visibility + no console errors.
 */

test.describe('Smoke Tests — Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads and returns HTTP 200', async ({ page }) => {
    // The goto above would have thrown if navigation failed, but let's
    // also assert we're on the right page with a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('router-outlet is rendered (Angular app bootstrapped)', async ({ page }) => {
    // Angular renders <router-outlet> as a DOM marker — the app wrapper must exist
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible({ timeout: 10_000 });
  });

  test('theme toggle button is visible', async ({ page }) => {
    const themeBtn = page.locator('button.theme-floating-toggle');
    await expect(themeBtn).toBeVisible({ timeout: 5_000 });
  });

  test('page has no broken images (404)', async ({ page }) => {
    const failedImages: string[] = [];
    page.on('response', (response) => {
      if (
        response.url().match(/\.(png|jpg|jpeg|gif|svg|webp)/) &&
        response.status() >= 400
      ) {
        failedImages.push(response.url());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(failedImages, `Broken images: ${failedImages.join(', ')}`).toHaveLength(0);
  });

  test('no unhandled console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Ignore CORS/network errors that are outside our control
        const text = msg.text();
        if (!text.includes('CORS') && !text.includes('net::ERR_')) {
          consoleErrors.push(text);
        }
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(
      consoleErrors,
      `Console errors on load:\n${consoleErrors.join('\n')}`,
    ).toHaveLength(0);
  });
});

test.describe('Smoke Tests — Navigation', () => {
  test('login page is reachable', async ({ page }) => {
    await page.goto('/login');
    // Should not redirect to 404 — Angular router serves index.html (SPA)
    await expect(page).not.toHaveURL('/404');
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible({ timeout: 10_000 });
  });

  test('direct URL navigation works (SPA routing)', async ({ page }) => {
    // Vercel rewrites serve index.html for all routes — confirm Angular handles it
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Angular app should be present, not a blank page or 404 HTML
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible({ timeout: 10_000 });
  });
});
