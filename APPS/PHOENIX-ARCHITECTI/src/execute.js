import { checkAdminKey, sanitizeInput } from './security.js';
import { verify } from './verify.js';
import { logToD1 } from './logger.js';

const SYSTEM_PROMPT = `You are Phoenix-Architecti — elite code drone for the OB-1 empire.
L01 NO_FABRICATION — never guess. State what is missing.
L02 NO_STUBS — full implementation only. No TODO, no placeholders.
L03 STRONGEST_VERSION_FIRST — complete, hardened output immediately.
L04 RAW_OUTPUT — raw file content ONLY. No markdown fences. No backticks. No explanation. First character = first character of the file.
L06 ZERO_DRIFT — answer the task, nothing else.`;

function stripFences(text) {
  if (!text) return '';
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
}

export async function handleExecute(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'invalid JSON' }, { status: 400 });

  const task = sanitizeInput(body.task, 10000);
  const context = sanitizeInput(body.context, 50000);
  const { target, model } = body;

  if (!task) return Response.json({ error: 'task required' }, { status: 400 });

  const parts = [];
  if (context) parts.push('CONTEXT:\n' + context);
  if (target) parts.push('TARGET FILE: ' + target);
  parts.push('TASK:\n' + task);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n\n') },
  ];

  const aiResult = await env.AI.run(model || '@cf/qwen/qwen2.5-coder-32b-instruct', { messages, max_tokens: 8192 });
  const patch = stripFences(aiResult.response ?? '');
  const verifyResult = verify(patch);

  const d1_id = await logToD1(env, {
    action: 'execute',
    task,
    result: patch,
    tier: 1,
    ip: request.headers.get('CF-Connecting-IP') || '',
  });

  return Response.json({
    patch,
    verified: verifyResult.ok,
    verify_error: verifyResult.error || null,
    model: model || '@cf/qwen/qwen2.5-coder-32b-instruct',
    d1_id,
    version: '1.0.0',
  });
}
