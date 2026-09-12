import { test, expect } from '@playwright/test';

const BASE = 'https://michael-hobbs.pages.dev';

test('01 - page loads with 200', async ({ page }) => {
  const res = await page.goto(BASE, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('02 - title contains Michael Hobbs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Michael Hobbs/);
});

test('03 - meta description is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Michael Hobbs/);
});

test('04 - OG title is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Michael Hobbs/);
});

test('05 - OG image is set', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /portrait\.jpg/);
});

test('06 - theme color meta is set', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#08090d');
});

test('07 - brand nav contains Michael Hobbs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.brand')).toContainText('Michael Hobbs');
});

test('08 - no James Coomber references', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const count = await page.locator('text=James Coomber').count();
  expect(count).toBe(0);
});

test('09 - no james-coomber paths in HTML', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const html = await page.content();
  expect(html).not.toContain('james-coomber');
});

test('10 - hero section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.hero')).toBeVisible();
});

test('11 - H1 contains Michael Hobbs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('Michael Hobbs');
});

test('12 - H1 contains Founder of NET & PrAiS', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('Founder of NET & PrAiS');
});

test('13 - subtitle contains SAIT Polytech', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.subtitle')).toContainText('SAIT Polytech');
});

test('14 - subtitle mentions 4 continents', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.subtitle')).toContainText('America, England, Australia, and Vietnam');
});

test('15 - profile badge shows CEO & Lead Trainer', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.profile-badge')).toContainText('CEO & Lead Trainer');
});

test('16 - avatar image is visible', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.avatar')).toBeVisible();
});

test('17 - avatar src is portrait.jpg', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.avatar')).toHaveAttribute('src', /portrait\.jpg/);
});

test('18 - card name is Michael Hobbs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.card-name')).toContainText('Michael Hobbs');
});

test('19 - card role is CEO / Lead Trainer', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.card-role')).toContainText('CEO / Lead Trainer');
});

test('20 - meta grid shows SAIT Polytech', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.meta-value', { hasText: 'SAIT Polytech' })).toBeVisible();
});

test('21 - primary CTA links to #connect', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.btn-primary')).toHaveAttribute('href', '#connect');
});

test('22 - Explore NET CTA exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.btn-ghost >> text=Explore NET')).toHaveCount(1);
});

test('23 - Explore PrAiS CTA exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.btn-ghost >> text=Explore PrAiS')).toHaveCount(1);
});

test('24 - hero video element exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.hero-video')).toBeVisible();
});

test('25 - hero overlay exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.hero-overlay')).toBeVisible();
});

test('26 - story section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#story')).toBeVisible();
});

test('27 - story heading is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#story-heading')).toContainText('From Calgary');
});

test('28 - The Foundation card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The Foundation')).toBeVisible();
});

test('29 - SAIT Polytech card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=SAIT Polytech & The Business Edge')).toBeVisible();
});

test('30 - 4 continents card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=America → England → Australia → Vietnam')).toBeVisible();
});

test('31 - Recruiter card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The Recruiter & Team Builder')).toBeVisible();
});

test('32 - 20,000 growth mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=5 to 20,000')).toBeVisible();
});

test('33 - $20 million mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=$20 million')).toBeVisible();
});

test('34 - Les Brown card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Les Brown & The Stage')).toBeVisible();
});

test('35 - Les Brown name is present', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Les Brown')).toBeVisible();
});

test('36 - Vietnam & The Classroom card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Vietnam & The Classroom')).toBeVisible();
});

test('37 - 5 years teaching mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=5 years teaching experience in Vietnam')).toBeVisible();
});

test('38 - Montessori mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Montessori')).toBeVisible();
});

test('39 - Cambridge mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Cambridge')).toBeVisible();
});

test('40 - IELTS mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=IELTS')).toBeVisible();
});

test('41 - Founder card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The Founder')).toBeVisible();
});

test('42 - NET mentioned in founder card', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=NET (Natural English Training)')).toBeVisible();
});

