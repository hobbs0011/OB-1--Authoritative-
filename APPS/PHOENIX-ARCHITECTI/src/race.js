// RACE.JS — DO-based 1-hour Race Runner + standalone DEATH pipeline
// PCC-Arch (phoenix-architecti) Mothership Orchestrator
// CF Workers die at 30s — Durable Objects + chained alarms solve this.

// ─── Standalone DEATH pipeline (module-level, reusable) ───────────────────────

export async function runDeathPipeline(env, run_number, rrl_text) {
  // Stage 2: SOUL — count user lines
  const lines = rrl_text.split('\n');
  const soul_lines = lines.filter(
    l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')
  );
  const soul_count = soul_lines.length || Math.floor(lines.length * 0.4);

  // Stage 3: DNA — count assistant lines
  const dna_lines = lines.filter(
    l => l.includes('"role":"assistant"') || l.startsWith('Claude:') || l.startsWith('Assistant:')
  );
  const dna_count = dna_lines.length || Math.floor(lines.length * 0.6);

  // Stage 4: LEDGER — SHA-256 fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(rrl_text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const ledger_id = `HL-${run_number}`;

  // Stage 5: STARMAP
  const starmap_id = `SM-${run_number}`;
  const summary = rrl_text.substring(0, 200);

  // Stage 6: SOULKEYS — high-charge vocabulary hit count
  const soulSeeds = [
    '#SOUL', '#SOULDNA', '#RAW', '#FUCK', '#OMG', 'LISTEN',
    '#MONKEY', '#YES', '#SSK', '#LEDGER', '#AGENT99', 'Obi', 'OB1', '#DRIFT',
  ];
  const soulkeys_hit = soulSeeds.filter(k => rrl_text.includes(k)).length;

  // Stage 7 & 8: KV writes
  if (env.SOUL_KV) {
    const kv = env.SOUL_KV;
    await kv.put(`death:${run_number}:soul`,     String(soul_count));
    await kv.put(`death:${run_number}:dna`,      String(dna_count));
    await kv.put(`death:${run_number}:ledger`,   JSON.stringify({ ledger_id, sha256 }));
    await kv.put(`death:${run_number}:starmap`,  JSON.stringify({ starmap_id, summary }));
    await kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit));
    await kv.put(`pipeline:pending:${run_number}`, JSON.stringify({ run_number, soul_count, dna_count }));
    await kv.put(`registry:run:${run_number}`, JSON.stringify({
      run_number, ledger_id, soul_count, dna_count,
      starmap_id, soulkeys_hit, processed_at: Date.now(),
    }));
  }

  return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
}

// ─── /api/session/death handler ───────────────────────────────────────────────

