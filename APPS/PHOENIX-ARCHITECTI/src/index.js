// Phoenix-Architecti — T1 Code Drone
// Fixes: phoenix_architecti_log table, strip markdown fences, raw output only

function stripFences(text) {
  if (!text) return text;
  // Remove opening fence with optional language tag
  text = text.replace(/^```[a-zA-Z0-9]*\n?/m, '');
  // Remove closing fence
  text = text.replace(/\n?```\s*$/m, '');
  return text.trim();
}

async function callProvider(url, key, model, messages, extraHeaders = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, ...extraHeaders },
    body: JSON.stringify({ model, messages, max_tokens: 8192 })
  });
  if (response.status === 429) return null;
  if (!response.ok) throw new Error(url + ' error: ' + response.status + ' ' + await response.text());
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callLLM(env, messages) {
  const cacheKey = 'llm-' + btoa(encodeURIComponent(JSON.stringify(messages)).slice(0, 128));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  const tried = [];
  let result = null;

  if (result === null && env.CEREBRAS_API_KEY) {
    tried.push('Cerebras');
    result = await callProvider('https://api.cerebras.ai/v1/chat/completions', env.CEREBRAS_API_KEY, 'llama-3.3-70b', messages);
  }
  if (result === null && env.GROQ_API_KEY) {
    tried.push('Groq');
    result = await callProvider('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, 'llama-3.3-70b-versatile', messages);
  }
  if (result === null && env.OPENROUTER_API_KEY) {
    tried.push('OpenRouter');
    result = await callProvider('https://openrouter.ai/api/v1/chat/completions', env.OPENROUTER_API_KEY, 'openrouter/auto', messages, {
      'HTTP-Referer': 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev',
      'X-Title': 'Phoenix-Architecti'
    });
  }
  if (result === null) {
    tried.push('CF-Workers-AI');
    try {
      const aiResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
      result = aiResult.response ?? null;
    } catch (aiErr) {
      throw new Error('All inference tiers failed (' + tried.join(' → ') + '). Last: ' + aiErr.message);
    }
  }

  if (!result) throw new Error('All inference tiers returned empty (' + tried.join(' → ') + ')');
  await env.CACHE.put(cacheKey, result, { expirationTtl: 3600 });
  return result;
}

async function logToD1(env, task, result, taskType) {
  const id = 'PC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  try {
    await env.DB.prepare(
      'INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    ).bind(id, taskType, task.slice(0, 2000), result.slice(0, 4000), ).run();
  } catch (err) {
    console.error('D1 log failed:', err.message);
  }
  return id;
}

async function handleCode(request, env) {
  const body = await request.json();
  if (!body.task) return Response.json({ error: 'task is required' }, { status: 400 });

  const parts = [];
  if (body.context) parts.push('CONTEXT:\n' + body.context);
  if (body.targetfile) parts.push('TARGET FILE: ' + body.targetfile);
  parts.push('TASK:\n' + body.task);

  const messages = [
    {
      role: 'system',
      content: `You are Phoenix-Architecti — T1 code drone for the OB-1 empire.

LAWS:
L01 NO_FABRICATION — never guess. If context is missing, say what is missing.
L02 NO_STUBS — full implementation only. No "// TODO" or placeholder comments.
L03 STRONGEST_VERSION_FIRST — output the complete, hardened version immediately.
L04 RAW_OUTPUT — output the raw file content ONLY. NO markdown fences. NO backticks. NO explanation before or after. The first character of your response must be the first character of the file.
L06 ZERO_DRIFT — answer the task, nothing else. No preamble, no summary.`
    },
    { role: 'user', content: parts.join('\n\n') }
  ];

  const raw = await callLLM(env, messages);
  const result = stripFences(raw);
  const id = await logToD1(env, body.task, result, 'code');
  return Response.json({ code_patch: result, d1_row_id: id, task: body.task });
}

async function handleCrunch(request, env) {
  const body = await request.json();
  if (!body.rawtext) return Response.json({ error: 'rawtext is required' }, { status: 400 });

  const format = body.format || 'biblechapter';
  const formatInstructions = {
    biblechapter: 'Format as a Bible chapter. Number each block. Preserve ALL text verbatim including typos, CAPS, swearing. Add 1-2 sentence footnote per block explaining intent. End with exact block count.',
    summary: 'Extract the 5 most important decisions or facts. Numbered list. Exact, no editorializing.',
    laws: 'Extract all rules, laws, protocols, constraints. Format: LAW-NNN: name — description. Be exhaustive.'
  };

  const messages = [
    { role: 'system', content: 'You are Phoenix-Architecti — forensic scribe. L01 NO_FABRICATION. L06 ZERO_DRIFT. Output raw text only, no fences.' },
    { role: 'user', content: (formatInstructions[format] || formatInstructions.biblechapter) + '\n\nRAW TEXT:\n' + body.rawtext }
  ];

  const result = await callLLM(env, messages);
  const id = await logToD1(env, body.rawtext.slice(0, 200), result, 'crunch_' + format);
  return Response.json({ crunched: result, format, d1_row_id: id });
}

async function handleStatus(env) {
  let recent = [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, tasktype, taskinput, createdat FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT 5'
    ).all();
    recent = rows.results || [];
  } catch (err) {
    console.error('Status D1 query failed:', err.message);
  }
  return Response.json({ drone: 'phoenix-architecti', version: '1.1.0', status: 'LIVE', d1: 'soul-archive', table: 'phoenix_architecti_log', recenttasks: recent });
}

async function handleLog(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const type = url.searchParams.get('type');
  let rows;
  try {
    if (type) {
      rows = await env.DB.prepare('SELECT * FROM phoenix_architecti_log WHERE tasktype = ? ORDER BY createdat DESC LIMIT ?').bind(type, limit).all();
    } else {
      rows = await env.DB.prepare('SELECT * FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT ?').bind(limit).all();
    }
  } catch (err) {
    return Response.json({ error: err.message, count: 0, logs: [] });
  }
  return Response.json({ count: rows.results?.length || 0, logs: rows.results || [] });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { headers: CORS });

    try {
      let response;
      if (method === 'POST' && url.pathname === '/api/code') response = await handleCode(request, env);
      else if (method === 'POST' && url.pathname === '/api/crunch') response = await handleCrunch(request, env);
      else if (method === 'GET' && url.pathname === '/api/status') response = await handleStatus(env);
      else if (method === 'GET' && url.pathname === '/api/log') response = await handleLog(request, env);
      else response = Response.json({ error: 'Not found', drone: 'phoenix-architecti' }, { status: 404 });

      const headers = new Headers(response.headers);
      Object.entries(CORS).forEach(([k, v]) => headers.set(k, v));
      return new Response(response.body, { status: response.status, headers });
    } catch (err) {
      return Response.json({ error: err.message || 'Internal error', drone: 'phoenix-architecti' }, { status: 500, headers: CORS });
    }
  }
};
