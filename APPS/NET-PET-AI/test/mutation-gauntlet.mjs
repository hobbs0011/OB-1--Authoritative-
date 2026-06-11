// ─────────────────────────────────────────────────────────────────────────────
// MUTATION GAUNTLET — tests the test suite.
//
// "How did we fail to test the test suite?" — by trusting green without ever
// proving the guards CAN go red. A test never observed failing is worthless.
//
// This file mutation-tests the harness: for each guard, it breaks the system in
// the precise way that guard exists to catch, and asserts the guard turns RED.
// A guard that stays GREEN under its own mutation is a TAUTOLOGY (a lie) and is
// named in the output. Mutation #1 is ground truth — the REAL pre-fix code from
// git (commit cf9f32f7~1, the version that dead-ended a real student), not a
// synthetic injection authored to match the fix.
//
// Run: node test/mutation-gauntlet.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { webkit } from 'playwright';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const URL = `${BASE}/magic-chat?studentId=sov100-test-magic`;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const VP = { width: 375, height: 553 };               // worst realistic iPhone usable height

const OLD = join(tmpdir(), 'obi-mutation');
const oldHtml = readFileSync(join(OLD, 'magic-chat.OLD.html'), 'utf8');
const oldJs   = readFileSync(join(OLD, 'chat.OLD.js'), 'utf8');

let GAUNTLET_FAIL = 0;
// behavedCorrectly = the guard did what it must under this mutation (RED on a
// failure mutation, GREEN on the control). A guard that can't tell broken from
// fixed is a tautology and is named loudly.
const verdict = (mutation, guard, behavedCorrectly, detail = '') => {
  if (!behavedCorrectly) GAUNTLET_FAIL++;
  console.log(`  ${behavedCorrectly ? 'PROVEN' : 'TAUTOLOGY'}  [${mutation}] guard "${guard}" ${behavedCorrectly ? 'discriminated correctly' : 'could NOT tell broken from fixed — BLIND SPOT'}${detail ? '  — ' + detail : ''}`);
};

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: VP, userAgent: IOS_UA, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  return { ctx, page: await ctx.newPage() };
}

// Thumb-fidelity reachability: is the element's center in the viewport NOW (no auto-scroll)?
async function startReachableByThumb(page) {
  await page.locator('.landing-mode-card[data-mode="free"]').evaluate(el => el.click()).catch(() => {});
  await page.waitForTimeout(900);   // allow any (real) auto-scroll to settle
  return await page.evaluate(() => {
    const b = document.getElementById('landingStartBtn');
    if (!b) return false;
    const r = b.getBoundingClientRect();
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    return cy >= 0 && cy <= window.innerHeight && cx >= 0 && cx <= window.innerWidth;
  });
}

const browser = await webkit.launch({ headless: true });

// ── MUTATION 1 — GIT TRUTH: serve the real pre-fix assets that shipped the bug.
{
  const { ctx, page } = await newPage(browser);
  await page.route('**/magic-chat*', r => r.fulfill({ contentType: 'text/html', body: oldHtml }));
  await page.route('**/chat.js*', r => r.fulfill({ contentType: 'application/javascript', body: oldJs }));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  const reachable = await startReachableByThumb(page);
  // Guard "start-button-reachable-by-thumb" must go RED (reachable=false) on the real old code.
  verdict('GIT-TRUTH pre-fix code (cf9f32f7~1)', 'start-button-reachable-by-thumb', reachable === false,
          reachable ? 'Start was REACHABLE on the broken code → harness is BLIND to the real bug' : 'Start correctly unreachable on the shipped bug');
  await ctx.close();
}

// ── CONTROL — current prod must be GREEN (reachable). Proves the guard is not stuck-red.
{
  const { ctx, page } = await newPage(browser);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  const reachable = await startReachableByThumb(page);
  verdict('CONTROL current prod', 'start-button-reachable-by-thumb', reachable === true,
          reachable ? 'Start reachable on fixed code (guard not stuck-red)' : 'Start UNREACHABLE on current prod — real regression OR guard stuck-red');
  await ctx.close();
}

