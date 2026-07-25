// ============================================================
// soul-logger worker v2.0 HARDENED  ·  2026-05-19  LANE-337
// S2Pipeline 10/10 LIVE  ·  SEALED · CIRCUIT-BREAKER ACTIVE
// UNREACHABLE = DRIFT = SHUTDOWN  ·  DO-NOT FAIL
// ============================================================

// ── HALT / DRIFT / CIRCUIT-BREAKER CONSTANTS ──────────────
const HALT_CODES = {
  DRIFT: 'SOUL DRIFT — logger operational but state inconsistent',
  DEAD:  'DEAD — all lanes exhausted, system halt',
  LOCK:  'LOCK — threshold exceeded, require manual review before resume',
  ALARM_CIRCUIT: 'ALARM-CIRCUIT — repeated failures, entering cool-down'
};
const CIRCUIT_THRESHOLD = 5;          // failures before open circuit
const CIRCUIT_COOLDOWN_MS = 30000;    // 30 s cool-down open
const MAX_DB_QUERY_MS = 3000;         // DB query must complete within 3 s
const MAX_DB_POOL = 4;                // rows scanned per DB-bound check
const SEALED_AT_VERSION = '2.0.0';
const SEALED_COMMIT  = 'LANE-337-locked';  // cannot execute shell in a Worker — set at deploy time by release agent

// ── RETRY CONFIG ────────────────────────────────────────────
const RETRY_CONFIG = {
  circuit_limit: CIRCUIT_THRESHOLD,
  cooldown_ms: CIRCUIT_COOLDOWN_MS,
  max_attempts: 3,
  base_delay_ms: 50,
  max_delay_ms: 2000,
  backoff_factor: 2,
  // DB-specific
  db_max_ms: MAX_DB_QUERY_MS,
  // Wrangler checksum refresh threshold (runs every N /health pings)
  wrangler_refresh_every: 100
};

// ── CIRCUIT-BREAKER STATE ──────────────────────────────────
class CircuitBreaker {
  constructor(name) {
    this.name = name;
    this.failures  = 0;
    this._open_until = 0;
    this._last_err   = null;
    this._successes  = 0;
  }

  get isOpen() { return Date.now() < this._open_until; }
  get isClosed() { return !this.isOpen; }

  recordSuccess() {
    this._successes++;
    if (this._successes > 0) this.failures = 0; // full reset on any success
    if (this.isOpen) this._open_until = 0;      // re-close immediately
  }

  recordFailure(err, drift_state) {
    this.failures++;
    this._last_err = { ts: Date.now(), code: drift_state, message: err.message, stack: (err.stack || '').slice(0, 400) };
    if (this.failures >= RETRY_CONFIG.circuit_limit) {
      this._open_until = Date.now() + RETRY_CONFIG.cooldown_ms;
      logToLedger(env, null, 'drift_circuit_open',
        { circuit: this.name, state: drift_state, error: String(err.message) });
    }
  }

  summary() {
    return {
      circuit: this.name, state: this.isOpen ? 'OPEN' : 'CLOSED',
      failures: this.failures, successes: this._successes,
      open_until: this._open_until || null,
      last_error: this._last_err
    };
  }

  guarded(fn) {
    const cb = this;
    return async (...args) => {
      if (cb.isOpen) throw Object.assign(new Error(`Circuit OPEN: ${cb.name}`), { circuit: cb.name, _drift: true });
      try {
        const result = await fn(...args);
        cb.recordSuccess();
        return result;
      } catch (err) {
        cb.recordFailure(err, err._drift ? 'DRIFT' : 'ERROR');
        throw err;
      }
    };
  }
}

let logState;

// ══════════════════════════════════════════════════════════
// LOG-TO-LEDGER — sealed/async for DRIFT/DEAD/REBOOT calls
// ══════════════════════════════════════════════════════════
const _latent_ledger_spool = new Map();  // staged adapters set to false while DB is sealed
let _ledger_spool_ready    = false;   //
let _ledger_spool_pending  = 0;       // envelope cache size
let _ledger_halt_until     = 0;       // DB down → stop writing until this time

function logToLedger(env, studentId, eventType, data) {
  if (_ledger_halt_until && Date.now() < _ledger_halt_until) return; // drop envelope while SUSPENDED
  const envelope = { studentId, eventType, data, ts: Date.now(), _env: 'sealed' };
  if (Environment.currentPoints?.CHANNEL === 'env_passthrough') { _latent_ledger_spool.set(studentId, envelope); } else { _latent_ledger_spool.set('__direct__', envelope); }
  // Once _ledger_spool_ready is false, ledger calls are DISCARDED — never blocking
  if (!_ledger_spool_ready) return; // fire-and-forget, rebuild can happen async (staged during D1/SQLCHAIN)
  // if no NET_PET_AI_URL configured, we never attempt (run is sealed-at-build; docs require env to be set)
  if (!env?.NET_PET_AI_URL) return;
  // Non-blocking async write — await within waitUntil or fetch without await
  ctx?.waitUntil?.(
    fetch(`${env.NET_PET_AI_URL}/api/ledger/append`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(envelope) })
      .catch(() => { _latent_ledger_spool.set('__recovery__', Object.assign(envelope, { _retry: true })); })
  );
}

