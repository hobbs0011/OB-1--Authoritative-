// Phoenix-Architecti security.js v1.0.0
// PORTED VERBATIM from NET-PET-AI/src/security.js v1.2.1 (SEC-PORT principle)
// Binding adaptations only: SOUL_DB → DB, student-facing CORS → internal API CORS
// DO NOT regenerate this file with a 32B model. Port only. Proven code stays proven.

const VERSION = '1.0.0';

const SECURITY = {
  RATE_LIMIT: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    blockDuration: 5 * 60 * 1000,
  },
  SANITIZE: {
    maxTaskLength: 10000,
    maxContextLength: 50000,
    stripHtml: true,
    blockSql: true,
    blockXss: true,
  },
  CORS: {
    // Internal API — called from Claude Code (PowerShell), Haiku operator, CF workers.
    // Not browser-facing. Auth gate (WORKER_ADMIN_KEY / PA_AUTH_SECRET) is the real control.
    // Wildcard is intentional for programmatic callers; tighten if exposed publicly.
    allowedOrigins: ['*'],
    allowCredentials: false,
  },
};

// ── KV-backed rate limiter — survives worker restarts ─────────────────────────
const _rateLimitFallback = new Map();

async function checkRateLimit(ip, kv) {
  const now = Date.now();
  if (!kv) {
    console.warn('RATELIMIT KV binding not configured — rate limiting is ephemeral');
    return _checkRateLimitInMemory(ip, now);
  }
  const key = `rl:${ip}`;
  const raw = await kv.get(key);
  const record = raw
    ? JSON.parse(raw)
    : { count: 0, resetAt: now + SECURITY.RATE_LIMIT.windowMs, blocked: false, blockUntil: 0 };

  if (record.blocked && record.blockUntil > now) {
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_blocked' };
  }
  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + SECURITY.RATE_LIMIT.windowMs;
    record.blocked = false;
    record.blockUntil = 0;
  }
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.blockDuration / 1000) });
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_exceeded' };
  }
  record.count++;
  await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.windowMs / 1000) });
  return { allowed: true, remaining: SECURITY.RATE_LIMIT.maxRequests - record.count, resetAt: record.resetAt };
}

function _checkRateLimitInMemory(ip, now) {
  const windowStart = now - SECURITY.RATE_LIMIT.windowMs;
  for (const [key, data] of _rateLimitFallback) {
    if (data.resetAt < windowStart) _rateLimitFallback.delete(key);
  }
  const record = _rateLimitFallback.get(ip) || { count: 0, resetAt: now + SECURITY.RATE_LIMIT.windowMs, blocked: false, blockUntil: 0 };
  if (record.blocked && record.blockUntil > now) {
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_blocked' };
  }
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    _rateLimitFallback.set(ip, record);
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_blocked' };
  }
  record.count++;
  _rateLimitFallback.set(ip, record);
  return { allowed: true, remaining: SECURITY.RATE_LIMIT.maxRequests - record.count, resetAt: record.resetAt };
}

// ── Input sanitizer — strips HTML, blocks SQL injection + XSS patterns ────────
function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') return '';
  const limit = maxLength || SECURITY.SANITIZE.maxTaskLength;
  let output = input.length > limit ? input.slice(0, limit) : input;

  if (SECURITY.SANITIZE.stripHtml) {
    output = output.replace(/<[^>]*>/g, '');
  }
  if (SECURITY.SANITIZE.blockSql) {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(';\s*DROP\b)/i,
      /(\bOR\s+1\s*=\s*1\b)/i,
    ];
    for (const p of sqlPatterns) {
      if (p.test(output)) {
        console.warn('SQL_INJECTION_ATTEMPT:', output.slice(0, 50));
        output = output.replace(p, '[BLOCKED_SQL]');
      }
    }
  }
  if (SECURITY.SANITIZE.blockXss) {
    const xssPatterns = [/<script\b/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i, /<object/i, /<embed/i, /eval\s*\(/i];
    for (const p of xssPatterns) {
      if (p.test(output)) {
        console.warn('XSS_ATTEMPT:', output.slice(0, 50));
        output = output.replace(p, '[BLOCKED_XSS]');
      }
    }
  }
  return output.trim();
}

// ── CORS ──────────────────────────────────────────────────────────────────────
function getCorsHeaders(origin = '') {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-pa-auth, Authorization',
  };
  const isAllowed = SECURITY.CORS.allowedOrigins.some(a => a === '*' || origin === a);
  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = (SECURITY.CORS.allowCredentials && origin) ? origin : '*';
  }
  return headers;
}

function validateOrigin(origin) {
  if (!origin) return true;
  return SECURITY.CORS.allowedOrigins.some(a => a === '*' || origin === a);
}

// ── Constant-time admin key check (timing-attack safe) ────────────────────────
// Guards /api/blueprint (paid Opus) and /api/swarm (10-drone, resource-heavy).
// Set WORKER_ADMIN_KEY wrangler secret. Also accepts PA_AUTH_SECRET for back-compat.
async function checkAdminKey(request, env) {
  const expected = env.WORKER_ADMIN_KEY || env.PA_AUTH_SECRET || '';
  if (!expected) return null; // dev: no secret = allow
  const provided = request.headers.get('x-pa-auth') || request.headers.get('X-Admin-Key') || '';
  const enc = new TextEncoder();
  const a = enc.encode(provided.padEnd(128, '\0'));
  const b = enc.encode(expected.padEnd(128, '\0'));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    const origin = request.headers.get('Origin') || '';
    return new Response(JSON.stringify({ error: 'Unauthorized', hint: 'x-pa-auth header required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
    });
  }
  return null;
}

// ── Audit log — writes to audit_log table in env.DB (soul-archive D1) ─────────
async function logAudit(env, { action, actor = 'system', target = '', ip = '', meta = {} }) {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY, ts INTEGER NOT NULL, action TEXT NOT NULL,
        actor TEXT, target TEXT, ip TEXT, meta TEXT
      )`
    ).run();
    const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await env.DB.prepare(
      `INSERT INTO audit_log (id, ts, action, actor, target, ip, meta) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, Date.now(), action, actor, target, ip, JSON.stringify(meta)).run();
  } catch (e) {
    console.warn('AUDIT_LOG_FAIL:', e.message);
  }
}

// ── Security middleware — front gate for all /api/ routes ─────────────────────
async function securityMiddleware(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);

  if (!url.pathname.startsWith('/api/status')) {
    const rateCheck = await checkRateLimit(ip, env?.RATELIMIT);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000) }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)), ...getCorsHeaders(origin) },
      });
    }
  }
  return null;
}

export { VERSION, SECURITY, securityMiddleware, sanitizeInput, checkAdminKey, getCorsHeaders, validateOrigin, checkRateLimit, logAudit };
