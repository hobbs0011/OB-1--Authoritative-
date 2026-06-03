import { Hono } from 'hono';
import legacyWorker, { LedgerDO, PetDO, CommandDO, MemoryDO } from './index.js';
import { handleQueue } from './queue-consumer.js';

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

// ── /api/v1 routes ───────────────────────────────────────────────────────────

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', version: 'v1', worker: 'net-pet-ai' }, 200, {
    'Cache-Control': 'public, max-age=60',
  });
});

app.get('/api/v1/version', (c) => {
  return c.json({ worker: 'net-pet-ai', phase: 'P5', score: 95 }, 200, {
    'Cache-Control': 'public, max-age=60',
  });
});

// ── /api/v1/metrics — recent error log (observability) ──────────────────────

app.get('/api/v1/metrics', async (c) => {
  if (!c.env?.SOUL_DB) return c.json({ error: 'DB unavailable' }, 503);
  const rows = c.env.SOUL_DB.prepare(
    'SELECT ts, tag, message, student_id FROM error_log ORDER BY ts DESC LIMIT 20'
  ).all();
  return c.json({ errors: rows.results ?? [], count: rows.results?.length ?? 0 });
});

// ── Legacy fallback — all unmigrated routes pass through to existing handler ─

app.all('*', async (c) => {
  return legacyWorker.fetch(c.req.raw, c.env, c.executionCtx);
});

export default {
  fetch: app.fetch,
  scheduled: legacyWorker.scheduled,
  queue: handleQueue,
};

export { LedgerDO, PetDO, CommandDO, MemoryDO };
