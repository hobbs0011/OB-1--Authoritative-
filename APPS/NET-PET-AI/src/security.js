// src/security.js — NET-PET-AI Security Middleware

const VERSION = "1.2.1";

const SECURITY = {
  RATE_LIMIT: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    blockDuration: 5 * 60 * 1000,
  },
  SANITIZE: {
    maxMessageLength: 10000,
    maxStudentIdLength: 64,
    stripHtml: true,
    blockSql: true,
    blockXss: true,
  },
  CORS: {
    allowedOrigins: [
      'https://naturalenglishtraining.com',
      'https://www.naturalenglishtraining.com',
      'https://net-pet-ai.mrmichaelhobbs123.workers.dev',
      // Add the specific extension ID here once deployed, e.g. 'chrome-extension://abcdef1234567890abcdef1234567890'
      // Never use 'chrome-extension://*' — it allows every installed extension to make credentialed requests.
    ],
    allowCredentials: true,
  },
};

// KV-backed rate limiter — survives worker restarts.
// Requires RATELIMIT KV namespace binding (wrangler kv namespace create RATELIMIT).
// Falls back to in-memory (with a warning) when the binding is absent.
const _rateLimitFallback = new Map();

async function checkRateLimit(ip, kv) {
  const now = Date.now();

  if (!kv) {
    console.warn('RATELIMIT KV binding not configured — rate limiting is ephemeral');
    return _checkRateLimitInMemory(ip, now);
  }

  const key = `rl:${ip}`;
  let raw;
  try {
    raw = await kv.get(key);
  } catch {
    console.warn('RATELIMIT kv.get failed — falling back to in-memory');
    return _checkRateLimitInMemory(ip, now);
  }

  let record;
  try {
    record = raw ? JSON.parse(raw) : { count: 0, resetAt: now + SECURITY.RATE_LIMIT.windowMs, blocked: false, blockUntil: 0 };
  } catch {
    console.warn('RATELIMIT JSON parse failed — falling back to in-memory');
    return _checkRateLimitInMemory(ip, now);
  }

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
    try {
      await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.blockDuration / 1000) });
    } catch {
      console.warn('RATELIMIT kv.put failed — continuing without persistent block');
    }
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_exceeded' };
  }

  record.count++;
  try {
    await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.windowMs / 1000) });
  } catch {
    console.warn('RATELIMIT kv.put failed — continuing without persistent state');
  }
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
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: 'rate_limit_exceeded' };
  }
  record.count++;
  _rateLimitFallback.set(ip, record);
  return { allowed: true, remaining: SECURITY.RATE_LIMIT.maxRequests - record.count, resetAt: record.resetAt };
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  let output = input;

  if (output.length > SECURITY.SANITIZE.maxMessageLength) {
    output = output.slice(0, SECURITY.SANITIZE.maxMessageLength);
  }

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
    for (const pattern of sqlPatterns) {
      if (pattern.test(output)) {
        console.warn('SQL_INJECTION_ATTEMPT:', output.slice(0, 50));
        output = output.replace(pattern, '[BLOCKED_SQL]');
      }
    }
  }

  if (SECURITY.SANITIZE.blockXss) {
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
    ];
    for (const pattern of xssPatterns) {
      if (pattern.test(output)) {
        console.warn('XSS_ATTEMPT:', output.slice(0, 50));
        output = output.replace(pattern, '[BLOCKED_XSS]');
      }
    }
  }

  return output.trim();
}

function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    return { valid: false, error: 'studentId required' };
  }
  if (studentId.length > SECURITY.SANITIZE.maxStudentIdLength) {
    return { valid: false, error: 'studentId too long' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(studentId)) {
    return { valid: false, error: 'studentId contains invalid characters' };
  }
  return { valid: true };
}

// Active student roster — only these IDs may consume voice tokens and mutate student KV.
// Operator (sov100-*) and test IDs are always allowed.
// ⚠️ UPDATE THIS LIST when onboarding or offboarding students.
const ACTIVE_STUDENT_ROSTER = new Set([
  'huong-bluetech',
  'mai-tram-bluetech',
  'quy-bluetech',
  'lam-bluetech',
  'quan-bluetech',
  'quang-bluetech',
  'minh-bluetech',
  // test / warm-up IDs
  'sov100-test-magic',
  'keep-warm-ping',
]);