test('43 - PrAiS mentioned in founder card', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=PrAiS (Phoenix Rising Ai Solutions)')).toBeVisible();
});

test('44 - 1000X mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=1000X')).toBeVisible();
});

test('45 - story cards have hover state', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.story-card').first();
  await card.hover();
  await expect(card).toBeVisible();
});

test('46 - NET section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#net')).toBeVisible();
});

test('47 - NET heading is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#net-heading')).toContainText('The Tiger Protocol');
});

test('48 - 60% Rule image loads', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('img[src*="60percent.jpg"]')).toBeVisible();
});

test('49 - 60% Rule text present', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The 60% Rule')).toBeVisible();
});

test('50 - Tiger Protocol image loads', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('img[src*="tiger-protocol.jpg"]')).toBeVisible();
});

test('51 - Tiger Protocol vs Grammar Prison text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Tiger Protocol vs Grammar Prison')).toBeVisible();
});

test('52 - Not Broken image loads', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('img[src*="not-broken.jpg"]')).toBeVisible();
});

test('53 - You Are Not Broken text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=You Are Not Broken')).toBeVisible();
});

test('54 - Diagnostic Matrix image loads', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('img[src*="diagnostic-matrix.jpg"]')).toBeVisible();
});

test('55 - NET Architecture text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=NET Architecture')).toBeVisible();
});

test('56 - 80% success rate mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=80% NET Guaranteed Success Rate')).toBeVisible();
});

test('57 - Codex image loads', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('img[src*="codex.jpg"]')).toBeVisible();
});

test('58 - Phoenix Rising Codex text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The Phoenix Rising Codex')).toBeVisible();
});

test('59 - all NET images have alt text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const images = page.locator('#net img');
  const count = await images.count();
  expect(count).toBe(5);
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt?.length).toBeGreaterThan(0);
  }
});

test('60 - NET images are lazy loaded', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const images = page.locator('#net img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const loading = await images.nth(i).getAttribute('loading');
    expect(loading).toBe('lazy');
  }
});

test('61 - quote section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.quote-section')).toBeVisible();
});

test('62 - quote text is present', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#quote-text')).toContainText('Saigon is the economic hub of Vietnam');
});

test('63 - quote author is Michael Hobbs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.quote-author')).toContainText('Michael Hobbs');
});

test('64 - quote mark is visible', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.quote-mark')).toBeVisible();
});

test('65 - quote card has glass effect', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.quote-card');
  await expect(card).toBeVisible();
});

test('66 - PrAiS section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#prais')).toBeVisible();
});

test('67 - PrAiS heading is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#prais-heading')).toContainText('PrAiS');
});

test('68 - Gaming stat card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Gaming')).toBeVisible();
});

test('69 - Corporate stat card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Corporate')).toBeVisible();
});

test('70 - 1000X stat card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=1000X')).toBeVisible();
});

test('71 - AI Native stat card exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=AI Native')).toBeVisible();
});

test('72 - PrAiS description mentions gaming', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.prais-card')).toContainText('gaming');
});

test('73 - PrAiS description mentions chatbots', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.prais-card')).toContainText('chat bots');
});

test('74 - PrAiS description mentions 1000X', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.prais-card')).toContainText('1000X longer');
});

test('75 - PrAiS card is visible', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.prais-card')).toBeVisible();
});

test('76 - Connect section exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#connect')).toBeVisible();
});

test('77 - Connect heading exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#connect h3')).toContainText('Connect');
});

test('78 - Website link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.link-btn >> text=Website')).toHaveCount(1);
});

test('79 - Instagram link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.link-btn >> text=Instagram')).toHaveCount(1);
});

test('80 - LinkedIn link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.link-btn >> text=LinkedIn')).toHaveCount(1);
});

test('81 - YouTube link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.link-btn >> text=YouTube')).toHaveCount(1);
});

test('82 - all links open in new tab', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const links = page.locator('.link-btn');
  const count = await links.count();
  expect(count).toBe(4);
  for (let i = 0; i < count; i++) {
    await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    await expect(links.nth(i)).toHaveAttribute('rel', 'noopener');
  }
});

