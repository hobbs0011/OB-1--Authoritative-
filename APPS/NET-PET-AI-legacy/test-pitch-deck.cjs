const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const publicDir = path.join(process.cwd(), 'public');
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  if (u.pathname.startsWith('/api/')) {
    res.writeHead(204);
    res.end();
    return;
  }
  const fp = path.join(publicDir, u.pathname.replace(/^\/+/, ''));
  if (!fp.startsWith(publicDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ct = {'.html':'text/html; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'}[path.extname(fp)] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': ct});
    res.end(data);
  });
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15'
  });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(`http://127.0.0.1:${port}/pitch-deck.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('#backBar', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const controls = await page.evaluate(() => {
    const c = [];
    document.querySelectorAll('button, a[href], [onclick]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width >= 1 && r.height >= 1) {
        c.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)
        });
      }
    });
    return c;
  });

  console.log('pitch-deck controls:', controls.length);
  console.log(JSON.stringify(controls.slice(0, 15), null, 2));
  console.log('errors:', errors);

  await browser.close();
  server.close();
});