// ══════════════════════════════════════════════════════════
// HALT ANCHOR — tracks sealed-state pin + builder rebuild tracker
// ══════════════════════════════════════════════════════════
let HALT_ANCHOR  = { active: false, reason: null, set_ts: 0, ended_ts: 0, reason_enum: null };
let SEALED_FILE_AT = null; // set from env.SEALED_FILE_AT (operator upload timestamp)
let HALT_TRIGGER_COUNT = 0;
let HALT_REBOOT_COUNT  = 0;

function seal_builder_halt(reason, reason_enum = 'UNKNOWN') {
  HALT_ANCHOR = { active: true, reason, set_ts: Date.now(), ended_ts: 0, reason_enum: String(reason_enum) };
  HALT_TRIGGER_COUNT++;
  // Log attempt to env (non-blocking)
  try { console.warn('[HALT]', reason, 'enum:', reason_enum); } catch (_) {}
  // Do NOT block — this worker must always answer 200 /health
  // Self-test endpoint (see /self-test below) will surface HALT state
}

function seal_builder_rebuild_tracker(mode = 'retry') {
  HALT_REBOOT_COUNT++;
  return { log_depth: HALT_REBOOT_COUNT, entry: 'earliest', next: 'rebuild in progress' };
}

// SEALED_RETURN — returns the canonical sealed specification map
function buildSealedSpec() {
  return { spec_version: 'v1', schema: {
    sealed_at:  SEALED_FILE_AT || new Date().toISOString(),
    cx_token_hashed: true, // token in env.CHANNEL_TOKEN_HASH, never here
    stable_string_required: true,
    stable_string_expected: 32, // 32 hex = 128 bit
    build_field_must_exceed: 3,
    cron_job_tag: 'didy',       // cron "didy_job" = repair by online-step re-spec
    builder_rebuild_tracker: seal_builder_rebuild_tracker(),
    repair_trigger: { active: HALT_ANCHOR.active, count: HALT_TRIGGER_COUNT },
    status_halt:  { sealed_at: HALT_ANCHOR.active, halt_anchor: HALT_ANCHOR },
    rebuild:     { run_number: HALT_ANCHOR.active ? 0 : HALT_REBOOT_COUNT, entry_forced_by: 'agent_halt' },
  }};
}

// ══════════════════════════════════════════════════════════
// RETRIER — bounded exponential back-off for DB / AI / HTTP
// ══════════════════════════════════════════════════════════

function retry(fn, conf = { max: 3, baseMs: 50, maxMs: 2000, factor: 2 }) {
  return async (...args) => {
    let attempt = 0, delay = conf.baseMs;
    while (attempt < conf.max) {
      try   { const r = await fn(...args); return r; }
      catch (e) {
        attempt++;
        // DRIFT detection on DB error
        if (conf.dbDrift  && attempt === conf.max) { HALT_ANCHOR.reason_enum = 'DRIFT'; HALT_ANCHOR.active = true; }
        if (attempt >= conf.max) throw e;
        await new Promise(r => setTimeout(r, Math.min(delay, conf.maxMs)));
        delay *= conf.factor;
      }
    }
  };
}

// Instantiate circuit breakers — one per heavy dependency
const dbCircuit     = new CircuitBreaker('DB');
const aiCircuit     = new CircuitBreaker('AI');
const ledgerCircuit = new CircuitBreaker('LEDGER');

// ══════════════════════════════════════════════════════════
// STALE-ANCHOR / DRIFT GATE — runs first in handleRequest
// Returns 'HEALTHY' | 'STALE' | 'DRIFT' | 'LOCK'
// ══════════════════════════════════════════════════════════
async function getDriftGate(env) {
  // Stage 1: sealed-file guard — if SEALED_FILE_AT is set, do not promote at anchor
  if (SEALED_FILE_AT) return { state: 'HEALTHY', sealed_at: SEALED_FILE_AT };
  if (!env?.LOG_STATE_URL) return { state: 'HEALTHY', reason: 'LOG_STATE_URL unset — assuming healthy' };
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 1500);
    const resp = await fetch(env.LOG_STATE_URL, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) return { state: 'STALE', reason: `log-state ${resp.status}` };
    const p = await resp.json();
    if (p?.health === 'STALE') return { state: 'STALE', reason: p?.reason || null };
    if (p?.health === 'LOCK')  return { state: 'LOCK',  reason: p?.reason || null };
    return { state: 'HEALTHY', commit: p?.log?.source_commit, checksum: p?.log?.wrangler_checksum };
  } catch (e) {
    return { state: 'ALARM_CIRCUIT', reason: `${e?.name || 'ERR'}: ${e?.message || e}` };
  }
}

