// Verifies the Start button is REACHABLE on a short iPhone viewport — the real
// dead-end. Does NOT use Playwright's auto-scroll click (that masked the bug).
import { webkit } from 'playwright';

const URL = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-chat?studentId=sov100-test-magic';
// iPhone SE / older iPhone with Safari chrome eating height — the worst realistic case.
const VIEWPORTS = [
  { name: 'iPhone-SE-375x553', w: 375, h: 553 },   // SE with URL bar + toolbar
  { name: 'iPhone-13-390x664', w: 390, h: 664 },   // mid with Safari chrome
];

let anyFail = false;
const browser = await webkit.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#modeLanding', { timeout: 8000 });

  // Select a mode by invoking its real onclick (tap the card)
  await page.locator('.landing-mode-card[data-mode="free"]').dispatchEvent('click');
  await page.waitForTimeout(200);

  // Did selecting set the Start button "ready" (clickable)?
  const ready = await page.evaluate(() => {
    const b = document.getElementById('landingStartBtn');
    if (!b) return { exists: false };
    const cs = getComputedStyle(b);
    return { exists: true, ready: b.classList.contains('ready'),
             pointerEvents: cs.pointerEvents, opacity: cs.opacity };
  });

  // Is the Start button reachable on THIS viewport — visible now, or scrollable to?
  const reach = await page.evaluate(() => {
    const land = document.getElementById('modeLanding');
    const b = document.getElementById('landingStartBtn');
    if (!b || !land) return { reachable: false };
    const scrollable = land.scrollHeight > land.clientHeight + 2;
    const canScrollToIt = getComputedStyle(land).overflowY === 'auto' || getComputedStyle(land).overflowY === 'scroll';
    // Scroll the container to the bottom and re-measure the button rect vs viewport
    land.scrollTop = land.scrollHeight;
    const r = b.getBoundingClientRect();
    const inView = r.top >= 0 && r.bottom <= window.innerHeight + 1;
    return { scrollable, canScrollToIt, afterScrollInView: inView,
             btnTop: Math.round(r.top), btnBottom: Math.round(r.bottom), vh: window.innerHeight };
  });

  const pass = ready.exists && ready.ready && ready.pointerEvents !== 'none'
            && reach.canScrollToIt && reach.afterScrollInView && errors.length === 0;
  if (!pass) anyFail = true;

  console.log(`\n[${vp.name}]  ${pass ? 'PASS' : 'FAIL'}`);
  console.log(`  start-btn ready=${ready.ready} pointerEvents=${ready.pointerEvents} opacity=${ready.opacity}`);
  console.log(`  overflow scrollable=${reach.scrollable} canScrollToIt=${reach.canScrollToIt}`);
  console.log(`  after scroll: btn in viewport=${reach.afterScrollInView} (top=${reach.btnTop} bottom=${reach.btnBottom} vh=${reach.vh})`);
  if (errors.length) console.log(`  PAGE ERRORS: ${errors.join(' | ')}`);

  await ctx.close();
}

await browser.close();
console.log(anyFail ? '\nRESULT: FAIL — Start still not reachable' : '\nRESULT: PASS — Start reachable on short iPhone viewport');
process.exit(anyFail ? 1 : 0);