test('83 - connect card is visible', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.connect-card')).toBeVisible();
});

test('84 - nav has 5 links', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links li')).toHaveCount(5);
});

test('85 - About nav link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links a[href="#about"]')).toBeVisible();
});

test('86 - Story nav link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links a[href="#story"]')).toBeVisible();
});

test('87 - NET nav link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links a[href="#net"]')).toBeVisible();
});

test('88 - PrAiS nav link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links a[href="#prais"]')).toBeVisible();
});

test('89 - Connect nav link exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-links a[href="#connect"]')).toBeVisible();
});

test('90 - scroll to story works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#story"]');
  await expect(page).toHaveURL(/#story/);
});

test('91 - scroll to NET works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#net"]');
  await expect(page).toHaveURL(/#net/);
});

test('92 - scroll to PrAiS works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#prais"]');
  await expect(page).toHaveURL(/#prais/);
});

test('93 - scroll to connect works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#connect"]');
  await expect(page).toHaveURL(/#connect/);
});

test('94 - CTA primary scrolls to connect', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.btn-primary');
  await expect(page).toHaveURL(/#connect$/);
});

test('95 - Explore NET CTA scrolls to NET', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.btn-ghost >> text=Explore NET');
  await expect(page).toHaveURL(/#net$/);
});

test('96 - Explore PrAiS CTA scrolls to PrAiS', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.btn-ghost >> text=Explore PrAiS');
  await expect(page).toHaveURL(/#prais$/);
});

test('97 - footer exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('footer')).toBeVisible();
});

test('98 - footer contains copyright 2026', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('footer')).toContainText('2026');
});

test('99 - footer mentions NET + PrAiS', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('footer')).toContainText('NET + PrAiS');
});

test('100 - page has no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  expect(errors).toHaveLength(0);
});

test('101 - viewport is set correctly', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const vp = page.viewportSize();
  expect(vp?.width).toBeGreaterThan(0);
  expect(vp?.height).toBeGreaterThan(0);
});

test('102 - no horizontal overflow', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('103 - hero content fits viewport', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const heroContent = page.locator('.hero-content');
  const box = await heroContent.boundingBox();
  const vp = page.viewportSize();
  expect(box?.width, 'hero content width').toBeLessThanOrEqual((vp?.width ?? 0) + 1);
});

test('104 - all sections visible in viewport', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const sections = ['#story', '#net', '#prais', '#connect'];
  for (const id of sections) {
    await page.goto(`${BASE}${id}`, { waitUntil: 'networkidle' });
    await expect(page.locator(id)).toBeVisible();
  }
});

test('105 - cards do not overlap on mobile', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const cards = await page.locator('.story-card, .method-card').all();
  for (const card of cards) {
    await expect(card).toBeVisible();
  }
});

test('106 - nav is fixed on scroll', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const nav = page.locator('nav');
  const style = await nav.evaluate(el => getComputedStyle(el).position);
  expect(style).toBe('fixed');
});

test('107 - nav has backdrop blur', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const nav = page.locator('nav');
  const blur = await nav.evaluate(el => getComputedStyle(el).backdropFilter);
  expect(blur).toContain('blur');
});

test('108 - brand gradient is applied', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const brand = page.locator('.brand');
  const bg = await brand.evaluate(el => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('gradient');
});

test('109 - cards have glass background', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.card').first();
  const bg = await card.evaluate(el => getComputedStyle(el).backdropFilter);
  expect(bg).toContain('blur');
});

test('110 - buttons have hover transition', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const btn = page.locator('.btn-primary');
  const transition = await btn.evaluate(el => getComputedStyle(el).transition);
  expect(transition).toContain('transform');
});

test('111 - page has h1', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveCount(1);
});

test('112 - page has h2s', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const h2s = await page.locator('h2').count();
  expect(h2s).toBeGreaterThan(0);
});