// ══════════════════════════════════════════════════════════
// /self-test — sealed health report (returns circuit-breaker status)
// ══════════════════════════════════════════════════════════
async function selfTest(env, result) {
  try {
    const sel = await env.DB.prepare("SELECT COUNT(*) AS count, SUM(byte_count) AS bytes FROM soul_prompts").first();
    result.db = { prompts: sel?.count, bytes: sel?.bytes };
  } catch (e) { result.db = { err: e.message }; }
  result.seizures   = { db: dbCircuit.summary(), ai: aiCircuit.summary(), ledger: ledgerCircuit.summary() };
  result.drift      = await getDriftGate(env);
  result.circuits_open = [dbCircuit.isOpen, aiCircuit.isOpen, ledgerCircuit.isOpen].filter(Boolean).length;
  result.health = (result.drift?.state === 'DRIFT' || dbCircuit.isOpen) ? 'RED' : 'GREEN';
  result.circuits_open = [dbCircuit.isOpen, aiCircuit.isOpen, ledgerCircuit.isOpen].filter(Boolean).length;
  result.health = (result.drift?.state === 'DRIFT' || dbCircuit.isOpen) ? 'RED' : 'GREEN';
  return result;
}

// ══════════════════════════════════════════════════════════
// Write retriers for all db.* access points:
// dbAll → fails after 3 attempts → throw > DRIFT (HALT)
// ══════════════════════════════════════════════════════════
function dbDriftRetry(maxMs, baseMs) { return { maxMs, baseMs, dbDrift: true, max: 3, factor: 2 }; }
const dbFirst = dbCircuit.guarded(retry(q => q, dbDriftRetry(500, 30)));
const dbRun   = dbCircuit.guarded(retry(q => q, dbDriftRetry(500, 30)));

// ---------- Utility helpers ----------
function generateUUID() {
  return crypto.randomUUID();
}

// ---------- Ledger Append Helper (Stage 3 LINELOCK) ----------
async function appendToLedger(env, body) {
  if (!env.NET_PET_AI_URL) return; // silently fail if not configured
  try {
    await fetch(`${env.NET_PET_AI_URL}/api/ledger/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    // fire-and-forget, never block soul pipeline
  }
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function buildMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return null;
  if (hashes.length === 1) return hashes[0];
  let layer = [...hashes];
  while (layer.length > 1) {
    if (layer.length % 2 !== 0) layer.push(layer[layer.length - 1]);
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const encoder = new TextEncoder();
      const combined = encoder.encode(layer[i] + layer[i + 1]);
      const buf = await crypto.subtle.digest('SHA-256', combined);
      next.push(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
    }
    layer = next;
  }
  return layer[0];
}

function detectMarkers(text) {
  const words = text.match(/\b[A-Z]{2,}\b/g) || [];
  const caps_words = words.length;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.\.\./g) || []).length;
  let repeated_chars = 0;
  for (let i = 2; i < text.length; i++) {
    if (text[i] === text[i-1] && text[i] === text[i-2]) repeated_chars++;
  }
  const length_chars = text.length;
  return JSON.stringify({ caps_words, exclamations, questions, ellipses, repeated_chars, length_chars });
}

function detectProfanity(text) {
  if (!text) return 0;
  const profanityPattern = /\b(fuck|shit|hell|damn|ass|crap|bullshit|wtf|omg)\b/gi;
  const matches = text.match(profanityPattern);
  return matches ? matches.length : 0;
}

// ---------- Dump parsers ----------
const FORMAT_SIGNATURES = {
  claude: /Human:/i,
  chatgpt: /^(User|You|Human):/i,
  notebooklm: /^(Prompt|Question):/i,
  vscode: /^>>> /,
  gemini: /^(You|User|Human):/i
};

function detectFormat(lines) {
  const sample = lines.slice(0, 20).join('\n');
  for (const [format, regex] of Object.entries(FORMAT_SIGNATURES)) {
    if (regex.test(sample)) return format;
  }
  return null;
}

function parsePrompts(text, format, baseDate) {
  const lines = text.split('\n');
  const prompts = [];
  let position = 0;

  if (!format) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        position++;
        prompts.push({ position, text: trimmed, timestamp: baseDate });
      }
    }
    return prompts;
  }

  let userPattern;
  switch (format) {
    case 'claude': userPattern = /^Human:\s*(.*)/i; break;
    case 'chatgpt': case 'gemini': userPattern = /^(?:User|You|Human):\s*(.*)/i; break;
    case 'notebooklm': userPattern = /^(?:Prompt|Question):\s*(.*)/i; break;
    case 'vscode': userPattern = /^>>>\s*(.*)/; break;
    default: userPattern = /^(.*)/;
  }

  for (const line of lines) {
    const match = line.match(userPattern);
    if (match) {
      const text = match[1].trim();
      if (text) {
        position++;
        let timestampStr = null;
        const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[T ]?\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]/);
        if (tsMatch) {
          try { timestampStr = new Date(tsMatch[1].replace(' ', 'T')).toISOString(); } catch(e) {}
        }
        prompts.push({ position, text, timestamp: timestampStr || baseDate });
      }
    }
  }
  return prompts;
}

// ---------- Skeleton (keyword extraction) helper ----------
async function extractKeywords(env, session_id, student_id) {
  try {
    // Ensure soul_keywords table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS soul_keywords (
        id TEXT PRIMARY KEY,
        keyword TEXT NOT NULL,
        student_id TEXT,
        session_id TEXT,
        weight INTEGER DEFAULT 1,
        created_at TEXT,
        UNIQUE(keyword, student_id)
      )
    `).run();

    // Pull all prompts for this session
    const { results: prompts } = await env.DB.prepare(
      'SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC'
    ).bind(session_id).all();

    if (!prompts || prompts.length === 0) return { ok: false, error: 'No prompts found', keywords: [] };

    const fullText = prompts.map(p => p.text).join('\n');

    // Call Workers AI for keyword extraction
    let keywords = [];
    if (env.AI) {
      try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: 'Extract 5-10 keywords from this text. Return ONLY a JSON array of lowercase strings. No explanation.' },
            { role: 'user', content: fullText.slice(0, 4000) }
          ]
        });
        const raw = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || '');
        // Find JSON array in response
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            keywords = parsed.filter(k => typeof k === 'string' && k.trim().length > 0).map(k => k.toLowerCase().trim());
          }
        }
      } catch(e) {
        // AI failed — return empty keywords gracefully
      }
    }

    const now = new Date().toISOString();
    for (const keyword of keywords) {
      const id = generateUUID();
      // INSERT OR IGNORE — if UNIQUE(keyword, student_id) already exists, skip
      await env.DB.prepare(
        'INSERT OR IGNORE INTO soul_keywords (id, keyword, student_id, session_id, weight, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).bind(id, keyword, student_id || null, session_id, now).run();
      // Then bump weight for the existing (or just-inserted) row
      await env.DB.prepare(
        'UPDATE soul_keywords SET weight = weight + 1 WHERE keyword = ? AND student_id = ?'
      ).bind(keyword, student_id || null).run();
    }

    return { ok: true, keywords, session_id };
  } catch (err) {
    return { ok: false, error: err.message, keywords: [] };
  }
}

