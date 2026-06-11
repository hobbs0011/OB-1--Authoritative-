import { webkit } from 'playwright';
const b = await webkit.launch({ headless: true });
const ctx = await b.newContext({
  viewport: { width: 375, height: 553 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
});
const p = await ctx.newPage();
await p.goto('https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-chat?studentId=sov100-test-magic', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#modeLanding');
await p.locator('.landing-mode-card[data-mode="free"]').dispatchEvent('click');
await p.waitForTimeout(1000); // let smooth auto-scroll settle — NO manual scroll
const r = await p.evaluate(() => {
  const x = document.getElementById('landingStartBtn').getBoundingClientRect();
  return { top: Math.round(x.top), bottom: Math.round(x.bottom), vh: window.innerHeight, inView: x.top >= 0 && x.bottom <= window.innerHeight + 1 };
});
console.log('AUTO-SCROLL on iPhone-SE (no manual scroll): Start in view =', r.inView, JSON.stringify(r));
await b.close();
process.exit(r.inView ? 0 : 1);
