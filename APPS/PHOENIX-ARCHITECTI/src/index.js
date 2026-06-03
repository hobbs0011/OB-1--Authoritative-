import { securityMiddleware, getCorsHeaders } from './security.js';
import { handleExecute } from './execute.js';
import { handleMission } from './mission.js';
import { handleSwarm } from './swarm.js';
import { handleBlueprint } from './blueprint.js';
import { handleStatus } from './status.js';

const VERSION = '1.0.0';

function addCors(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}

export default {
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
      if (method === 'POST' && (pathname === '/api/execute' || pathname === '/api/code')) {
        response = await handleExecute(request, env);
      } else if (method === 'POST' && pathname === '/api/mission') {
        response = await handleMission(request, env);
      } else if (method === 'POST' && pathname === '/api/swarm') {
        response = await handleSwarm(request, env);
      } else if (method === 'POST' && pathname === '/api/blueprint') {
        response = await handleBlueprint(request, env);
      } else if (method === 'GET' && pathname === '/api/status') {
        response = await handleStatus(env);
      } else {
        response = Response.json({ error: 'Not found', version: VERSION }, { status: 404 });
      }
    } catch (err) {
      response = Response.json({ error: err.message || 'Internal error', version: VERSION }, { status: 500 });
    }

    return addCors(response, origin);
  },
};
