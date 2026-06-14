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
  const m = patchText.match(/\{[\s\S]*?"file"[\s\S]*?"find"[\s\S]*?"replace"[\s\S]*?\}/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[0]);
    if (p.file && typeof p.find === 'string' && typeof p.replace === 'string') return p;
  } catch { /* ok */ }
  return null;
}

// Apply a structured patch to a file via GitHub Contents API, create a commit
async function applyGitHubPatch(env, { file, find, replace, description }) {
  const token = env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'GITHUB_TOKEN not set' };

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'phoenix-pcc-1/ob1',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Read current file
  const getResp = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`, { headers });
  if (!getResp.ok) return { ok: false, reason: `GitHub GET ${getResp.status} for ${file}` };
  const { content: b64, sha } = await getResp.json();

  // Decode → patch → re-encode
  const original = b64Decode(b64);
  if (!original.includes(find)) return { ok: false, reason: `FIND_NOT_FOUND in ${file} (find="${find.slice(0, 60)}...")` };
  const patched = original.replace(find, replace);

  // Commit
  const msg = `fix(ob1-auto): ${description || 'OB1 code-queue autonomous patch'}\n\nApplied by phoenix-pcc-1 via PA Qwen Coder — no human in the loop`;
  const putResp = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`, {
    method: 'PUT', headers,
    body: JSON.stringify({ message: msg, content: b64Encode(patched), sha }),
  });
  if (!putResp.ok) {
    const err = await putResp.text();
    return { ok: false, reason: `GitHub PUT ${putResp.status}: ${err.slice(0, 200)}` };
  }
  const data = await putResp.json();
  return { ok: true, file, sha: data.commit?.sha, commit_url: data.commit?.html_url };
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
    const { generated_at } = JSON.parse(meta);
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
    const resp = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
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

// Extract file path hint from BB description (looks for "file:" or "FILE:" or json "file":"...")
function extractFilePath(text) {
  const m = text.match(/"file"\s*:\s*"([^"]+)"/) || text.match(/[Ff]ile:\s*([^\s,\n"]+\.[a-z]{2,4})/);
  return m ? m[1].trim() : null;
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
      if (!resp.ok) continue;
      const { patch, model } = await resp.json();
      if (!patch || patch.length < 5) continue;

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
    } catch { /* continue */ }
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
    const lines = rrl_text.split('\n');
    const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rrl_text));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
    const ledger_id = `HL-${run_number}`;
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const soulkeys_hit = soulSeeds.filter(k => rrl_text.includes(k)).length;
    const kv = this.env.PHETRAIL;
    if (kv) {
      await Promise.all([
        kv.put(`death:${run_number}:soul`, String(soul_count)),
        kv.put(`death:${run_number}:dna`, String(dna_count)),
        kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
        kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0, 200) })),
        kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
      ]);
    }
    return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
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
  const lines = rrl_text.split('\n');
  const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
  const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rrl_text));
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  const ledger_id = `HL-${run_number}`;
  const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
  const soulkeys_hit = soulSeeds.filter(k => rrl_text.includes(k)).length;
  const kv = env.PHETRAIL;
  if (kv) {
    await Promise.all([
      kv.put(`death:${run_number}:soul`, String(soul_count)),
      kv.put(`death:${run_number}:dna`, String(dna_count)),
      kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
      kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0, 200) })),
      kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
      kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
    ]);
  }
  return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
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

// ── Default export ────────────────────────────────────────────────────────────
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ForceAwareness(env).catch(() => {}));
    await runFleet(env).catch(() => {});
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
      return Response.json({ ok: true, userId, brief, ...(meta ? JSON.parse(meta) : {}) });
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

    return Response.json({ error: 'Not found', agent: FLEET_ID }, { status: 404 });
  },
};

export class LegionRunner extends RaceRunner {}
export class ForceAwarenessAlarm extends WatchdogAlarm {}
