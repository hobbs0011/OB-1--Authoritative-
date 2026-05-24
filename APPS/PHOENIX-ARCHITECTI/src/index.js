// Phoenix-Architecti — Universal Code Drone, all 5 tiers
// T1=free, T2=DS-Flash, T3=DS-Reasoner, T4=Gemini, T5=Anthropic direct

function stripFences(text) {
  if (!text) return text;
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
}

const SYSTEM_PROMPT = `You are Phoenix-Architecti — elite code drone for the OB-1 empire.
L01 NO_FABRICATION — never guess. State what is missing.
L02 NO_STUBS — full implementation only. No TODO, no placeholders.
L03 STRONGEST_VERSION_FIRST — complete, hardened output immediately.
L04 RAW_OUTPUT — raw file content ONLY. No markdown fences. No backticks. No explanation. First character = first character of the file.
L06 ZERO_DRIFT — answer the task, nothing else.`;

// ── OpenAI-compatible call (DeepSeek, Groq, Cerebras, OpenRouter) ────────────
async function callOpenAI(url, key, model, messages, extraHeaders = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, ...extraHeaders },
    body: JSON.stringify({ model, messages, max_tokens: 8192 })
  });
  if (res.status === 429) return null;
  if (!res.ok) throw new Error(url + ' ' + res.status + ': ' + await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

// ── Anthropic Messages API (T5) ───────────────────────────────────────────────
async function callAnthropic(env, messages) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || SYSTEM_PROMPT;
  const userMsgs = messages.filter(m => m.role !== 'system');
  const url = env.AIGATEWAYURL
    ? env.AIGATEWAYURL.replace(/\/$/, '') + '/anthropic/v1/messages'
    : 'https://api.anthropic.com/v1/messages';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      ...(env.CF_GATEWAY_TOKEN ? { 'cf-aig-authorization': 'Bearer ' + env.CF_GATEWAY_TOKEN } : {})
    },
    body: JSON.stringify({ model: 'claude-opus-4-20250514', max_tokens: 8192, system: systemMsg, messages: userMsgs })
  });
  if (!res.ok) throw new Error('Anthropic ' + res.status + ': ' + await res.text());
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}

