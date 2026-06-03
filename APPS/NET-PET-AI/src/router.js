import { Hono } from 'hono';
import legacyWorker, { LedgerDO, PetDO, CommandDO, MemoryDO } from './index.js';

const app = new Hono();

// ── /api/v1 routes ───────────────────────────────────────────────────────────

app.get('/api/v1/health', (c) => c.json({ status: 'ok', version: 'v1', worker: 'net-pet-ai' }));
app.get('/api/v1/version', (c) => c.json({ worker: 'net-pet-ai', phase: 'P3', score: 90 }));

// ── Legacy fallback — all unmigrated routes pass through to existing handler ─

app.all('*', async (c) => {
  return legacyWorker.fetch(c.req.raw, c.env, c.executionCtx);
});

export default {
  fetch: app.fetch,
  scheduled: legacyWorker.scheduled,
};

export { LedgerDO, PetDO, CommandDO, MemoryDO };
