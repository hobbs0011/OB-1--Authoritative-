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

export async function handleExecute(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'invalid JSON' }, { status: 400 });

  const task = sanitizeInput(body.task, 10000);
  const context = sanitizeInput(body.context, 50000);
  const { target, model } = body;
  const tier = parseInt(body.tier) || 10;

  if (!task) return Response.json({ error: 'task required' }, { status: 400 });

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

  // T2: DeepSeek Flash (deepseek-chat via api.deepseek.com)
  if (tier === 2 && env.DEEPSEEK_API_KEY) {
    try {
      const dsResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 4096 }),
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

  // T2-FREE: DeepSeek R1 Distill 32B via CF Workers AI (free reasoning T2, no key required)
  if (tier === 2 && !aiResult) {
    try {
      const r1Result = await env.AI.run('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', { messages, max_tokens: 8192 });
      if (r1Result?.response) {
        aiResult = { response: stripThinkTags(r1Result.response) };
        usedModel = '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';
        tierUsed = 2;
      }
    } catch (_) {}
  }

  // T1: Llama 3.3 70B via CF Workers AI (primary — strong, free, no external key)
  if (!aiResult) {
    try {
      aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 8192 });
      usedModel = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
      tierUsed = 1;
    } catch (_) {}
  }

  // T10: Qwen 2.5 Coder — fallback if Llama unavailable
  if (!aiResult) {
    aiResult = await env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
    usedModel = '@cf/qwen/qwen2.5-coder-32b-instruct';
    tierUsed = 10;
  }

  const patch = stripFences(aiResult.response ?? '');
  const verifyResult = verify(patch);

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
    version: '1.0.0',
  });
}