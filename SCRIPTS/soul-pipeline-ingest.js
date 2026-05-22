// ============================================================
// SOUL PIPELINE INGEST v2 — 1-call-per-bucket, full pipeline
// SCRIPTS/soul-pipeline-run.ps1 | Node 18+, native fetch | S2PIPELINE 10/10
// ============================================================
const https = require('https');
const fs   = require('fs');
const path = require('path');

const WORKER   = 'https://soul-logger.mrmichaelhobbs123.workers.dev';
const OPS_DIR  = path.join(process.cwd(), 'OPERATIONS');
const LOG_FILE = path.join(OPS_DIR,   `pipeline-run-log-${new Date().toISOString().slice(0,10)}.jsonl`);
const CLASS_FILE = path.join(OPS_DIR, `raw-soul-ingress-classified-${new Date().toISOString().slice(0,10)}.jsonl`);
const DELAY_MS  = 1500;   // per-call throttle

function appendLog(rec) {
  fs.mkdirSync(OPS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE,  JSON.stringify(rec) + '\n', 'utf8');
}
function appendClass(rec) {
  fs.mkdirSync(OPS_DIR, { recursive: true });
  fs.appendFileSync(CLASS_FILE.replace(/\.jsonl$/, '-classified.json'), JSON.stringify(rec, null, 2), 'utf8');
}
function req(url, method, body) {
  return new Promise((resolve, reject) => {
    const u  = new URL(url);
    const bd = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { 'Content-Type':'application/json','Content-Length':Buffer.byteLength(bd),
                 'User-Agent':'soul-pipeline-run/1.0' }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: { raw: d.slice(0,500) } }); }
      });
    });
    r.on('error', reject);
    r.write(bd); r.end();
  });
}
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Bucket parsers ─────────────────────────────────────────
/**
 * Bucket A: Markdown verbatim blockquotes
 * Lines starting with > (optionally space) followed by a quote char → text body
 * Multi-line: consecutive > lines → single quote object
 */
