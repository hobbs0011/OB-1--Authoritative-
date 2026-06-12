import { checkAdminKey } from './security.js';
import { verify } from './verify.js';
import { inferMaxTokens, isCodeTask, compressContext } from './tokens.js';

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

function buildMessages(order, results) {
  const parts = [];
  for (const depId of (order.depends_on || [])) {
    const dep = results.get(depId);
    if (dep && dep.status === 'VERIFIED' && dep.patch) {
      parts.push(`[DEPENDENCY: ${depId}]\n${dep.patch}`);
    }
  }
  const ctx = compressContext(order.context || '');
  if (ctx) parts.push('CONTEXT:\n' + ctx);
  if (order.target) parts.push('TARGET FILE: ' + order.target);
  parts.push('TASK:\n' + order.task);
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n\n') },
  ];
}

export async function handleSwarm(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.blueprint) || body.blueprint.length === 0) {
    return Response.json({ error: 'blueprint array required' }, { status: 400 });
  }

  const drones = Math.min(Math.max(1, body.drones || 10), 10);
  const results = new Map();
  const idOrderMap = new Map();

  for (const order of body.blueprint) {
    if (!order.id || !order.task) {
      return Response.json({ error: 'each order needs id + task' }, { status: 400 });
    }
    results.set(order.id, { id: order.id, status: 'PENDING', patch: '' });
    idOrderMap.set(order.id, order);
  }

  let waveCount = 0;
  let maxWaveSize = 0;
  const finalResults = [];

  while (true) {
    const pendingIds = [...results.entries()]
      .filter(([, r]) => r.status === 'PENDING')
      .map(([id]) => id);

    if (pendingIds.length === 0) break;

    const wave = [];
    for (const id of pendingIds) {
      const order = idOrderMap.get(id);
      const allDepsVerified = (order.depends_on || []).every(depId => {
        const dep = results.get(depId);
        return dep && dep.status === 'VERIFIED';
      });
      if (allDepsVerified) wave.push(order);
    }

    if (wave.length === 0) {
      return Response.json({ error: 'circular dependency or blocked DAG' }, { status: 400 });
    }

    const waveSlice = wave.slice(0, drones);
    if (waveSlice.length > maxWaveSize) maxWaveSize = waveSlice.length;

    await Promise.all(waveSlice.map(async order => {
      const startTime = Date.now();
      const model = order.model || (isCodeTask(order.task) ? '@cf/qwen/qwen2.5-coder-32b-instruct' : '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
      const maxToks = order.max_tokens || inferMaxTokens(order.task, order.context || '');
      const messages = buildMessages(order, results);
      const maxRetries = order.max_retries ?? 0;

      // Context bloat guard
      const ctxLen = (order.context || '').length;
      if (ctxLen > order.task.length * 20 && ctxLen > 5000) {
        console.warn(`CONTEXT_BLOAT: order ${order.id} ctx=${ctxLen} task=${order.task.length}`);
      }

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const aiResult = await env.AI.run(model, { messages, max_tokens: maxToks });
          const patch = stripFences(aiResult.response ?? '');
          const shouldVerify = order.verify === 'acorn';
          const verifyResult = shouldVerify ? verify(patch) : { ok: true };

          if (verifyResult.ok) {
            results.set(order.id, { id: order.id, status: 'VERIFIED', patch });
            finalResults.push({ id: order.id, verified: true, patch, ms: Date.now() - startTime, model, max_tokens: maxToks });
            return;
          }
          if (attempt < maxRetries) continue;
          results.set(order.id, { id: order.id, status: 'FAILED', patch });
          finalResults.push({ id: order.id, verified: false, patch, ms: Date.now() - startTime, model, max_tokens: maxToks });
        } catch (err) {
          if (attempt < maxRetries) continue;
          results.set(order.id, { id: order.id, status: 'FAILED', patch: '' });
          finalResults.push({ id: order.id, verified: false, patch: '', ms: Date.now() - startTime, model, max_tokens: maxToks });
        }
      }
    }));

    waveCount++;
  }

  return Response.json({
    mission_id: 'SW-' + Date.now(),
    waves: waveCount,
    drones_used: maxWaveSize,
    results: finalResults,
    all_verified: finalResults.every(r => r.verified),
  });
}
