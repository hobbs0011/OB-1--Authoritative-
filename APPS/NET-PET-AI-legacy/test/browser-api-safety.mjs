// ─────────────────────────────────────────────────────────────────────────────
// BROWSER-API SAFETY SWEEP — validates graceful degradation when browser APIs are
// unavailable (in-app browsers, private mode, restricted environments).
//
// Run: node test/browser-api-safety.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { webkit } from 'playwright';

const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const URL = `${BASE}/magic-chat?studentId=sov100-test-magic`;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const VP = { width: 375, height: 553 };

async function driveTo(page) {
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  await page.locator('.landing-mode-card[data-mode="free"]').evaluate(el => el.click()).catch(() => {});
  await page.waitForTimeout(700);
  await page.evaluate(() => { const b = document.getElementById('landingStartBtn'); if (b) b.click(); });
  await page.waitForTimeout(4000);
}

const browser = await webkit.launch({ headless: true });

let FAIL_COUNT = 0;

// ── TEST 1 — navigator.mediaDevices null ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  
  await page.addInitScript(() => {
    delete navigator.mediaDevices;
    try { delete Navigator.prototype.mediaDevices; } catch (_) {}
  });
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await driveTo(page);
  const status = await page.evaluate(() => ({
    orbStatus: document.getElementById('orbStatus')?.textContent || '',
    micStatus: document.getElementById('micStatus')?.textContent || '',
    inAppBanner: !!document.getElementById('micUnavailableBanner')
  }));
  const hasBanner = status.inAppBanner;
  const hasClearText = status.orbStatus.includes('Safari') || status.orbStatus.includes('browser') || status.micStatus.includes('Safari');
  if (!hasBanner && !hasClearText) {
    console.log('FAIL  [mediaDevices-null]  No graceful degradation - student gets silent dead-end');
    FAIL_COUNT++;
  } else {
    console.log('PASS  [mediaDevices-null]  Graceful degradation confirmed');
  }
  if (errs.length > 0) {
    console.log('CRASH [mediaDevices-null]  Uncaught errors:', errs.filter(e => !/mediaDevices|getUserMedia/.test(e)).slice(0,2));
    FAIL_COUNT++;
  }
  await ctx.close();
}

// ── TEST 2 — AudioContext null ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  
  await page.addInitScript(() => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
  });
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await driveTo(page);
  const realErr = errs.filter(e => !/AudioContext|audioCtx/i.test(e));
  if (realErr.length > 0) {
    console.log('FAIL  [AudioContext-null]  Uncaught errors:', realErr.slice(0,2));
    FAIL_COUNT++;
  } else {
    console.log('PASS  [AudioContext-null]  No crash on missing AudioContext');
  }
  await ctx.close();
}

// ── TEST 3 — localStorage null ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  
  await page.addInitScript(() => {
    delete window.localStorage;
    delete window.sessionStorage;
    try { delete Storage.prototype.setItem; } catch (_) {}
  });
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await driveTo(page);
  const realErr = errs.filter(e => !/localStorage|sessionStorage/i.test(e));
  if (realErr.length > 0) {
    console.log('FAIL  [localStorage-null]  Uncaught errors:', realErr.slice(0,2));
    FAIL_COUNT++;
  } else {
    console.log('PASS  [localStorage-null]  No crash on missing storage APIs');
  }
  await ctx.close();
}

// ── TEST 4 — sessionStorage null ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  
  await page.addInitScript(() => {
    delete window.sessionStorage;
  });
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await driveTo(page);
  const realErr = errs.filter(e => !/sessionStorage/i.test(e));
  if (realErr.length > 0) {
    console.log('FAIL  [sessionStorage-null]  Uncaught errors:', realErr.slice(0,2));
    FAIL_COUNT++;
  } else {
    console.log('PASS  [sessionStorage-null]  No crash on missing sessionStorage');
  }
  await ctx.close();
}

await browser.close();
console.log(`\n===== BROWSER-API SAFETY: ${FAIL_COUNT === 0 ? 'ALL SAFE' : FAIL_COUNT + ' CRASHES FOUND'} =====`);
process.exit(FAIL_COUNT);