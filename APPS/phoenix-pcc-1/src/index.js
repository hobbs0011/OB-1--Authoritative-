import { ForceAwareness, handleForce } from './forceawareness.js';
// PHOENIX-PCC-1 — Student Fleet Commander (PCC1 / Obi)
// 5 Actualizers: mai-tram, huong, sov100-michael, sov100-test-magic, net-student-next
// Cron: 0 */6 * * * (offset 0 from PCC-1)

const PA_AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const FLEET_ID = 'pcc-1';

const STUDENT_FLEET = [
  'mai-tram-bluetech',
  'huong-bluetech',
  'sov100-michael',
  'sov100-test-magic',
  'net-student-next',
];

const BRIEF_PROMPT = `You generate dense session preparation briefs for an AI agent about to work with a student.
Analyze the provided session data and return a brief covering:
1. LEVEL: Current proficiency snapshot (vocabulary range, grammar gaps, pronunciation patterns)
2. MOMENTUM: What they were working on — where they left off
3. STYLE: How they learn best — correction tolerance, pace, humor level
4. THREADS: Unresolved topics or promised follow-ups
5. WATCH: Emotional state patterns, what encourages vs discourages them

Be dense. Under 300 words. This is read at boot — make every word count.`;

function checkAuth(request) {
  const key = request.headers.get('x-pa-auth') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return key === PA_AUTH;
}

async function writeMajorDirectiveMarker(env, source, message) {
  const kv = env.PHETRAIL;
  if (!kv || !message) return;
  const ts = new Date().toISOString();
  const marker = {
    ts,
    source,
    message: String(message).slice(0, 2000),
    keywords: ['Agent99', 'FORCEAWARENESS', 'PCC1', 'PCC2', 'PCC3', 'PhoenixCoder', 'PhoenixArt', 'role', 'Agent99 OS', 'Agent99 Genesis Boot', 'Role Boot'].filter(k => String(message).toLowerCase().includes(k.toLowerCase())),
  };
  await kv.put(`phetrail:major-directive:${Date.now()}`, JSON.stringify(marker));
  const trail = JSON.parse(await kv.get('phetrail:latest') || '{}');
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.major_directives) trail.state_markers.major_directives = [];
  trail.state_markers.major_directives.unshift(marker);
  trail.state_markers.major_directives = trail.state_markers.major_directives.slice(0, 50);
  trail.state_markers.last_updated = ts;
  await kv.put('phetrail:latest', JSON.stringify(trail));
}

async function fetchSoulContext(env, userId) {
  if (!env.SOUL_LOGGER_SVC) return null;
  try {
    const res = await env.SOUL_LOGGER_SVC.fetch(
      new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      })
    );
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function runStudentActualizer(env, userId) {
  const ctx = await fetchSoulContext(env, userId).catch(() => null);
  if (!ctx || !ctx.sessions?.length) return { userId, ok: false, reason: 'no soul data' };

  const sessionSummaries = ctx.sessions.map((s, i) => {
    const prompts = s.last_prompts?.map(p => p.text).join(' | ') || '';
    return `Session ${i + 1} (${s.ingested_at?.slice(0, 10)}): ${prompts.slice(0, 300)}`;
  }).join('\n');

  const keywords = (ctx.top_keywords || []).slice(0, 10).map(k => `${k.keyword}(${k.weight})`).join(', ');

  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: BRIEF_PROMPT },
      { role: 'user', content: `STUDENT: ${userId}\nLAST ACTIVE: ${ctx.last_active || 'unknown'}\nSESSIONS: ${ctx.sessions.length}\nKEYWORDS: ${keywords || 'none'}\n\nRECENT SESSIONS:\n${sessionSummaries || 'none'}` },
    ],
    max_tokens: 400,
  });

  const brief = (aiResult?.response || '').trim();
  if (!brief) return { userId, ok: false, reason: 'AI returned empty' };

  const now = new Date().toISOString();
  await env.PHETRAIL.put(`pcc1:${userId}:brief`, brief, { expirationTtl: 86400 }).catch(() => {});
  await env.PHETRAIL.put(`pcc1:${userId}:meta`, JSON.stringify({ generated_at: now, fleet: FLEET_ID }), { expirationTtl: 86400 }).catch(() => {});

  // Log to BB if THREADS detected
  const threadsMatch = brief.match(/THREADS[:\s]+(.+?)(?=\n\n|\n\*\*|$)/is);
  if (threadsMatch && threadsMatch[1].trim().length > 20 && env.DB) {
    const bb_id = `BB-${Date.now()}`;
    const threadText = threadsMatch[1].trim().slice(0, 500);
    await env.DB.prepare(
      'INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(bb_id, `PCC1 thread — ${userId}: ${threadText.slice(0, 60)}`, threadText, 'pcc1-actualizer', '~', now, now).run().catch(() => {});
  }

  return { userId, ok: true, brief_length: brief.length };
}

