// Phoenix-Architecti v1.0.0-seed — RUNG 0
// Minimal: POST /api/execute → CF Workers AI (qwen-coder-32b) → patch
// Hand-written by Sonnet crunch pass. Deploy this, prove the free path lives, then climb.

const VERSION = '1.0.0-seed';
const RUNG = 0;

const SYSTEM = `You are Phoenix-Architecti — elite code drone for the OB-1 empire.
L01 NO_FABRICATION — never guess. State what is missing.
L02 NO_STUBS — full implementation only. No TODO, no placeholders.
L03 STRONGEST_VERSION_FIRST — complete, hardened output immediately.
L04 RAW_OUTPUT — raw file content ONLY. No markdown fences. No backticks. No explanation. First character = first character of the file.
L06 ZERO_DRIFT — answer the task, nothing else.`;

function stripFences(text) {
  if (!text) return '';
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
}

async function handleExecute(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.task) return Response.json({ error: 'task required' }, { status: 400 });

  const parts = [];
  if (body.context) parts.push('CONTEXT:\n' + body.context);
  if (body.target)  parts.push('TARGET FILE: ' + body.target);
  parts.push('TASK:\n' + body.task);

  const messages = [
    { role: 'system', content: SYSTEM },
    { role: 'user',   content: parts.join('\n\n') }
  ];

  const model = body.model || '@cf/qwen/qwen2.5-coder-32b-instruct';
  const result = await env.AI.run(model, { messages, max_tokens: 8192 });
  const patch = stripFences(result.response ?? '');

  return Response.json({ patch, verified: false, model, rung: RUNG, version: VERSION });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-pa-auth',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    let response;
    if (request.method === 'POST' && url.pathname === '/api/execute') {
      response = await handleExecute(request, env);
    } else if (request.method === 'GET' && url.pathname === '/api/status') {
      response = Response.json({ version: VERSION, rung: RUNG, ai_bound: !!env.AI, status: 'SEED_LIVE' });
    } else {
      response = Response.json({ error: 'seed: only /api/execute and /api/status live', rung: RUNG }, { status: 404 });
    }

    const headers = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
    return new Response(response.body, { status: response.status, headers });
  }
};
