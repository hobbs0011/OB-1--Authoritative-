import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');

const VIEWPORTS = [
  { name: 'desktop-1366x768', width: 1366, height: 768, isMobile: false },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: 'iPhone-375x553', width: 375, height: 553, isMobile: true },
  { name: 'iPhone-360x560', width: 360, height: 560, isMobile: true },
];

const BROWSERS = [
  { name: 'chromium', launch: () => chromium.launch({ headless: true }) },
  { name: 'firefox', launch: () => firefox.launch({ headless: true }) },
  { name: 'webkit', launch: () => webkit.launch({ headless: true }) },
];

const CASES = [
  { key: 'legacy-pitch-deck', file: 'pitch-deck.html', type: 'pitch' },
  { key: 'consolidated-pitch', file: 'corporate-pitch/pitch-deck-consolidated.html', type: 'pitch' },
  { key: 'corporate-method', file: 'corporate-pitch/method.html', type: 'page' },
  { key: 'corporate-programs', file: 'corporate-pitch/programs.html', type: 'page' },
  { key: 'corporate-index', file: 'corporate-pitch/index.html', type: 'page' },
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

async function newPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent: viewport.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return { context, page };
}

async function auditScrollFidelity(page, caseKey) {
  const result = await page.evaluate(() => {
    const sections = [];
    document.querySelectorAll('.slide, .section').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        sections.push({ id: el.id || null, cls: el.className, top: Math.round(rect.top), bottom: Math.round(rect.bottom) });
      }
    });
    return {
      sectionsInView: sections.length,
      firstSectionTop: sections[0]?.top ?? null,
      htmlScrollSnap: getComputedStyle(document.documentElement).scrollSnapType,
      bodyScrollSnap: getComputedStyle(document.body).scrollSnapType,
    };
  });

  if (caseKey.includes('pitch') && result.sectionsInView < 1) {
    failures.push({ page: caseKey, issue: 'no_section_in_viewport_initial' });
  }
  if (caseKey.includes('pitch') && !result.htmlScrollSnap.includes('y') && !result.bodyScrollSnap.includes('y')) {
    warnings.push({ page: caseKey, type: 'scroll-snap-missing' });
  }
  return result;
}

async function auditNavigation(page, caseKey) {
  const issues = [];
  const links = await page.locator('a[href]').all();
  for (const link of links.slice(0, 20)) {
    const href = await link.getAttribute('href');
    if (!href) continue;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) continue;
    const target = href.replace(/^\//, '').split('?')[0];
    const filePath = path.resolve(publicDir, target);
    if (!filePath.startsWith(path.resolve(publicDir) + path.sep)) {
      issues.push({ href, reason: 'outside-public' });
      continue;
    }
    const exists = fs.existsSync(filePath);
    if (!exists && !href.startsWith('#')) {
      issues.push({ href, reason: 'missing-target' });
    }
  }
  if (issues.length) failures.push({ page: caseKey, issue: 'broken-navigation', details: issues.slice(0, 5) });
}

async function auditForm(page, caseKey) {
  const hasForm = await page.locator('form').count();
  if (hasForm === 0) return;
  const inputs = await page.locator('input, textarea, select').count();
  if (inputs === 0) failures.push({ page: caseKey, issue: 'form-without-controls' });
  const submitText = await page.locator('button[type="submit"], input[type="submit"]').first().textContent().catch(() => '');
  if (!submitText || submitText.trim().length === 0) failures.push({ page: caseKey, issue: 'submit-button-empty' });
}

async function auditA11y(page, caseKey) {
  const result = await page.evaluate(() => {
    const landmarks = document.querySelectorAll('header, main, nav, footer, [role="banner"], [role="contentinfo"], [role="navigation"]').length;
    const headings = document.querySelectorAll('h1, h2, h3').length;
    const imgsMissingAlt = document.querySelectorAll('img:not([alt])').length;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { landmarks, headings, imgsMissingAlt, reducedMotion };
  });
  if (result.landmarks === 0 && caseKey.includes('pitch')) warnings.push({ page: caseKey, type: 'no-landmarks' });
  if (result.imgsMissingAlt > 0) warnings.push({ page: caseKey, type: 'images-missing-alt', count: result.imgsMissingAlt });
}

