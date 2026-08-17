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
      CACHE: !!env.PHETRAIL,
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

  // PCC health check — live metrics from D1
  try {
    const cutoff = new Date(Date.now() - 86400000).toISOString();
    const total = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics WHERE created_at >= ?').bind(cutoff).first();
    const passed = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1 AND created_at >= ?').bind(cutoff).first();
    const avgMs = await env.DB.prepare('SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1 AND created_at >= ?').bind(cutoff).first();
    const last = await env.DB.prepare('SELECT created_at, passed, duration_ms FROM pcc_metrics ORDER BY id DESC LIMIT 1').first();

    const totalCalls = total?.cnt || 0;
    const passedCalls = passed?.cnt || 0;
    const passRate = totalCalls > 0 ? (passedCalls / totalCalls * 100) : null;
    const avgDuration = avgMs?.avg ? Math.round(avgMs.avg) : null;

    let pccStatus = 'UNKNOWN';
    if (totalCalls === 0) pccStatus = 'SILENT';
    else if (passRate >= 70 && (avgDuration === null || avgDuration <= 8000)) pccStatus = 'HEALTHY';
    else pccStatus = 'DEGRADED';

    result.pcc = {
      status: pccStatus,
      calls_24h: totalCalls,
      pass_rate: passRate !== null ? passRate.toFixed(1) + '%' : 'N/A',
      avg_ms: avgDuration,
      last_call: last?.created_at || null,
      last_passed: last ? !!last.passed : null,
    };
  } catch {
    result.pcc = { status: 'UNKNOWN', error: 'metrics table unreachable' };
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

  // Test 4: Vectorize (SOUL_INDEX + DNA_INDEX)
  results.vectorize = {
    soul_index: !!env.SOUL_INDEX,
    dna_index: !!env.DNA_INDEX,
    note: env.SOUL_INDEX ? 'SOUL_INDEX bound ✓' : 'SOUL_INDEX not found — check wrangler.toml',
  };

  // Test 5: M2M100 translation (EN→VI — key for NET)
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run('@cf/meta/m2m100-1.2b', { text: 'Hello', source_lang: 'en', target_lang: 'vi' }),
      10000
    );
    results.m2m_translation = { ok: true, ms: Date.now() - start, sample: JSON.stringify(res).slice(0, 80) };
  } catch (err) {
    results.m2m_translation = { ok: false, error: err.message };
  }

  // Test 6: BGE Reranker
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run('@cf/baai/bge-reranker-base', { query: 'test', contexts: ['context a', 'context b'] }),
      10000
    );
    results.bge_reranker = { ok: true, ms: Date.now() - start };
  } catch (err) {
    results.bge_reranker = { ok: false, error: err.message };
  }

  return Response.json({ capability_test: results, tested_at: new Date().toISOString() });
}
