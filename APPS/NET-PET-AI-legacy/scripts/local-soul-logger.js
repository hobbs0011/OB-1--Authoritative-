require('dotenv').config();
const { Hono } = require('hono');
const { localEnv } = require('./local-env.js');

const app = new Hono();

app.get('/api/v1/health', (c) => c.text('OK'));
app.get('/api/v1/version', (c) => c.json({ version: 'local-0.1.0', env: 'localhost' }));

app.get('/api/soul/count', async (c) => {
  try {
    const row = localEnv.SOUL_DB.select('SELECT SUM(char_count) as total FROM soul_events WHERE student_id = ?', ['sov100']);
    const total = row?.[0]?.total || 0;
    return c.json({ soulcount: total, level: 'LOCAL', source: 'sqlite' });
  } catch (e) {
    return c.json({ soulcount: 0, level: 'ERROR', error: e.message }, 500);
  }
});

app.post('/api/soul/event', async (c) => {
  try {
    const body = await c.req.json();
    const id = body.event_id || `local-${Date.now()}`;
    localEnv.SOUL_DB.insert(
      'INSERT OR REPLACE INTO soul_events (event_id, session_id, student_id, byte_count, char_count, source) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.session_id || 'unknown', body.student_id || 'sov100', body.char_count || 0, body.char_count || 0, body.source || 'local']
    );
    const row = localEnv.SOUL_DB.select('SELECT SUM(char_count) as total FROM soul_events WHERE student_id = ?', ['sov100']);
    const total = row?.[0]?.total || 0;
    return c.json({ ok: true, event_id: id, soulcount: total });
  } catch (e) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

app.use('*', async (c, next) => {
  await next();
  c.res = new Response(c.res.body, {
    status: c.res.status,
    headers: {
      ...Object.fromEntries(c.res.headers),
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});

const port = parseInt(process.env.PORT || '8788', 10);
console.log(`[LOCAL-SOUL] Starting on :${port} at ${new Date().toISOString()}`);
require('http').createServer(async (req, res) => {
  const env = localEnv;
  const honoReq = new Request(req.url, {
    method: req.method,
    headers: Object.fromEntries(req.headers),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  });
  const response = await app.fetch(honoReq, env);
  res.statusCode = response.status;
  response.headers.forEach((v, k) => { if (k.toLowerCase() !== 'content-encoding') res.setHeader(k, v); });
  const text = await response.text();
  res.end(text);
}).listen(port, () => {
  console.log(`[LOCAL-SOUL] LISTENING http://localhost:${port}`);
});
