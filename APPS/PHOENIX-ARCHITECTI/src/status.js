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

export async function handleCapabilityTest(env) {
  const results = {};

  // Test 1: BGE-base embedding
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run('@cf/baai/bge-base-en-v1.5', { text: 'student pronunciation final consonants' }),
      15000
    );
    const vec = res?.data?.[0] || res?.result?.data?.[0] || res;
    const dims = Array.isArray(vec) ? vec.length : (vec?.length || 0);
    results.bge_base = { ok: dims > 0, dims, ms: Date.now() - start, sample: Array.isArray(vec) ? vec.slice(0,3) : null };
  } catch (err) {
    results.bge_base = { ok: false, error: err.message };
  }

  // Test 2: BGE-m3 (multilingual — Vietnamese+English)
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run('@cf/baai/bge-m3', { text: 'student pronunciation' }),
      15000
    );
    const vec = res?.data?.[0] || res?.result?.data?.[0] || res;
    const dims = Array.isArray(vec) ? vec.length : 0;
    results.bge_m3 = { ok: dims > 0, dims, ms: Date.now() - start };
  } catch (err) {
    results.bge_m3 = { ok: false, error: err.message };
  }

  // Test 3: Whisper tiny — does it accept audio? (structure test only, no real audio)
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run('@cf/openai/whisper-tiny-en', { audio: [] }),
      10000
    );
    results.whisper_tiny = { ok: true, ms: Date.now() - start, response: JSON.stringify(res).slice(0,100) };
  } catch (err) {
    results.whisper_tiny = { ok: false, error: err.message };
  }

  // Test 4: Vectorize binding present?
  results.vectorize = { bound: !!env.VECTORIZE, note: env.VECTORIZE ? 'index bound' : 'no index created yet — needs wrangler vectorize create' };

  return Response.json({ capability_test: results, tested_at: new Date().toISOString() });
}