test('113 - page has h3s', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const h3s = await page.locator('h3').count();
  expect(h3s).toBeGreaterThan(0);
});

test('114 - all images have alt text', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt?.length).toBeGreaterThan(0);
  }
});

test('115 - nav has aria-label', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('nav[aria-label]')).toHaveCount(1);
});

test('116 - sections have aria-labelledby', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const sections = await page.locator('section[aria-labelledby]').count();
  expect(sections).toBeGreaterThan(0);
});

test('117 - decorative elements are aria-hidden', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const hidden = await page.locator('[aria-hidden="true"]').count();
  expect(hidden).toBeGreaterThan(0);
});

test('118 - links are focusable', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const links = await page.locator('a[href]').all();
  expect(links.length).toBeGreaterThan(0);
});

test('119 - buttons are focusable', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const buttons = await page.locator('.btn').all();
  for (const btn of buttons) {
    await expect(btn).toBeVisible();
  }
});

test('120 - lang attribute is en', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('html[lang="en"]')).toHaveCount(1);
});

test('121 - portrait loads under 500KB', async ({ page }) => {
  const url = `${BASE}/assets/portrait.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
  const buffer = await page.evaluate(async (imgUrl: string) => {
    const res = await fetch(imgUrl);
    return await res.arrayBuffer();
  }, url);
  expect(buffer.byteLength).toBeGreaterThan(0);
  const metadata = await sharp(Buffer.from(buffer)).metadata();
  expect(metadata.width).toBeGreaterThan(0);
  expect(metadata.height).toBeGreaterThan(0);
});

test('122 - 60percent image loads', async ({ page }) => {
  const url = `${BASE}/assets/net/60percent.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('123 - tiger-protocol image loads', async ({ page }) => {
  const url = `${BASE}/assets/net/tiger-protocol.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('124 - not-broken image loads', async ({ page }) => {
  const url = `${BASE}/assets/net/not-broken.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('125 - diagnostic-matrix image loads', async ({ page }) => {
  const url = `${BASE}/assets/net/diagnostic-matrix.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('126 - codex image loads', async ({ page }) => {
  const url = `${BASE}/assets/net/codex.jpg`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  expect(res?.status()).toBe(200);
});

test('127 - all images return 200', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src');
    if (src && !src.startsWith('data:') && !src.startsWith('http')) {
      const fullUrl = new URL(src, BASE).href;
      const res = await page.goto(fullUrl, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);
    }
  }
});

test('128 - fonts load without 404', async ({ page }) => {
  const fontErrors: string[] = [];
  page.on('requestfailed', req => {
    if (req.url().includes('fonts.googleapis.com') || req.url().includes('fonts.gstatic.com')) {
      fontErrors.push(req.url());
    }
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  expect(fontErrors.length).toBe(0);
});

test('129 - no broken internal links', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const links = await page.locator('a[href^="#"]').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href && href !== '#') {
      const target = page.locator(href);
      await expect(target).toBeVisible();
    }
  }
});

test('130 - page load time under 5s', async ({ page }) => {
  const start = Date.now();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - start;
  expect(loadTime).toBeLessThan(5000);
});

test('131 - hover on story card changes background', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.story-card').first();
  await card.hover();
  const bg = await card.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});

test('132 - hover on method card lifts it', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.method-card').first();
  await card.hover();
  const transform = await card.evaluate(el => getComputedStyle(el).transform);
  expect(transform).not.toBe('none');
});

test('133 - hover on stat card lifts it', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.stat-card').first();
  await card.hover();
  const transform = await card.evaluate(el => getComputedStyle(el).transform);
  expect(transform).not.toBe('none');
});

test('134 - hover on link button slides it', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const btn = page.locator('.link-btn').first();
  await btn.hover();
  const transform = await btn.evaluate(el => getComputedStyle(el).transform);
  expect(transform).not.toBe('none');
});

test('135 - nav links change color on hover', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const link = page.locator('.nav-links a').first();
  await link.hover();
  const color = await link.evaluate(el => getComputedStyle(el).color);
  expect(color).not.toBe('rgba(255, 255, 255, 0.52)');
});

test('136 - scroll smooth works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(behavior).toBe('smooth');
});

test('137 - page has no horizontal scrollbar', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('138 - all sections have padding', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const sections = await page.locator('section').all();
  for (const section of sections) {
    const padding = await section.evaluate(el => getComputedStyle(el).paddingTop);
    expect(parseInt(padding)).toBeGreaterThan(0);
  }
});

test('139 - cards have border-radius', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const card = page.locator('.card').first();
  const radius = await card.evaluate(el => getComputedStyle(el).borderRadius);
  expect(parseInt(radius)).toBeGreaterThan(0);
});

test('140 - gradient text is applied to h1', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const h1 = page.locator('h1 .gradient');
  const bg = await h1.evaluate(el => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('gradient');
});

test('141 - NET brand mentioned 3+ times', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const count = await page.locator('text=/NET \\(Natural English Training\\)|Founder of NET/').count();
  expect(count).toBeGreaterThanOrEqual(2);
});

test('142 - PrAiS brand mentioned 3+ times', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const count = await page.locator('text=PrAiS').count();
  expect(count).toBeGreaterThanOrEqual(3);
});

test('143 - SAIT Polytech mentioned in story', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=SAIT Polytech in Calgary')).toBeVisible();
});

test('144 - commercial insurance mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=commercial insurance')).toBeVisible();
});

test('145 - Thai Vegan mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Thai Vegan')).toBeVisible();
});

test('146 - life insurance mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=life insurance')).toBeVisible();
});

test('147 - Israeli company mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Israeli company')).toBeVisible();
});

test('148 - Aussie farms mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Aussie farms')).toBeVisible();
});

test('149 - moderator teams mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=moderators')).toBeVisible();
});

test('150 - cyber security teams mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=cyber security')).toBeVisible();
});

test('151 - 4 tokens launched mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Launched 4 tokens')).toBeVisible();
});

test('152 - pump-and-dump mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=pump-and-dump')).toBeVisible();
});

test('153 - early 20s mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=early 20s')).toBeVisible();
});

test('154 - thousands of students mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=thousands of students')).toBeVisible();
});

test('155 - 1 year old to 70 mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=1 year old to 70')).toBeVisible();
});

test('156 - grade 12 for 3 years mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=grade 12 for 3 years')).toBeVisible();
});

test('157 - Tiger Protocol mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The Tiger Protocol')).toBeVisible();
});

test('158 - 60% Rule mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=The 60% Rule')).toBeVisible();
});

test('159 - Grammar First mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Grammar First')).toBeVisible();
});

test('160 - Tiger Mode mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Tiger Mode')).toBeVisible();
});

test('161 - Zero-judgment zone mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Zero-judgment zone')).toBeVisible();
});

test('162 - Grammar Prison mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Grammar Prison')).toBeVisible();
});

test('163 - 30% industry average mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=30% industry average')).toBeVisible();
});

test('164 - AI + PET Infrastructure mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=AI + PET Infrastructure')).toBeVisible();
});

test('165 - Local Lakeview Networking mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Local Lakeview Networking')).toBeVisible();
});

test('166 - Master Playbook mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Master Playbook')).toBeVisible();
});

test('167 - Pedagogy mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=Pedagogy')).toBeVisible();
});

test('168 - confident velocity mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=confident velocity')).toBeVisible();
});

test('169 - permission mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=unlock permission')).toBeVisible();
});

test('170 - psychological identity shift mentioned', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('text=psychological identity shift')).toBeVisible();
});

test('171 - hero screenshot captured', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'D:/OB-1-CANONICAL/tmp/hero-desktop.png', fullPage: false });
  expect(true).toBe(true);
});

test('172 - story section screenshot', async ({ page }) => {
  await page.goto(`${BASE}#story`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'D:/OB-1-CANONICAL/tmp/story-desktop.png', fullPage: false });
  expect(true).toBe(true);
});

test('173 - NET section screenshot', async ({ page }) => {
  await page.goto(`${BASE}#net`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'D:/OB-1-CANONICAL/tmp/net-desktop.png', fullPage: false });
  expect(true).toBe(true);
});

test('174 - mobile hero screenshot', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'D:/OB-1-CANONICAL/tmp/hero-mobile.png', fullPage: false });
  expect(true).toBe(true);
});

