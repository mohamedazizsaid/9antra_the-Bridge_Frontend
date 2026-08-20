import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for The Bridge Frontend.
 * Base URL is injected via the E2E_BASE_URL env var in CI (Vercel preview URL).
 * For local development: npm run e2e:local (starts dev server first)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,    // serial for smoke tests against live preview
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['github'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Ignore HTTPS errors for preview deployments with self-signed certs
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Uncomment to add mobile testing:
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // ── Local dev only — starts ng serve automatically ─────────────────────────
  // Remove or comment out webServer when running against a live Vercel URL in CI
  webServer: process.env.E2E_BASE_URL
    ? undefined  // CI: use the live Vercel URL, don't spawn a dev server
    : {
        command: 'npm start',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