function validateActiveStudent(studentId) {
  if (!studentId || typeof studentId !== 'string') return { valid: false, error: 'studentId required' };
  // Operator IDs always pass
  if (studentId.startsWith('sov100-')) return { valid: true };
  if (ACTIVE_STUDENT_ROSTER.has(studentId)) return { valid: true };
  return { valid: false, error: 'student not in active roster' };
}

function getCorsHeaders(origin = '') {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Student-Token',
  };

  const isAllowed = SECURITY.CORS.allowedOrigins.some(allowed =>
    allowed === '*' ||
    origin === allowed ||
    (allowed.endsWith('*') && origin.startsWith(allowed.slice(0, -1)))
  );

  if (isAllowed) {
    // Reflect specific origin when credentials are enabled — browsers reject * + credentials
    headers['Access-Control-Allow-Origin'] = (SECURITY.CORS.allowCredentials && origin) ? origin : '*';
  }

  if (SECURITY.CORS.allowCredentials && origin) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function validateOrigin(origin) {
  if (!origin) return true; // No origin = curl/script access
  
  return SECURITY.CORS.allowedOrigins.some(allowed => 
    allowed === '*' || 
    origin === allowed ||
    (allowed.endsWith('*') && origin.startsWith(allowed.slice(0, -1))))
  ;
}

async function securityMiddleware(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);
  
  // Bypass rate-limit for STT (chunked uploads need burst capacity) and health
  if (!url.pathname.startsWith('/api/health') && !url.pathname.startsWith('/api/stt')) {
    const rateCheck = await checkRateLimit(ip, env?.RATELIMIT);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateCheck.resetAt - Date.now()) / 1000).toString(),
          ...getCorsHeaders(origin),
        }
      });
    }
  }
  
  if (url.pathname.startsWith('/api/') && !validateOrigin(origin)) {
    console.warn('CORS_BLOCKED:', origin);
    return new Response(JSON.stringify({
      error: 'Origin not allowed'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });
  }
  
  return null;
}

// Constant-time admin key check — guards teacher/admin/internal routes.
// Set WORKER_ADMIN_KEY wrangler secret. Absent secret = open in dev (safe for local).
// Returns a 401 Response if auth fails, null if OK (mirrors securityMiddleware pattern).
async function checkAdminKey(request, env) {
  const expected = env.WORKER_ADMIN_KEY || '';
  if (!expected) return null; // dev: no secret configured = allow
  const provided = request.headers.get('X-Admin-Key') || '';
  const enc = new TextEncoder();
  const a = enc.encode(provided.padEnd(128, '\0'));
  const b = enc.encode(expected.padEnd(128, '\0'));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    const origin = request.headers.get('Origin') || '';
    return new Response(JSON.stringify({ error: 'Unauthorized', hint: 'X-Admin-Key header required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
    });
  }
  return null;
}

async function logAudit(env, { action, actor = 'system', target = '', ip = '', meta = {} }) {
  if (!env.SOUL_DB) return;
  try {
    await env.SOUL_DB.prepare(
      `CREATE TABLE IF NOT EXISTS audit_log_v2 (
        id TEXT PRIMARY KEY,
        ts INTEGER NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        metadata TEXT
      )`
    ).run();
    const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await env.SOUL_DB.prepare(
      `INSERT INTO audit_log_v2 (id, ts, action, target, performed_by, metadata) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, Math.floor(Date.now() / 1000), action, target, actor, JSON.stringify({ ...meta, ip })).run();
  } catch (e) {
    console.warn('AUDIT_LOG_FAIL:', e.message);
  }
}

export { VERSION, SECURITY, securityMiddleware, sanitizeInput, validateStudentId, validateActiveStudent, checkRateLimit, getCorsHeaders, validateOrigin, checkAdminKey, logAudit };