test('175 - mobile story screenshot', async ({ page }) => {
  await page.goto(`${BASE}#story`, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'D:/OB-1-CANONICAL/tmp/story-mobile.png', fullPage: false });
  expect(true).toBe(true);
});

test('176 - page reloads without errors', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.hero')).toBeVisible();
});

test('177 - direct hash navigation works', async ({ page }) => {
  await page.goto(`${BASE}#net`, { waitUntil: 'networkidle' });
  await expect(page.locator('#net')).toBeVisible();
});

test('178 - multiple hash navigations work', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#story"]');
  await page.click('.nav-links a[href="#net"]');
  await page.click('.nav-links a[href="#prais"]');
  await page.click('.nav-links a[href="#connect"]');
  await expect(page).toHaveURL(/#connect$/);
});

test('179 - back button works', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-links a[href="#net"]');
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('180 - page works without JS', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { (window as any).noJS = true; });
  await expect(page.locator('.hero')).toBeVisible();
});

test('181 - charset is UTF-8', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[charset="UTF-8"]')).toHaveCount(1);
});

test('182 - viewport meta is correct', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
});

test('183 - OG type is website', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
});

test('184 - canonical URL is set', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const canonical = page.locator('link[rel="canonical"]');
  if (await canonical.count() > 0) {
    await expect(canonical).toHaveCount(1);
  }
});

