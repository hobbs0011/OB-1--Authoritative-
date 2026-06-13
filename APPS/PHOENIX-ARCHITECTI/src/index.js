import { securityMiddleware, getCorsHeaders } from './security.js';
import { handleExecute } from './execute.js';
import { handleBatch } from './batch.js';
import { handleMission } from './mission.js';
import { handleSwarm } from './swarm.js';
import { handleBlueprint } from './blueprint.js';
import { handleStatus, handleProbe, handleCapabilityTest } from './status.js';
import { handleCompletions } from './completions.js';
import { handleEmbed, handleRecall, handleIngest, evaporatePheromones } from './memory.js';
import { handlePipeline } from './pipeline.js';
import { handleActualizer, refreshAllBriefs, checkPccHealth } from './actualizer.js';
import { handleTranslate } from './translate.js';
import { handleBackburner } from './backburner.js';
import { handleArt } from './art.js';
import { handleArtArsenal } from './art-arsenal.js';
import { handleIncarnate, runPatternScanner } from './incarnate.js';
import { handleOrchestrate, runOrchestrator } from './orchestrate.js';
import { LegionRunner, handleSessionDeath } from './race.js';
import { ForceAwareness, handleForce } from './forceawareness.js';
export { LegionRunner };

const VERSION = '1.0.0';

function addCors(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
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

export default {
async scheduled(event, env) {
    await evaporatePheromones(env);
    await refreshAllBriefs(env).catch(() => {});
    await runPatternScanner(env).catch(() => {});
    await checkPccHealth(env).catch(() => {});
    await runOrchestrator(env).catch(() => {});
    await ForceAwareness(env).catch(() => {});
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    const secResp = await securityMiddleware(request, env);
    if (secResp) return addCors(secResp, origin);

    const { pathname } = url;
    const method = request.method;

    let response;
    try {
      if (method === 'POST' && pathname === '/api/batch') {
        response = await handleBatch(request, env);
      } else if (method === 'POST' && (pathname === '/api/execute' || pathname === '/api/code')) {
        response = await handleExecute(request, env);
      } else if (method === 'POST' && pathname === '/api/mission') {
        response = await handleMission(request, env);
      } else if (method === 'POST' && pathname === '/api/swarm') {
        response = await handleSwarm(request, env);
      } else if (method === 'POST' && pathname === '/api/blueprint') {
        response = await handleBlueprint(request, env);
      } else if (method === 'GET' && pathname === '/api/status') {
        response = await handleStatus(env);
      } else if (method === 'GET' && pathname === '/api/probe') {
        response = await handleProbe(request, env);
      } else if (method === 'GET' && pathname === '/api/capabilities') {
        response = await handleCapabilityTest(env);
      } else if (method === 'POST' && pathname === '/v1/chat/completions') {
        response = await handleCompletions(request, env);
      } else if (method === 'POST' && pathname === '/api/embed') {
        response = await handleEmbed(request, env);
      } else if (method === 'GET' && pathname === '/api/recall') {
        response = await handleRecall(request, env);
      } else if (method === 'POST' && pathname === '/api/ingest') {
        response = await handleIngest(request, env);
      } else if (method === 'POST' && pathname === '/api/pipeline') {
        response = await handlePipeline(request, env);
      } else if (pathname === '/api/actualizer' || pathname.startsWith('/api/actualizer/')) {
        response = await handleActualizer(request, env);
      } else if (method === 'POST' && pathname === '/api/translate') {
        response = await handleTranslate(request, env);
      } else if (pathname === '/api/backburner' || pathname.startsWith('/api/backburner/')) {
        response = await handleBackburner(request, env);
      } else if (pathname.startsWith('/api/incarnate') || pathname.startsWith('/api/metrics/pcc')) {
        response = await handleIncarnate(request, env);
      } else if (pathname.startsWith('/api/orchestrate')) {
        response = await handleOrchestrate(request, env);
      } else if (method === 'POST' && pathname === '/api/session/death') {
        response = await handleSessionDeath(request, env);
      } else if (pathname.startsWith('/api/race/') && env.LEGION_RUNNER) {
        const id = env.LEGION_RUNNER.idFromName('singleton');
        const stub = env.LEGION_RUNNER.get(id);
        const doPath = pathname.replace('/api/race', '');
        response = await stub.fetch(new Request('https://race' + doPath, request));
} else if (pathname === '/api/force/start' && request.method === 'POST') {
     const id = env.FORCEAWARENESS_ALARM.idFromName('heartbeat');
     const stub = env.FORCEAWARENESS_ALARM.get(id);
     await stub.fetch('https://fake/start');
     return Response.json({ ok: true, status: 'heartbeat_started_30s' });
   }
   if (pathname === '/api/force/status') {
         response = await handleForce(request, env);
       } else if (pathname === '/api/message' && method === 'POST') {
         const body = await request.json().catch(() => ({}));
         await writeMajorDirectiveMarker(env, 'pcc3-windu', body.message).catch(() => {});
         response = Response.json({ ok: true, received: true, agent: 'pcc3-windu', message: body.message });
       } else if (pathname === '/art-arsenal') {
        response = await handleArtArsenal(request, env);
      } else if (pathname.startsWith('/api/art')) {
        response = await handleArt(request, env);
      } else {
  if (pathname === '/api/rise' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { run_number } = body;
    const kv = env.PHETRAIL;
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
        response = Response.json({ error: 'Not found', version: VERSION }, { status: 404 });
      }
    } catch (err) {
      response = Response.json({ error: err.message || 'Internal error', version: VERSION }, { status: 500 });
    }

    return addCors(response, origin);
  },
};






// ---------------------------------------------------------------------------
// LegionRunner — 30-second self-rescheduling heartbeat (Agent 99 OS core)
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
     await ForceAwareness(this.env).catch(() => {});
     await this.state.storage.setAlarm(Date.now() + 30000);
   }
}


export class ForceAwarenessAlarm extends WatchdogAlarm {}
