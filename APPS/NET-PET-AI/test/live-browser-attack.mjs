// LIVE BROWSER ATTACK — drives the real deployed site with real engines.
// WebKit = Safari engine (the student's iPhone path). Chromium = Michael's laptop.
// Run: node test/live-browser-attack.mjs
import { webkit, chromium } from 'playwright';

const BASE = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const STUDENT = 'sov100-test-magic';               // never a real student id
const URL = `${BASE}/magic-chat?studentId=${STUDENT}`;

const results = [];
function check(engine, name, pass, detail = '') {
  results.push({ engine, name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${engine}] ${tag}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function runEngine(engineName, launcher, isMobile) {
  console.log(`\n===== ${engineName} =====`);
  let browser;
  try {
    browser = await launcher.launch({ headless: true });
  } catch (e) {
    check(engineName, 'browser-launch', false, e.message.slice(0, 120));
    return;
  }

  const ctxOpts = {
    ignoreHTTPSErrors: true,
  };
  // WebKit rejects the 'microphone' permission token; only Chromium accepts it.
  if (!isMobile) ctxOpts.permissions = ['microphone'];
  if (isMobile) {
    ctxOpts.viewport = { width: 390, height: 844 };           // iPhone 13/14 logical
    ctxOpts.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    ctxOpts.isMobile = true;
    ctxOpts.hasTouch = true;
    ctxOpts.deviceScaleFactor = 3;
  }

  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const wsConnections = [];
  const tokenCalls = [];

  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('websocket', ws => { wsConnections.push(ws.url()); });
  page.on('request', r => { if (r.url().includes('/api/deepgram-token')) tokenCalls.push(r.url()); });

  // 1. Page loads
  try {
    const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    check(engineName, 'page-load-200', resp && resp.status() === 200, `status ${resp && resp.status()}`);
  } catch (e) {
    check(engineName, 'page-load-200', false, e.message.slice(0, 120));
    await browser.close();
    return;
  }

  // 2. Mode landing visible
  let landingVisible = false;
  try {
    await page.waitForSelector('#modeLanding', { timeout: 8000, state: 'attached' });
    landingVisible = await page.isVisible('#modeLanding');
  } catch (_) {}
  check(engineName, 'mode-landing-visible', landingVisible);

  // 3. Mode cards present (count)
  const cardCount = await page.locator('#modeLanding [data-mode], #modeLanding .mode-card, .landing-mode').count().catch(() => 0);
  check(engineName, 'mode-cards-present', cardCount >= 2, `${cardCount} cards`);

  // 4. Click a mode card (Free Talk / first card) then Start
  let dismissed = false;
  try {
    // Try a few likely selectors for a mode card
    const cardSel = ['#modeLanding [data-mode]', '#modeLanding .mode-card', '.landing-mode', '#modeLanding button'];
    let clicked = false;
    for (const sel of cardSel) {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0) { await loc.click({ timeout: 3000 }).catch(() => {}); clicked = true; break; }
    }
    // Start button
    const startSel = ['#startSessionBtn', '#landingStart', '#modeLanding .start', 'button:has-text("Start")', 'button:has-text("Begin")'];
    for (const sel of startSel) {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0) { await loc.click({ timeout: 3000 }).catch(() => {}); break; }
    }
    check(engineName, 'mode-card-clickable', clicked);
    // Wait for landing to gain hidden class / disappear
    await page.waitForFunction(() => {
      const l = document.getElementById('modeLanding');
      return !l || l.classList.contains('hidden') || getComputedStyle(l).display === 'none' || l.offsetParent === null;
    }, { timeout: 8000 }).then(() => dismissed = true).catch(() => {});
  } catch (e) {
    check(engineName, 'mode-card-clickable', false, e.message.slice(0, 80));
  }
  check(engineName, 'landing-dismissed-after-start', dismissed);

  // 5. Orb screen becomes the UI
  let orbVisible = false;
  try {
    await page.waitForSelector('#orbScreen', { timeout: 6000 });
    orbVisible = await page.isVisible('#orb').catch(() => false) || await page.isVisible('#orbScreen').catch(() => false);
  } catch (_) {}
  check(engineName, 'orb-screen-visible', orbVisible);

  // 6. Token fetch fired (Obi brain handshake)
  await page.waitForTimeout(4000);
  check(engineName, 'deepgram-token-fetched', tokenCalls.length > 0, `${tokenCalls.length} calls`);

  // 7. WebSocket to Deepgram opened (Obi voice channel)
  const wssDeepgram = wsConnections.filter(u => u.includes('deepgram') || u.startsWith('wss://'));
  check(engineName, 'voice-websocket-opened', wssDeepgram.length > 0, wssDeepgram.slice(0, 1).join('') || 'none');

  // 8. No createMediaElementSource on the playback path (the iOS silence trap)
  const usesMediaElementSrc = await page.evaluate(() => {
    // chat.js source already fetched; check the live function body
    // Require a method-call dot so the explanatory comment ("createMediaElementSource()
    // silences…") inside the function body — which toString() includes — is not a false hit.
    try { return /\.createMediaElementSource\s*\(/.test(window.hookOrbAudio ? window.hookOrbAudio.toString() : ''); }
    catch (_) { return false; }
  }).catch(() => false);
  check(engineName, 'no-mediaElementSource-on-playback', !usesMediaElementSrc, usesMediaElementSrc ? 'STILL TAPPING PLAYBACK' : 'clean');

  // 9. No uncaught page errors / JS crashes
  check(engineName, 'no-page-crash', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));

  // 10. Console error budget (allow benign mic-permission noise)
  const realErrors = consoleErrors.filter(e =>
    !/permission|NotAllowed|getUserMedia|microphone|autoplay|user gesture|play\(\)/i.test(e));
  check(engineName, 'console-error-budget', realErrors.length === 0, realErrors.slice(0, 2).join(' | '));

  await browser.close();
}

await runEngine('WebKit/Safari-iPhone', webkit, true);
await runEngine('Chromium/Laptop', chromium, false);

// Summary
console.log('\n===== SUMMARY =====');
const byEngine = {};
for (const r of results) {
  byEngine[r.engine] = byEngine[r.engine] || { pass: 0, fail: 0 };
  byEngine[r.engine][r.pass ? 'pass' : 'fail']++;
}
for (const [eng, s] of Object.entries(byEngine)) {
  console.log(`${eng}: ${s.pass} PASS / ${s.fail} FAIL`);
}
const totalFail = results.filter(r => !r.pass).length;
console.log(totalFail === 0 ? '\nALL GREEN' : `\n${totalFail} FAILURES`);
process.exit(totalFail === 0 ? 0 : 1);