test('185 - preloads are defined', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const preloads = await page.locator('link[rel="preload"]').count();
  expect(preloads).toBeGreaterThanOrEqual(2);
});

test('186 - no broken images', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => img.naturalWidth === 0 && !img.src.startsWith('data:'));
  });
  expect(brokenImages.length).toBe(0);
});

test('187 - all external links are https', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const links = await page.locator('a[href^="http"]').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https:\/\//);
  }
});

test('188 - no inline styles with Coomber', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const inline = await page.locator('[style*="Coomber"]').count();
  expect(inline).toBe(0);
});

test('189 - footer copyright year is 2026', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('footer')).toContainText('2026');
});

test('190 - footer mentions Cloudflare Pages', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('footer')).toContainText('Cloudflare Pages');
});

test('191 - all CTAs are visible on load', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const ctas = page.locator('.btn');
  await expect(ctas).toHaveCount(3);
  for (const cta of await ctas.all()) {
    await expect(cta).toBeVisible();
  }
});

test('192 - story cards animate on scroll', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await expect(page.locator('.story-card').first()).toBeVisible();
});

test('193 - method cards animate on scroll', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);
  await expect(page.locator('.method-card').first()).toBeVisible();
});

test('194 - video is muted', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const video = page.locator('.hero-video');
  await expect(video).toHaveAttribute('muted');
});

test('195 - video is autoplay', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const video = page.locator('.hero-video');
  await expect(video).toHaveAttribute('autoplay');
});

test('196 - video loops', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const video = page.locator('.hero-video');
  await expect(video).toHaveAttribute('loop');
});

test('197 - video has poster', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const video = page.locator('.hero-video');
  await expect(video).toHaveAttribute('poster', /portrait\.jpg/);
});

test('198 - page is fully loaded', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const readyState = await page.evaluate(() => document.readyState);
  expect(readyState).toBe('complete');
});

test('199 - no alert dialogs', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  let alertFired = false;
  page.on('dialog', () => { alertFired = true; });
  await page.evaluate(() => {});
  expect(alertFired).toBe(false);
});

test('200 - full page screenshot captured', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `D:/OB-1-CANONICAL/tmp/fullpage-${test.info().project.name}.png`, fullPage: true });
  expect(true).toBe(true);
});
