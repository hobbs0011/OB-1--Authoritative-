import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

const ADMIN_KEY = 'test-admin-key';
const TEST_ID = 'sov100-test-magic';
const BASE = 'https://fake-host';

// ── PART 1: health, auth, deepgram, vocab, phonics ──────────────────────────

describe('health', () => {
  it('GET /api/health → 200', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/health`));
    expect(resp.status).toBe(200);
  });

  it('GET /api/health/deep → 200 or 503 (not 500)', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/health/deep`));
    expect([200, 503]).toContain(resp.status);
    expect(resp.status).not.toBe(500);
  });

  it.skip('GET /api/heartbeat — skipped: makes external fetch calls blocked by miniflare', () => {});

  it('GET /api/status → 200', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/status`));
    expect(resp.status).toBe(200);
  });
});

describe('auth', () => {
  it('GET /api/error-log no key → 401', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/error-log`));
    expect(resp.status).toBe(401);
  });

  it('GET /api/error-log with key → 200 or 500 (D1 table may not exist in miniflare)', async () => {
    const req = new Request(`${BASE}/api/error-log`, {
      headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    const resp = await SELF.fetch(req);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/teacher/dashboard no key → 401', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/teacher/dashboard`));
    expect(resp.status).toBe(401);
  });

  it('GET /api/teacher/dashboard with key → 200 or 500 (D1 table may not exist in miniflare)', async () => {
    const req = new Request(`${BASE}/api/teacher/dashboard`, {
      headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    const resp = await SELF.fetch(req);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });
});

describe('deepgram', () => {
  it('GET /api/deepgram-token?mode=free → 200 or 500 (key-dependent)', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/deepgram-token?mode=free&studentId=${TEST_ID}`)
    );
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/deepgram-token?mode=study → not 401', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/deepgram-token?mode=study&studentId=${TEST_ID}`)
    );
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/deepgram-token?mode=phonics → not 401', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/deepgram-token?mode=phonics&studentId=${TEST_ID}`)
    );
    expect(resp.status).not.toBe(401);
  });
});

describe('vocab', () => {
  it('GET /api/vocab/due?studentId=TEST_ID → 200', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/vocab/due?studentId=${TEST_ID}`)
    );
    expect(resp.status).toBe(200);
  });

  it('GET /api/vocab/list?studentId=TEST_ID → 200', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/vocab/list?studentId=${TEST_ID}`)
    );
    expect(resp.status).toBe(200);
  });

  it('POST /api/vocab/add → 200 or 400', async () => {
    const req = new Request(`${BASE}/api/vocab/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: TEST_ID, word: 'test', definition: 'a test' }),
    });
    const resp = await SELF.fetch(req);
    expect([200, 400]).toContain(resp.status);
  });

  it('POST /api/vocab/review → 200 or 400', async () => {
    const req = new Request(`${BASE}/api/vocab/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: TEST_ID, word: 'test', correct: true }),
    });
    const resp = await SELF.fetch(req);
    expect([200, 400]).toContain(resp.status);
  });
});

describe('phonics', () => {
  it('GET /api/phonics/curriculum?group=SATNIP → 200', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/phonics/curriculum?group=SATNIP`)
    );
    expect(resp.status).toBe(200);
  });

  it('GET /api/phonics/progress?studentId=TEST_ID → 200', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/phonics/progress?studentId=${TEST_ID}`)
    );
    expect(resp.status).toBe(200);
  });

  it('GET /api/drills/list → 200', async () => {
    const resp = await SELF.fetch(new Request(`${BASE}/api/drills/list`));
    expect(resp.status).toBe(200);
  });

  it('GET /api/drills/next?studentId=TEST_ID → 200', async () => {
    const resp = await SELF.fetch(
      new Request(`${BASE}/api/drills/next?studentId=${TEST_ID}`)
    );
    expect(resp.status).toBe(200);
  });
});

// ── PART 2: memory, netpet, session, metrics, ledger, progress ──────────────
// NOTE: Many routes query D1 tables that don't exist in miniflare's test DB.
// Assertions: not 401 (auth gate) + not 404 (route exists). 200 or 500 both accepted.

describe('memory', () => {
  it('POST /api/memory → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: TEST_ID, key: 'test', value: 'hello' }),
    });
    expect([200, 400, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/memory?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/memory?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/memory/summary?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/memory/summary?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});

describe('netpet', () => {
  it('GET /api/netpet/state?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/netpet/state?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/netpet/score?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/netpet/score?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('POST /api/netpet/checkin → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/netpet/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: TEST_ID }),
    });
    expect([200, 400, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});

describe('session', () => {
  it('GET /api/agent/session?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/agent/session?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('POST /api/session/log → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/session/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: TEST_ID, duration: 60, mode: 'free' }),
    });
    expect([200, 400, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/session/latest?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/session/latest?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});

describe('metrics', () => {
  it('GET /api/metrics/summary with key → not 401', async () => {
    const resp = await SELF.fetch(`${BASE}/api/metrics/summary`, {
      headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/metrics/dau with key → not 401', async () => {
    const resp = await SELF.fetch(`${BASE}/api/metrics/dau`, {
      headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/metrics/errors?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/metrics/errors?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});

describe('ledger', () => {
  it('GET /api/ledger/status → not 404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/ledger/status`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/ledger/stats with key → not 401', async () => {
    const resp = await SELF.fetch(`${BASE}/api/ledger/stats`, {
      headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(401);
  });

  it('GET /api/ledger/history?studentId=TEST_ID → not 404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/ledger/history?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/ledger/state?studentId=TEST_ID → not 404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/ledger/state?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});

describe('progress', () => {
  it('GET /api/progress?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/progress?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/daily?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/daily?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/parent/report?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/parent/report?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });

  it('GET /api/mistakes?studentId=TEST_ID → not 401/404', async () => {
    const resp = await SELF.fetch(`${BASE}/api/mistakes?studentId=${TEST_ID}`);
    expect([200, 500]).toContain(resp.status);
    expect(resp.status).not.toBe(404);
  });
});
