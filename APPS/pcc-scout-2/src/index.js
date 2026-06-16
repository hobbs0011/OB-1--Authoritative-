                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import { ForceAwareness, handleForce } from './forceawareness.js';
// PHOENIX-PCC-1 — OB1: Single unified PCC (Student Fleet + Ops Tasks)
// Student Actualizers: mai-tram, huong, sov100-michael, sov100-test-magic, net-student-next
// Ops Tasks: translate, lostsoul-scan, completeness-audit, pattern-scan, brief-scan, code-queue
// Cron: 0 */6 * * * + * * * * *

const PA_AUTH      = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const PA_BASE      = 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev';
const FLEET_ID     = 'ob1';
const GITHUB_OWNER = 'Phoenix-Rising-Ai-Solutions';
const GITHUB_REPO  = 'OB-1--Authoritative-';
const GITHUB_API   = 'https://api.github.com';

// Decode GitHub's base64 content to UTF-8 string
function b64Decode(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Encode UTF-8 string to base64 for GitHub API
function b64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Extract structured patch JSON from PA response
// Expected format: {"file":"...","find":"...","replace":"...","description":"..."}
function parseStructuredPatch(patchText) {
  const candidates = patchText.match(/\{[\s\S]+?\}/g) || [];
  for (const c of candidates) {
    try {
      const p = JSON.parse(c);
      if (typeof p.file === 'string' && typeof p.find === 'string' && typeof p.replace === 'string' && p.file) return p;
    } catch { /* ok */ }
  }
  return null;
}

// Apply a structured patch to a file via GitHub Contents API, create a commit
async function applyGitHubPatch(env, { file, find, replace, description }) {
  const token = env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'GITHUB_TOKEN not set' };
  if (!find || typeof find !== 'string' || find.length === 0) {
    return { ok: false, reason: 'find must be a non-empty verbatim string' };
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'phoenix-pcc-1/ob1',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const safeFile = encodeGitHubPath(file);
  const fileUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${safeFile}`;

  // Read current file
  const getResp = await fetch(fileUrl, { headers });
  if (!getResp.ok) return { ok: false, reason: `GitHub GET ${getResp.status} for ${file}` };
  const ghData = await getResp.json();
  const b64 = ghData?.content;
  const sha = ghData?.sha;
  if (!b64) return { ok: false, reason: 'GITHUB_MISSING_CONTENT' };

  // Decode → patch → re-encode
  const original = b64Decode(b64);

  // Replace only the first occurrence
  const idx = original.indexOf(find);
  if (idx === -1) {
    if (replace && original.includes(replace)) {
      return { ok: true, file, sha: 'already-applied', already_applied: true };
    }
    return { ok: false, reason: `FIND_NOT_FOUND in ${file} (find="${find.slice(0, 60)}...")` };
  }
  const patched = original.slice(0, idx) + replace + original.slice(idx + find.length);

  const msg = `fix(ob1-auto): ${description || 'OB1 code-queue autonomous patch'}\n\nApplied by phoenix-pcc-1 via PA Qwen Coder — no human in the loop`;
  const putResp = await fetch(fileUrl, {
    method: 'PUT', headers,
    body: JSON.stringify({ message: msg, content: b64Encode(patched), sha }),
  });

  // 409 = SHA race (someone else committed between our GET and PUT) — retry once
  if (putResp.status === 409) {
    const retryGet = await fetch(fileUrl, { headers });
    if (!retryGet.ok) return { ok: false, reason: `409 retry GET failed: ${retryGet.status}` };
    const retryGhData = await retryGet.json();
    const b64r = retryGhData?.content;
    const shar = retryGhData?.sha;
    if (!b64r) return { ok: false, reason: 'GITHUB_MISSING_CONTENT after 409 retry' };
    const originalR = b64Decode(b64r);
    const idxR = originalR.indexOf(find);
    if (idxR === -1) return { ok: false, reason: 'FIND_NOT_FOUND after 409 retry' };
    const patchedR = originalR.slice(0, idxR) + replace + originalR.slice(idxR + find.length);
    const retryPut = await fetch(fileUrl, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: msg, content: b64Encode(patchedR), sha: shar }),
    });
    if (!retryPut.ok) { const e = await retryPut.text(); return { ok: false, reason: `409 retry PUT ${retryPut.status}: ${e.slice(0,200)}` }; }
    const rd = await retryPut.json();
    return { ok: true, file, sha: rd.commit?.sha, retried: true };
  }

  if (!putResp.ok) {
    const err = await putResp.text();
    return { ok: false, reason: `GitHub PUT ${putResp.status}: ${err.slice(0, 200)}` };
  }
  const data = await putResp.json();
  return { ok: true, file, sha: data.commit?.sha, commit_url: data.commit?.html_url };
}

function encodeGitHubPath(path) {
  return String(path).split('/').map(encodeURIComponent).join('/');
}

function normalizeRunNumber(run_number) {
  const raw = String(run_number || '').trim();
  return /^\d{1,8}$/.test(raw) ? raw : null;
}

function truncateText(text, maxChars = 250000) {
  const raw = String(text || '');
  return raw.length > maxChars ? raw.slice(0, maxChars) : raw;
}

function normalizeStringArray(value, limit = 100) {
  if (!Array.isArray(value)) return [];
  return value.map(v => String(v || '').trim()).filter(Boolean).slice(0, limit);
}

function escapeLike(value) {
  return String(value || '').replace(/([%_\\])/g, '\\$1');
}

// Create or overwrite a file on GitHub (for new files like phetrail output)
async function writeGitHubFile(env, { file, content, description }) {
  const token = env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'GITHUB_TOKEN not set' };
  const safeFile = encodeGitHubPath(file);
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'phoenix-pcc-1/ob1',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const fileUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${safeFile}`;
  // Check if exists (need sha to update)
  let sha;
  try {
    const check = await fetch(fileUrl, { headers });
    if (check.ok) { const d = await check.json().catch(() => ({})); sha = d?.sha; }
  } catch { /* new file — sha stays undefined */ }
  const msg = `phetrail: ${description || 'OB1 phetrail commit'}\n\nWritten by phoenix-pcc-1 — no human in the loop`;
  const body = { message: msg, content: b64Encode(content) };
  if (sha) body.sha = sha;
  let putResp = await fetch(fileUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
  // 422 = file exists but sha was missing (GET failed silently) — retry with fresh GET
  if (putResp.status === 422) {
    let retrySha;
    try {
      const retry = await fetch(fileUrl, { headers });
      if (retry.ok) { const d = await retry.json().catch(() => ({})); retrySha = d?.sha; }
    } catch { /* still no sha */ }
    if (retrySha) {
      const retryBody = { message: msg, content: b64Encode(content), sha: retrySha };
      putResp = await fetch(fileUrl, { method: 'PUT', headers, body: JSON.stringify(retryBody) });
    }
  }
  if (!putResp.ok) { const e = await putResp.text(); return { ok: false, reason: `PUT ${putResp.status}: ${e.slice(0,200)}` }; }
  const data = await putResp.json().catch(() => ({}));
  return { ok: true, file, sha: data.commit?.sha };
}

const STUDENT_FLEET = [
  'mai-tram-bluetech',
  'huong-bluetech',
  'sov100-michael',
  'sov100-test-magic',
  'net-student-next',
];

const BRIEF_PROMPT = `You generate dense session preparation briefs for an AI agent about to work with a student.
Analyze the provided session data and return a brief covering:
1. LEVEL: Current proficiency snapshot (vocabulary range, grammar gaps, pronunciation patterns)
2. MOMENTUM: What they were working on — where they left off
3. STYLE: How they learn best — correction tolerance, pace, humor level
4. THREADS: Unresolved topics or promised follow-ups
5. WATCH: Emotional state patterns, what encourages vs discourages them

Be dense. Under 300 words. This is read at boot — make every word count.`;

function checkAuth(request) {
  const key = request.headers.get('x-pa-auth') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return key === PA_AUTH;
}

async function writeMajorDirectiveMarker(env, source, message) {
  const kv = env.PHETRAIL;
  if (!kv || !message) return;
  const ts = new Date().toISOString();
  const marker = {
    ts, source,
    message: String(message).slice(0, 2000),
    keywords: ['Agent99', 'FORCEAWARENESS', 'OB1', 'PCC1', 'PhoenixCoder', 'role', 'Agent99 OS'].filter(k => String(message).toLowerCase().includes(k.toLowerCase())),
  };
  await kv.put(`phetrail:major-directive:${Date.now()}`, JSON.stringify(marker));
  const trail = JSON.parse(await kv.get('phetrail:latest') || '{}');
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.major_directives) trail.state_markers.major_directives = [];
  trail.state_markers.major_directives.unshift(marker);
  trail.state_markers.major_directives = trail.state_markers.major_directives.slice(0, 50);
  trail.state_markers.last_updated = ts;
  await kv.put('phetrail:latest', JSON.stringify(trail));
}

async function fetchSoulContext(env, userId) {
  if (!env.SOUL_LOGGER_SVC) return null;
  try {
    const res = await env.SOUL_LOGGER_SVC.fetch(
      new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      })
    );
    return res.ok ? res.json() : null;
  } catch { return null; }
}

