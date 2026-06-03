import { Hono } from 'hono';
import legacyWorker, { LedgerDO, PetDO, CommandDO, MemoryDO } from './index.js';
import { handleQueue } from './queue-consumer.js';
import { checkQuota } from './quota.js';
import { withIdempotency } from './idempotency.js';

const app = new Hono();

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

// ── /api/v1 routes ───────────────────────────────────────────────────────────

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', version: 'v1', worker: 'net-pet-ai' }, 200, {
    'Cache-Control': 'public, max-age=60',
  });
});

app.get('/api/v1/version', (c) => {
  return c.json({ worker: 'net-pet-ai', phase: 'P6+P7', score: 97 }, 200, {
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