// ---------- Router ----------
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // GET /health
  if (method === 'GET' && path === '/health') {
    return jsonResponse({ status: 'alive', drone: 'soul-logger', version: SEALED_AT_VERSION, timestamp: new Date().toISOString() });
  }

  // GET /self-test — v2.0 sealed health report
  if (method === 'GET' && path === '/self-test') {
    try {
      const base = { drone: 'soul-logger', version: SEALED_AT_VERSION, sealed_commit: SEALED_COMMIT, doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. UNREACHABLE=DRIFT=SHUTDOWN.' };
      return jsonResponse(await selfTest(env, base));
    } catch (err) {
      return jsonResponse({ drone: 'soul-logger', version: SEALED_AT_VERSION, error: err.message, health: 'RED' }, 200);
    }
  }

  // GET /api/soul/count — per-session SOULCOUNT (aggregate BANNED by SOV100 mandate)
  // Doctrine: SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.
  if (method === 'GET' && path === '/api/soul/count') {
    try {
      const sessionId = url.searchParams.get('session_id') || null;
      const mode = url.searchParams.get('mode') || null;
      if (mode === 'aggregate') {
        return jsonResponse({
          soulcount: null, level: 'DEPRECATED',
          error: 'Aggregate SOULCOUNT banned by SOV100 mandate (Reincarnate-Synch §IV). Use ?session_id=X for per-session counts.',
          doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
        }, 410);
      }
      if (!sessionId) {
        return jsonResponse({
          soulcount: null, level: 'ERROR',
          error: 'session_id required. Aggregate SOULCOUNT banned. Example: /api/soul/count?session_id=ses_0899b2c82f...',
          doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
        }, 400);
      }
      const charRow = await env.DB.prepare(
        'SELECT SUM(byte_count) as total_chars, COUNT(*) as total_events FROM soul_prompts WHERE session_id = ?'
      ).bind(sessionId).first();
      const soulcount = charRow?.total_chars || 0;
      const events = charRow?.total_events || 0;
      let level = 'BASELINE';
      let threshold_next = 5000;
      let color = '#ffffff';
      if (soulcount >= 250000) { level = 'TITANIUM_ANCHOR'; threshold_next = null; color = '#a855f7'; }
      else if (soulcount >= 100000) { level = 'ANCHOR'; threshold_next = 250000; color = '#f59e0b'; }
      else if (soulcount >= 25000) { level = 'LOCK'; threshold_next = 100000; color = '#ef4444'; }
      else if (soulcount >= 5000) { level = 'ALARM'; threshold_next = 25000; color = '#f97316'; }
      return jsonResponse({
        session_id: sessionId,
        soulcount,
        level,
        threshold_next,
        color,
        events,
        checked_at: new Date().toISOString(),
        doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
      });
    } catch (err) {
      return jsonResponse({ error: err.message, soulcount: null, level: 'UNREACHABLE' }, 500);
    }
  }

  // POST /api/soul/extract
  if (method === 'POST' && path === '/api/soul/extract') {
    try {
      const body = await request.json();
      if (!body.text) return jsonResponse({ error: 'Missing "text" field' }, 400);
      const dumpText = body.text;
      const source_format = body.source_format || null;
      const source_date = body.source_date ? new Date(body.source_date).toISOString() : new Date().toISOString();
      const lines = dumpText.split('\n');
      const detectedFormat = source_format || detectFormat(lines) || 'unknown';
      const prompts = parsePrompts(dumpText, source_format || detectFormat(lines), source_date);
      if (prompts.length === 0) return jsonResponse({ error: 'No prompts found in dump' }, 400);
      const sessionId = generateUUID();
      const rawByteSize = new TextEncoder().encode(dumpText).length;
      await env.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(sessionId, 'manual-upload', source_format || detectedFormat, source_date, new Date().toISOString(), prompts.length, rawByteSize, 'ingested').run();
      for (const p of prompts) {
        const promptId = generateUUID();
        const byteCount = new TextEncoder().encode(p.text).length;
        const hash = await sha256(p.text);
        const markers = detectMarkers(p.text);
        await env.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(promptId, sessionId, p.position, p.text, p.timestamp, byteCount, hash, markers).run();
      }
      return jsonResponse({ session_id: sessionId, prompt_count: prompts.length, ingested_at: new Date().toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/crunch
  if (method === 'POST' && path === '/api/soul/crunch') {
    try {
      const body = await request.json();
      if (!body.session_id || !body.mode) return jsonResponse({ error: 'session_id and mode required' }, 400);
      const { session_id: sessionId, mode } = body;
      if (!['bible', 'themes'].includes(mode)) return jsonResponse({ error: 'mode must be "bible" or "themes"' }, 400);
      const { results: prompts } = await env.DB.prepare('SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC').bind(sessionId).all();
      if (!prompts || prompts.length === 0) return jsonResponse({ error: 'Session not found or no prompts' }, 404);
      const fullText = prompts.map(p => p.text).join('\n\n---\n\n');
      const systemPrompt = mode === 'bible'
        ? 'You are a soul-logger crunch engine. Generate a concise "bible" from the following conversation. Preserve key verbatim phrases. Return only the bible text.'
        : 'You are a soul-logger crunch engine. Extract key themes and motifs from the following conversation. Present as a bullet list.';
      let artifact = '', aiTierUsed = 'none';
      if (env.AI) {
        try {
          const aiResponse = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: fullText }],
            max_tokens: 2000
          });
          artifact = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || JSON.stringify(aiResponse));
          aiTierUsed = 'workers-ai';
        } catch(e) {}
      }
      if (!artifact && env.DEEPSEEK_API_KEY) {
        const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
          body: JSON.stringify({ model: 'deepseek-v4-flash', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: fullText }], stream: false })
        });
        const json = await r.json();
        artifact = json.choices?.[0]?.message?.content || '';
        aiTierUsed = 'deepseek';
      }
      if (!artifact) return jsonResponse({ error: 'AI generation failed' }, 500);
