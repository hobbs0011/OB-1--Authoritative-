import { chromium } from 'playwright';

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => consoleLogs.push({ type: 'pageerror', text: err.message + '\n' + err.stack }));

    await page.goto('https://net-pet-ai.mrmichaelhobbs123.workers.dev/bluetech-login/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(500);

    const checks = await page.evaluate(() => {
      const ids = ['splash','loginWrap','app','loginForm','error','username','password','sidebar','mobileMenuBtn','main','logoutBtn','navLinks','navBackdrop'];
      const out = {};
      for (const id of ids) out[id] = !!document.getElementById(id);
      out['querySelector .nav'] = !!document.querySelector('.nav');
      out['querySelector main'] = !!document.querySelector('main');
      return out;
    });
    console.log('=== DOM CHECKS ===');
    console.log(JSON.stringify(checks, null, 2));

    console.log('=== CONSOLE BEFORE FILL ===');
    consoleLogs.forEach(l => console.log(l.type.toUpperCase() + ':', l.text));

    await page.fill('#username', 'BlueTech English Class');
    await page.fill('#password', 'BLUETECH2026');
    await Promise.all([
      page.waitForURL('**/bluetech-login/**', { timeout: 10000 }).catch(() => null),
      page.click('#loginBtn'),
    ]);
    await page.waitForTimeout(1000);

    console.log('=== AFTER SUBMIT ===');
    console.log('URL:', page.url());
    console.log('TopNav hidden:', await page.$eval('#topNav', el => el.classList.contains('hidden')).catch(() => 'missing'));
    console.log('LoginScreen hidden:', await page.$eval('#loginScreen', el => el.classList.contains('hidden')).catch(() => 'missing'));
    console.log('Main container visible:', await page.$eval('.main-container', el => getComputedStyle(el).display).catch(() => 'missing'));
    console.log('Section active:', await page.$eval('.section.active', el => el.id).catch(() => 'missing'));

    console.log('=== CONSOLE AFTER SUBMIT ===');
    consoleLogs.forEach(l => console.log(l.type.toUpperCase() + ':', l.text));

    await page.screenshot({ path: 'D:\\OB-1-CANONICAL\\OPERATIONS\\bluetech-login-test.png', fullPage: true });
  } catch (err) {
    console.error('TEST_ERROR:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
