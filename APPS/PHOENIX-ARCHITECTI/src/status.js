function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export async function handleStatus(env) {
  const result = {
    version: '1.0.0',
    rung: 'ASSEMBLED',
    status: 'LIVE',
    ai: {
      qwen_coder: { ok: false, ms: null },
      llama_70b: { ok: false, ms: null },
    },
    db: { ok: false },
    bindings: {
      AI: !!env.AI,
      DB: !!env.DB,
      RATELIMIT: !!env.RATELIMIT,
      CACHE: !!env.CACHE,
    },
    drone_capacity: 10,
  };

  try {
    const start = Date.now();
    await withTimeout(
      env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', { messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 }),
      5000
    );
    result.ai.qwen_coder = { ok: true, ms: Date.now() - start };
  } catch {
    result.ai.qwen_coder = { ok: false, ms: null };
  }

  try {
    const start = Date.now();
    await withTimeout(
      env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 }),
      15000
    );
    result.ai.llama_70b = { ok: true, ms: Date.now() - start };
  } catch {
    result.ai.llama_70b = { ok: false, ms: null };
  }

  try {
    await env.DB.prepare('SELECT 1 FROM phoenix_architecti_log LIMIT 1').run();
    result.db = { ok: true };
  } catch {
    result.db = { ok: false };
  }

  return Response.json(result);
}

export async function handleProbe(request, env) {
  const urlParams = new URL(request.url).searchParams;
  const model = urlParams.get('model') || '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';
  const start = Date.now();
  try {
    const res = await withTimeout(
      env.AI.run(model, { messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 }),
      30000
    );
    const ms = Date.now() - start;
    const preview = (res?.response || JSON.stringify(res)).substring(0, 80);
    return Response.json({ model, ok: true, ms, preview, error: null });
  } catch (err) {
    return Response.json({ model, ok: false, ms: Date.now() - start, preview: '', error: err.message });
  }
}