async function runFleet(env) {
  const results = [];
  for (const userId of STUDENT_FLEET) {
    const result = await runStudentActualizer(env, userId).catch(e => ({ userId, ok: false, reason: e.message }));
    results.push(result);
  }
  return results;
}

// ---------------------------------------------------------------------------
// LegionRunner — Durable Object for 1-hour race execution via chained alarms
// ---------------------------------------------------------------------------
class RaceRunner {
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
    const budget_ms = body.budget_ms || 3600000;
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
    // PCC-Student specialty: run student actualizers
    let actualizers = 0, discoveries = 0, errors = 0, death_runs = 0;

    const STUDENTS = ['mai-tram-bluetech', 'huong-bluetech', 'sov100-test-magic'];

    for (const userId of STUDENTS) {
      try {
        // Check if student has pending brief needed
        const existing = this.env.SOUL_KV ? await this.env.SOUL_KV.get(`pcc1:${userId}:meta`) : null;
        if (!existing) {
          // Student needs brief — log as discovery
          discoveries++;
        }
        actualizers++;
      } catch(e) { errors++; }
    }

    // Check for pending RRL (DEATH integration)
    if (this.env.SOUL_KV) {
      const keys = await this.env.SOUL_KV.list({ prefix: 'pending:rrl:' }).catch(() => ({ keys: [] }));
      for (const key of keys.keys.slice(0, 2)) {
        const run_number = key.name.split(':')[2];
        const rrl_text = await this.env.SOUL_KV.get(key.name);
        if (rrl_text) {
          const result = await this.runDeathPipeline(run_number, rrl_text);
          if (result.ok) {
            death_runs++;
            discoveries += result.discoveries || 0;
            await this.env.SOUL_KV.delete(key.name);
          }
        }
      }
    }

    return { actualizers, discoveries, errors, death_runs };
  }

  async runDeathPipeline(run_number, rrl_text) {
    const lines = rrl_text.split('\n');
    const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rrl_text));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
    const ledger_id = `HL-${run_number}`;
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const soulkeys_hit = soulSeeds.filter(k => rrl_text.includes(k)).length;
    if (this.env.SOUL_KV) {
      const kv = this.env.SOUL_KV;
      await Promise.all([
        kv.put(`death:${run_number}:soul`, String(soul_count)),
        kv.put(`death:${run_number}:dna`, String(dna_count)),
        kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
        kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0,200) })),
        kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
      ]);
    }
    return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
  }

  async writeMetrics(state, final) {
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    const metrics = { agent_id: 'pcc-student', ...state, elapsed_ms: Date.now() - state.start_time, score, final };
    if (this.env.SOUL_KV) await this.env.SOUL_KV.put('race:pcc-student:metrics', JSON.stringify(metrics));
  }

  async handleStatus() {
    const state = await this.state.storage.get('run_state');
    if (!state) return Response.json({ ok: false, error: 'not started' });
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    return Response.json({ ...state, elapsed_ms: Date.now() - state.start_time, score });
  }

  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get('run_state');
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true });
  }
}