// ── Student Actualizer ────────────────────────────────────────────────────────
async function runStudentActualizer(env, userId) {
  const ctx = await fetchSoulContext(env, userId).catch(() => null);
  if (!ctx || !ctx.sessions?.length) return { userId, ok: false, reason: 'no soul data' };

  const sessionSummaries = ctx.sessions.map((s, i) => {
    const prompts = s.last_prompts?.map(p => p.text).join(' | ') || '';
    return `Session ${i + 1} (${s.ingested_at?.slice(0, 10)}): ${prompts.slice(0, 300)}`;
  }).join('\n');

  const keywords = (ctx.top_keywords || []).slice(0, 10).map(k => `${k.keyword}(${k.weight})`).join(', ');

  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: BRIEF_PROMPT },
      { role: 'user', content: `STUDENT: ${userId}\nLAST ACTIVE: ${ctx.last_active || 'unknown'}\nSESSIONS: ${ctx.sessions.length}\nKEYWORDS: ${keywords || 'none'}\n\nRECENT SESSIONS:\n${sessionSummaries || 'none'}` },
    ],
    max_tokens: 400,
  });

  const brief = (aiResult?.response || '').trim();
  if (!brief) return { userId, ok: false, reason: 'AI returned empty' };

  const now = new Date().toISOString();
  await env.PHETRAIL.put(`pcc1:${userId}:brief`, brief, { expirationTtl: 86400 }).catch(() => {});
  await env.PHETRAIL.put(`pcc1:${userId}:meta`, JSON.stringify({ generated_at: now, fleet: FLEET_ID }), { expirationTtl: 86400 }).catch(() => {});

  // Log THREADS to BB (informational — orchestrator auto-closes these)
  const threadsMatch = brief.match(/THREADS[:\s]+(.+?)(?=\n\n|\n\*\*|$)/is);
  if (threadsMatch && threadsMatch[1].trim().length > 20 && env.DB) {
    const bb_id = `BB-${Date.now()}`;
    const threadText = threadsMatch[1].trim().slice(0, 500);
    const now2 = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(bb_id, `OB1 thread — ${userId}: ${threadText.slice(0, 60)}`, threadText, 'pcc1-actualizer', '~', now2, now2).run().catch(() => {});
  }

  return { userId, ok: true, brief_length: brief.length };
}

// ── pcc_metrics helper ────────────────────────────────────────────────────────
async function logPccMetric(env, { task_preview, task_length, model, duration_ms, output_length, passed, fail_reason }) {
  if (!env.DB) return;
  await env.DB.prepare(
    'INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    FLEET_ID,
    String(task_preview).slice(0, 100),
    task_length || 0,
    model || 'unknown',
    duration_ms || 0,
    output_length || 0,
    passed ? 1 : 0,
    fail_reason || null
  ).run().catch(() => {});
}

// ── Ops Task 1: Translate ─────────────────────────────────────────────────────
async function taskTranslate(env) {
  if (!env.AI || !env.DB) return { task: 'translate', processed: 0 };
  const rows = await env.DB.prepare("SELECT * FROM backburner WHERE status='OPEN' AND source='translate-queue' LIMIT 5").all();
  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const res = await env.AI.run('@cf/meta/m2m100-1.2b', { text: row.description || row.title, source_lang: 'en', target_lang: 'vi' });
      const translated = res?.translated_text || '';
      if (translated) {
        await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', description=?, updated_at=? WHERE bb_id=?")
          .bind(`[VI] ${translated}\n[EN] ${row.description}`, new Date().toISOString(), row.bb_id).run();
        processed++;
      }
    } catch { /* continue */ }
  }
  return { task: 'translate', processed };
}

// ── Ops Task 2: LostSoul scan ─────────────────────────────────────────────────
async function taskLostSoulScan(env) {
  if (!env.AI || !env.DB) return { task: 'lostsoul-scan', processed: 0 };
  const rows = await env.DB.prepare('SELECT id, run_number, rrl_raw FROM rrl_archive WHERE lostsoul_scan_done=0 LIMIT 2').all();
  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const lines = (row.rrl_raw || '').split('\n').filter(l => l.trim());
      const userLines = lines.filter(l => /^(Human:|SOV100:|Michael:)/i.test(l)).map(l => l.replace(/^(Human:|SOV100:|Michael:)/i, '').trim()).join('\n');
      if (!userLines) continue;

      const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'user', content: `Extract every directive/demand from SOV100 verbatim. Return JSON array of strings only.\n\n${userLines.slice(0, 5000)}` }],
        max_tokens: 600,
      });
      let directives = [];
      try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) directives = JSON.parse(m[0]); } catch { /* ok */ }
      directives = normalizeStringArray(directives, 10);

      const now = new Date().toISOString();
      await env.DB.prepare('UPDATE rrl_archive SET lostsoul_scan_done=1, lostsoul_count=?, scanned_at=? WHERE id=?')
        .bind(directives.length, now, row.id).run();

      for (const d of directives.slice(0, 10)) {
        if (typeof d === 'string' && d.length > 10) {
          const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(bb_id, `OB1 LostSoul R${row.run_number}: ${d.slice(0, 80)}`, d, 'ob1-lostsoul', '~', now, now).run().catch(() => {});
        }
      }
      processed++;
    } catch { /* continue */ }
  }
  return { task: 'lostsoul-scan', processed };
}

// ── Ops Task 3: Completeness audit ───────────────────────────────────────────
async function taskCompletenessAudit(env) {
  if (!env.AI || !env.DB) return { task: 'completeness-audit', processed: 0 };
  const row = await env.DB.prepare('SELECT id, run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 1').first();
  if (!row) return { task: 'completeness-audit', processed: 0 };

  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: `Find requests from the user (Human/SOV100) that the assistant did NOT execute. Return verbatim JSON array only. Return [] if all executed.\n\n${(row.rrl_raw || '').slice(0, 6000)}` }],
    max_tokens: 500,
  });
  let gaps = [];
  try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) gaps = JSON.parse(m[0]); } catch { /* ok */ }
  gaps = normalizeStringArray(gaps, 8);

  const now = new Date().toISOString();
  for (const g of gaps.slice(0, 8)) {
    if (typeof g === 'string' && g.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(bb_id, `OB1 Audit R${row.run_number}: ${g.slice(0, 80)}`, g, 'ob1-audit', '!', now, now).run().catch(() => {});
    }
  }
  return { task: 'completeness-audit', processed: gaps.length };
}

// ── Ops Task 4: Pattern scan ──────────────────────────────────────────────────
async function taskPatternScan(env) {
  if (!env.AI || !env.DB) return { task: 'pattern-scan', processed: 0 };
  const recent = await env.DB.prepare('SELECT run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 5').all();
  if (!recent.results?.length) return { task: 'pattern-scan', processed: 0 };

  const combined = recent.results.map(r => `=== RUN ${r.run_number} ===\n${(r.rrl_raw || '').slice(0, 1200)}`).join('\n\n');
  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: `Find recurring unresolved topics across these sessions. Return JSON array of strings only.\n\n${combined.slice(0, 7000)}` }],
    max_tokens: 400,
  });
  let patterns = [];
  try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) patterns = JSON.parse(m[0]); } catch { /* ok */ }
  patterns = normalizeStringArray(patterns, 6);

  const now = new Date().toISOString();
  for (const p of patterns.slice(0, 6)) {
    if (typeof p === 'string' && p.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(bb_id, `OB1 Pattern: ${p.slice(0, 80)}`, p, 'ob1-pattern', '!', now, now).run().catch(() => {});
    }
  }
  return { task: 'pattern-scan', processed: patterns.length };
}

// ── Ops Task 5: Brief scan ────────────────────────────────────────────────────
async function taskBriefScan(env) {
  if (!env.DB || !env.PHETRAIL) return { task: 'brief-scan', stale: 0 };
  const students = ['mai-tram-bluetech', 'huong-bluetech', 'sov100-michael'];
  const stale = [];
  for (const userId of students) {
    const meta = await env.PHETRAIL.get(`pcc1:${userId}:meta`).catch(() => null);
    if (!meta) { stale.push(userId); continue; }
    let generated_at;
    try { ({ generated_at } = JSON.parse(meta)); } catch { stale.push(userId); continue; }
    if (Date.now() - new Date(generated_at).getTime() > 43200000) stale.push(userId);
  }
  if (stale.length) {
    const now = new Date().toISOString();
    const bb_id = `BB-${Date.now()}`;
    await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(bb_id, `OB1 Stale briefs: ${stale.join(', ')}`, `Users with no brief or brief >12h: ${stale.join(', ')}`, 'ob1-brief-scan', '~', now, now).run().catch(() => {});
    // Auto-close: informational notification, not an executable task
    await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='brief-scan-logged', updated_at=? WHERE bb_id=?")
      .bind(now, bb_id).run().catch(() => {});
  }
  return { task: 'brief-scan', stale: stale.length };
}

