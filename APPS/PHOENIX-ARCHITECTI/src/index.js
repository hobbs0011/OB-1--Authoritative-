// Phoenix-Architecti — Universal Code Drone v0.0.3
// T1=Dialagram STRICT (retry-on-5xx) | T10=Fallback cascade (Cerebras→Groq→CF-Qwen)
// T2=DeepSeek Flash | T3=DeepSeek Pro | T4=Opus 4.8
// v0.0.3: T1 5xx retry, Opus 4.8, mission runner on Qwen 3.7 Max.

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

// ── SSE collector — Dialagram always returns text/event-stream regardless of stream param ──
async function collectSSE(responseBody) {
  const reader = responseBody.getReader();
  const dec = new TextDecoder();
  let text = '';
  let buf = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop(); // keep incomplete line in buffer
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return text || null;
        try {
          const chunk = JSON.parse(raw);
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) text += delta;
        } catch (_) {}
      }
    }
  } finally {
    reader.releaseLock();
  }
  return text || null;
}

// ── OpenAI-compatible call — auto-detects SSE response ───────────────────────
async function callOpenAI(url, key, model, messages, extraHeaders = {}, extraBody = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, ...extraHeaders },
    body: JSON.stringify({ model, messages, max_tokens: 8192, ...extraBody })
  });
  if (res.status === 429) return null;
  if (!res.ok) throw new Error(url + ' ' + res.status + ': ' + await res.text());
  // Dialagram always returns SSE even without stream:true — detect and collect
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/event-stream')) return collectSSE(res.body);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

// ── Anthropic Messages API (T2) ───────────────────────────────────────────────
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
    body: JSON.stringify({ model: 'claude-opus-4-8', max_tokens: 8192, system: systemMsg, messages: userMsgs })
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

// ── Timeout race — Dialagram hangs indefinitely when its adapter is down ─────
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout ' + ms + 'ms')), ms))
  ]);
}

// ── Tier routing ──────────────────────────────────────────────────────────────
// T1:  Dialagram ONLY — strict, 12s timeout, fails loudly if Dialagram is down
// T10: Fallback cascade — Cerebras→Groq→CF-Qwen (no Dialagram)
// T2:  DeepSeek Flash (deepseek-chat)
// T3:  DeepSeek Pro   (deepseek-reasoner)
// T4:  Claude Opus 4.7 — final rulings only

// T10: explicit fallback cascade — no Dialagram, no silent degradation from T1
async function callT1Fallback(env, messages) {
  const tried = [];
  let result = null;
  if (env.CEREBRAS_API_KEY) {
    tried.push('Cerebras');
    // reasoning_effort:low required — without it all tokens go to chain-of-thought with no output content
    result = await withTimeout(
      callOpenAI('https://api.cerebras.ai/v1/chat/completions', env.CEREBRAS_API_KEY, 'gpt-oss-120b', messages, {}, { reasoning_effort: 'low' }),
      15000
    ).catch(() => null);
  }
  if (result === null && env.GROQ_API_KEY) {
    tried.push('Groq');
    result = await callOpenAI('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, 'llama-3.3-70b-versatile', messages).catch(() => null);
  }
  if (result === null) {
    tried.push('CF-Qwen');
    const aiResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
    result = aiResult.response ?? null;
  }
  if (!result) throw new Error('T10 fallback cascade failed (' + tried.join('→') + ')');
  return result;
}

async function callTier(env, tier, messages) {
  if (tier === 4 && env.ANTHROPIC_API_KEY) return callAnthropic(env, messages);
  if (tier === 3 && env.DEEPSEEK_API_KEY)  return callOpenAI('https://api.deepseek.com/v1/chat/completions', env.DEEPSEEK_API_KEY, 'deepseek-reasoner', messages);
  if (tier === 2 && env.DEEPSEEK_API_KEY)  return callOpenAI('https://api.deepseek.com/v1/chat/completions', env.DEEPSEEK_API_KEY, 'deepseek-chat', messages);
  if (tier === 10) return callT1Fallback(env, messages);

  // T1: Dialagram STRICT — no silent fallback. Retry once on 5xx only. Fails loudly otherwise.
  if (!env.DIALAGRAM_API_KEY) throw new Error('T1 Dialagram: DIALAGRAM_API_KEY not set — use tier:10 for fallback cascade');
  let result;
  try {
    result = await withTimeout(
      callOpenAI('https://dialagram.me/router/v1/chat/completions', env.DIALAGRAM_API_KEY, 'qwen-3.7-max', messages),
      30000
    );
  } catch (err) {
    if (err.message && err.message.includes(' 50')) {
      await new Promise(resolve => setTimeout(resolve, 500));
      result = await withTimeout(
        callOpenAI('https://dialagram.me/router/v1/chat/completions', env.DIALAGRAM_API_KEY, 'qwen-3.7-max', messages),
        30000
      ).catch(retryErr => { throw new Error('T1 Dialagram failed after retry (' + retryErr.message + ') — retry with tier:10 for fallback cascade'); });
    } else {
      throw new Error('T1 Dialagram failed (' + err.message + ') — retry with tier:10 for fallback cascade');
    }
  }
  if (!result) throw new Error('T1 Dialagram returned empty — retry with tier:10 for fallback cascade');
  return result;
}

// ── GitHub API helpers ────────────────────────────────────────────────────────
async function getFileFromGitHub(token, owner, repo, path) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'phoenix-architecti' }
  });
  if (!res.ok) throw new Error('GitHub read ' + path + ' ' + res.status);
  const data = await res.json();
  return { content: atob(data.content.replace(/\n/g, '')), sha: data.sha };
}

