import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test-suite',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/oktava-login',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },
  projects: [
    // ── CHROME ──────────────────────────────────────────────────────────────
    {
      name: 'chrome-android',
      use: {
        ...devices['Pixel 5'],
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.112 Mobile Safari/537.36',
      }
    },
    {
      name: 'chrome-mac',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      }
    },
    // ── SAFARI ──────────────────────────────────────────────────────────────
    {
      name: 'safari-ios',
      use: {
        ...devices['iPhone 14'],
      }
    },
    {
      name: 'safari-mac',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
      }
    },
    // ── SAMSUNG INTERNET (ANDROID) ──────────────────────────────────────────
    {
      name: 'samsung-android',
      use: {
        ...devices['Galaxy Tab S8'],
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/123.0.0.0 Mobile Safari/537.36',
      }
    },
    // ── EDGE (WINDOWS PC) ───────────────────────────────────────────────────
    {
      name: 'edge-win',
      use: {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.112 Safari/537.36 Edg/125.0.2535.92',
      }
    },
    // ── FIREFOX (WINDOWS PC) ────────────────────────────────────────────────
    {
      name: 'firefox-win',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      }
    },
    // ── CHROME iOS ──────────────────────────────────────────────────────────
    {
      name: 'chrome-ios',
      use: {
        ...devices['iPhone 14'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.112 Mobile/15E148 Safari/604.1',
      }
    },
  ],
  webServer: null,
});
