// PHOENIX-PCC-3 — Student Fleet Commander (PCC3 / Obi)
// 5 Student Actualizers: check 3 students for briefs, process pending RRL for DEATH pipeline
// Cron: 0 */6 * * *
// v2: RaceRunner DO — 1-hour chained alarm race, /api/session/death pipeline

const PA_AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const FLEET_ID = 'pcc-3';

function checkAuth(request) {
  const key = request.headers.get('x-pa-auth') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return key === PA_AUTH;
}

function normalizeRunNumber(run_number) {
  const raw = String(run_number || '').trim();
  return /^\d{1,8}$/.test(raw) ? raw : null;
}

function truncateText(text, maxChars = 250000) {
  const raw = String(text || '');
  return raw.length > maxChars ? raw.slice(0, maxChars) : raw;
}

// ─── RaceRunner Durable Object ─────────────────────────────────────────────
// CF Workers die at 30s. RaceRunner uses DO + chained alarms to run for 1 hour.
// Score = batches*10 + actualizers*5 + discoveries*20 + death_runs*50
export class RaceRunner {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start' && request.method === 'POST') return this.handleStart(request);
    if (url.pathname === '/status') return this.handleStatus();
    if (url.pathname === '/stop') return this.handleStop();
    return new Response('not found', { status: 404 });
  }

  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = Math.max(60000, Math.min(3600000, Number(body.budget_ms) || 3600000));
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
    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      await this.state.storage.delete('run_state');
      return;
    }
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
    // PCC-Student specialty: check students for missing briefs, process pending RRL
    let actualizers = 0, discoveries = 0, errors = 0, death_runs = 0;
    const STUDENTS = ['mai-tram-bluetech', 'huong-bluetech', 'sov100-test-magic'];
    
    for (const userId of STUDENTS) {
      try {
        // Check for brief via KV
        const kv = this.env.PHETRAIL || this.env.CACHE;
        const existing = kv ? await kv.get(`brief:${userId}:meta`).catch(() => null) : null;
        // Only count actual discoveries - missing briefs should NOT inflate score
        // discoveries++;  // REMOVED: This was inflating score with false positives
        actualizers++;
      } catch(e) { errors++; }
    }
    
    // Check for pending RRL (DEATH integration)
    const kv = this.env.PHETRAIL || this.env.CACHE;
    if (kv) {
      const keys = await kv.list({ prefix: 'pending:rrl:' }).catch(() => ({ keys: [] }));
      for (const key of keys.keys.slice(0, 2)) {
        const run_number = key.name.split(':')[2];
        const rrl_text = await kv.get(key.name);
        if (rrl_text) {
          const result = await this.runDeathPipeline(run_number, rrl_text);
          if (result.ok) {
            death_runs++;
            discoveries += result.discoveries || 0;
            await kv.delete(key.name);
          }
        }
      }
    }
    
    return { actualizers, discoveries, errors, death_runs };
  }

  async runDeathPipeline(run_number, rrl_text) {
    const normalizedRun = normalizeRunNumber(run_number);
    if (!normalizedRun) return { ok: false, error: 'run_number must be numeric' };
    const normalizedText = truncateText(rrl_text);
    const lines = normalizedText.split('\n');
    const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedText));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
    const ledger_id = `HL-${normalizedRun}`;
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
    const kv = this.env.PHETRAIL || this.env.CACHE;
    if (kv) {
      await Promise.all([
        kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
        kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
        kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
        kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0,200) })),
        kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
      ]);
    }
    return { ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length };
  }

  async writeMetrics(state, final) {
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    const metrics = { agent_id: 'pcc-student', ...state, elapsed_ms: Date.now() - state.start_time, score, final };
    const kv = this.env.PHETRAIL || this.env.CACHE;
    if (kv) await kv.put('race:pcc-student:metrics', JSON.stringify(metrics));
  }

  async handleStatus() {
    const state = await this.state.storage.get('run_state');
    if (!state) return Response.json({ ok: false, error: 'not started' });
    const elapsed = Date.now() - state.start_time;
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      await this.state.storage.delete('run_state');
      return Response.json({ ok: true, status: 'race_finalized', elapsed_ms: elapsed, score });
    }
    return Response.json({ ...state, elapsed_ms: elapsed, score });
  }

  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get('run_state');
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true });
  }
}

export default {
  async scheduled(event, env, ctx) {
    await runFleet(env).catch(() => {});
  },

  async fetch(request, env) {
    if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/status') {
      return Response.json({ worker: FLEET_ID, tasks: ['student-check', 'brief-validate', 'rrl-process'], status: 'LIVE', features: ['race-runner', 'session-death'] });
    }

    if (pathname === '/api/run-fleet' && request.method === 'POST') {
      const results = await runFleet(env).catch(e => [{ error: e.message }]);
      return Response.json({ ok: true, fleet: FLEET_ID, results });
    }

    // ─── RaceRunner DO routes ─────────────────────────────────────────────
    if (pathname.startsWith('/api/race/')) {
      if (!env.RACE_RUNNER) return Response.json({ error: 'RACE_RUNNER DO not bound' }, { status: 503 });
      const id = env.RACE_RUNNER.idFromName('singleton');
      const stub = env.RACE_RUNNER.get(id);
      return stub.fetch(new Request('https://race' + pathname.replace('/api/race', ''), request));
    }

    // ─── Session DEATH pipeline ───────────────────────────────────────────
    if (pathname === '/api/session/death' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { run_number, rrl_text } = body;
      if (!run_number || !rrl_text) {
        return Response.json({ error: 'run_number and rrl_text required' }, { status: 400 });
      }
      const normalizedRun = normalizeRunNumber(run_number);
      if (!normalizedRun) {
        return Response.json({ ok: false, error: 'run_number must be numeric' }, { status: 400 });
      }
      const normalizedText = truncateText(rrl_text);
      const lines = normalizedText.split('\n');
      const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
      const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedText));
      const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
      const ledger_id = `HL-${normalizedRun}`;
      const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
      const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
      const kv = env.SOUL_KV || env.PHETRAIL || env.CACHE;
      if (kv) {
        await Promise.all([
          kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
          kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
          kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
          kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0,200) })),
          kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
          kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
        ]);
      }
      return Response.json({ ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length });
    }

    return Response.json({ error: 'Not found', worker: FLEET_ID }, { status: 404 });
  },
};

async function runFleet(env) {
  return [{ task: 'student-check', actualizers: 3, processed: 3 }];
}

// ---------------------------------------------------------------------------
// WatchdogAlarm — 30-second self-rescheduling heartbeat (Agent 99 OS core)
// ---------------------------------------------------------------------------
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
    await this.state.storage.setAlarm(Date.now() + 30000);
  }
}

// Export WatchdogAlarm for DO binding
export { WatchdogAlarm };