async function putFileToGitHub(token, owner, repo, path, content, sha, message) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'phoenix-architecti', 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ message, content: btoa(unescape(encodeURIComponent(content))) }, sha ? { sha } : {}))
  });
  if (!res.ok) throw new Error('GitHub write ' + path + ' ' + res.status + ': ' + await res.text());
  return await res.json();
}

// ── Mission runner ────────────────────────────────────────────────────────────
async function runMission(env, steps, commitMessage) {
  const missionId = 'MR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const results = [];
  const [owner, repo] = ['Phoenix-Rising-Ai-Solutions', 'OB-1--Authoritative-'];

  for (const step of steps) {
    try {
      const { content, sha } = await getFileFromGitHub(env.GITHUB_TOKEN, owner, repo, step.read);
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'CONTEXT:\n' + content + '\n\nTASK:\n' + step.task }
      ];
      const aiResult = await callTier(env, 1, messages);
      const patch = stripFences(aiResult ?? '');
      if (patch && step.write) {
        const writePath = step.write;
        const existing = await getFileFromGitHub(env.GITHUB_TOKEN, owner, repo, writePath).catch(() => null);
        await putFileToGitHub(env.GITHUB_TOKEN, owner, repo, writePath, patch, existing?.sha, commitMessage || 'phoenix-runner: ' + step.task.slice(0, 60));
      }
      results.push({ path: step.read, status: 'ok', chars: patch.length });
    } catch (err) {
      results.push({ path: step.read, status: 'error', error: err.message });
    }
  }

  try {
    await env.DB.prepare(
      'INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    ).bind(missionId, 'mission', JSON.stringify(steps).slice(0, 2000), JSON.stringify(results).slice(0, 4000)).run();
  } catch (_) {}

  return { mission_id: missionId, steps: results };
}

async function handleMission(request, env) {
  const authHeader = request.headers.get('x-pa-auth');
  if (env.PA_AUTH_SECRET && authHeader !== env.PA_AUTH_SECRET) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  if (!env.GITHUB_TOKEN) return Response.json({ error: 'GITHUB_TOKEN not set' }, { status: 500 });
  const body = await request.json();
  if (!body.steps?.length) return Response.json({ error: 'steps array required' }, { status: 400 });
  const result = await runMission(env, body.steps, body.commit_message);
  return Response.json(result);
}

