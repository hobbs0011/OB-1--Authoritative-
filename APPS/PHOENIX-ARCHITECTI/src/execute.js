import { checkAdminKey, sanitizeInput } from './security.js';
import { verify } from './verify.js';
import { logToD1 } from './logger.js';
import { isCodeTask, inferMaxTokens, compressContext, cacheKey } from './tokens.js';
import { recallFragments } from './memory.js';

const SYSTEM_PROMPT = `You are Phoenix-Architecti — elite code drone for the OB-1 empire.
L01 NO_FABRICATION — never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS — full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST — complete, production-ready output immediately.
L04 RAW_OUTPUT — raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION — NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT — answer the task only. No commentary before or after the code.`;

function stripFences(text) {
  if (!text) return '';
  const s = typeof text === 'string' ? text : String(text);
  return s.replace(/^```[a-zA-Z0-9]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
}

function stripThinkTags(text) {
  if (!text) return '';
  return text.replace(/[\s\S]*?/gi, '').trim();
}

export async function handleExecute(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'invalid JSON' }, { status: 400 });

  const task = sanitizeInput(body.task, 10000);
  let context = compressContext(sanitizeInput(body.context, 50000));
  const { target, model } = body;
  const tier = parseInt(body.tier) || 1;

  if (!task) return Response.json({ error: 'task required' }, { status: 400 });

  // Context bloat guard
  if (context.length > task.length * 20 && context.length > 5000) {
    console.warn(`CONTEXT_BLOAT: ctx=${context.length} task=${task.length}`);
  }

  // KV cache check — skip for T2 paid (don't serve stale on expensive calls)
  const ck = await cacheKey(task, context);
  if (tier !== 2 && env.CACHE) {
    const cached = await env.CACHE.get('cache:' + ck).catch(() => null);
    if (cached) {
      return Response.json({ patch: cached, verified: true, model: 'kv-cache', d1_id: null, version: '1.1.0', cached: true });
    }
  }

  // Pheromone memory recall
  if (env.DNA_INDEX) {
    try {
      const results = await recallFragments(task, env, { type: 'both', topK: 3 });
      if (results.length > 0) {
        const pheromoneMemory = results.map((result, index) => `[${index + 1}] score=${result.score.toFixed(3)} run=${result.metadata?.run} type=${result.label}: ${(result.metadata?.text_preview || '').slice(0, 150)}`).join('\n');
        context = `PHEROMONE_MEMORY (semantic recall):\n${pheromoneMemory}\n\n${context}`;
      }
    } catch (error) {
      console.warn('Error recalling fragments:', error);
    }
  }

  const maxToks = inferMaxTokens(task, context);
  const codeTask = isCodeTask(task);

  const parts = [];
  if (context) parts.push('CONTEXT:\n' + context);
  if (target) parts.push('TARGET FILE: ' + target);
  parts.push('TASK:\n' + task);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n\n') },
  ];

  let aiResult;
  let usedModel = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  let tierUsed = 1;

  // T2 paid: DeepSeek Flash
  if (tier === 2 && env.DEEPSEEK_API_KEY) {
    try {
      const dsResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: Math.max(maxToks, 2048) }),
      });
      if (dsResp.ok) {
        const dsJson = await dsResp.json();
        if (dsJson.choices?.[0]?.message?.content) {
          aiResult = { response: dsJson.choices[0].message.content };
          usedModel = 'deepseek-chat';
          tierUsed = 2;
        }
      }
    } catch (_) {}
  }

  // T2-FREE: DeepSeek R1 Distill 32B (reasoning)
  if (tier === 2 && !aiResult) {
    try {
      const r1Result = await env.AI.run('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', { messages, max_tokens: maxToks });
      if (r1Result?.response) {
        aiResult = { response: stripThinkTags(r1Result.response) };
        usedModel = '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';
        tierUsed = 2;
      }
    } catch (_) {}
  }

  // T10 first for code tasks: Qwen 2.5 Coder specialized model
  if (!aiResult && codeTask) {
    try {
      const qwenResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: maxToks });
      if (qwenResult?.response) {
        aiResult = qwenResult;
        usedModel = '@cf/qwen/qwen2.5-coder-32b-instruct';
        tierUsed = 10;
      }
    } catch (_) {}
  }

  // T1: Llama 3.3 70B (general + code fallback)
  if (!aiResult) {
    try {
      aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: maxToks });
      usedModel = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
      tierUsed = 1;
    } catch (_) {}
  }

  // T10 fallback for non-code tasks
  if (!aiResult) {
    aiResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: maxToks });
    usedModel = '@cf/qwen/qwen2.5-coder-32b-instruct';
    tierUsed = 10;
  }

  const patch = stripFences(aiResult.response ?? '');
  const verifyResult = verify(patch);

  // Cache successful results
  if (tier !== 2 && env.CACHE && patch.length > 0) {
    env.CACHE.put('cache:' + ck, patch, { expirationTtl: 3600 }).catch(() => {});
  }

  const d1_id = await logToD1(env, {
    action: 'execute',
    task,
    result: patch,
    tier: tierUsed,
    ip: request.headers.get('CF-Connecting-IP') || '',
  });

  return Response.json({
    patch,
    verified: verifyResult.ok,
    verify_error: verifyResult.error || null,
    model: usedModel,
    d1_id,
    version: '1.1.0',
    max_tokens_used: maxToks,
    code_routed: codeTask && tierUsed === 10,
  });
}
