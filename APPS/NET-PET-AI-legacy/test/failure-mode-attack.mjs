// ─────────────────────────────────────────────────────────────────────────────
// FAILURE-MODE attack — the conditions that actually produce "Obi didn't work,
// didn't specify." The happy-path suite never touches these. For each adverse
// condition the student MUST get a CLEAR outcome (Obi works, OR a message that
// says what's wrong / what to do). A silent dead-end — orb shown but status
// reads idle ("Tap to start") or stuck ("Connecting…") with no banner — is a BUG.
//
// Run: node test/failure-mode-attack.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { webkit } from 'playwright';

const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const URL = `${BASE}/magic-chat?studentId=sov100-test-magic`;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const VP = { width: 375, height: 553 };

let CRIT_FAIL = 0, OPEN_FAIL = 0;
// critical = a regression here must BLOCK deploy (token failures = the real student
// killer). known-open = documented gaps that warn but don't gate (mic-denied UX,
// in-app harness-sim limitation). The gate fails only on critical silent dead-ends.
const result = (mode, critical, pass, observed, raw) => {
  if (!pass) { if (critical) CRIT_FAIL++; else OPEN_FAIL++; }
  const tag = pass ? 'PASS' : (critical ? 'FAIL(CRITICAL)' : 'KNOWN-OPEN');
  console.log(`  ${tag}  [${mode}]  ${pass ? 'clear outcome' : 'SILENT DEAD-END'}  — student sees: "${observed}"  RAW=${JSON.stringify(raw)}`);
};

// An "idle / ambiguous" end-state = a silent dead-end under a failure condition.
const AMBIGUOUS = [/^tap to start$/i, /^connecting…?$/i, /^$/];
function isClear(statusText, bannerVisible) {
  if (bannerVisible) return true;
  if (!statusText) return false;
  if (AMBIGUOUS.some(rx => rx.test(statusText.trim()))) return false;
  // A clear outcome names the problem or the action: busy/wait/again/problem/denied/open/chrome/safari
  return /busy|wait|again|problem|denied|open|chrome|safari|error|try|moment|later/i.test(statusText);
}

async function driveTo(page) {
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  await page.locator('.landing-mode-card[data-mode="free"]').evaluate(el => el.click()).catch(() => {});
  await page.waitForTimeout(700);
  await page.evaluate(() => { const b = document.getElementById('landingStartBtn'); if (b) b.click(); });
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const t = (id) => { const e = document.getElementById(id); return e ? (e.textContent || '').trim() : ''; };
    const bannerVisible = (id) => { const e = document.getElementById(id); return !!(e && (e.classList.contains('visible') || (e.offsetParent !== null && getComputedStyle(e).display !== 'none'))); };
    return {
      micStatus: t('micStatus'),
      orbStatus: t('orbStatus'),
      networkBanner: bannerVisible('networkFallbackBanner'),
      // Detect the in-app banner by its STABLE ID, not by scanning div text — the
      // text scan false-positived on a fixed container elsewhere on the page and
      // made every failure case wrongly "pass". Same false-green disease; id-based
      // detection is the cure.
      inAppBanner: bannerVisible('micUnavailableBanner'),
    };
  });
}

const browser = await webkit.launch({ headless: true });

// ── FAILURE 1 — token 429 (quota exhausted: the most likely real cause) ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/api/deepgram-token*', r => r.fulfill({ status: 429, contentType: 'application/json', body: '{"error":"Rate limit exceeded","retryAfter":1400}' }));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const s = await driveTo(page);
  const observed = s.orbStatus || s.micStatus;
  result('token-429-quota', true, isClear(observed, s.networkBanner || s.inAppBanner), observed, s);
  await ctx.close();
}

// ── FAILURE 2 — token 500 (worker error) ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/api/deepgram-token*', r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' }));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const s = await driveTo(page);
  const observed = s.orbStatus || s.micStatus;
  result('token-500-server-error', true, isClear(observed, s.networkBanner || s.inAppBanner), observed, s);
  await ctx.close();
}

// ── FAILURE 3 — microphone DENIED (student taps "Don't Allow") ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
    }
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const s = await driveTo(page);
  const observed = s.orbStatus || s.micStatus;
  result('mic-denied', true, isClear(observed, s.networkBanner || s.inAppBanner), observed, s);
  await ctx.close();
}

// ── FAILURE 4 — in-app browser (Zalo/FB): navigator.mediaDevices undefined ──
{
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    // Truly delete navigator.mediaDevices to simulate in-app browser limitation
    // The page accesses navigator.mediaDevices.getUserMedia which throws synchronously
    // in in-app browsers, so we need to ensure the property is genuinely unavailable
    delete navigator.mediaDevices;
    // Also delete on prototype to catch any inherited accessors
    if (Navigator.prototype.mediaDevices) {
      try { delete Navigator.prototype.mediaDevices; } catch (_) {}
    }
  });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const s = await driveTo(page);
  const observed = s.inAppBanner ? 'open-in-safari/chrome banner' : (s.orbStatus || s.micStatus);
  const realErr = errs.filter(e => !/getUserMedia|mediaDevices|NotAllowed/i.test(e));
  result('in-app-browser-no-mediaDevices', true, isClear(observed, s.inAppBanner) && realErr.length === 0,
         observed + (realErr.length ? ` | CRASH: ${realErr[0]}` : ''));
  await ctx.close();
}

await browser.close();
console.log(`\n===== FAILURE-MODE: ${CRIT_FAIL === 0 ? 'no CRITICAL silent dead-ends' : CRIT_FAIL + ' CRITICAL silent dead-ends (BLOCK)'}${OPEN_FAIL ? ' | ' + OPEN_FAIL + ' known-open (warn)' : ''} =====`);
process.exit(CRIT_FAIL === 0 ? 0 : 1);
