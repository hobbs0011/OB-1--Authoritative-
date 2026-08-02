// ─────────────────────────────────────────────────────────────────────────────
// iPhone REAL attack — thumb-fidelity. No cheats.
//
// This harness exists because the previous one passed while the product
// dead-ended in front of a real student. The lie was Playwright's .click(),
// which auto-scrolls an off-screen element into view and taps it — a thing a
// human thumb cannot do. This harness interacts ONLY the way a thumb can:
//
//   • thumbTap() refuses to tap any element whose center is not currently
//     inside the visible viewport. If it's off-screen, the tap MISSES and the
//     step FAILS — exactly like a real finger.
//   • NO dispatchEvent (that bypasses hit-testing entirely).
//   • Realistic USABLE viewport heights (Safari chrome eats ~150px).
//   • The deployed version is pinned and printed, so a green run names what it tested.
//   • A self-proof at the end injects the original broken CSS and asserts this
//     harness FAILS on it — proving it would have caught the shipped bug.
//
// Run: node test/iphone-real-attack.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { webkit } from 'playwright';

const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const STUDENT = 'sov100-test-magic';                  // never a real student id
const URL = `${BASE}/magic-chat?studentId=${STUDENT}`;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// USABLE viewport = device logical size MINUS Safari's URL bar + toolbar (~150px).
// This is what the page actually gets on a real iPhone — not the device spec.
const DEVICES = [
  { name: 'iPhone-SE-2/3 (usable 375x553)',  w: 375, h: 553 },
  { name: 'iPhone-13/14 (usable 390x664)',   w: 390, h: 664 },
  { name: 'iPhone-12-mini (usable 360x560)', w: 360, h: 560 },
];