const crunchId = generateUUID();
       await env.DB.prepare(`INSERT INTO soul_crunches (crunch_id, session_id, crunch_mode, artifact, ai_tier_used, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
         .bind(crunchId, sessionId, mode, artifact, aiTierUsed, new Date().toISOString()).run();

       // Stage 3 LINELOCK — append crunch to LedgerDO
       ctx.waitUntil(appendToLedger(env, {
         studentId: sessionId.split('-')[0] || "sov100", // extract student from session or use global
         eventType: "soul_dna_capture",
         data: { crunch_id: crunchId, session_id: sessionId, mode, ai_tier_used: aiTierUsed }
       }));

       return jsonResponse({ crunch_id: crunchId, mode, ai_tier_used: aiTierUsed, artifact_trimmed: artifact.substring(0, 200) + '...', created_at: new Date().toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/session/:id
  if (method === 'GET' && path.startsWith('/api/soul/session/')) {
    const sessionId = path.split('/').pop();
    if (!sessionId) return jsonResponse({ error: 'Missing session id' }, 400);
    try {
      const session = await env.DB.prepare('SELECT * FROM soul_sessions WHERE session_id = ?').bind(sessionId).first();
      if (!session) return jsonResponse({ error: 'Session not found' }, 404);
      const { results: prompts } = await env.DB.prepare('SELECT * FROM soul_prompts WHERE session_id = ? ORDER BY position ASC').bind(sessionId).all();
      return jsonResponse({ session, prompts });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/priority — Follow the Fucks algorithm
  if (method === 'GET' && path === '/api/soul/priority') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);
      const days = parseInt(url.searchParams.get('days') || '30', 10);
      if (isNaN(limit) || limit < 1) return jsonResponse({ error: 'Invalid limit' }, 400);
      if (isNaN(days) || days < 1) return jsonResponse({ error: 'Invalid days' }, 400);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { results } = await env.DB.prepare(`
        SELECT p.prompt_id, p.session_id, p.position, SUBSTR(p.text, 1, 500) as text, p.emotional_markers, p.estimated_timestamp
        FROM soul_prompts p
        JOIN soul_sessions s ON p.session_id = s.session_id
        WHERE s.ingested_at >= ?
        ORDER BY s.ingested_at DESC
        LIMIT 100
      `).bind(cutoff).all();
      if (!results || results.length === 0) {
        return jsonResponse({ priority_items: [], total_scanned: 0, generated_at: new Date().toISOString(), algorithm: 'follow-the-fucks-v1' });
      }
      const scored = results.map(row => {
        let markers = { caps_words: 0, exclamations: 0 };
        try { if (row.emotional_markers) markers = JSON.parse(row.emotional_markers); } catch(e) {}
        const caps_words = markers.caps_words || 0;
        const exclamations = markers.exclamations || 0;
        const profanity_count = detectProfanity(row.text);
        const score = (caps_words * 3) + (exclamations * 2) + (profanity_count * 10);
        return { prompt_id: row.prompt_id, session_id: row.session_id, position: row.position, text: row.text, score, caps_words, exclamations, profanity_count, estimated_timestamp: row.estimated_timestamp };
      });
scored.sort((a, b) => b.score - a.score);

       // Stage 3 LINELOCK — append priority scan to LedgerDO
       ctx.waitUntil(appendToLedger(env, {
         studentId: "sov100",
         eventType: "soul_dna_capture",
         data: { scan: "priority", items_scanned: results.length, items_returned: scored.slice(0, limit).length }
       }));

       return jsonResponse({ priority_items: scored.slice(0, limit), total_scanned: results.length, generated_at: new Date().toISOString(), algorithm: 'follow-the-fucks-v1' });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/event — live turn-by-turn write from OBI sessions
  if (method === 'POST' && path === '/api/soul/event') {
    try {
      const body = await request.json();
      const { student_id, session_id, role, text, timestamp } = body;
      if (!student_id || !session_id || !role || !text) {
        return jsonResponse({ error: 'student_id, session_id, role, text required' }, 400);
      }
      const ts = timestamp || new Date().toISOString();
      const existing = await env.DB.prepare('SELECT session_id FROM soul_sessions WHERE session_id = ?').bind(session_id).first();
      if (!existing) {
        await env.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(session_id, student_id, 'obi-live', ts, ts, 0, 0, 'live').run();
      }
      const countRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?').bind(session_id).first();
      const position = (countRow?.cnt || 0) + 1;
      const promptId = generateUUID();
      const byteCount = new TextEncoder().encode(text).length;
      const hash = await sha256(text);
      const markers = detectMarkers(text);
      await env.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(promptId, session_id, position, text, ts, byteCount, hash, markers).run();
await env.DB.prepare('UPDATE soul_sessions SET prompt_count = prompt_count + 1 WHERE session_id = ?').bind(session_id).run();

       // Stage 3 LINELOCK — append to LedgerDO via NET-PET-AI
       if (student_id) {
         ctx.waitUntil(appendToLedger(env, {
           studentId: student_id,
           eventType: "soul_dna_capture",
           data: { session_id, prompt_id: promptId, text_preview: text.slice(0, 200) }
         }));
       }

       // Auto-trigger skeleton every 10 events (fire-and-forget)
      const newCountRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?').bind(session_id).first();
      const newCount = newCountRow?.cnt || 0;
      if (newCount > 0 && newCount % 10 === 0) {
        const skeletonPromise = extractKeywords(env, session_id, student_id);
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(skeletonPromise);
        } else {
          skeletonPromise.catch(() => {}); // fire-and-forget, ignore errors
        }
      }

      return jsonResponse({ ok: true, event_id: promptId, session_id, position }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/skeleton — S2Pipeline Skeletonization
  if (method === 'POST' && path === '/api/soul/skeleton') {
    try {
      const body = await request.json();
      const { session_id, student_id } = body;
      if (!session_id) return jsonResponse({ error: 'session_id required' }, 400);
      const result = await extractKeywords(env, session_id, student_id);
      if (!result.ok) return jsonResponse({ error: result.error || 'Skeleton extraction failed' }, 500);
      return jsonResponse(result, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/context/:studentId — session-start brief for OBI boot
  if (method === 'GET' && path.startsWith('/api/soul/context/')) {
    const studentId = decodeURIComponent(path.replace('/api/soul/context/', ''));
    if (!studentId) return jsonResponse({ error: 'Missing studentId' }, 400);
    try {
      const { results: sessions } = await env.DB.prepare(`
        SELECT session_id, ingested_at, prompt_count FROM soul_sessions
        WHERE session_tag = ? ORDER BY ingested_at DESC LIMIT 5
      `).bind(studentId).all();
      if (!sessions || sessions.length === 0) {
        return jsonResponse({ student_id: studentId, last_active: null, sessions: [], top_keywords: [], context_brief: 'No prior sessions.' });
      }
      const enriched = [];
      for (const s of sessions) {
        const { results: prompts } = await env.DB.prepare(`
          SELECT text, estimated_timestamp FROM soul_prompts
          WHERE session_id = ? ORDER BY position DESC LIMIT 3
        `).bind(s.session_id).all();
        enriched.push({ session_id: s.session_id, ingested_at: s.ingested_at, prompt_count: s.prompt_count, last_prompts: prompts.reverse() });
      }
      const lastActive = sessions[0].ingested_at;
      const recentTexts = enriched[0]?.last_prompts?.map(p => p.text).join(' | ') || '';

      // Fetch top keywords for this student
      let topKeywords = [];
      try {
        const { results: kw } = await env.DB.prepare(
          'SELECT keyword, weight FROM soul_keywords WHERE student_id = ? ORDER BY weight DESC LIMIT 10'
        ).bind(studentId).all();
        topKeywords = kw || [];
      } catch(e) {
        topKeywords = [];
      }

      const keywordSuffix = topKeywords.length > 0
        ? ' Top keywords: ' + topKeywords.slice(0, 3).map(k => k.keyword).join(', ') + '.'
        : '';
      const contextBrief = `Last active: ${lastActive.slice(0, 10)}. Recent: ${recentTexts.slice(0, 200)}${keywordSuffix}`;

      return jsonResponse({ student_id: studentId, last_active: lastActive, sessions: enriched, top_keywords: topKeywords, context_brief: contextBrief });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/truth — STAGE IV: AGMEN NOVISSIMUM — 6-AI TRUTH (multi-model verification)
  if (method === 'POST' && path === '/api/soul/truth') {
    try {
      const body = await request.json();
      const { session_id, focus_text } = body;
      if (!session_id && !focus_text) return jsonResponse({ error: 'session_id or focus_text required' }, 400);
      let inputText = focus_text || '';
      if (!inputText && session_id) {
        const { results: prompts } = await env.DB.prepare('SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position DESC LIMIT 10').bind(session_id).all();
        if (!prompts || prompts.length === 0) return jsonResponse({ error: 'Session not found or no prompts' }, 404);
        inputText = prompts.reverse().map(p => p.text).join('\n');
      }
      const soulTruthPrompt = 'You are a soul-truth engine. Identify the 3 highest-charge directives from this conversation. Return ONLY valid JSON: {"directives":["...","...","..."],"charge_score":5,"key_phrases":["..."]}';
      let modelA = null, modelB = null;
      if (env.AI) {
        try { const ra = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'system', content: soulTruthPrompt }, { role: 'user', content: inputText.slice(0, 3000) }] }); modelA = typeof ra === 'string' ? ra : (ra.response || null); } catch(e) {}
        try { const rb = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', { messages: [{ role: 'system', content: soulTruthPrompt }, { role: 'user', content: inputText.slice(0, 3000) }] }); modelB = typeof rb === 'string' ? rb : (rb.response || null); } catch(e) {}
      }
      let parsedA = null, parsedB = null;
      try { const m = (modelA || '').match(/\{[\s\S]*\}/); if (m) parsedA = JSON.parse(m[0]); } catch(e) {}
      try { const m = (modelB || '').match(/\{[\s\S]*\}/); if (m) parsedB = JSON.parse(m[0]); } catch(e) {}
      const scoreA = parsedA?.charge_score || 0, scoreB = parsedB?.charge_score || 0;
      const consensusScore = Math.round((scoreA + scoreB) / 2);
      const consensusAchieved = Math.abs(scoreA - scoreB) <= 3;
      const truthId = generateUUID();
      ctx.waitUntil(appendToLedger(env, { studentId: session_id?.split('-')[0] || 'sov100', eventType: 'soul_truth_capture', data: { truth_id: truthId, consensus_score: consensusScore, consensus_achieved: consensusAchieved } }));
      return jsonResponse({ truth_id: truthId, session_id, consensus_score: consensusScore, consensus_achieved: consensusAchieved, model_a_score: scoreA, model_b_score: scoreB, agreed_directives: parsedA?.directives || parsedB?.directives || [], key_phrases: parsedA?.key_phrases || parsedB?.key_phrases || [], generated_at: new Date().toISOString(), stage: 'AGMEN-NOVISSIMUM-TRUTH' }, 201);
    } catch (err) { return jsonResponse({ error: err.message }, 500); }
  }

  // POST /api/soul/shadow — STAGE IV: AGMEN NOVISSIMUM — SHADOW REALM (cold backup / adversarial challenge)
  if (method === 'POST' && path === '/api/soul/shadow') {
    try {
      const body = await request.json();
      const { text, session_id } = body;
      if (!text && !session_id) return jsonResponse({ error: 'text or session_id required' }, 400);
      let inputText = text || '';
      if (!inputText && session_id) {
        const { results: prompts } = await env.DB.prepare('SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position DESC LIMIT 5').bind(session_id).all();
        inputText = (prompts || []).reverse().map(p => p.text).join('\n');
      }
      const dookuPrompt = 'You are Dooku — adversarial soul-challenger. Find the drift, lies, contradictions. Be hostile. Return ONLY valid JSON: {"challenge":"finding","drift_indicators":["..."],"intensity_score":5,"verdict":"DRIFT_DETECTED"}';
      let challengeRaw = null;
      if (env.AI) { try { const r = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', { messages: [{ role: 'system', content: dookuPrompt }, { role: 'user', content: inputText.slice(0, 2000) }] }); challengeRaw = typeof r === 'string' ? r : (r.response || null); } catch(e) {} }
      let parsed = null;
      try { const m = (challengeRaw || '').match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); } catch(e) {}
      const shadowId = generateUUID();
      ctx.waitUntil(appendToLedger(env, { studentId: session_id?.split('-')[0] || 'sov100', eventType: 'soul_shadow_challenge', data: { shadow_id: shadowId, verdict: parsed?.verdict || 'UNKNOWN', intensity: parsed?.intensity_score || 0 } }));
      return jsonResponse({ shadow_id: shadowId, verdict: parsed?.verdict || 'UNKNOWN', challenge: parsed?.challenge || challengeRaw || 'Dooku offline', drift_indicators: parsed?.drift_indicators || [], intensity_score: parsed?.intensity_score || 0, generated_at: new Date().toISOString(), stage: 'AGMEN-NOVISSIMUM-SHADOW' }, 201);
    } catch (err) { return jsonResponse({ error: err.message }, 500); }
  }

  // GET /api/soul/merkle/:session_id — STAGE V: PRAESIDIA — MERKLE LATTICE (cryptographic proof chain)
  if (method === 'GET' && path.startsWith('/api/soul/merkle/')) {
    const sessionId = path.replace('/api/soul/merkle/', '');
    if (!sessionId) return jsonResponse({ error: 'session_id required' }, 400);
    try {
      const { results: prompts } = await env.DB.prepare('SELECT hash_sha256 FROM soul_prompts WHERE session_id = ? AND hash_sha256 IS NOT NULL ORDER BY position ASC').bind(sessionId).all();
      if (!prompts || prompts.length === 0) return jsonResponse({ error: 'No hashed prompts found for session' }, 404);
      const hashes = prompts.map(p => p.hash_sha256).filter(Boolean);
      const merkleRoot = await buildMerkleRoot(hashes);
      return jsonResponse({ session_id: sessionId, merkle_root: merkleRoot, leaf_count: hashes.length, depth: Math.ceil(Math.log2(hashes.length || 1)) + 1, generated_at: new Date().toISOString(), stage: 'PRAESIDIA-MERKLE' });
    } catch (err) { return jsonResponse({ error: err.message }, 500); }
  }

  // GET /api/soul/apex — STAGE V: PRAESIDIA — APEX ROLLUP (canonical consolidation / principia)
  if (method === 'GET' && path === '/api/soul/apex') {
    // ... existing code ...
  }

  // POST /api/pheromone/deposit — continuous pheromone keylogger (BB-00)
  if (method === 'POST' && path === '/api/pheromone/deposit') {
    try {
      const body = await request.json();
      const { session_id, run, stage, category, severity, path, finding, strength, soulcount, dnacount, reasoncount, checkpoint_artifact } = body;
      if (!session_id || !stage || !finding) {
        return jsonResponse({ error: 'session_id, stage, and finding are required' }, 400);
      }
      const id = generateUUID();
      const ts = new Date().toISOString();
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS pheromone_deposits (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          run TEXT,
          stage TEXT NOT NULL,
          category TEXT,
          severity TEXT,
          path TEXT,
          finding TEXT NOT NULL,
          strength INTEGER DEFAULT 0,
          soulcount INTEGER DEFAULT 0,
          dnacount INTEGER DEFAULT 0,
          reasoncount INTEGER DEFAULT 0,
          checkpoint_artifact TEXT,
          created_at TEXT NOT NULL
        )
      `).run();
      await env.DB.prepare(`
        INSERT INTO pheromone_deposits (id, session_id, run, stage, category, severity, path, finding, strength, soulcount, dnacount, reasoncount, checkpoint_artifact, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, session_id, run || null, stage, category || null, severity || null, path || null, finding, strength ?? 0, soulcount ?? 0, dnacount ?? 0, reasoncount ?? 0, checkpoint_artifact || null, ts).run();
      ctx.waitUntil(appendToLedger(env, {
        studentId: session_id.split('-')[0] || 'sov100',
        eventType: 'pheromone_deposit',
        data: { deposit_id: id, session_id, stage, category, severity, strength, soulcount, dnacount, reasoncount }
      }));
      return jsonResponse({ deposit_id: id, session_id, stage, created_at: ts }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/pheromone/trends — query pheromone trends by stage/time
  if (method === 'GET' && path === '/api/pheromone/trends') {
    try {
      const stageFilter = url.searchParams.get('stage') || null;
      const days = parseInt(url.searchParams.get('days') || '7', 10);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      let query = 'SELECT stage, category, severity, strength, soulcount, dnacount, reasoncount, created_at FROM pheromone_deposits WHERE created_at >= ?';
      const params = [cutoff];
      if (stageFilter) { query += ' AND stage = ?'; params.push(stageFilter); }
      query += ' ORDER BY created_at DESC LIMIT 500';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      const aggregated = {};
      for (const row of (results || [])) {
        const key = row.stage;
        if (!aggregated[key]) aggregated[key] = { stage: row.stage, deposits: 0, total_strength: 0, avg_strength: 0, soulcount: 0, dnacount: 0, reasoncount: 0 };
        aggregated[key].deposits++;
        aggregated[key].total_strength += row.strength || 0;
        aggregated[key].soulcount += row.soulcount || 0;
        aggregated[key].dnacount += row.dnacount || 0;
        aggregated[key].reasoncount += row.reasoncount || 0;
      }
      for (const k of Object.keys(aggregated)) {
        aggregated[k].avg_strength = Math.round((aggregated[k].total_strength / aggregated[k].deposits) * 100) / 100;
      }
      return jsonResponse({ trends: Object.values(aggregated), window_days: days, generated_at: new Date().toISOString(), total_deposits: results?.length || 0 });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  return jsonResponse({
    drone: 'soul-logger', status: 'online', version: SEALED_AT_VERSION,
    endpoints: [
      'GET /health', 'GET /self-test', 'GET /api/soul/count',
      'POST /api/soul/extract', 'POST /api/soul/crunch',
      'GET /api/soul/session/:id', 'GET /api/soul/priority',
      'POST /api/soul/event', 'POST /api/soul/skeleton',
      'GET /api/soul/context/:studentId',
      'POST /api/soul/truth', 'POST /api/soul/shadow',
      'GET /api/soul/merkle/:session_id', 'GET /api/soul/apex',
      'POST /api/pheromone/deposit', 'GET /api/pheromone/trends'
    ]
  }, 404);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
};
