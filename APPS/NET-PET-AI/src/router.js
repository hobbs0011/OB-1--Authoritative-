import { Hono } from 'hono';
import legacyWorker, { LedgerDO, PetDO, CommandDO, MemoryDO } from './index.js';
import { handleQueue } from './queue-consumer.js';
import { checkQuota } from './quota.js';
import { withIdempotency } from './idempotency.js';
import { handleStudentErase } from './deletion.js';
import { checkAdminKey } from './security.js';
import { verifyClerkSession } from './auth.js';

const app = new Hono();

// ── Security headers middleware ───────────────────────────────────────────────

app.use('*', async (c, next) => {
  await next();
  const headers = new Headers(c.res.headers);
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(self)');
  if (c.req.url.startsWith('https://')) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  const body = await c.res.text();
  return new Response(body, { status: c.res.status, headers });
});

// ── Request size limit middleware (Issue 009) ──────────────────────────────────

app.use('/api/:path*', async (c, next) => {
  const contentLength = c.req.header('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > 65536) {
    return c.json({ error: 'Request too large', max: 65536 }, 413);
  }
  await next();
});

// ── Cache middleware for read-heavy v1 routes ─────────────────────────────────

app.use('/api/v1/health', async (c, next) => {
  const cache = caches.default;
  const cached = await cache.match(c.req.url);
  if (cached) return cached;
  await next();
  if (c.res.ok) {
    c.executionCtx.waitUntil(cache.put(c.req.url, c.res.clone()));
  }
});

app.use('/api/v1/version', async (c, next) => {
  const cache = caches.default;
  const cached = await cache.match(c.req.url);
  if (cached) return cached;
  await next();
  if (c.res.ok) {
    c.executionCtx.waitUntil(cache.put(c.req.url, c.res.clone()));
  }
});

// ── P6: Per-student hourly quota enforcement ──────────────────────────────────

app.get('/api/deepgram-token', async (c, next) => {
  const studentId = c.req.query('studentId');
  if (studentId && !studentId.startsWith('sov100-')) {
    const { allowed, retryAfter } = await checkQuota(c.env, studentId, 'deepgram');
    if (!allowed) {
      return c.json({ error: 'Rate limit exceeded', retryAfter }, 429, {
        'Retry-After': String(retryAfter),
      });
    }
  }
  return next();
});

app.post('/api/chat', async (c, next) => {
  let studentId;
  try {
    const bodyText = await c.req.raw.clone().text();
    studentId = JSON.parse(bodyText).studentId;
  } catch {}
  if (studentId && !studentId.startsWith('sov100-')) {
    const { allowed, retryAfter } = await checkQuota(c.env, studentId, 'chat');
    if (!allowed) {
      return c.json({ error: 'Rate limit exceeded', retryAfter }, 429, {
        'Retry-After': String(retryAfter),
      });
    }
  }
  return next();
});

// ── P7: Idempotent mutation endpoints ────────────────────────────────────────

app.post('/api/payment/confirm', (c) =>
  withIdempotency(c.env, c.req.raw, () =>
    legacyWorker.fetch(c.req.raw.clone(), c.env, c.executionCtx)
  )
);

app.post('/api/waitlist', (c) =>
  withIdempotency(c.env, c.req.raw, () =>
    legacyWorker.fetch(c.req.raw.clone(), c.env, c.executionCtx)
  )
);

app.post('/api/referral/register', (c) =>
  withIdempotency(c.env, c.req.raw, () =>
    legacyWorker.fetch(c.req.raw.clone(), c.env, c.executionCtx)
  )
);

// ── P9: Clerk session middleware (soft enforcement — logs userId, does not block) ──

app.use('/api/*', async (c, next) => {
  const session = await verifyClerkSession(c.req.raw, c.env);
  if (session) c.set('clerkUserId', session.userId);
  return next();
});

// ── P10: Student data erasure ─────────────────────────────────────────────────

app.delete('/api/student/:id/erase', async (c) => {
  const authFail = await checkAdminKey(c.req.raw, c.env);
  if (authFail) return authFail;
  const studentId = c.req.param('id');
  if (!studentId) return c.json({ error: 'student id required' }, 400);
  const result = await handleStudentErase(studentId, c.env);
  return c.json(result);
});

// ── /api/v1 routes ───────────────────────────────────────────────────────────

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', version: 'v1', worker: 'net-pet-ai' }, 200, {
    'Cache-Control': 'public, max-age=60',
  });
});

app.get('/api/v1/version', (c) => {
  return c.json({ worker: 'net-pet-ai', phase: 'P6+P7+P9+P10', score: 97 }, 200, {
    'Cache-Control': 'public, max-age=60',
  });
});

// ── /api/v1/metrics — recent error log (observability) ───────────────────────

app.get('/api/v1/metrics', async (c) => {
  if (!c.env?.SOUL_DB) return c.json({ error: 'DB unavailable' }, 503);
  const rows = await c.env.SOUL_DB.prepare(
    'SELECT ts, tag, message, student_id FROM error_log ORDER BY ts DESC LIMIT 20'
  ).all();
  return c.json({ errors: rows.results ?? [], count: rows.results?.length ?? 0 });
});

app.get('/api/lead', (c) => c.json({ error: 'POST required' }, 405));

// ── Legacy fallback — all unmigrated routes pass through to existing handler ──

app.all('*', async (c) => {
  return legacyWorker.fetch(c.req.raw, c.env, c.executionCtx);
});

export default {
  fetch: app.fetch,
  scheduled: legacyWorker.scheduled,
  queue: handleQueue,
};

export { LedgerDO, PetDO, CommandDO, MemoryDO };