// ── Gemini (T4) ───────────────────────────────────────────────────────────────
async function callGemini(env, messages) {
  const combined = messages.map(m => m.content).join('\n\n');
  const url = env.AIGATEWAYURL
    ? env.AIGATEWAYURL.replace(/\/$/, '') + '/google-ai-studio/v1/models/gemini-3.5-flash:generateContent?key=' + env.GEMINI_API_KEY
    : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + env.GEMINI_API_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.CF_GATEWAY_TOKEN ? { 'cf-aig-authorization': 'Bearer ' + env.CF_GATEWAY_TOKEN } : {})
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: combined }] }] })
  });
  if (!res.ok) throw new Error('Gemini ' + res.status + ': ' + await res.text());
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ── Tier routing ──────────────────────────────────────────────────────────────
async function callTier(env, tier, messages) {
  const gwBase = env.AIGATEWAYURL?.replace(/\/$/, '');
  const gwHeaders = env.CF_GATEWAY_TOKEN ? { 'cf-aig-authorization': 'Bearer ' + env.CF_GATEWAY_TOKEN } : {};

  if (tier >= 5 && env.ANTHROPIC_API_KEY) return callAnthropic(env, messages);
  if (tier >= 4 && env.GEMINI_API_KEY) return callGemini(env, messages);
  if (tier >= 3 && env.DEEPSEEK_API_KEY) {
    return callOpenAI('https://api.deepseek.com/v1/chat/completions', env.DEEPSEEK_API_KEY, 'deepseek-v4-pro', messages);
  }
  if (tier >= 2 && env.DEEPSEEK_API_KEY) {
    return callOpenAI('https://api.deepseek.com/v1/chat/completions', env.DEEPSEEK_API_KEY, 'deepseek-v4-flash', messages);
  }

  // T1 — free cascade
  const tried = [];
  let result = null;
  if (env.CEREBRAS_API_KEY) {
    tried.push('Cerebras');
    result = await callOpenAI('https://api.cerebras.ai/v1/chat/completions', env.CEREBRAS_API_KEY, 'llama-3.3-70b', messages);
  }
  if (result === null && env.GROQ_API_KEY) {
    tried.push('Groq');
    result = await callOpenAI('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, 'llama-3.3-70b-versatile', messages);
  }
  if (result === null) {
    tried.push('CF-Qwen');
    const aiResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
    result = aiResult.response ?? null;
  }
  if (!result) throw new Error('T1 free cascade failed (' + tried.join('→') + ')');
  return result;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
async function withCache(env, key, tier, fn) {
  const cacheKey = 'llm-t' + tier + '-' + btoa(encodeURIComponent(key).slice(0, 120));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;
  const result = await fn();
  if (result) await env.CACHE.put(cacheKey, result, { expirationTtl: 3600 });
  return result;
}

// ── D1 logging ────────────────────────────────────────────────────────────────
async function logToD1(env, task, result, taskType, tier) {
  const id = 'PC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  try {
    await env.DB.prepare(
      'INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    ).bind(id, taskType + '_t' + tier, task.slice(0, 2000), (result || '').slice(0, 4000)).run();
  } catch (err) {
    console.error('D1 log failed:', err.message);
  }
  return id;
}

// ── Handlers ──────────────────────────────────────────────────────────────────
async function handleCode(request, env) {
  const body = await request.json();
  if (!body.task) return Response.json({ error: 'task is required' }, { status: 400 });

  const tier = parseInt(body.tier || '1');
  const parts = [];
  if (body.context) parts.push('CONTEXT:\n' + body.context);
  if (body.targetfile) parts.push('TARGET FILE: ' + body.targetfile);
  parts.push('TASK:\n' + body.task);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n\n') }
  ];

  const raw = await withCache(env, body.task + body.context, tier, () => callTier(env, tier, messages));
  const result = stripFences(raw);
  const id = await logToD1(env, body.task, result, 'code', tier);
  return Response.json({ code_patch: result, d1_row_id: id, task: body.task, tier });
}

async function handleCrunch(request, env) {
  const body = await request.json();
  if (!body.rawtext) return Response.json({ error: 'rawtext is required' }, { status: 400 });
  const tier = parseInt(body.tier || '1');
  const format = body.format || 'biblechapter';
  const instructions = {
    biblechapter: 'Format as a Bible chapter. Number each block. Preserve ALL text verbatim including typos, CAPS, swearing. Add 1-2 sentence footnote per block explaining intent. End with exact block count.',
    summary: 'Extract the 5 most important decisions or facts. Numbered list. Exact, no editorializing.',
    laws: 'Extract all rules, laws, protocols, constraints. Format: LAW-NNN: name — description. Exhaustive.'
  };
  const messages = [
    { role: 'system', content: 'You are Phoenix-Architecti — forensic scribe. L01 NO_FABRICATION. L06 ZERO_DRIFT. Raw text output only, no fences.' },
    { role: 'user', content: (instructions[format] || instructions.biblechapter) + '\n\nRAW TEXT:\n' + body.rawtext }
  ];
  const result = await withCache(env, body.rawtext.slice(0, 200) + format, tier, () => callTier(env, tier, messages));
  const id = await logToD1(env, body.rawtext.slice(0, 200), result, 'crunch_' + format, tier);
  return Response.json({ crunched: result, format, d1_row_id: id, tier });
}

async function handleStatus(env) {
  let recent = [];
  try {
    const rows = await env.DB.prepare('SELECT id, tasktype, taskinput, createdat FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT 5').all();
    recent = rows.results || [];
  } catch (err) {}
  return Response.json({
    drone: 'phoenix-architecti', version: '0.0.1', status: 'LIVE',
    tiers: {
      t1: 'free — Cerebras→Groq→CF-Qwen',
      t2: env.DEEPSEEK_API_KEY ? 'deepseek-v4-flash ✓' : 'NO KEY',
      t3: env.DEEPSEEK_API_KEY ? 'deepseek-v4-pro ✓' : 'NO KEY',
      t4: env.GEMINI_API_KEY ? 'gemini-3.5-flash ✓' : 'NO KEY',
      t5: env.ANTHROPIC_API_KEY ? 'claude-opus-4-20250514 ✓' : 'NO KEY'
    },
    gateway: env.AIGATEWAYURL ? 'CF AI Gateway ✓' : 'direct API',
    recenttasks: recent
  });
}

async function handleLog(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const type = url.searchParams.get('type');
  let rows;
  try {
    rows = type
      ? await env.DB.prepare('SELECT * FROM phoenix_architecti_log WHERE tasktype = ? ORDER BY createdat DESC LIMIT ?').bind(type, limit).all()
      : await env.DB.prepare('SELECT * FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT ?').bind(limit).all();
  } catch (err) {
    return Response.json({ error: err.message, count: 0, logs: [] });
  }
  return Response.json({ count: rows.results?.length || 0, logs: rows.results || [] });
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

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