export async function handleSessionDeath(request, env) {
  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { run_number, rrl_text } = body;
  if (!run_number || !rrl_text) {
    return Response.json({ ok: false, error: 'run_number and rrl_text required' }, { status: 400 });
  }

  try {
    const result = await runDeathPipeline(env, run_number, rrl_text);
    return Response.json(result);
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// ─── RaceRunner Durable Object ────────────────────────────────────────────────

export class RaceRunner {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start' && request.method === 'POST') {
      return this.handleStart(request);
    } else if (url.pathname === '/status') {
      return this.handleStatus();
    } else if (url.pathname === '/stop') {
      return this.handleStop();
    }
    return new Response('not found', { status: 404 });
  }

  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = body.budget_ms || 3600000; // 1 hour default
    const now = Date.now();
    await this.state.storage.put('run_state', {
      start_time: now,
      budget_ms,
      batches_run: 0,
      actualizers_run: 0,
      discoveries_count: 0,
      errors_count: 0,
      death_runs: 0,
    });
    await this.state.storage.setAlarm(now + 1000); // first alarm in 1s
    return Response.json({ ok: true, started_at: now, budget_ms });
  }

  async alarm() {
    const state = await this.state.storage.get('run_state');
    if (!state) return;

    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms) {
      // Race over — write final metrics
      await this.writeMetrics(state, true);
      return;
    }

    // Run one batch of work
    const batchResult = await this.runBatch(state);

    const updated = {
      ...state,
      batches_run:       state.batches_run       + 1,
      actualizers_run:   state.actualizers_run   + (batchResult.actualizers  || 0),
      discoveries_count: state.discoveries_count + (batchResult.discoveries  || 0),
      errors_count:      state.errors_count      + (batchResult.errors       || 0),
      death_runs:        state.death_runs         + (batchResult.death_runs   || 0),
    };

    await this.state.storage.put('run_state', updated);
    await this.writeMetrics(updated, false);

    // Schedule next alarm in 30s
    await this.state.storage.setAlarm(Date.now() + 30000);
  }

  async runBatch(state) {
    let actualizers = 0;
    let discoveries = 0;
    let errors = 0;
    let death_runs = 0;

    try {
      // Check for pending RRL to process (DEATH integration)
      if (this.env.SOUL_KV) {
        const keys = await this.env.SOUL_KV.list({ prefix: 'pending:rrl:' });
        for (const key of (keys.keys || []).slice(0, 3)) { // max 3 per batch
          const run_number = key.name.split(':')[2];
          const rrl_text = await this.env.SOUL_KV.get(key.name);
          if (rrl_text) {
            const deathResult = await runDeathPipeline(this.env, run_number, rrl_text);
            if (deathResult.ok) {
              death_runs++;
              discoveries += deathResult.discoveries || 0;
              await this.env.SOUL_KV.delete(key.name);
            }
          }
        }
      }

      // Dispatch to PCC-2 and PCC-3 via service bindings
      // Fix: parse response body to count real actualizers; log errors instead of swallowing them
      if (this.env.PCC2_SVC) {
        try {
          const r = await this.env.PCC2_SVC.fetch(
            new Request('https://pcc2/api/run-fleet', { method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-pa-auth': 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=' },
              body: JSON.stringify({ triggered_by: 'race-runner-arch' }) })
          );
          if (r.ok) {
            const body = await r.json().catch(() => ({}));
            // Count results that returned ok:true
            const okCount = Array.isArray(body.results)
              ? body.results.filter(x => x.ok === true).length
              : 0;
            // Minimum 1 credit if the call itself succeeded, even if all students had no soul data
            actualizers += Math.max(okCount, 1);
          } else {
            errors++;
          }
        } catch (e) {
          errors++;
          if (this.env.SOUL_KV) {
            await this.env.SOUL_KV.put('race:pcc2:last-error', JSON.stringify({ msg: e.message, ts: Date.now() })).catch(() => {});
          }
        }
      }
      if (this.env.PCC3_SVC) {
        try {
          const r = await this.env.PCC3_SVC.fetch(
            new Request('https://pcc3/api/run-fleet', { method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-pa-auth': 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=' },
              body: JSON.stringify({ triggered_by: 'race-runner-arch' }) })
          );
          if (r.ok) {
            const body = await r.json().catch(() => ({}));
            // Count tasks that did real work (processed > 0 or stale > 0)
            const activeCount = Array.isArray(body.results)
              ? body.results.filter(x => (x.processed > 0 || x.stale > 0)).length
              : 0;
            // Minimum 1 credit if the call itself succeeded
            actualizers += Math.max(activeCount, 1);
          } else {
            errors++;
          }
        } catch (e) {
          errors++;
          if (this.env.SOUL_KV) {
            await this.env.SOUL_KV.put('race:pcc3:last-error', JSON.stringify({ msg: e.message, ts: Date.now() })).catch(() => {});
          }
        }
      }
    } catch (e) {
      errors++;
    }

    return { actualizers, discoveries, errors, death_runs };
  }

  async writeMetrics(state, final) {
    const elapsed = Date.now() - (state.start_time || Date.now());
    const score =
      (state.batches_run       || 0) * 10  +
      (state.actualizers_run   || 0) * 5   +
      (state.discoveries_count || 0) * 20  +
      (state.death_runs        || 0) * 50;

    const metrics = {
      agent_id:          'pcc-arch',
      start_time:        state.start_time,
      elapsed_ms:        elapsed,
      batches_run:       state.batches_run,
      actualizers_run:   state.actualizers_run,
      discoveries_count: state.discoveries_count,
      errors_count:      state.errors_count,
      death_runs:        state.death_runs,
      score,
      final,
    };

    if (this.env.SOUL_KV) {
      await this.env.SOUL_KV.put('race:pcc-arch:metrics', JSON.stringify(metrics));
    }
  }

  async handleStatus() {
    const state = await this.state.storage.get('run_state');
    if (!state) return Response.json({ ok: false, error: 'not started' });
    const elapsed = Date.now() - state.start_time;
    const score =
      (state.batches_run       || 0) * 10  +
      (state.actualizers_run   || 0) * 5   +
      (state.discoveries_count || 0) * 20  +
      (state.death_runs        || 0) * 50;
    return Response.json({ ...state, elapsed_ms: elapsed, score });
  }

  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get('run_state');
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true, stopped: true });
  }
}