let FAILED = 0;
const log = (engine, name, pass, detail = '') => {
  if (!pass) FAILED++;
  console.log(`  [${engine}] ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

// Tap an element the way a thumb does: at its real on-screen center, WITHOUT
// scrolling it into view. Returns {tapped:false} if it isn't actually visible
// in the viewport right now — which is a FAIL, just like a finger missing.
async function thumbTap(page, selector) {
  const el = page.locator(selector).first();
  if (await el.count() === 0) return { tapped: false, reason: 'not in DOM' };
  const box = await el.boundingBox();              // viewport-relative; null if not rendered
  if (!box) return { tapped: false, reason: 'no box (display:none / not laid out)' };
  const vp = page.viewportSize();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const inView = cy >= 0 && cy <= vp.height && cx >= 0 && cx <= vp.width;
  if (!inView) return { tapped: false, reason: `OFF-SCREEN center=(${Math.round(cx)},${Math.round(cy)}) vp=${vp.width}x${vp.height}` };
  // Also reject if something else is on top at that point (overlay/hit-test).
  const topMostMatches = await page.evaluate(({ x, y, sel }) => {
    const top = document.elementFromPoint(x, y);
    if (!top) return false;
    const target = document.querySelector(sel);
    return !!(target && (target === top || target.contains(top) || top.contains(target)));
  }, { x: cx, y: cy, sel: selector });
  if (!topMostMatches) return { tapped: false, reason: 'covered by another element at tap point' };
  await page.touchscreen.tap(cx, cy);              // touchscreen.tap does NOT auto-scroll
  return { tapped: true };
}

async function runDevice(dev) {
  console.log(`\n===== ${dev.name} =====`);
  const browser = await webkit.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: dev.w, height: dev.h },
    userAgent: IOS_UA, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  // Token: track whether the RESPONSE SUCCEEDED, not merely that a request was made.
  // (The gauntlet proved a "request was made" check is a tautology — green on a 500.)
  let tokenOk = null;
  page.on('response', r => { if (r.url().includes('/api/deepgram-token')) tokenOk = r.ok(); });
  // WebSocket: the 'websocket' event fires on ATTEMPT, not on open — so counting it
  // is a lie (the gauntlet proved it stays green even when the socket is aborted).
  // A genuinely-open, working agent socket RECEIVES frames (SettingsApplied etc).
  // We assert liveness by frames received, and watch for socket errors.
  let wsFrames = 0, wsErr = null;
  page.on('websocket', ws => {
    if (!ws.url().includes('deepgram')) return;
    ws.on('framereceived', () => { wsFrames++; });
    ws.on('socketerror', e => { wsErr = String(e); });
  });

  const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  log(dev.name, 'page-load-200', resp && resp.status() === 200, `status ${resp && resp.status()}`);

  await page.waitForSelector('#modeLanding', { timeout: 8000 }).catch(() => {});
  log(dev.name, 'landing-visible', await page.isVisible('#modeLanding').catch(() => false));

  // 1. The 3 mode cards must be REACHABLE by thumb (in viewport, tappable).
  const card = '.landing-mode-card[data-mode="free"]';
  const cardTap = await thumbTap(page, card);
  log(dev.name, 'mode-card-reachable-by-thumb', cardTap.tapped, cardTap.reason || '');

  // 2. After tapping a mode, the Start button must come INTO the viewport on its
  //    own (our scrollIntoView fix) — the student must not have to hunt for it.
  await page.waitForTimeout(1000);                 // allow smooth auto-scroll to settle
  const startTap = await thumbTap(page, '#landingStartBtn');
  log(dev.name, 'start-button-reachable-by-thumb', startTap.tapped, startTap.reason || '');

  // 3. Tapping Start must dismiss the landing and show the orb.
  let dismissed = false, orb = false;
  if (startTap.tapped) {
    dismissed = await page.waitForFunction(() => {
      const l = document.getElementById('modeLanding');
      return l && l.classList.contains('hidden');
    }, { timeout: 6000 }).then(() => true).catch(() => false);
    orb = await page.isVisible('#orbScreen').catch(() => false);
  }
  log(dev.name, 'landing-dismissed-on-start', dismissed);
  log(dev.name, 'orb-screen-shown', orb);

  // 4. Obi handshake: token RESPONSE ok + Deepgram agent WS genuinely LIVE (frames).
  await page.waitForTimeout(4500);
  log(dev.name, 'deepgram-token-ok', tokenOk === true, `response.ok=${tokenOk}`);
  log(dev.name, 'agent-ws-live-frames', wsFrames > 0, `frames=${wsFrames} err=${wsErr || 'none'}`);

  // 5. Audio path must NOT tap the playback element (iOS silence trap).
  const taps = await page.evaluate(() =>
    /\.createMediaElementSource\s*\(/.test(window.hookOrbAudio ? window.hookOrbAudio.toString() : '')
  ).catch(() => true);
  log(dev.name, 'no-playback-mediaElementSource', !taps, taps ? 'STILL TAPPING' : 'clean');

  // 6. No uncaught JS crash. (Benign getUserMedia/autoplay denials filtered — but
  //    nothing else is tolerated.)
  const real = pageErrors.filter(e => !/getUserMedia|mediaDevices|NotAllowed|autoplay|user gesture|play\(\)/i.test(e));
  log(dev.name, 'no-uncaught-crash', real.length === 0, real.slice(0, 2).join(' | '));

  await browser.close();
}

// SELF-PROOF: re-create the exact shipped bug (center + no overflow scroll) and
// assert this harness FAILS to reach Start. If this "passes" (i.e. still tappable),
// the harness has no teeth and we say so loudly.
async function selfProof() {
  console.log(`\n===== SELF-PROOF: does the harness catch the original dead-end? =====`);
  const browser = await webkit.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 553 }, userAgent: IOS_UA, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 });
  // Faithfully recreate the SHIPPED bug: (a) vertical centering, (b) no scroll,
  // and (c) NEUTRALIZE the scrollIntoView auto-scroll fix — otherwise the live
  // rescuer hides the bug and the self-proof itself lies (which it did first run).
  await page.evaluate(() => { Element.prototype.scrollIntoView = function () {}; });
  await page.addStyleTag({ content: `#modeLanding{justify-content:center!important;overflow:visible!important;}` });
  // Pick a mode WITHOUT relying on Start being reachable, then reset any scroll
  // so we measure the true centered (pre-fix) position.
  await page.locator('.landing-mode-card[data-mode="free"]').evaluate(el => el.click());
  await page.evaluate(() => { const l = document.getElementById('modeLanding'); if (l) l.scrollTop = 0; window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  const startTap = await thumbTap(page, '#landingStartBtn');
  const harnessHasTeeth = (startTap.tapped === false);
  console.log(`  injected pre-fix CSS (center + overflow:hidden)`);
  console.log(`  Start reachable by thumb? ${startTap.tapped}  ${startTap.reason ? '(' + startTap.reason + ')' : ''}`);
  log('SELF-PROOF', 'harness-catches-original-deadend', harnessHasTeeth,
      harnessHasTeeth ? 'correctly UNREACHABLE → would have caught it' : 'NO TEETH — still tappable');
  await browser.close();
}

// ── Run ──
const ver = await fetch(`${BASE}/api/status`).then(r => r.json()).catch(() => ({}));
console.log(`Testing deploy: version=${ver.version} readiness=${ver.readiness} @ ${new Date().toISOString()}`);
for (const d of DEVICES) await runDevice(d);
await selfProof();

console.log(`\n===== RESULT: ${FAILED === 0 ? 'ALL GREEN (and the harness has teeth)' : FAILED + ' FAILURES'} =====`);
process.exit(FAILED === 0 ? 0 : 1);
