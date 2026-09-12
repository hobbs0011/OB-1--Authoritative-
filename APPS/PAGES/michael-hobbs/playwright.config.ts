import { defineConfig, devices } from '@playwright/test';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1024, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const BROWSERS = [
  { name: 'Chromium Desktop', use: { ...devices['Desktop Chrome'] } },
  { name: 'Firefox Desktop', use: { ...devices['Desktop Firefox'] } },
  { name: 'WebKit Desktop', use: { ...devices['Desktop Safari'] } },
  { name: 'Chrome Android', use: { ...devices['Pixel 7'] } },
  { name: 'Safari iOS', use: { ...devices['iPhone 14'] } },
];

export default defineConfig({
  testDir: './test',
  testMatch: ['**/*.spec.ts'],
  timeout: 60000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test/playwright-report' }]],
  workers: 4,
  projects: BROWSERS.flatMap(browser =>
    Object.entries(VIEWPORTS).map(([viewportName, viewport]) => ({
      name: `${browser.name} ${viewportName}`,
      use: { ...browser.use, viewport },
    }))
  ),
});
