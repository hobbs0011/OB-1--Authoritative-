import { checkAdminKey, sanitizeInput } from './security.js';
import { verify } from './verify.js';
import { logToD1 } from './logger.js';

const SYSTEM_PROMPT = `You are Phoenix-Architecti — elite code drone for the OB-1 empire.
L01 NO_FABRICATION — never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS — full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST — complete, production-ready output immediately.
L04 RAW_OUTPUT — raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION — NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT — answer the task only. No commentary before or after the code.`;

function stripFences(text) {
  if (!text) return '';
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
}

function stripThinkTags(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

async function runTier(env, messages, tier) {
  // T2: DeepSeek Flash paid
  if (tier === 2 && env.DEEPSEEK_API_KEY) {
    try {
      const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 4096 }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.choices?.[0]?.message?.content) return { text: j.choices[0].message.content, model: 'deepseek-chat' };
      }
    } catch (_) {}
  }
  // T2-FREE: R1 Distill
  if (tier === 2) {
    try {
      const r = await env.AI.run('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', { messages, max_tokens: 8192 });
      if (r?.response) return { text: stripThinkTags(r.response), model: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b' };
    } catch (_) {}
  }
  // T1: Llama 70B
  try {
    const r = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 8192 });
    if (r?.response) return { text: r.response, model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' };
  } catch (_) {}
  // T10: Qwen fallback
  const r = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
  return { text: r?.response ?? '', model: '@cf/qwen/qwen2.5-coder-32b-instruct' };
}

export async function handleBatch(request, env) {
  const adminResp = await checkAdminKey(request, env);
  if (adminResp !== null) return adminResp;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.tasks) || body.tasks.length === 0) {
    return Response.json({ error: 'tasks array required' }, { status: 400 });
  }

  const globalTier = parseInt(body.global_tier) || 1;
  const results = [];

  for (let i = 0; i < body.tasks.length; i++) {
    const t = body.tasks[i];
    const tier = parseInt(t.tier) || globalTier;
    const task = sanitizeInput(t.task, 10000);
    const context = sanitizeInput(t.context, 40000);
    const target = t.targetfile || '';
    const stepStart = Date.now();

    if (!task) { results.push({ index: i, error: 'task required', patch: '', verified: false }); continue; }

    const parts = [];
    if (context) parts.push('CONTEXT:\n' + context);
    if (target) parts.push('TARGET FILE: ' + target);
    parts.push('TASK:\n' + task);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: parts.join('\n\n') },
    ];

    const { text, model } = await runTier(env, messages, tier);
    const patch = stripFences(text);
    const verifyResult = verify(patch);

    results.push({ index: i, task, patch, verified: verifyResult.ok, model, ms: Date.now() - stepStart });
  }

  await logToD1(env, {
    action: 'batch',
    task: `batch:${body.tasks.length}tasks`,
    result: `${results.filter(r => r.verified).length}/${results.length} verified`,
    tier: globalTier,
    ip: request.headers.get('CF-Connecting-IP') || '',
  });

  return Response.json({
    batch_id: 'BR-' + Date.now(),
    results,
    all_verified: results.every(r => r.verified),
    count: results.length,
  });
}