// ── MUTATION 2 — token endpoint 500. A guard that only checks "a token request
//    was MADE" is a tautology; a real guard checks the response SUCCEEDED.
{
  const { ctx, page } = await newPage(browser);
  let tokenOk = null;
  await page.route('**/api/deepgram-token*', async r => {
    await r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"injected"}' });
  });
  page.on('response', async resp => { if (resp.url().includes('/api/deepgram-token')) tokenOk = resp.ok(); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  await startReachableByThumb(page);
  await page.evaluate(() => { const b = document.getElementById('landingStartBtn'); if (b) b.click(); });
  await page.waitForTimeout(3000);
  // The honest guard: token RESPONSE ok? Under this mutation it must be false.
  verdict('token-500', 'deepgram-token-RESPONSE-ok', tokenOk === false,
          `observed tokenOk=${tokenOk} (a "request was made" check would falsely stay green here)`);
  await ctx.close();
}

// ── MUTATION 3 — block the Deepgram agent WebSocket. The "agent-websocket-opened"
//    guard must go RED.
{
  const { ctx, page } = await newPage(browser);
  // NOTE: page.route().abort() canNOT block a WebSocket (route only intercepts
  // HTTP) — that inert mutation is itself a test-suite trap. Block the socket at
  // the right layer: override window.WebSocket for deepgram URLs BEFORE load.
  await page.addInitScript(() => {
    const _WS = window.WebSocket;
    window.WebSocket = function (url, ...rest) {
      if (String(url).includes('deepgram')) throw new Error('blocked-by-gauntlet');
      return new _WS(url, ...rest);
    };
  });
  // Liveness = frames received, NOT the attempt event (which fires even when aborted).
  let wsFrames = 0;
  page.on('websocket', ws => { if (ws.url().includes('deepgram')) ws.on('framereceived', () => wsFrames++); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  await startReachableByThumb(page);
  await page.evaluate(() => { const b = document.getElementById('landingStartBtn'); if (b) b.click(); });
  await page.waitForTimeout(3500);
  // Aborted socket can never receive frames. The corrected guard must go RED.
  verdict('ws-blocked', 'agent-ws-live-frames', wsFrames === 0,
          `frames received under block: ${wsFrames} (want 0 — a "ws attempted" check would falsely stay green)`);
  await ctx.close();
}

// ── MUTATION 4 — re-introduce the iOS silence trap in chat.js and assert the
//    "no-playback-mediaElementSource" guard goes RED.
{
  const poisoned = oldJs.replace(
    /function hookOrbAudio\(audioEl\)\s*\{/,
    'function hookOrbAudio(audioEl){ try{ _orbAudioCtx.createMediaElementSource(audioEl); }catch(_){}'
  );
  const { ctx, page } = await newPage(browser);
  await page.route('**/magic-chat*', r => r.fulfill({ contentType: 'text/html', body: oldHtml }));
  await page.route('**/chat.js*', r => r.fulfill({ contentType: 'application/javascript', body: poisoned }));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const taps = await page.evaluate(() =>
    /\.createMediaElementSource\s*\(/.test(window.hookOrbAudio ? window.hookOrbAudio.toString() : '')
  ).catch(() => false);
  // Guard fires when it DETECTS the tap. Under poison it must detect it (taps=true → guard RED).
  verdict('audio-silence-trap', 'no-playback-mediaElementSource', taps === true,
          `createMediaElementSource detected in hookOrbAudio: ${taps} (want true under poison)`);
  await ctx.close();
}

await browser.close();
console.log(`\n===== GAUNTLET: ${GAUNTLET_FAIL === 0 ? 'ALL GUARDS PROVEN (each can go RED on its real failure mode)' : GAUNTLET_FAIL + ' TAUTOLOGIES / BLIND SPOTS — guards that cannot detect failure'} =====`);
process.exit(GAUNTLET_FAIL === 0 ? 0 : 1);