function parseBlockquotes(rawMd) {
  const lines = rawMd.split('\n');
  const out   = [];
  let cur = null;
  for (const line of lines) {
    if (match = line.match(/^>\s*([\u201c\u201d"])(.*)/)) {
      if (!cur) cur = { label: match[1], text: match[2].trim(), line_count: 1, char_count: match[2].trim().length };
      else         { cur.text += '\n' + match[2].trim(); cur.line_count++; }
    } else if (cur && (line.trim() === '' || line.startsWith('#'))) {
      out.push(cur); cur = null;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Bucket B / C: JSONL — one schema'd JSON object per newline
 * Lines starting with { are valid JSON objects
 */
function parseJsonl(rawJsonl) {
  const lines = rawJsonl.split('\n');
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    try {
      const obj = JSON.parse(t);
      if (obj.text) out.push(obj);
      else if (obj.id && obj.label) out.push(obj);
    } catch(e) { /* skip malformed */ }
  }
  return out;
}

// ── Pipeline executor ──────────────────────────────────────
async function runPipeline(sourceId, text, meta = {}) {
  const t0  = Date.now();
  const res = { source_id: sourceId, session_id: null, stages: {}, text_len: text.length,
                started_at: new Date().toISOString(), meta };
  try {
    // STAGE 1 — RRL extract → D1
    const r1 = await req(`${WORKER}/api/soul/extract`, 'POST', { text, source_format: meta.fmt||'raw', source_date: meta.date||'2026-04-05' });
    if (r1.status < 300 && r1.body?.session_id) {
      res.session_id = r1.body.session_id;
      res.stages.extract = { status: r1.status, prompt_count: r1.body.prompt_count, ingested_at: r1.body.ingested_at };
      appendLog({ ts: Date.now(), stage:'extract', source_id: sourceId, session_id: res.session_id, rc: r1.status, prompts: r1.body.prompt_count });
    } else { res.error_stage='extract'; res.error_detail = r1.body; return res; }
    await delay(DELAY_MS);

    const sid = res.session_id;

    // STAGE 2 — SOUL crunch (bible + themes)
    let aiTierBible = null;
    const r2b = (await req(`${WORKER}/api/soul/crunch`, 'POST', { session_id: sid, mode:'bible' }));
    if (r2b.status < 300) { res.stages.crunch_bible = { status:r2b.status, crunch_id:r2b.body.crunch_id, tier:r2b.body.ai_tier_used };
      appendLog({ ts:Date.now(), stage:'crunch_bible', session_id:sid, crunch_id:r2b.body.crunch_id, rc:r2b.status }); }
    await delay(DELAY_MS);
    const r2t = (await req(`${WORKER}/api/soul/crunch`, 'POST', { session_id: sid, mode:'themes' }));
    if (r2t.status < 300) { res.stages.crunch_themes = { status:r2t.status, crunch_id:r2t.body.crunch_id, tier:r2t.body.ai_tier_used };
      appendLog({ ts:Date.now(), stage:'crunch_themes', session_id:sid, crunch_id:r2t.body.crunch_id, rc:r2t.status }); }
    await delay(DELAY_MS);
    // Stage 3 LINELOCK — auto via appendToLedger() inside crunch, no direct call needed

    // STAGE 4 — SKELETON / keyword extraction
    const r4 = (await req(`${WORKER}/api/soul/skeleton`, 'POST', { session_id: sid, student_id:'sov100' }));
    if (r4.status < 300) { res.stages.skeleton = { status:r4.status, keywords:(r4.body.keywords||[]).slice(0,12) };
      appendLog({ ts:Date.now(), stage:'skeleton', session_id:sid, kw_count:(r4.body.keywords||[]).length, rc:r4.status }); }
    await delay(DELAY_MS);

    // STAGE 6 — 6-AI truth
    let tScore = null;
    const r6 = (await req(`${WORKER}/api/soul/truth`, 'POST', { session_id: sid }));
    if (r6.status < 300) {
      tScore = r6.body?.consensus_score || null;
      res.stages.truth = { status:r6.status, truth_id:r6.body.truth_id, consensus_score:tScore, consensus_achieved:r6.body.consensus_achieved, agreed_directives:(r6.body.agreed_directives||[]).slice(0,6) };
      appendLog({ ts:Date.now(), stage:'truth', session_id:sid, truth_id:r6.body.truth_id, score:tScore, rc:r6.status });
    }
    await delay(DELAY_MS);

    // STAGE 7 — shadow/adversarial
    const r7 = (await req(`${WORKER}/api/soul/shadow`, 'POST', { session_id: sid }));
    if (r7.status < 300) {
      res.stages.shadow = { status:r7.status, shadow_id:r7.body.shadow_id, verdict:r7.body.verdict, intensity:r7.body.intensity_score };
      appendLog({ ts:Date.now(), stage:'shadow', session_id:sid, shadow_id:r7.body.shadow_id, verdict:r7.body.verdict, rc:r7.status });
    }
    await delay(DELAY_MS);

  } catch(e) { res.run_error = { msg: e.message, stack: (e.stack||'').slice(0,300) }; }
  res.elapsed_ms = Date.now() - t0;
  res.completed_at = new Date().toISOString();
  return res;
}

// ── Main entry ─────────────────────────────────────────────
(async () => {
  console.log(`
═══════════════════════════════════════════
SOUL PIPELINE INGEST — RUN ${new Date().toISOString().slice(0,10)}
═══════════════════════════════════════════
Worker:  ${WORKER}
Throttle: ${DELAY_MS}ms/call | Stages: 1+2(both)+4+6+7
`);

  const summary = { run_at: new Date().toISOString(), buckets: [] };

  // ─── BUCKET A — VERBATIM QUOTES ─────────────────────
  const rawA = path.join(process.cwd(), 'CANON', 'SOUL-DNA-RAW-MICHAEL-QUOTES-ALL-SESSIONS-2026-04-05.md');
  if (fs.existsSync(rawA)) {
    const contentA  = fs.readFileSync(rawA, 'utf8');
    const quotes    = parseBlockquotes(contentA);

    console.log(`[BUCKET A] VERBATIM QUOTES: ${quotes.length} quotes | ${contentA.length} source chars`);

    // Classified dump
    const bktA = {
      bucket:'A', file: 'SOUL-DNA-RAW-MICHAEL-QUOTES-ALL-SESSIONS-2026-04-05.md',
      total_source_chars: contentA.length, total_quotes: quotes.length,
      records: quotes.map((q,i)=>({ index:i, label:q.label.slice(0,8), lines:q.line_count, chars:q.char_count, preview:q.text.slice(0,80) }))
    };
    appendClass(bktA);

    // One big extract call — all quotes in one session
    const allQText = quotes.map(q => `> ${q.label}${q.text}`).join('\n>\n');
    const rA = await runPipeline(`A-quotes-${Date.now()}`, allQText, { fmt:'markdown-blockquote', date:'2026-04-05' });
    rA.quotes_count = quotes.length;
    summary.buckets.push(rA);
    console.log(`  A-session: sid=${rA.session_id} stages=${Object.keys(rA.stages||{}).join(',')} elapsed=${rA.elapsed_ms}ms`);
  } else { console.warn('[BUCKET A] MISSING:', rawA); }

  // ─── BUCKET B — SOULDNA SEGMENTS (JSONL) ────────────
  const rawB = path.join(process.cwd(), 'CANON', 'SOUL-SEGMENTS', 'SOULDNA-ADDITIONAL-SEGMENTS-2026-04-05.md');
  if (fs.existsSync(rawB)) {
    const contentB = fs.readFileSync(rawB, 'utf8');
    const segs     = parseJsonl(contentB);

    console.log(`[BUCKET B] SOULDNA SEGMENTS: ${segs.length} segments | ${contentB.length} chars`);

    const bktB = {
      bucket:'B', file:'SOULDNA-ADDITIONAL-SEGMENTS-2026-04-05.md',
      total_chars: contentB.length, total_segments: segs.length,
      records: segs.map((s,i)=>({ index:i, id:s.id, sha:s.sha256?.slice(0,12), chars:(s.text||'').length }))
    };
    appendClass(bktB);

    // One call per segment — channel-labelled sessions
    const bktBRes = { bucket:'B', label:'segment-runs', runs:[], limit:segs.length };
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const text = seg.text || JSON.stringify(seg);
      const res  = await runPipeline(`B-${i}-${seg.id?.slice(-8)||'u'}`, text, { fmt:'soulsegment-jsonl', date:'2026-04-05', sha256:seg.sha256 });
      bktBRes.runs.push(res);
      console.log(`  [B-${i}] sid=${res.session_id?.slice(0,8)} stages=${Object.keys(res.stages||{}).length} sha=${(seg.sha256||'').slice(0,8)} truth=${res.stages?.truth?.consensus_score ?? 'n/a'} elapsed=${res.elapsed_ms}ms`);
    }
    summary.buckets.push({ bucket:'B', runs_total:segs.length, ...bktBRes });
  } else { console.warn('[BUCKET B] MISSING:', rawB); }

  // ─── BUCKET C — VERBATIM LOG KEY-SOUL10 ─────────────
  const rawC = path.join(process.cwd(), 'CANON', 'SOUL-LOG-VERBATIM-KEY-SOUL10-2026-04-05.md');
  if (fs.existsSync(rawC)) {
    const contentC = fs.readFileSync(rawC, 'utf8');
    const objs     = parseJsonl(contentC);

    console.log(`[BUCKET C] VERBATIM LOG: ${objs.length} JSONL objects | topK=50 throttle (prevents runaway)`);

    const bktC = { bucket:'C', file:'VERBATIM-KEY-SOUL10-2026-04-05.md', total_chars:contentC.length, total_objects:objs.length };
    appendClass(bktC);

    const bktCRes = { bucket:'C', label:'verbatim-log-runs', runs:[], limit:50 };
    for (let i = 0; i < Math.min(objs.length, 50); i++) {
      const obj = objs[i];
      const text = obj.text || JSON.stringify(obj);
      const res  = await runPipeline(`C-${i}`, text, { fmt:'verbatim-jsonl', date:'2026-04-05', sha256:obj.sha256 });
      bktCRes.runs.push(res);
      console.log(`  [C-${i}] sid=${res.session_id?.slice(0,8)} stages=${Object.keys(res.stages||{}).length} sha=${(obj.sha256||'').slice(0,8)} truth=${res.stages?.truth?.consensus_score ?? 'n/a'} elapsed=${res.elapsed_ms}ms`);
    }
    bktCRes.note = `Processed ${Math.min(objs.length,50)} of ${objs.length} total objects`;
    summary.buckets.push({ bucket:'C', ...bktCRes });
  } else { console.warn('[BUCKET C] MISSING:', rawC); }

  // ── Summary write ─────────────────────────────────────
  summary.completed_at = new Date().toISOString();
  const sf = CLASS_FILE.replace(/\.jsonl$/, '-run-summary.json');
  fs.appendFileSync(sf, JSON.stringify(summary, null, 2), 'utf8');
  const totalCalls = summary.buckets.reduce((s,b) => s + Object.keys(b.stages||{}).length + (b.runs||[]).reduce((ss,r)=>ss+Object.keys(r.stages||{}).length,0), 0);
  console.log(`
═══════════════════════════════════════════
RUN COMPLETE
═══════════════════════════════════════════
Buckets: ${summary.buckets.length}
Runs: ${totalCalls}
Logs: ${LOG_FILE}`);
})();