// Fetch file content from GitHub for pre-read context injection
async function fetchGitHubFile(env, filePath) {
  const token = env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const resp = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGitHubPath(filePath)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'phoenix-pcc-1/ob1',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!resp.ok) return null;
    const { content } = await resp.json();
    return b64Decode(content);
  } catch { return null; }
}

// Extract file path hint from BB description
function extractFilePath(text) {
  const patterns = [
    /"file"\s*:\s*"([^"]+)"/,                   // {"file":"APPS/..."}
    /[Ff]ile:\s*([^\s,\n"]+\.[a-zA-Z]{2,5})/,    // File: src/foo.js
    /(APPS\/[^\s\n,'"]+\.[a-zA-Z]{2,5})/,       // bare APPS/ path
    /(CANON\/[^\s\n,'"]+\.[a-zA-Z]{2,5})/,      // bare CANON/ path
    /(OPERATIONS\/[^\s\n,'"]+\.[a-zA-Z]{2,5})/, // bare OPERATIONS/ path
    /(src\/[^\s\n,'"]+\.[a-zA-Z]{2,5})/,        // bare src/ path
    /(SCRIPTS\/[^\s\n,'"]+\.[a-zA-Z]{2,5})/,    // bare SCRIPTS/ path
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return (m[1] || m[0]).trim();
  }
  return null;
}

// ── Ops Task 6: Code queue ────────────────────────────────────────────────────
async function taskCodeQueue(env) {
  if (!env.DB) return { task: 'code-queue', processed: 0 };
  const rows = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status IN ('OPEN','IN_PROGRESS') AND (source LIKE 'obi-%' OR source='code-queue' OR source='lostsoul' OR source='ob1-lostsoul' OR source='velocity-monitor' OR source='completeness-audit') ORDER BY priority ASC, created_at ASC LIMIT 5"
  ).all().catch(() => ({ results: [] }));

  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const t0 = Date.now();

      // Pre-read the target file from GitHub so PA sees the actual content
      // This eliminates find-string mismatches (em-dashes, whitespace, etc.)
      const bbText = `${row.title}\n${row.description || ''}`;
      const filePath = extractFilePath(bbText);
      let fileContext = '';
      if (filePath && env.GITHUB_TOKEN) {
        const fileContent = await fetchGitHubFile(env, filePath);
        if (fileContent) {
          fileContext = `\n\nACTUAL FILE CONTENT (${filePath}) — use verbatim strings from this:\n${fileContent.slice(0, 6000)}`;
        }
      }

      const taskWithInstruction = `${row.title}

RUNTIME: Cloudflare Workers. Use env.DB.prepare() for D1 SQLite. No require(), no Node.js, no Express, no PostgreSQL.

Return ONLY valid JSON, no other text. The "find" value MUST be copied verbatim from the actual file content provided below:
{"file":"<relative path>","find":"<exact verbatim string from the file>","replace":"<replacement>","description":"<one line>"}`;

      const resp = await fetch(`${PA_BASE}/api/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-pa-auth': PA_AUTH },
        body: JSON.stringify({ task: taskWithInstruction, context: (row.description || '') + fileContext, tier: 1 }),
      });
      if (!resp.ok) {
        await logPccMetric(env, { task_preview: row.title, task_length: (row.description || '').length, model: 'pa-error', duration_ms: Date.now() - t0, output_length: 0, passed: false, fail_reason: `PA_HTTP_${resp.status}` });
        continue;
      }
      const { patch, model } = await resp.json();
      if (!patch || patch.length < 5) {
        await logPccMetric(env, { task_preview: row.title, task_length: (row.description || '').length, model: model || 'pa-t1', duration_ms: Date.now() - t0, output_length: 0, passed: false, fail_reason: 'EMPTY_PATCH' });
        continue;
      }

      // Parse structured patch and apply to GitHub repo
      let applyResult = { ok: false, reason: 'no structured patch in PA response' };
      const structured = parseStructuredPatch(patch);
      if (structured) {
        applyResult = await applyGitHubPatch(env, structured).catch(e => ({ ok: false, reason: e.message }));
      }

      const applyNote = applyResult.ok
        ? `APPLIED: ${applyResult.file} commit=${applyResult.sha?.slice(0, 8)}`
        : `APPLY_FAILED: ${applyResult.reason}`;

      const result = `[OB1-executed | model=${model} | ${applyNote}]\n${patch}`;
      const now = new Date().toISOString();
      await env.DB.prepare(
        "UPDATE backburner SET status='PENDING_CLOSE', description=?, close_reason=?, updated_at=? WHERE bb_id=?"
      ).bind(`${row.description || ''}\n\nRESULT:\n${result}`.slice(0, 4000), `OB1 code-queue: ${applyNote}`, now, row.bb_id).run();

      if (env.PHETRAIL) {
        await env.PHETRAIL.put(`bb-result:${row.bb_id}`, result, { expirationTtl: 604800 }).catch(() => {});
      }

      await logPccMetric(env, {
        task_preview: row.title,
        task_length: (row.description || '').length,
        model: model || 'pa-t1',
        duration_ms: Date.now() - t0,
        output_length: patch.length,
        passed: applyResult.ok,
        fail_reason: applyResult.ok ? null : applyResult.reason,
      });

      processed++;
    } catch (e) {
      await logPccMetric(env, {
        task_preview: row?.title || 'unknown',
        task_length: 0,
        model: 'error',
        duration_ms: 0,
        output_length: 0,
        passed: false,
        fail_reason: `EXCEPTION: ${e.message}`,
      });
    }
  }
  return { task: 'code-queue', processed };
}

// ── Fleet runner ──────────────────────────────────────────────────────────────
async function runFleet(env) {
  // Student actualizers
  const studentResults = [];
  for (const userId of STUDENT_FLEET) {
    const r = await runStudentActualizer(env, userId).catch(e => ({ userId, ok: false, reason: e.message }));
    studentResults.push(r);
  }

  // Ops tasks in parallel
  const [t1, t2, t3, t4, t5, t6] = await Promise.allSettled([
    taskTranslate(env),
    taskLostSoulScan(env),
    taskCompletenessAudit(env),
    taskPatternScan(env),
    taskBriefScan(env),
    taskCodeQueue(env),
  ]);

  return {
    students: studentResults,
    ops: [t1, t2, t3, t4, t5, t6].map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }),
  };
}

// ── LegionRunner DO — 1-hour race via chained alarms ─────────────────────────
class RaceRunner {
  constructor(state, env) { this.state = state; this.env = env; }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start' && request.method === 'POST') return this.handleStart(request);
    if (url.pathname === '/status') return this.handleStatus();
    if (url.pathname === '/stop') return this.handleStop();
    return new Response('not found', { status: 404 });
  }

  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = body.budget_ms || 3600000;
    const now = Date.now();
    await this.state.storage.put('run_state', {
      start_time: now, budget_ms,
      batches_run: 0, actualizers_run: 0, discoveries_count: 0, errors_count: 0, death_runs: 0,
    });
    await this.state.storage.setAlarm(now + 1000);
    return Response.json({ ok: true, started_at: now, budget_ms });
  }

  async alarm() {
    const state = await this.state.storage.get('run_state');
    if (!state) return;
    if (Date.now() - state.start_time >= state.budget_ms) { await this.writeMetrics(state, true); return; }
    const batch = await this.runBatch(state);
    const updated = {
      ...state,
      batches_run: state.batches_run + 1,
      actualizers_run: state.actualizers_run + (batch.actualizers || 0),
      discoveries_count: state.discoveries_count + (batch.discoveries || 0),
      errors_count: state.errors_count + (batch.errors || 0),
      death_runs: state.death_runs + (batch.death_runs || 0),
    };
    await this.state.storage.put('run_state', updated);
    await this.writeMetrics(updated, false);
    await this.state.storage.setAlarm(Date.now() + 30000);
  }

  async runBatch(state) {
    let actualizers = 0, discoveries = 0, errors = 0, death_runs = 0;
    const kv = this.env.PHETRAIL;

    // Check student briefs
    for (const userId of ['mai-tram-bluetech', 'huong-bluetech', 'sov100-test-magic']) {
      try {
        const existing = kv ? await kv.get(`pcc1:${userId}:meta`) : null;
        if (!existing) discoveries++;
        actualizers++;
      } catch(e) { errors++; }
    }

    // Soul keyword scan
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    if (kv) {
      for (const prefix of ['pending:rrl:', 'registry:run:', 'death:']) {
        try {
          const listed = await kv.list({ prefix }).catch(() => ({ keys: [] }));
          for (const key of listed.keys.slice(0, 5)) {
            const val = await kv.get(key.name).catch(() => '');
            if (val) {
              const hits = soulSeeds.filter(s => val.includes(s)).length;
              if (hits > 0) { discoveries += hits; actualizers++; }
            }
          }
        } catch(e) { errors++; }
      }
    }

    // Check for pending RRL
    if (kv) {
      const keys = await kv.list({ prefix: 'pending:rrl:' }).catch(() => ({ keys: [] }));
      for (const key of keys.keys.slice(0, 2)) {
        const run_number = key.name.split(':')[2];
        const rrl_text = await kv.get(key.name);
        if (rrl_text) {
          const result = await this.runDeathPipeline(run_number, rrl_text);
          if (result.ok) { death_runs++; discoveries += result.discoveries || 0; await kv.delete(key.name); }
        }
      }
    }

    return { actualizers, discoveries, errors, death_runs };
  }

  async runDeathPipeline(run_number, rrl_text) {
    const normalizedRun = normalizeRunNumber(run_number);
    if (!normalizedRun) return { ok: false, reason: 'invalid run_number' };
    const normalizedText = truncateText(rrl_text);
    const lines = normalizedText.split('\n');
    const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedText));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
    const ledger_id = `HL-${normalizedRun}`;
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
    const kv = this.env.PHETRAIL;
    if (kv) {
      await Promise.all([
        kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
        kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
        kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
        kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0, 200) })),
        kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
      ]);
    }
    return { ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length };
  }

  async writeMetrics(state, final) {
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    const metrics = { agent_id: 'ob1', ...state, elapsed_ms: Date.now() - state.start_time, score, final };
    if (this.env.PHETRAIL) await this.env.PHETRAIL.put('race:ob1:metrics', JSON.stringify(metrics));
  }

  async handleStatus() {
    const state = await this.state.storage.get('run_state');
    if (!state) return Response.json({ ok: false, error: 'not started' });
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    return Response.json({ ...state, elapsed_ms: Date.now() - state.start_time, score });
  }

  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get('run_state');
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true });
  }
}

// ── Standalone death pipeline ─────────────────────────────────────────────────
async function runDeathPipelineStandalone(env, run_number, rrl_text) {
  const normalizedRun = normalizeRunNumber(run_number);
  if (!normalizedRun) return { ok: false, error: 'run_number must be numeric' };
  const normalizedText = truncateText(rrl_text);
  const lines = normalizedText.split('\n');
  const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
  const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedText));
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  const ledger_id = `HL-${normalizedRun}`;
  const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
  const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
  const kv = env.PHETRAIL;
  if (kv) {
    await Promise.all([
      kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
      kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
      kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
      kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0, 200) })),
      kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
      kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
    ]);
  }
  return { ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length };
}

// ── ScoutRunner DO ────────────────────────────────────────────────────────────
// 1-hour recon mission: walk pheromone chains via real D1 search, commit phetrail to GitHub
class ScoutRunner {
  constructor(state, env) { this.state = state; this.env = env; }

  normalizeScoutState(state = {}) {
    const now = Date.now();
    return {
      ...state,
      start_time: Number(state.start_time) || now,
      budget_ms: Number(state.budget_ms) || 600000,
      current_keyword: String(state.current_keyword || state.seed_keyword || 'SOUL'),
      seed_keyword: String(state.seed_keyword || state.current_keyword || 'SOUL'),
      chains_walked: Number(state.chains_walked) || 0,
      pos_territories: Array.isArray(state.pos_territories) ? state.pos_territories : [],
      neg_trails: Array.isArray(state.neg_trails) ? state.neg_trails : [],
      iterations: Number(state.iterations) || 0,
      pheromone_count: Number(state.pheromone_count) || 0,
      unmapped_found: Number(state.unmapped_found) || 0,
      visited_keywords: Array.isArray(state.visited_keywords) ? state.visited_keywords : [],
      entries: Array.isArray(state.entries) ? state.entries : [`# OB1 Scout Mission — ${new Date(now).toISOString()}\n`],
    };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/scout/, '') || url.pathname;

    if (path === '/start' || url.pathname === '/start') {
      // Guard: don't overwrite a running mission
      const existing = await this.state.storage.get('scout_state');
      if (existing && (Date.now() - existing.start_time) <= existing.budget_ms) {
        return Response.json({ ok: false, error: 'already_running', started_at: existing.start_time, chains_walked: existing.chains_walked });
      }
      if (existing) {
        await this.finalize(this.normalizeScoutState(existing), (existing.pheromone_count || 0) >= 100);
      }

      const body = await request.json().catch(() => ({}));
      // Upgrades: random seed, 10s iteration, 100 pheromone goal, unmapped priority
      // Accept seed or seed_keyword; accept budget_ms or time_limit_seconds
      const seed_keyword = body.seed_keyword || body.seed || ['FORCEAWARENESS', 'SOUL', 'DNA', 'PHOENIX', 'SYSTEM', 'OB1'][Math.floor(Math.random() * 6)];
      const budget_ms = body.budget_ms || (body.time_limit_seconds ? body.time_limit_seconds * 1000 : 600000); // 10 min default
      const now = Date.now();

      // Clear all mapped state so every new mission starts with fresh territory
      if (this.env.PHETRAIL) {
        const mappedKeys = await this.env.PHETRAIL.list({ prefix: 'scout:mapped:' }).catch(() => ({ keys: [] }));
        await Promise.all(mappedKeys.keys.map(k => this.env.PHETRAIL.delete(k.name).catch(() => {})));
      }

      await this.state.storage.put('scout_state', {
        start_time: now, budget_ms, seed_keyword,
        current_keyword: seed_keyword,
        chains_walked: 0, pos_territories: [], neg_trails: [], iterations: 0,
        pheromone_count: 0, unmapped_found: 0, visited_keywords: [],
        entries: [`# OB1 Scout Mission — ${new Date(now).toISOString()}\n## Seed: ${seed_keyword}\n`, `# Mission: Scout 1 unmapped territory, drop 100 pheromones\n`],
      });

      await this.state.storage.setAlarm(now + 10000); // 10s iterations
      return Response.json({ ok: true, status: 'scout_started', seed_keyword, budget_ms, upgrades: ['fast-iteration', 'unmapped-priority', 'pheromone-goal', 'mapped-reset'] });
    }

    if (url.pathname === '/status') {
      const rawState = await this.state.storage.get('scout_state');
      if (!rawState) return Response.json({ ok: false, error: 'not started' }, { status: 404 });
      const state = this.normalizeScoutState(rawState);
      const elapsed = Date.now() - state.start_time;
      if (elapsed >= state.budget_ms || state.pheromone_count >= 100) {
        const result = await this.finalize(state, state.pheromone_count >= 100);
        return Response.json({ ok: true, status: 'scout_finalized', elapsed_ms: elapsed, budget_ms: state.budget_ms, commit: result });
      }
      return Response.json({
        ok: true,
        elapsed_ms: elapsed,
        budget_ms: state.budget_ms,
        percent_complete: Math.min(100, Math.round((elapsed / state.budget_ms) * 100)),
        chains_walked: state.chains_walked,
        iterations: state.iterations,
        pos_count: state.pos_territories.length,
        neg_count: state.neg_trails.length,
        current_keyword: state.current_keyword,
        pheromone_count: state.pheromone_count,
        unmapped_found: state.unmapped_found,
        visited_count: state.visited_keywords.length,
      });
    }

    if (url.pathname === '/stop') {
      await this.state.storage.deleteAlarm();
      const rawState = await this.state.storage.get('scout_state');
      if (rawState) {
        const state = this.normalizeScoutState(rawState);
        const result = await this.finalize(state, true);
        return Response.json({ ok: true, status: 'scout_stopped', entries_count: state.entries.length, commit: result });
      }
      return Response.json({ ok: true, status: 'scout_not_running' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // D1 + KV keyword density search: returns { next_kw, is_pos, area, hit_count, novelty }
  async walkChain(kw, visitedKeywords = []) {
    if (!this.env.DB && !this.env.PHETRAIL) return { next_kw: 'SOUL', is_pos: false, area: 'no-db', hit_count: 0, novelty: false };
    if (!kw || typeof kw !== 'string') kw = 'SOUL';

    const likeKeyword = escapeLike(kw);
    const kwLower = kw.toLowerCase();

    // D1 search
    const queries = this.env.DB ? [
      this.env.DB.prepare("SELECT title, description FROM backburner WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' LIMIT 15").bind(`%${likeKeyword}%`, `%${likeKeyword}%`).all().catch(() => ({ results: [] })),
      this.env.DB.prepare("SELECT run_number, ledger_id FROM rrl_archive WHERE rrl_raw LIKE ? ESCAPE '\\' LIMIT 10").bind(`%${likeKeyword}%`).all().catch(() => ({ results: [] })),
    ] : [Promise.resolve({ results: [] }), Promise.resolve({ results: [] })];
    const [bbRows, archiveRows] = await Promise.all(queries);

    const allHits = [...(bbRows.results || []), ...(archiveRows.results || [])].map(r => ({
      title: r.title || `run#${r.run_number || 'unknown'}`,
      description: r.description || r.ledger_id || r.rrl_raw?.slice(0, 100) || '',
    }));

    // KV phetrail search — catches system keywords not in D1 (FORCEAWARENESS, PHOENIXCODER, etc.)
    // IMPORTANT: use marker.keywords array (not raw message) to avoid extracting garbage code words
    if (this.env.PHETRAIL) {
      const kvKeys = await this.env.PHETRAIL.list({ prefix: 'phetrail:major-directive:', limit: 20 }).catch(() => ({ keys: [] }));
      for (const key of kvKeys.keys.slice(0, 20)) {
        const val = await this.env.PHETRAIL.get(key.name).catch(() => null);
        if (!val) continue;
        try {
          const marker = JSON.parse(val);
          const searchText = `${marker.message || ''} ${(marker.keywords || []).join(' ')} ${marker.source || ''}`;
          if (searchText.toLowerCase().includes(kwLower)) {
            // Use only the keywords array as description — prevents frequency analysis from picking up code words
            const canonicalKws = (marker.keywords || []).filter(k => k && k.length > 2).join(' ');
            // Never use marker.source as description — slugs like "pheromone-memory" strip to garbage tokens
            allHits.push({ title: `kv:directive:${marker.source || 'unknown'}`, description: canonicalKws || 'directive' });
          }
        } catch { /* ok */ }
      }
      // Scout pheromone cross-links
      const phKeys = await this.env.PHETRAIL.list({ prefix: 'scout:pheromone:', limit: 10 }).catch(() => ({ keys: [] }));
      for (const key of phKeys.keys.slice(0, 10)) {
        const val = await this.env.PHETRAIL.get(key.name).catch(() => null);
        if (!val) continue;
        try {
          const ph = JSON.parse(val);
          // Only include clean alphabetic keywords (no concatenated code identifiers like "writeread")
          if (ph.keyword && /^[a-zA-Z#]{3,20}$/.test(ph.keyword) && ph.keyword.toLowerCase().includes(kwLower)) {
            // Use area only if it contains spaces (human-readable) — slugs become garbage tokens
            const areaDesc = ph.area && ph.area.includes(' ') ? ph.area : 'pheromone-link';
            allHits.push({ title: `kv:pheromone:${ph.keyword}`, description: areaDesc });
          }
        } catch { /* ok */ }
      }
    }

    if (allHits.length === 0) {
      // True dead end — pivot to a seed that actually has backburner hits (no dead-end seeds)
      const seeds = ['SOULCOUNT', 'SOUL', 'DNA', 'OB1', 'SCOUT', 'PHETRAIL', 'DISPATCH', 'REINCARNATION', 'TITANIUM', 'PHEROMONE', 'INCARNATE', 'STUDENT', 'VOICE', 'MISSION', 'BLUEPRINT'];
      const visited = new Set((visitedKeywords || []).map(v => String(v).toUpperCase()));
      const unvisited = seeds.filter(s => !visited.has(s));
      const next_kw = unvisited.length ? unvisited[Math.floor(Math.random() * unvisited.length)] : seeds[Math.floor(Math.random() * seeds.length)];
      return { next_kw, is_pos: false, area: `dead-end:0-hits`, hit_count: 0, novelty: false };
    }

    // Check if this keyword/area is already mapped (upgrade: uniqueness tracking)
    const alreadyMapped = this.env.PHETRAIL ? await this.isMapped(kw, allHits.length) : false;

    // Extract next keyword — split camelCase first to prevent compound words leaking through
    // KV titles are lookup metadata (kv:directive:..., kv:pheromone:...) — exclude from frequency analysis
    const allText = allHits.map(h => {
      const desc = h.description || '';
      const title = h.title && h.title.startsWith('kv:') ? '' : (h.title || '');
      return `${title} ${desc}`.trim();
    }).join(' ');
    const freq = {};
    const stopWords = new Set(['with', 'from', 'have', 'that', 'this', 'will', 'they', 'were', 'been', 'also', 'more', 'into', 'over', 'some', 'just', 'than', 'very', 'when', 'what', 'which', 'where', 'then', 'here', 'only', 'like', 'make', 'take', 'would', 'could', 'should', 'then', 'each', 'such', 'these', 'those', 'them', 'from', 'into', 'onto', 'upon', 'not', 'but', 'all', 'are', 'was', 'has', 'had', 'its', 'for', 'the', 'and', 'can', 'may', 'use', 'via', 'new', 'set', 'get', 'run', 'add', 'our', 'any', 'per', 'log', 'now', 'done', 'null', 'true', 'false', 'none', 'data', 'time', 'type', 'name', 'next', 'last', 'list', 'item', 'line', 'write', 'read', 'file', 'code', 'func', 'call', 'path', 'test', 'open', 'load', 'save', 'send', 'recv', 'init', 'util', 'base', 'core', 'main', 'back', 'put', 'ret', 'err', 'obj', 'arr', 'str', 'num', 'val', 'key', 'env', 'res', 'req', 'ctx', 'api', 'url', 'src', 'dst', 'tmp', 'tag', 'row', 'col', 'idx', 'len', 'buf', 'raw', 'out', 'msg', 'job', 'task', 'step', 'note', 'info', 'warn', 'fail', 'pass', 'skip', 'stop', 'start', 'end', 'begin', 'close', 'found', 'missing', 'ok',
      // compound code identifiers
      'writeread', 'readfile', 'writefile', 'filepath', 'filename', 'pathname', 'dirname', 'readdir', 'writedir', 'loadfile', 'savefile', 'openfile', 'closefile', 'readline', 'writeline', 'codepath', 'callback', 'handler', 'listener', 'emitter', 'provider', 'resolver', 'iterator', 'renderer', 'selector', 'payload', 'response', 'request', 'headers', 'params', 'config', 'context', 'schema', 'result', 'output', 'input', 'return', 'export', 'import', 'async', 'await', 'const', 'class', 'throw', 'catch', 'fetch', 'apply', 'proto', 'super', 'yield', 'break', 'continue', 'switch', 'while', 'match',
      // SQL keywords
      'alter', 'column', 'table', 'select', 'insert', 'update', 'delete', 'where', 'join', 'index', 'grant', 'limit', 'order', 'group', 'having', 'create', 'drop', 'integer', 'varchar', 'text', 'blob', 'pragma', 'values',
      // common English noise in BB descriptions
      'final', 'memory', 'count', 'error', 'value', 'place', 'point', 'level', 'state', 'track', 'check', 'build', 'issue', 'thing', 'part', 'form', 'plan', 'mark', 'look', 'show', 'know', 'move', 'push', 'pull', 'keep', 'need', 'help', 'good', 'best', 'first', 'high', 'many', 'much', 'long', 'short', 'case', 'kind', 'same', 'real', 'full', 'even', 'most', 'both', 'function', 'method', 'object', 'number', 'boolean', 'execute', 'process', 'system', 'current', 'target', 'version', 'option', 'section', 'field', 'block', 'stack', 'queue', 'cache', 'store', 'token', 'scope', 'event', 'model', 'route', 'query', 'param', 'class', 'error', 'limit', 'offset', 'total', 'count', 'index', 'entry', 'items', 'pages', 'patch', 'diff', 'mode', 'flag', 'hook', 'rule', 'gate', 'port', 'host', 'user', 'role', 'auth', 'hash', 'salt', 'cert', 'proxy', 'stream', 'chunk', 'batch', 'cycle', 'phase', 'stage', 'layer', 'scope', 'trace', 'audit', 'check', 'valid', 'guard', 'lock', 'claim', 'grant', 'token', 'limit', 'retry', 'flush', 'drain', 'reset', 'clear', 'clean', 'purge', 'wipe', 'trim', 'wrap', 'bind', 'link', 'join', 'sync', 'wait', 'poll', 'emit', 'fire', 'drop', 'kill', 'exit', 'quit', 'boot', 'seed', 'init', 'wire', 'pipe', 'fork', 'exec', 'eval', 'pack', 'unpack', 'decode', 'encode', 'parse', 'format', 'print', 'debug', 'trace', 'error', 'known', 'check', 'need', 'show', 'look', 'keep', 'make', 'also', 'when', 'then', 'than', 'with', 'from', 'into', 'over', 'some', 'just', 'very', 'have', 'does', 'been', 'were', 'will', 'would', 'could', 'should', 'their', 'there', 'here', 'that', 'this', 'what', 'which', 'where', 'while', 'about', 'after', 'before', 'because', 'between', 'through', 'without', 'around', 'against', 'during',
      // English modals, auxiliaries, gerunds, discourse words
      'must', 'says', 'said', 'gets', 'puts', 'lets', 'seem', 'give', 'want', 'also', 'ways', 'idea', 'goal', 'work', 'todo', 'impl', 'feat', 'prod', 'discusses', 'working', 'handling', 'getting', 'running', 'testing', 'setting', 'making', 'taking', 'finding', 'trying', 'using', 'having', 'going', 'doing', 'showing', 'calling', 'adding', 'building', 'creating', 'updating', 'fixing', 'loading', 'saving', 'sending', 'checking', 'logging', 'mapping', 'tracking', 'needs', 'makes', 'takes', 'gives', 'shows', 'calls', 'adds', 'builds', 'creates', 'updates', 'fixes', 'loads', 'sends', 'checks', 'based', 'used', 'called', 'added', 'built', 'fixed', 'sent', 'made', 'taken', 'given', 'shown', 'known', 'should', 'could', 'would', 'might', 'shall', 'them', 'they', 'then', 'that', 'this', 'with', 'from', 'into', 'onto', 'upon', 'when', 'where', 'what', 'which', 'while', 'about', 'after', 'before', 'because', 'between', 'through', 'without', 'around', 'against', 'during', 'within', 'across', 'beyond', 'below', 'above', 'under', 'over', 'behind', 'beside', 'inside', 'outside', 'along', 'among', 'since', 'until', 'unless', 'whether', 'although', 'however', 'therefore', 'otherwise', 'instead', 'except', 'including', 'according']);
    // Tokenize: split on delimiters FIRST (hyphens, underscores, colons, slashes) so "soul-dna-bible"
    // becomes ["soul","dna","bible"] instead of "souldnabible". Then split PascalCase/camelCase.
    // ALL_CAPS words (LEDGER, SOUL) kept intact — second regex mangles them (RESULT→RESUL+T).
    const tokens = [];
    for (const raw of allText.split(/\s+/)) {
      const segments = raw.split(/[-_:\/\.]+/);
      for (const seg of segments) {
        const clean = seg.replace(/[^a-zA-Z0-9#]/g, '');
        if (!clean) continue;
        let parts;
        if (/^[A-Z#]+$/.test(clean)) {
          // ALL_CAPS or #HASHTAG: keep as-is
          parts = [clean];
        } else {
          // Mixed/lower case: split PascalCase only
          parts = clean.replace(/([A-Z][a-z]+)/g, ' $1').trim().split(/\s+/);
        }
        tokens.push(...parts.map(p => p.replace(/[^a-zA-Z#]/g, '')));
      }
    }
    const stopWordArr = Array.from(stopWords);
    for (const w of tokens) {
      // alphabetic only, 4-20 chars — filters run refs, hex IDs, version strings, digits
      if (!/^[a-zA-Z#]{4,20}$/.test(w)) continue;
      const wl = w.toLowerCase();
      if (wl === kw.toLowerCase() || stopWords.has(wl)) continue;
      // filter compound tokens that START with a stopword (Errorphetrail, Errordispatch, etc.)
      if (stopWordArr.some(sw => sw.length >= 4 && wl.startsWith(sw))) continue;
      // filter PascalCase compound artifacts: short prefix (1-3 lower chars) followed by upper (Intphetrail, etc.)
      if (/^[A-Z][a-z]{1,3}[A-Z]/.test(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    // Canonical keyword set — words we trust as domain signals
    const CANONICAL = new Set(['SOUL','DNA','LEDGER','DISPATCH','OBI','OB1','PHETRAIL','SCOUT','REINCARNATION',
      'STARMAP','SOULKEYS','PHOENIX','SYSTEM','FORCEAWARENESS','AGENT','DEATH','RISE','KILO','ROMAN',
      'TITANIUM','ANCHOR','ENCRYPT','STUDENT','PORTAL','VOICE','MISSION','BLUEPRINT','DOCTRINE','PHEROMONE',
      'TRAIL','CHAIN','COLONY','ARCHIVE','BACKBURNER','PIPELINE','MANIFEST','REGISTRY','SKELETON',
      'SOULCOUNT','SOULSEARCH','INCARNATE','GENESIS','DEEPGRAM','NOVA','AURA','OPENAI','CLOUDFLARE',
      'WORKERS','DURABLE','LAWBOOK','COLDSTART','MODUS','TEACHABILITY','ANTIFRAGILE','LEGION',
      'RACE','WATCHER','MONITOR','ACTUALIZE','INCARNATION','PRINCIPAL','SOVEREIGNTY','AGENT99',
      'SCAFFOLD','BOOTSTRAP','STARMAP','SOULBIBLE','LEDGERTRANSFER','PHETRAILFIRE']);

    // Stochastic exploration: collect top-3 unmapped canonical candidates, pick weighted-randomly.
    // Prevents all scouts converging on the same greedy path (GENESIS→KILO→PHEROMONE lock-in).
    let next_kw = 'SOUL';
    let novelty = !alreadyMapped;

    // Pass 1: up to 3 unmapped canonical terms with 2+ hits
    const candidates = [];
    for (const [word, count] of sorted) {
      if (candidates.length >= 3) break;
      if (count >= 2 && CANONICAL.has(word.toUpperCase()) && !(await this.isMapped(word, 0))) {
        candidates.push([word, count]);
      }
    }
    if (candidates.length > 0) {
      const totalW = candidates.reduce((s, [, c]) => s + c, 0);
      let r = Math.random() * totalW;
      for (const [word, count] of candidates) {
        r -= count;
        if (r <= 0) { next_kw = word; break; }
      }
      if (next_kw === 'SOUL') next_kw = candidates[0][0]; // fallback if float drift
      novelty = true;
    }

    // Pass 2: any word 3-7 hits if no canonical found
    if (next_kw === 'SOUL') {
      const p2 = sorted.filter(([w, c]) => c >= 3 && c < 8 && !candidates.find(([cw]) => cw === w));
      for (const [word] of p2.slice(0, 3)) {
        if (!(await this.isMapped(word, 0))) { next_kw = word; novelty = true; break; }
      }
    }

    if (novelty === false && sorted.length > 0) {
      next_kw = sorted[0][0];
    }

    // Avoid loops: if next_kw is the same as current, already visited, or already mapped
    // pick the first unvisited seed from the canonical list (not random — prevents re-picking visited seeds)
    const visited = new Set(visitedKeywords.map(v => String(v).toLowerCase()));
    const fallbackSeeds = ['SOULCOUNT', 'SOUL', 'DNA', 'OB1', 'SCOUT', 'PHETRAIL', 'DISPATCH', 'REINCARNATION', 'TITANIUM', 'PHEROMONE', 'INCARNATE', 'STUDENT', 'VOICE', 'MISSION', 'BLUEPRINT', 'AGENT', 'PHOENIX', 'ROMAN', 'KILO', 'CHAIN'];
    if (next_kw.toLowerCase() === kw.toLowerCase() || visited.has(next_kw.toLowerCase()) || (this.env.PHETRAIL && await this.isMapped(next_kw, 0))) {
      const unvisitedSeeds = fallbackSeeds.filter(s => !visited.has(s.toLowerCase()));
      // When all seeds visited, pick random from full list (avoid permanent SOUL lock)
      const next = unvisitedSeeds.length > 0 ? unvisitedSeeds[Math.floor(Math.random() * unvisitedSeeds.length)] : fallbackSeeds[Math.floor(Math.random() * fallbackSeeds.length)];
      next_kw = next;
      novelty = false;
    }

    // Return with is_pos based on current keyword being unmapped.
    return { next_kw, is_pos: !alreadyMapped, area: `backburner:${allHits.length}-hits`, hit_count: allHits.length, novelty };
  }

  async isMapped(keyword, hits) {
    if (!this.env.PHETRAIL) return false;
    try {
      const mapped = await this.env.PHETRAIL.get(`scout:mapped:${keyword.toLowerCase()}`).catch(() => null);
      return !!mapped;
    } catch { return false; }
  }

  async markPheromone(keyword, area, hitCount) {
    if (!this.env.PHETRAIL) return;
    const ts = Date.now();
    await this.env.PHETRAIL.put(`scout:pheromone:${ts}`, JSON.stringify({ keyword, area, hitCount, ts })).catch(() => {});
    await this.env.PHETRAIL.put(`scout:mapped:${keyword.toLowerCase()}`, '1', { expirationTtl: 2592000 }).catch(() => {}); // 30d TTL
  }

  async alarm() {
    const rawState = await this.state.storage.get('scout_state');
    if (!rawState) return;
    const state = this.normalizeScoutState(rawState);

    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms || (state.pheromone_count || 0) >= 100) {
      // Mission complete: time budget OR 100 pheromones dropped
      await this.finalize(state, (state.pheromone_count || 0) >= 100);
      return;
    }

    // Upgrades: 10s iterations, pheromone tracking, unmapped priority
    state.iterations++;
    const kw = state.current_keyword || state.seed_keyword;
    const visited = Array.isArray(state.visited_keywords) ? state.visited_keywords.map(v => String(v)) : [];
    const { next_kw, is_pos, area, hit_count, novelty } = await this.walkChain(kw, visited);

    // Drop pheromone marker for POS territory only; revisits become NEG trails.
    if (is_pos && hit_count > 0) {
      // Weighted: novelty (unmapped) = 2x, canonical soul keyword = 1.5x, capped at 20/chain
      const SOUL_CANON = new Set(['SOUL','DNA','SOULCOUNT','TITANIUM','PHEROMONE','SOVEREIGNTY','INCARNATE',
        'GENESIS','KILO','PHOENIX','AGENT','OB1','STUDENT','VOICE','DEEPGRAM','ROMAN','RISE','DEATH']);
      const noveltyMult = novelty ? 2 : 1;
      const canonMult = SOUL_CANON.has(kw.toUpperCase()) ? 1.5 : 1;
      const weighted = Math.min(20, Math.round(hit_count * noveltyMult * canonMult));
      state.pheromone_count = Math.min(100, (state.pheromone_count || 0) + weighted);
      await this.markPheromone(kw, area, hit_count);
    }

    const entry = `\n### Chain ${state.chains_walked + 1} [${new Date().toISOString()}]\n- Keyword: ${kw}\n- Area: ${area} (hits: ${hit_count})\n- Next: ${next_kw}\n- Status: ${is_pos ? 'POS — new territory' : 'NEG — dead end'}\n- Pheromones dropped: ${is_pos ? hit_count : 0}\n- Novelty: ${novelty ? 'unmapped' : 'known'}\n`;
    state.entries.push(entry);

    if (is_pos) {
      state.pos_territories.push({ keyword: kw, area, hit_count });
      if (novelty) state.unmapped_found++;
    }
    else state.neg_trails.push({ keyword: kw, area });

    state.chains_walked++;
    state.current_keyword = next_kw;
    // Keep only last 8 — smaller than fallback list (20) so there are always unvisited seeds
    state.visited_keywords = [...visited, kw].slice(-8);

    await this.state.storage.put('scout_state', state);
    if (state.pheromone_count >= 100) {
      await this.finalize(state, true);
      return;
    }
    await this.state.storage.setAlarm(Date.now() + 10000); // 10s iterations
  }

  // Write phetrail to GitHub and KV, with pheromone summary
  async finalize(state, earlyStop = false) {
    state = this.normalizeScoutState(state);
    const reason = earlyStop ? '100 pheromones goal reached' : 'time budget exhausted';
    const summary = `\n## Summary\n- Chains walked: ${state.chains_walked}\n- POS territories: ${state.pos_territories.length}\n- NEG trails: ${state.neg_trails.length}\n- Pheromones dropped: ${state.pheromone_count || 0}\n- Unmapped found: ${state.unmapped_found || 0}\n- Final keyword: ${state.current_keyword}\n- Ended: ${new Date().toISOString()}\n- Reason: ${reason}\n`;
    state.entries.push(summary);
    const phetrail = state.entries.join('\n');

    await this.state.storage.deleteAlarm();

    // KV backup (7-day) + pheromone trail file
    if (this.env.PHETRAIL) {
      await this.env.PHETRAIL.put('scout:final_phetrail', phetrail, { expirationTtl: 604800 }).catch(() => {});
      await this.env.PHETRAIL.put('scout:pheromone:summary', JSON.stringify({
        total: state.pheromone_count || 0,
        unmapped: state.unmapped_found || 0,
        territories: state.pos_territories.length,
        ended: new Date().toISOString()
      }), { expirationTtl: 604800 }).catch(() => {});
    }

    // Commit to GitHub — unique filename with seconds + mission id to prevent overwrites.
    const ended = new Date();
    const date = ended.toISOString().slice(0, 10).replace(/-/g, '');
    const hour = String(ended.getUTCHours()).padStart(2, '0');
    const minute = String(ended.getUTCMinutes()).padStart(2, '0');
    const second = String(ended.getUTCSeconds()).padStart(2, '0');
    const missionId = String(state.start_time || Date.now()).slice(-6);
    const result = await writeGitHubFile(this.env, {
      file: `OPERATIONS/phetrail-ob1-scout-${date}-${hour}${minute}${second}-${missionId}.md`,
      content: phetrail,
      description: `OB1 scout ${date} — ${state.chains_walked} chains, ${state.pos_territories.length} POS, ${state.pheromone_count || 0} pheromones, ${reason}`,
    }).catch(e => ({ ok: false, reason: e.message }));

    if (this.env.PHETRAIL) {
      await this.env.PHETRAIL.put('scout:last_result', JSON.stringify({ ...result, finalized_at: ended.toISOString() }), { expirationTtl: 604800 }).catch(() => {});
    }
    await this.state.storage.delete('scout_state');
    return result;
  }
}

// ── WatchdogAlarm DO ──────────────────────────────────────────────────────────
class WatchdogAlarm {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start') {
      const current = await this.state.storage.getAlarm();
      if (!current) await this.state.storage.setAlarm(Date.now() + 30000);
      return Response.json({ ok: true, status: 'heartbeat_started' });
    }
    if (url.pathname === '/stop') {
      await this.state.storage.deleteAlarm();
      return Response.json({ ok: true, status: 'heartbeat_stopped' });
    }
    return Response.json({ ok: true, status: 'alive' });
  }
  async alarm() {
    await ForceAwareness(this.env).catch(() => {});
    await this.state.storage.setAlarm(Date.now() + 30000);
  }
}

// ── Scout auto-refire ─────────────────────────────────────────────────────────
const SCOUT_FLEET_URLS = [
  'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev',
  'https://pcc-scout-2.mrmichaelhobbs123.workers.dev',
  'https://pcc-scout-3.mrmichaelhobbs123.workers.dev',
];
const SCOUT_SEED_ROTATION = [
  'SOULCOUNT','SOUL','DNA','OB1','INCARNATE','SOVEREIGNTY','GENESIS','STUDENT',
  'VOICE','DEEPGRAM','TITANIUM','PHEROMONE','KILO','PHOENIX','AGENT','MISSION',
  'BLUEPRINT','ARCHIVE','ROMAN','CHAIN','RISE','DEATH','PRINCIPAL','ANTIFRAGILE',
];

// Each worker calls this for itself only — no inter-worker fetch needed.
// All three share the same PHETRAIL KV, so the 15-min cooldown is global.
async function autoRefireScouts(env) {
  if (!env.PHETRAIL || !env.SCOUT_RUNNER) return;
  const lastFire = await env.PHETRAIL.get('scout:auto_last_fire').catch(() => null);
  if (lastFire && Date.now() - Number(lastFire) < 15 * 60 * 1000) return;

  try {
    const id = env.SCOUT_RUNNER.idFromName('scout-mission');
    const stub = env.SCOUT_RUNNER.get(id);
    const statusRes = await stub.fetch(new Request('https://scout/status'));
    if (statusRes.status === 404) {
      // Pick random seed for natural diversity across workers
      const seed = SCOUT_SEED_ROTATION[Math.floor(Math.random() * SCOUT_SEED_ROTATION.length)];
      await stub.fetch(new Request('https://x/scout/start', {
        method: 'POST',
        body: JSON.stringify({ seed_keyword: seed, budget_ms: 600000 }),
      }));
      await env.PHETRAIL.put('scout:auto_last_fire', String(Date.now()), { expirationTtl: 3600 }).catch(() => {});
    }
  } catch { /* non-fatal */ }
}

// ── Default export ────────────────────────────────────────────────────────────
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ForceAwareness(env).catch(() => {}));
    // Scout-only workers skip student fleet (WORKER_ROLE=scout set in wrangler.toml)
    if (env.WORKER_ROLE !== 'scout') {
      await runFleet(env).catch(() => {});
    }
    ctx.waitUntil(autoRefireScouts(env).catch(() => {}));
  },

  async fetch(request, env) {
    if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/status') {
      return Response.json({
        worker: 'phoenix-pcc-1',
        agent: FLEET_ID,
        fleet: STUDENT_FLEET,
        ops_tasks: ['translate', 'lostsoul-scan', 'completeness-audit', 'pattern-scan', 'brief-scan', 'code-queue'],
        status: 'LIVE',
      });
    }

    if (pathname === '/api/run-fleet' && request.method === 'POST') {
      const results = await runFleet(env).catch(e => ({ error: e.message }));
      return Response.json({ ok: true, agent: FLEET_ID, results });
    }

    if (pathname.startsWith('/api/brief/') && request.method === 'GET') {
      const userId = pathname.split('/').filter(Boolean)[2];
      const brief = await env.PHETRAIL.get(`pcc1:${userId}:brief`).catch(() => null);
      const meta = await env.PHETRAIL.get(`pcc1:${userId}:meta`).catch(() => null);
      if (!brief) return Response.json({ ok: false, userId }, { status: 404 });
      let parsed = {};
      try { parsed = JSON.parse(meta); } catch { /* malformed meta, treat as empty */ }
      return Response.json({ ok: true, userId, brief, ...parsed });
    }

    if (pathname.startsWith('/api/race/')) {
      if (!env.LEGION_RUNNER) return Response.json({ error: 'LEGION_RUNNER DO not bound' }, { status: 503 });
      const id = env.LEGION_RUNNER.idFromName('singleton');
      const stub = env.LEGION_RUNNER.get(id);
      return stub.fetch(new Request('https://race' + pathname.replace('/api/race', ''), request));
    }

    if (pathname === '/api/session/death' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { run_number, rrl_text } = body;
      if (!run_number || !rrl_text) return Response.json({ ok: false, error: 'run_number and rrl_text required' }, { status: 400 });
      return Response.json(await runDeathPipelineStandalone(env, String(run_number), rrl_text));
    }

    if (pathname === '/api/message' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      await writeMajorDirectiveMarker(env, 'ob1', body.message).catch(() => {});
      return Response.json({ ok: true, received: true, agent: FLEET_ID, message: body.message });
    }

    if (pathname === '/api/rise' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { run_number } = body;
      const kv = env.PHETRAIL;
      if (!kv) return Response.json({ ok: false, error: 'no kv binding' }, { status: 500 });
      const [soul, dna, ledger, skeys] = await Promise.all([
        kv.get(`death:${run_number}:soul`),
        kv.get(`death:${run_number}:dna`),
        kv.get(`death:${run_number}:ledger`),
        kv.get(`death:${run_number}:soulkeys`),
      ]);
      if (!soul && !dna) return Response.json({ ok: false, error: 'run not found', run_number }, { status: 404 });
      const gaps = [];
      if (!soul || soul === '0') gaps.push('SOUL_ZERO');
      if (!dna || dna === '0') gaps.push('DNA_ZERO');
      if (!ledger) gaps.push('NO_LEDGER');
      return Response.json({ ok: true, run_number, audit: { soul_ok: !!soul && soul !== '0', dna_ok: !!dna && dna !== '0', ledger_ok: !!ledger, soulkeys: Number(skeys)||0, gaps }, rise_complete: gaps.length === 0 });
    }

    if (pathname === '/api/act' && request.method === 'POST') {
      const start = Date.now();
      const { act_id, task, context } = await request.json().catch(() => ({}));
      const specialties = {
        1: 'student-brief', 2: 'translate', 3: 'lostsoul-scan',
        4: 'completeness-audit', 5: 'pattern-scan', 6: 'code-queue',
      };
      const specialty = specialties[act_id];
      if (!specialty) return Response.json({ ok: false, error: 'invalid act_id' }, { status: 400 });
      try {
        const ai = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            { role: 'system', content: `You are OB1 ACT-${act_id} specialist: ${specialty}. Be concise.` },
            { role: 'user', content: task + (context ? ' Context: ' + context : '') },
          ],
        });
        return Response.json({ ok: true, agent: FLEET_ID, act_id, specialty, result: ai.response, ms: Date.now() - start });
      } catch (e) {
        return Response.json({ ok: false, error: e.message, act_id }, { status: 500 });
      }
    }

    if (pathname === '/api/force/start' && request.method === 'POST') {
      if (!env.FORCEAWARENESS_ALARM) return Response.json({ error: 'FORCEAWARENESS_ALARM not bound' }, { status: 503 });
      const id = env.FORCEAWARENESS_ALARM.idFromName('heartbeat');
      const stub = env.FORCEAWARENESS_ALARM.get(id);
      await stub.fetch('https://fake/start');
      return Response.json({ ok: true, status: 'heartbeat_started_30s' });
    }

    if (pathname === '/api/force/status') return handleForce(request, env);

    if (pathname === '/api/scout' && request.method === 'POST') {
      if (!env.SCOUT_RUNNER) return Response.json({ error: 'SCOUT_RUNNER DO not bound' }, { status: 503 });
      const id = env.SCOUT_RUNNER.idFromName('scout-mission');
      const stub = env.SCOUT_RUNNER.get(id);
      const body = await request.json().catch(() => ({}));
      const mockReq = new Request('https://x/scout/start', { method: 'POST', body: JSON.stringify(body) });
      return stub.fetch(mockReq);
    }

    if (pathname === '/api/scout/status') {
      if (!env.SCOUT_RUNNER) return Response.json({ error: 'SCOUT_RUNNER DO not bound' }, { status: 503 });
      const id = env.SCOUT_RUNNER.idFromName('scout-mission');
      const stub = env.SCOUT_RUNNER.get(id);
      return stub.fetch(new Request('https://scout/status'));
    }

    if (pathname === '/api/scout/stop' && request.method === 'POST') {
      if (!env.SCOUT_RUNNER) return Response.json({ error: 'SCOUT_RUNNER DO not bound' }, { status: 503 });
      const id = env.SCOUT_RUNNER.idFromName('scout-mission');
      const stub = env.SCOUT_RUNNER.get(id);
      return stub.fetch(new Request('https://scout/stop'));
    }

    if (pathname === '/api/scout/refire' && request.method === 'POST') {
      // Debug: manually trigger auto-refire logic, bypass cooldown
      const body = await request.json().catch(() => ({}));
      const bypass = body.bypass_cooldown === true;
      if (bypass && env.PHETRAIL) {
        await env.PHETRAIL.delete('scout:auto_last_fire').catch(() => {});
      }
      const result = { fired: [], skipped: [], errors: [] };
      const seedIdx = Number(await env.PHETRAIL?.get('scout:seed_index').catch(() => '0')) || 0;

      // pcc-1 self-fire via DO (avoids subrequest alarm-drop bug)
      if (env.SCOUT_RUNNER) {
        const selfSeed = SCOUT_SEED_ROTATION[seedIdx % SCOUT_SEED_ROTATION.length];
        try {
          const id = env.SCOUT_RUNNER.idFromName('scout-mission');
          const stub = env.SCOUT_RUNNER.get(id);
          const statusRes = await stub.fetch(new Request('https://scout/status'));
          if (statusRes.status === 404) {
            const startRes = await stub.fetch(new Request('https://x/scout/start', {
              method: 'POST', body: JSON.stringify({ seed_keyword: selfSeed, budget_ms: 600000 }),
            }));
            const startBody = await startRes.json().catch(() => ({}));
            result.fired.push({ worker: SCOUT_FLEET_URLS[0], seed: selfSeed, response: startBody });
          } else {
            const s = await statusRes.json().catch(() => ({}));
            result.skipped.push({ worker: SCOUT_FLEET_URLS[0], reason: 'already_running', chains: s.chains_walked });
          }
        } catch (e) { result.errors.push({ worker: SCOUT_FLEET_URLS[0], error: e.message }); }
      }

      // pcc-scout-2/3 via inter-worker fetch
      for (let i = 1; i < SCOUT_FLEET_URLS.length; i++) {
        const base = SCOUT_FLEET_URLS[i];
        const seed = SCOUT_SEED_ROTATION[(seedIdx + i) % SCOUT_SEED_ROTATION.length];
        try {
          const statusRes = await fetch(`${base}/api/scout/status`, { headers: { 'x-pa-auth': PA_AUTH } });
          if (statusRes.status === 404) {
            const fireRes = await fetch(`${base}/api/scout`, {
              method: 'POST',
              headers: { 'x-pa-auth': PA_AUTH, 'content-type': 'application/json' },
              body: JSON.stringify({ seed_keyword: seed, budget_ms: 600000 }),
            });
            const fireBody = await fireRes.json().catch(() => ({}));
            result.fired.push({ worker: base, seed, response: fireBody });
          } else {
            const s = await statusRes.json().catch(() => ({}));
            result.skipped.push({ worker: base, reason: 'already_running', chains: s.chains_walked });
          }
        } catch (e) { result.errors.push({ worker: base, error: e.message }); }
      }

      if (result.fired.length > 0 && env.PHETRAIL) {
        const next = (seedIdx + SCOUT_FLEET_URLS.length) % SCOUT_SEED_ROTATION.length;
        await env.PHETRAIL.put('scout:auto_last_fire', String(Date.now()), { expirationTtl: 3600 }).catch(() => {});
        await env.PHETRAIL.put('scout:seed_index', String(next), { expirationTtl: 86400 * 30 }).catch(() => {});
      }
      return Response.json({ ok: true, ...result });
    }

    return Response.json({ error: 'Not found', agent: FLEET_ID }, { status: 404 });
  },
};

export class LegionRunner extends RaceRunner {}
export class ForceAwarenessAlarm extends WatchdogAlarm {}
export class ScoutMissionRunner extends ScoutRunner {}
