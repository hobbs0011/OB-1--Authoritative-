import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');

const CASES = [
  { key: 'legacy-pitch-deck', file: 'pitch-deck.html', requiresBackBar: true },
  { key: 'consolidated-pitch', file: 'corporate-pitch/pitch-deck-consolidated.html', requiresBackBar: true },
  { key: 'corporate-method', file: 'corporate-pitch/method.html', requiresBackBar: false },
  { key: 'corporate-programs', file: 'corporate-pitch/programs.html', requiresBackBar: false },
];

const failures = [];
const warnings = [];

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml; charset=utf-8';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  return 'application/octet-stream';
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function publicPathFor(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded.replace(/^\/+/, '') || 'index.html';
  const filePath = path.resolve(publicDir, relative);
  if (!filePath.startsWith(path.resolve(publicDir) + path.sep) && filePath !== path.resolve(publicDir)) return null;
  return filePath;
}

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const filePath = publicPathFor(reqUrl.pathname);
    if (!filePath) {
      send(res, 403, 'Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(res, 404, 'Not found');
        return;
      }
      send(res, 200, data, contentType(filePath));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function newPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 553 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  return { context, page };
}

async function assessCase(browser, pageSpec, origin) {
  const { context, page } = await newPage(browser);
  try {
    const response = await page.goto(`${origin}/${pageSpec.file}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response || response.status() >= 400) {
      throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    }
    await page.waitForTimeout(300);

    const slideText = await page.$eval('#slideCounter', (el) => el.textContent).catch(() => null);
    const sectionCount = await page.locator('.section, .slide').count();
    const backBar = await page.locator('#backBar').count();
    const ctaCount = await page.locator('.cta-nav, .cta-btn').count();
    const brokenImages = await page.locator('img').evaluateAll((imgs) =>
      imgs
        .filter((img) => img.naturalWidth === 0 && !img.getAttribute('onerror') && !getComputedStyle(img).backgroundImage.includes('url('))
        .slice(0, 3)
        .map((img) => ({ src: img.src, alt: img.alt }))
    );
    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vpWidth = await page.evaluate(() => window.innerWidth);
    const xOverflow = docWidth > vpWidth + 1;

    const result = { case: pageSpec.key, slideText, sectionCount, backBar, ctaCount, brokenImages, docWidth, vpWidth, xOverflow };
    console.log(JSON.stringify(result, null, 2));

    if (pageSpec.requiresBackBar && backBar === 0) failures.push({ page: pageSpec.key, device: 'iPhone', issue: 'missing_back_bar' });
    if (ctaCount === 0 && pageSpec.key.includes('pitch')) warnings.push({ page: pageSpec.key, device: 'iPhone', type: 'no_cta', detail: 'no CTA buttons found' });
    if (xOverflow) warnings.push({ page: pageSpec.key, device: 'iPhone', type: 'horizontal-overflow', docWidth, viewport: vpWidth });
    if (brokenImages.length) warnings.push({ page: pageSpec.key, device: 'iPhone', type: 'broken_images', count: brokenImages.length, examples: brokenImages });
  } finally {
    await context.close();
  }
}

async function main() {
  const { server, origin } = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const pageSpec of CASES) {
      console.log(`\n--- ${pageSpec.key} ---`);
      await assessCase(browser, pageSpec, origin);
    }

    console.log('\n===== PITCHDECK EDGE CASE AUDIT =====');
    if (failures.length) {
      console.error(`\nMISSION RESULT: ${failures.length} failures`);
      for (const f of failures) {
        console.error(`  [FAIL] ${f.page}/${f.device}: ${f.issue}`);
      }
      process.exitCode = 1;
    } else {
      console.log('\nMISSION RESULT: NO HARD FAILURES');
    }

    if (warnings.length) {
      console.log(`\nNON-BLOCKING FLAGS: ${warnings.length}`);
      for (const w of warnings) {
        console.log(`  - ${w.page} (${w.device}) ${w.type}: ${JSON.stringify(w.detail || w)}`);
      }
    } else {
      console.log('\nNON-BLOCKING FLAGS: none');
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
