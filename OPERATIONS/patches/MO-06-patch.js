import { performance } from 'perf_hooks';

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

  // Qwen coder probe
  try {
    const start = performance.now();
    await withTimeout(
      env.AI.run('@cf/qwen/qwen2.5-coder-32b-instruct', {
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
      5000
    );
    const end = performance.now();
    result.ai.qwen_coder.ok = true;
    result.ai.qwen_coder.ms = Math.round(end - start);
  } catch {
    result.ai.qwen_coder.ok = false;
    result.ai.qwen_coder.ms = null;
  }

  // Llama 70b probe
  try {
    const start = performance.now();
    await withTimeout(
      env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
      5000
    );
    const end = performance.now();
    result.ai.llama_70b.ok = true;
    result.ai.llama_70b.ms = Math.round(end - start);
  } catch {
    result.ai.llama_70b.ok = false;
    result.ai.llama_70b.ms = null;
  }

  // DB probe
  try {
    if (env.DB && typeof env.DB.prepare === 'function') {
      await env.DB.prepare('SELECT 1').run();
    } else if (env.DB && typeof env.DB.exec === 'function') {
      await env.DB.exec('SELECT 1');
    }
    result.db.ok = true;
  } catch {
    result.db.ok = false;
  }

  return Response.json(result);
}
