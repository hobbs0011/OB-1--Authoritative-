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
import { RaceRunner, handleSessionDeath } from './race.js';
import { runWatchdog, handleWatchdog } from './watchdog.js';
export { RaceRunner };

const VERSION = '1.0.0';

function addCors(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async scheduled(event, env) {
    await evaporatePheromones(env);
    await refreshAllBriefs(env).catch(() => {});
    await runPatternScanner(env).catch(() => {});
    await checkPccHealth(env).catch(() => {});
    await runOrchestrator(env).catch(() => {});
    await runWatchdog(env).catch(() => {});
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
      } else if (pathname.startsWith('/api/race/') && env.RACE_RUNNER) {
        const id = env.RACE_RUNNER.idFromName('singleton');
        const stub = env.RACE_RUNNER.get(id);
        const doPath = pathname.replace('/api/race', '');
        response = await stub.fetch(new Request('https://race' + doPath, request));
      } else if (pathname === '/api/watchdog/status') {
        response = await handleWatchdog(request, env);
      } else if (pathname === '/art-arsenal') {
        response = await handleArtArsenal(request, env);
      } else if (pathname.startsWith('/api/art')) {
        response = await handleArt(request, env);
      } else {
        response = Response.json({ error: 'Not found', version: VERSION }, { status: 404 });
      }
    } catch (err) {
      response = Response.json({ error: err.message || 'Internal error', version: VERSION }, { status: 500 });
    }

    return addCors(response, origin);
  },
};

