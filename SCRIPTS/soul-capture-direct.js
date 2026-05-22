// ============================================================
// SOUL CAPTURE v3 — Read from source, post /api/soul/event
// ============================================================
const fs   = require('fs');
const path = require('path');
const https = require('https');

const WORKER    = 'soul-logger.mrmichaelhobbs123.workers.dev';
const SESSION   = 'sov100-run394-capture';
const OPS_DIR   = path.join(process.cwd(), 'OPERATIONS');
const LOG_FILE  = path.join(OPS_DIR, `soul-capture-${Date.now()}.jsonl`);
const DELAY_MS  = 400;

function appendLog(rec) {
  fs.mkdirSync(OPS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify(rec) + '\n', 'utf8');
}

async function req(worker, url, method, body) {
  return new Promise((resolve, reject) => {
    const u  = new URL(url.startsWith('http') ? url : `https://${worker}${url}`);
    const bd = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'soul-capture/3.0',
        ...(bd ? { 'Content-Length': Buffer.byteLength(bd) } : {})
      }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: { raw: d.slice(0,500) } }); }
      });
    });
    r.on('error', e => reject(e));
    if (bd) r.write(bd);
    r.end();
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Extract quotes from source markdown ─────────────────────
function extractBlockquotes(rawMd) {
  const lines = rawMd.split('\n');
  const out = [];
  let cur = null;
  for (const line of lines) {
    const m = line.match(/^>\s*[\u201c\u201d"]?\s*(.*)/);
    if (m) {
      if (!cur) { cur = m[1].trim(); }
      else      { cur += '\n' + m[1].trim(); }
    } else if (cur && (line.trim() === '' || line.startsWith('###') || line.startsWith('---'))) {
      out.push(cur); cur = null;
    } else if (cur && line.startsWith('>')) {
      // continuation
      const mc = line.match(/^>\s*(.*)/);
      if (mc) cur += '\n' + mc[1].trim();
    }
  }
  if (cur) out.push(cur);
  return out.filter(q => q.length > 10);
}

async function postEvent(text, seq) {
  const body = { session_id: SESSION, student_id: 'sov100-michael', role: 'user', text };
  const r = await req(WORKER, '/api/soul/event', 'POST', body);
  const ok = r.status < 300 && r.body?.ok;
  return { seq, ok, event_id: r.body?.event_id || 'FAIL', position: r.body?.position, chars: text.length, status: r.status };
}

async function getCount() {
  const r = await req(WORKER, '/api/soul/count', 'GET');
  return r.body;
}

(async () => {
  console.log('═══════════════════════════════════════════');
  console.log('SOUL CAPTURE v3 — Direct /api/soul/event');
  console.log('═══════════════════════════════════════════');
  console.log(`Session: ${SESSION}\n`);

  // Read source file
  const srcFile = path.join(process.cwd(), 'CANON', 'SOUL-DNA-RAW-MICHAEL-QUOTES-ALL-SESSIONS-2026-04-05.md');
  if (!fs.existsSync(srcFile)) { console.error('MISSING:', srcFile); return; }

  const rawMd = fs.readFileSync(srcFile, 'utf8');
  const quotes = extractBlockquotes(rawMd);
  console.log(`Parsed ${quotes.length} quotes from source\n`);

  // Before count
  const before = await getCount();
  console.log(`SOULCOUNT BEFORE: ${before.soulcount} | events: ${before.events}`);

  // Post in batches of 10
  let success = 0, totalChars = 0;
  const BATCH = 10;

  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];
    const r = await postEvent(q, i);
    appendLog(r);
    if (r.ok) { success++; totalChars += r.chars; }
    
    if ((i + 1) % BATCH === 0 || i === quotes.length - 1) {
      await delay(DELAY_MS * 2);
      const c = await getCount();
      const delta = c.soulcount - before.soulcount;
      console.log(`  [${i + 1}/${quotes.length}] LIVE: ${c.soulcount} (+${delta}) events:${c.events} | posted:${success}`);
    }
    await delay(DELAY_MS);
  }

  const after = await getCount();
  const delta = after.soulcount - before.soulcount;
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`CAPTURE COMPLETE`);
  console.log(`═══════════════════════════════════════════`);
  console.log(`Posted:    ${success}/${quotes.length}`);
  console.log(`Chars:     ${totalChars}`);
  console.log(`SOULCOUNT: ${before.soulcount} → ${after.soulcount} (+${delta})`);
  console.log(`Events:    ${before.events} → ${after.events}`);
  console.log(`Log:       ${LOG_FILE}`);
})();
