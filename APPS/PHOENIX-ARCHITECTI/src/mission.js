import { verify } from './verify.js';

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

function buildUserMsg(step, context) {
  const parts = [];
  if (context) parts.push('PREVIOUS STEP RESULT:\n' + context);
  if (step.context) parts.push('CONTEXT:\n' + step.context);
  if (step.target) parts.push('TARGET FILE: ' + step.target);
  parts.push('TASK:\n' + step.task);
  return parts.join('\n\n');
}

export async function handleMission(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.steps)) {
    return Response.json({ error: 'steps array required' }, { status: 400 });
  }

  const model = body.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  const results = [];
  let carryContext = '';

  for (let i = 0; i < body.steps.length; i++) {
    const step = body.steps[i];
    const stepStart = Date.now();

    const aiResult = await env.AI.run(model, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMsg(step, carryContext) },
      ],
      max_tokens: 8192,
    });

    const patch = stripFences(aiResult.response ?? '');
    const verifyResult = verify(patch);
    const ms = Date.now() - stepStart;

    results.push({ step_index: i, task: step.task, patch, verified: verifyResult.ok, ms });
    carryContext = patch;
  }

  return Response.json({
    mission_id: 'MR-' + Date.now(),
    steps: results,
    all_verified: results.every(r => r.verified),
  });
}