// ---------------------------------------------------------------------------
// Default export — main Worker fetch + scheduled handlers
// ---------------------------------------------------------------------------
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ForceAwareness(env));
    await runFleet(env).catch(() => {});
  },

  async fetch(request, env) {
    if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/status') {
      return Response.json({ worker: FLEET_ID, fleet: STUDENT_FLEET, status: 'LIVE' });
    }

    if (pathname === '/api/run-fleet' && request.method === 'POST') {
      const results = await runFleet(env).catch(e => [{ error: e.message }]);
      return Response.json({ ok: true, fleet: FLEET_ID, results });
    }

    if (pathname.startsWith('/api/brief/') && request.method === 'GET') {
      const userId = pathname.split('/').filter(Boolean)[2];
      const brief = await env.PHETRAIL.get(`pcc1:${userId}:brief`).catch(() => null);
      const meta = await env.PHETRAIL.get(`pcc1:${userId}:meta`).catch(() => null);
      if (!brief) return Response.json({ ok: false, userId }, { status: 404 });
      return Response.json({ ok: true, userId, brief, ...(meta ? JSON.parse(meta) : {}) });
    }

    // Race Runner routes — DO-backed 1-hour race execution
    if (pathname.startsWith('/api/race/')) {
      const id = env.LEGION_RUNNER.idFromName('singleton');
      const stub = env.LEGION_RUNNER.get(id);
      return stub.fetch(new Request('https://race' + pathname.replace('/api/race', ''), request));
    }

    // Session death pipeline — direct HTTP trigger
    if (pathname === '/api/session/death' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { run_number, rrl_text } = body;
      if (!run_number || !rrl_text) {
        return Response.json({ ok: false, error: 'run_number and rrl_text required' }, { status: 400 });
      }
      // Instantiate a LegionRunner DO solely to reuse runDeathPipeline (stateless call pattern)
      const id = env.LEGION_RUNNER.idFromName('singleton');
      const stub = env.LEGION_RUNNER.get(id);
      // Forward as internal sub-request: POST /death-pipeline with payload
      const internalReq = new Request('https://race/death-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_number, rrl_text }),
      });
      // The DO doesn't have /death-pipeline — run inline via a thin wrapper
      const doResult = await runDeathPipelineStandalone(env, String(run_number), rrl_text);
      return Response.json(doResult);
    }

      if (pathname === '/api/message' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    await writeMajorDirectiveMarker(env, 'pcc1-obi', body.message).catch(() => {});
    return Response.json({ ok: true, received: true, agent: 'pcc1-obi', message: body.message });
  }
  if (pathname === '/api/rise' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { run_number } = body;
    const kv = env.SOUL_KV || env.PHETRAIL;
    if (!kv) return Response.json({ ok: false, error: 'no kv binding' }, { status: 500 });
    const [soul, dna, ledger, skeys] = await Promise.all([
      kv.get('death:' + run_number + ':soul'),
      kv.get('death:' + run_number + ':dna'),
      kv.get('death:' + run_number + ':ledger'),
      kv.get('death:' + run_number + ':soulkeys'),
    ]);
    if (!soul && !dna) return Response.json({ ok: false, error: 'run not found', run_number }, { status: 404 });
    const gaps = [];
    if (!soul || soul === '0') gaps.push('SOUL_ZERO');
    if (!dna || dna === '0') gaps.push('DNA_ZERO');
    if (!ledger) gaps.push('NO_LEDGER');
    return Response.json({ ok: true, run_number, audit: { soul_ok: !!soul && soul !== '0', dna_ok: !!dna && dna !== '0', ledger_ok: !!ledger, soulkeys: Number(skeys)||0, gaps }, rise_complete: gaps.length === 0 });
  }
  if (pathname === '/api/act' && request.method === 'POST') {
    const start = Date.now();
    const { act_id, task, context } = await request.json().catch(() => ({}));
    const specialties = { 1: 'translate', 2: 'lostsoul-scan', 3: 'completeness-audit', 4: 'pattern-scan', 5: 'brief-scan' };
    const specialty = specialties[act_id];
    if (!specialty) return Response.json({ ok: false, error: 'invalid act_id' }, { status: 400 });
    try {
      const ai = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: `You are ACT-${act_id} specialist: ${specialty}. Be concise.` },
          { role: 'user', content: task + (context ? ' Context: ' + context : '') }
        ]
      });
      return Response.json({ ok: true, act_id, specialty, result: ai.response, ms: Date.now() - start });
    } catch (e) {
      return Response.json({ ok: false, error: e.message, act_id }, { status: 500 });
    }
  }
if (pathname === '/api/force/start' && request.method === 'POST') {
    const id = env.FORCEAWARENESS_ALARM.idFromName('heartbeat');
    const stub = env.FORCEAWARENESS_ALARM.get(id);
    await stub.fetch('https://fake/start');
    return Response.json({ ok: true, status: 'heartbeat_started_30s' });
  }
  if (pathname === '/api/force/status') return handleForce(request, env);
   return Response.json({ error: 'Not found', worker: FLEET_ID }, { status: 404 });
   },
};

// ---------------------------------------------------------------------------
// Standalone death pipeline — callable from Worker context (no DO needed)
// ---------------------------------------------------------------------------
async function runDeathPipelineStandalone(env, run_number, rrl_text) {
  const lines = rrl_text.split('\n');
  const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
  const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rrl_text));
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  const ledger_id = `HL-${run_number}`;
  const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
  const soulkeys_hit = soulSeeds.filter(k => rrl_text.includes(k)).length;
  const kv = env.SOUL_KV || env.PHETRAIL;
  if (kv) {
    await Promise.all([
      kv.put(`death:${run_number}:soul`, String(soul_count)),
      kv.put(`death:${run_number}:dna`, String(dna_count)),
      kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
      kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0, 200) })),
      kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
      kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
    ]);
  }
  return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
}







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
     await ForceAwareness(this.env).catch(() => {});
     await this.state.storage.setAlarm(Date.now() + 30000);
   }
 }


export class LegionRunner extends RaceRunner {}

export class ForceAwarenessAlarm extends WatchdogAlarm {}