async function auditPerfSignals(page, caseKey) {
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    if (!perf) return null;
    const cls = performance.getEntriesByType('layout-shift').slice(0, 10).reduce((s, e) => s + (e.value || 0), 0);
    const imgs = Array.from(document.images).filter(img => img.complete && img.naturalWidth > 0).map(img => img.naturalWidth * img.naturalHeight);
    const largest = imgs.sort((a, b) => b - a)[0] || 0;
    return {
      domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
      loadComplete: perf.loadEventEnd - perf.loadEventStart,
      cls: Math.round(cls * 1000) / 1000,
      largestImagePx: largest,
    };
  });
  if (!metrics) return;
  if (metrics.domContentLoaded > 3000) warnings.push({ page: caseKey, type: 'slow-dom', ms: metrics.domContentLoaded });
  if (metrics.loadComplete > 5000) warnings.push({ page: caseKey, type: 'slow-load', ms: metrics.loadComplete });
  if (metrics.cls > 0.1) warnings.push({ page: caseKey, type: 'cls', value: metrics.cls });
  if (metrics.largestImagePx > 4 * 1920 * 1080) warnings.push({ page: caseKey, type: 'large-image', px: metrics.largestImagePx });
}

async function assessCase(browser, pageSpec, viewport, origin) {
  const { context, page } = await newPage(browser, viewport);
  try {
    const response = await page.goto(`${origin}/${pageSpec.file}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response || response.status() >= 400) {
      throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    }
    await page.waitForTimeout(400);
    await auditScrollFidelity(page, pageSpec.key);
    await auditNavigation(page, pageSpec.key);
    await auditForm(page, pageSpec.key);
    await auditA11y(page, pageSpec.key);
    await auditPerfSignals(page, pageSpec.key);

    if (pageSpec.type === 'pitch') {
      const counter = await page.$eval('#slideCounter', el => el.textContent).catch(() => null);
      const sections = await page.locator('.slide, .section').count();
      console.log(JSON.stringify({ case: pageSpec.key, viewport: viewport.name, counter, sections }, null, 2));
    } else {
      const sections = await page.locator('.section, .slide').count();
      console.log(JSON.stringify({ case: pageSpec.key, viewport: viewport.name, sections }, null, 2));
    }
  } finally {
    await context.close();
  }
}

async function main() {
  const { server, origin } = await startStaticServer();
  let browser;
  try {
    for (const browserDef of BROWSERS) {
      console.log(`\n===== ${browserDef.name} =====`);
      browser = await browserDef.launch();
      for (const viewport of VIEWPORTS) {
        console.log(`\n--- viewport: ${viewport.name} ---`);
        for (const pageSpec of CASES) {
          try {
            await assessCase(browser, pageSpec, viewport, origin);
          } catch (e) {
            failures.push({ page: pageSpec.key, viewport: viewport.name, issue: 'runtime-error', detail: e.message });
          }
        }
      }
      await browser.close();
      browser = undefined;
    }

    console.log('\n===== EDGE CASE AUDIT SUMMARY =====');
    if (failures.length) {
      console.error(`\nMISSION RESULT: ${failures.length} failures`);
      for (const f of failures) {
        console.error(`  [FAIL] ${f.page}/${f.viewport || 'all'}: ${f.issue}${f.detail ? ' — ' + JSON.stringify(f.detail) : ''}`);
      }
      process.exitCode = 1;
    } else {
      console.log('\nMISSION RESULT: NO HARD FAILURES');
    }

    if (warnings.length) {
      console.log(`\nNON-BLOCKING FLAGS: ${warnings.length}`);
      for (const w of warnings) {
        console.log(`  - ${w.page} (${w.viewport || 'all'}) ${w.type}: ${JSON.stringify(w.detail || w)}`);
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
