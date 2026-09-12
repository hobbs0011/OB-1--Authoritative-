import { test, expect, devices } from '@playwright/test';

const BASE = 'https://michael-hobbs.pages.dev';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const BROWSERS = [
  { name: 'Chrome Desktop', use: { ...devices['Desktop Chrome'] } },
  { name: 'Safari Mac', use: { ...devices['Desktop Safari'] } },
  { name: 'Firefox Desktop', use: { ...devices['Desktop Firefox'] } },
  { name: 'Chrome Android', use: { ...devices['Pixel 7'] } },
  { name: 'Safari iOS', use: { ...devices['iPhone 14'] } },
];

for (const browser of BROWSERS) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${browser.name} ${viewportName}`, () => {
      test.use({ ...browser.use, viewport });

      test('level 1 - page structure', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        await expect(page).toHaveTitle(/Michael Hobbs/);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Michael Hobbs/);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Michael Hobbs/);
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
      });

      test('level 2 - content accuracy', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        await expect(page.locator('h1')).toContainText('Michael Hobbs');
        await expect(page.locator('.brand')).toContainText('Michael Hobbs');
        await expect(page.locator('.card-name')).toContainText('Michael Hobbs');
        await expect(page.locator('.quote-author')).toContainText('Michael Hobbs');
        await expect(page.locator('text=SAIT Polytech')).toBeVisible();
        await expect(page.locator('text=Les Brown')).toBeVisible();
        await expect(page.locator('text=20,000')).toBeVisible();
        await expect(page.locator('text=$20 million')).toBeVisible();
        await expect(page.locator('text=Montessori')).toBeVisible();
        await expect(page.locator('text=Cambridge')).toBeVisible();
        await expect(page.locator('text=IELTS')).toBeVisible();
        await expect(page.locator('text=1000X')).toBeVisible();
      });

      test('level 3 - media and imagery', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        const portrait = page.locator('.avatar');
        await expect(portrait).toBeVisible();
        await expect(portrait).toHaveAttribute('src', /portrait\.jpg/);
        await expect(page.locator('.hero-video')).toBeVisible();
        await expect(page.locator('img[src*="60percent.jpg"]')).toBeVisible();
        await expect(page.locator('img[src*="tiger-protocol.jpg"]')).toBeVisible();
        await expect(page.locator('img[src*="not-broken.jpg"]')).toBeVisible();
        await expect(page.locator('img[src*="diagnostic-matrix.jpg"]')).toBeVisible();
        await expect(page.locator('img[src*="codex.jpg"]')).toBeVisible();
      });

      test('level 4 - navigation and CTAs', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        const ctaPrimary = page.locator('.btn-primary');
        const ctaGhost = page.locator('.btn-ghost');
        await expect(ctaPrimary).toHaveCount(1);
        await expect(ctaGhost).toHaveCount(2);
        await expect(ctaPrimary).toHaveAttribute('href', '#connect');
        await expect(ctaGhost.nth(0)).toHaveAttribute('href', '#net');
        await expect(ctaGhost.nth(1)).toHaveAttribute('href', '#prais');
        await page.click('.btn-primary');
        await expect(page).toHaveURL(/#connect$/);
        await page.click('.btn-ghost >> nth=0');
        await expect(page).toHaveURL(/#net$/);
      });

      test('level 5 - cross-section integrity', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        const sections = ['#story', '#net', '#prais', '#connect'];
        for (const id of sections) {
          await page.goto(`${BASE}${id}`, { waitUntil: 'networkidle' });
          const section = page.locator(id);
          await expect(section).toBeVisible();
        }
        await page.goto(BASE, { waitUntil: 'networkidle' });
        const linkBtns = page.locator('.link-btn');
        await expect(linkBtns).toHaveCount(4);
        for (const btn of await linkBtns.all()) {
          await expect(btn).toHaveAttribute('target', '_blank');
          await expect(btn).toHaveAttribute('rel', 'noopener');
        }
      });
    });
  }
}