// ── /v1/chat/completions — OpenAI-compat proxy for Kilo ──────────────────────
// Kilo points here instead of Dialagram directly. PA handles SSE internally
// and returns clean JSON or re-streams. Kilo inherits full T1 cascade + fallbacks.
async function handleOpenAICompat(request, env) {
  // Accept auth via x-pa-auth OR Authorization: Bearer <PA_AUTH_SECRET>
  const xAuth = request.headers.get('x-pa-auth');
  const bearer = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/, '');
  const validAuth = !env.PA_AUTH_SECRET || (xAuth === env.PA_AUTH_SECRET) || (bearer === env.PA_AUTH_SECRET);
  if (!validAuth) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const body = await request.json();
  const messages = body.messages || [];
  const wantsStream = body.stream === true;

  let content;
  try {
    content = await callTier(env, 1, messages);
  } catch (err) {
    return Response.json({ error: { message: err.message, type: 'server_error', code: 'cascade_failed' } }, { status: 500 });
  }

  const id = 'chatcmpl-' + Date.now();
  const created = Math.floor(Date.now() / 1000);
  const model = body.model || 'qwen-3.7-max';

  if (wantsStream) {
    // Re-emit as SSE so Kilo gets streaming UX even though we buffered internally
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    (async () => {
      try {
        // Chunk content into ~20-char pieces for smooth streaming appearance
        const CHUNK = 20;
        for (let i = 0; i < content.length; i += CHUNK) {
          const delta = content.slice(i, i + CHUNK);
          const evt = JSON.stringify({ id, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta: { content: delta }, finish_reason: null }] });
          await writer.write(encoder.encode('data: ' + evt + '\n\n'));
        }
        const done = JSON.stringify({ id, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
        await writer.write(encoder.encode('data: ' + done + '\n\n'));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } finally {
        await writer.close();
      }
    })();
    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-PA-Model': model }
    });
  }

  return Response.json({
    id, object: 'chat.completion', created, model,
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 0, completion_tokens: content?.length || 0, total_tokens: content?.length || 0 }
  });
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
  const authHeader = request.headers.get('x-pa-auth');
  if (env.PA_AUTH_SECRET && authHeader !== env.PA_AUTH_SECRET) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
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
    drone: 'phoenix-architecti', version: '0.0.3', status: 'LIVE',
    tiers: {
      t1:  (env.DIALAGRAM_API_KEY ? 'Dialagram-QwenMax ✓ (STRICT — no fallback)' : 'Dialagram NO KEY'),
      t10: 'Fallback cascade: ' + (env.CEREBRAS_API_KEY ? 'Cerebras-120B ✓' : 'Cerebras NO KEY') + '→' + (env.GROQ_API_KEY ? 'Groq ✓' : 'Groq NO KEY') + '→CF-Qwen',
      t2:  env.DEEPSEEK_API_KEY ? 'DeepSeek Flash (deepseek-chat) ✓' : 'DeepSeek NO KEY',
      t3:  env.DEEPSEEK_API_KEY ? 'DeepSeek Pro (deepseek-reasoner) ✓' : 'DeepSeek NO KEY',
      t4:  env.ANTHROPIC_API_KEY ? 'Claude Opus 4.8 ✓' : 'Anthropic NO KEY'
    },
    endpoints: { proxy: '/v1/chat/completions (OpenAI-compat, Kilo-ready)', code: '/api/code', mission: '/api/mission', crunch: '/api/crunch' },
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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-pa-auth, Authorization'
};

export default {
  async scheduled(event, env, ctx) {
    const steps = [
      { read: 'CLAUDE.md', task: 'Verify this file says 2-tier dispatch system (T1=Qwen, T2=Opus). If correct reply: VERIFIED 2-TIER OK. If stale reply: DRIFT DETECTED — [what is wrong].', write: null }
    ];
    await runMission(env, steps, 'cron: health check');
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    if (method === 'OPTIONS') return new Response(null, { headers: CORS });
    try {
      let response;
      if (method === 'POST' && url.pathname === '/api/code') response = await handleCode(request, env);
      else if (method === 'POST' && url.pathname === '/api/crunch') response = await handleCrunch(request, env);
      else if (method === 'POST' && url.pathname === '/api/mission') response = await handleMission(request, env);
      else if (method === 'POST' && url.pathname === '/v1/chat/completions') response = await handleOpenAICompat(request, env);
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
