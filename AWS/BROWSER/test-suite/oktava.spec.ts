import { test, expect, devices } from '@playwright/test';

const BASE = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/oktava-login/';
const CREDS = {
  username: 'Oktava English Class',
  password: 'KISS2026'
};

// ─────────────────────────────────────────────────────────────────────────────
// G999 BRAND TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('G999 Brand Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('gold (#f59e0b) present', async ({ page }) => {
    const hasGold = await page.evaluate(() =>
      document.documentElement.innerHTML.includes('#f59e0b')
    );
    expect(hasGold).toBe(true);
  });

  test('void background (#0f0f1a)', async ({ page }) => {
    const hasVoid = await page.evaluate(() =>
      document.documentElement.innerHTML.includes('#0f0f1a')
    );
    expect(hasVoid).toBe(true);
  });

  test('purple accent (#a855f7)', async ({ page }) => {
    const hasPurple = await page.evaluate(() =>
      document.documentElement.innerHTML.includes('#a855f7')
    );
    expect(hasPurple).toBe(true);
  });

  test('Inter + Orbitron fonts', async ({ page }) => {
    const ok = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[href*="fonts.googleapis"]'));
      return links.some(l =>
        l.getAttribute('href')!.includes('Inter') &&
        l.getAttribute('href')!.includes('Orbitron')
      );
    });
    expect(ok).toBe(true);
  });

  test('login form visible', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP CORE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Desktop Core', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('page loads', async ({ page }) => {
    expect(page.url()).toBe(BASE);
    await expect(page.locator('form')).toBeVisible();
  });

  test('autofill', async ({ page }) => {
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await expect(page.locator('#username')).toHaveValue(CREDS.username);
    await expect(page.locator('#password')).toHaveValue(CREDS.password);
  });

  test('submit enables', async ({ page }) => {
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE / TABLET — runs against every mobile viewport project
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Mobile — Android & iOS', () => {
  test.use({ viewport: { width: 412, height: 892 } });

  test('login renders', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('form')).toBeVisible();
  });

  test('fills and submits to classroom (follows 307 redirect)', async ({ page }) => {
    await page.goto(BASE);
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/classroom*', { timeout: 15000 });
    expect(page.url()).toMatch(/classroom/);
  });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto(BASE);
    const scroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth
    );
    expect(scroll).toBe(false);
  });

  test('touch targets >= 44px', async ({ page }) => {
    await page.goto(BASE);
    const ok = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, a, input'));
      return els.every(el => {
        const r = el.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44;
      });
    });
    expect(ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLASSROOM DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Classroom Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}classroom.html`);
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/classroom*', { timeout: 15000 });
  });

  test('vocab content present', async ({ page }) => {
    const vocab = await page.evaluate(() => {
      const t = document.body.innerText.toLowerCase();
      return t.includes('vocab') || t.includes('class 10') ||
             t.includes('greeting') || t.includes('dialog');
    });
    expect(vocab).toBe(true);
  });

  test('G999 marker visible', async ({ page }) => {
    const g999 = await page.evaluate(() => {
      const html = document.body.innerHTML;
      return html.includes('GOSPEL 999') || html.includes('SEALED');
    });
    expect(g999).toBe(true);
  });

  test('readable contrast', async ({ page }) => {
    const ok = await page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const fg = getComputedStyle(document.body).color;
      const lum = (c: string) => {
        const n = c.match(/\d+/g);
        return n ? n[0]*0.299 + n[1]*0.587 + n[2]*0.114 : 0;
      };
      return Math.abs(lum(bg) - lum(fg)) > 100;
    });
    expect(ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE — 4 systems, key breakpoints
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Responsive — 4 systems', () => {
  const breakpoints = [
    { name: 'android-phone',  w: 412,  h: 892 },
    { name: 'iphone',         w: 390,  h: 844 },
    { name: 'ipad',           w: 1024, h: 1366 },
    { name: 'laptop',         w: 1366, h: 768 },
    { name: 'desktop-hd',     w: 1920, h: 1080 },
  ];

  for (const bp of breakpoints) {
    test(`${bp.name} (${bp.w}x${bp.h})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.w, height: bp.h });
      await page.goto(BASE);
      await page.fill('#username', CREDS.username);
      await page.fill('#password', CREDS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/classroom*', { timeout: 15000 });
      const noOverlap = await page.evaluate(() => {
        const cards = Array.from(
          document.querySelectorAll('.card, .vocab-item, [class*="card"]')
        );
        if (cards.length === 0) return true;
        const rects = cards.map(el => el.getBoundingClientRect());
        return !rects.some((r, i) =>
          rects.some((r2, j) =>
            i !== j && r.left < r2.right && r.right > r2.left &&
            r.top < r2.bottom && r.bottom > r2.top
          )
        );
      });
      expect(noOverlap).toBe(true);
    });
  }
});
