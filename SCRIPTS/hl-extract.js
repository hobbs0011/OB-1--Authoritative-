// Extract all verbatim quotes from Heavy Ledger JSON files
// Deduplicate and post to soul-logger
const fs = require('fs');
const path = require('path');
const https = require('https');

const HL_DIR = path.join(__dirname, '..', 'CANON', 'HEAVY-LEDGER');
const WORKER = 'soul-logger.mrmichaelhobbs123.workers.dev';
const SESSION = 'sov100-run396-heavyledger';
const DELAY = 300;

function req(url, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bd = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'hl-extract/1.0',
        ...(bd ? { 'Content-Length': Buffer.byteLength(bd) } : {}) }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: { raw: d.slice(0,500) } }); }
      });
    });
    r.on('error', reject);
    if (bd) r.write(bd); r.end();
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Read all HL JSON files, extract verbatim_quotes[].text
function extractAllQuotes() {
  const files = fs.readdirSync(HL_DIR).filter(f => f.endsWith('.json'));
  const allQuotes = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(HL_DIR, file), 'utf8');
      const obj = JSON.parse(raw);
      const quotes = obj?.heavy_ledger_entry?.verbatim_quotes || obj?.verbatim_quotes || [];
      for (const q of quotes) {
        if (q.text && q.text.length > 5) {
          allQuotes.push({ file, text: q.text.trim(), priority: q.priority || q.signal || 'UNKNOWN' });
        }
      }
    } catch(e) { /* skip bad JSON */ }
  }
  return allQuotes;
}

(async () => {
  const quotes = extractAllQuotes();
  console.log(`HL files read: ${quotes.length} total quotes`);

  // Deduplicate by text (case-insensitive, trimmed)
  const seen = new Set();
  const unique = [];
  for (const q of quotes) {
    const key = q.text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key) && q.text.length > 5) {
      seen.add(key);
      unique.push(q);
    }
  }
  console.log(`Unique quotes: ${unique.length}`);

  // Before count
  const before = await req(`https://${WORKER}/api/soul/count`, 'GET');
  console.log(`SOULCOUNT BEFORE: ${before.body?.soulcount}`);

  let posted = 0, chars = 0;
  // Post in batches
  for (let i = 0; i < unique.length; i++) {
    const q = unique[i];
    const body = { session_id: SESSION, student_id: 'sov100-michael', role: 'user', text: q.text };
    const r = await req(`https://${WORKER}/api/soul/event`, 'POST', body);
    if (r.status < 300 && r.body?.ok) { posted++; chars += q.text.length; }
    
    if ((i + 1) % 20 === 0 || i === unique.length - 1) {
      await delay(DELAY * 2);
      const c = await req(`https://${WORKER}/api/soul/count`, 'GET');
      const delta = c.body?.soulcount - before.body?.soulcount;
      console.log(`  [${i+1}/${unique.length}] posted:${posted} chars:${chars} SOULCOUNT:${c.body?.soulcount} (+${delta})`);
    }
    await delay(DELAY);
  }

  const after = await req(`https://${WORKER}/api/soul/count`, 'GET');
  console.log(`\nFINAL: ${before.body?.soulcount} → ${after.body?.soulcount} (+${after.body?.soulcount - before.body?.soulcount})`);
  console.log(`Posted: ${posted}/${unique.length} quotes, ${chars} chars`);
})();
