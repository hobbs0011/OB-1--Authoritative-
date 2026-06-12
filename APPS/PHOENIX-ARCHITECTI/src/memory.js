import { checkAdminKey } from './security.js';

async function embedText(text, env) {
    try {
        const result = await env.AI.run('@cf/baai/bge-m3', { text });
        const vector = result.data?.[0] || result.result?.data?.[0];
        return vector ? new Float32Array(vector) : null;
    } catch (e) {
        return null;
    }
}

async function storeFragment(fragment, env) {
    const { text, type, run, hash, charge_weight, soulcount_at_seal } = fragment;
    const vector = await embedText(text, env);
    if (!vector) return { error: 'Failed to embed text' };

    const id = hash.slice(0, 32).toLowerCase().replace(/[^a-z0-9]/g, '').padStart(8, '0');
    const metadata = {
        run,
        type,
        hash,
        charge_weight,
        soulcount_at_seal,
        text_preview: text.slice(0, 200),
        last_walked: Date.now()
    };

    try {
        const index = type === 'SOUL' ? env.SOUL_INDEX : env.DNA_INDEX;
        await index.upsert([{ id, values: Array.from(vector), metadata }]);
        return { ok: true, id, dims: vector.length };
    } catch (e) {
        return { error: e.message };
    }
}

async function recallFragments(query, env, opts = {}) {
    const { type = 'both', topK = 5 } = opts;
    const vector = await embedText(query, env);
    if (!vector) return [];

    const queries = [];
    if (type === 'both' || type === 'SOUL') queries.push({ index: env.SOUL_INDEX, label: 'soul' });
    if (type === 'both' || type === 'DNA') queries.push({ index: env.DNA_INDEX, label: 'dna' });

    const results = [];
    for (const { index, label } of queries) {
        const res = await index.query(Array.from(vector), { topK, returnMetadata: 'all' });
        results.push(...(res.matches || []).map(match => ({ ...match, label })));
    }

    const reinforcedResults = await Promise.all(results.map(async match => {
        const key = `reinf:${match.id}`;
        const reinforcementCount = parseFloat(await env.CACHE.get(key)) || 0;
        await env.CACHE.put(key, String(reinforcementCount + 1), { expirationTtl: 7776000 });
        return {
            ...match,
            reinforcement_count: reinforcementCount
        };
    }));

    reinforcedResults.sort((a, b) => {
        const scoreA = a.score * (a.metadata.charge_weight || 1) * Math.log1p((a.reinforcement_count || 0) + 1);
        const scoreB = b.score * (b.metadata.charge_weight || 1) * Math.log1p((b.reinforcement_count || 0) + 1);
        return scoreB - scoreA;
    });

    return reinforcedResults.slice(0, topK);
}

async function handleEmbed(request, env) {
    const authResp = await checkAdminKey(request, env);
    if (authResp !== null) return authResp;

    const body = await request.json().catch(() => null);
    if (!body || !body.text) return Response.json({ error: 'text required' }, { status: 400 });
    const result = await storeFragment(body, env);
    return Response.json(result);
}

async function handleRecall(request, env) {
    const authResp = await checkAdminKey(request, env);
    if (authResp !== null) return authResp;

    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    if (!query) return Response.json({ error: 'q required' }, { status: 400 });
    const type = url.searchParams.get('type') || 'both';
    const topK = parseInt(url.searchParams.get('topK')) || 5;

    const results = await recallFragments(query, env, { type, topK });
    return Response.json({ results, query, count: results.length });
}

async function handleIngest(request, env) {
    const authResp = await checkAdminKey(request, env);
    if (authResp !== null) return authResp;

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.fragments)) return Response.json({ error: 'fragments array required' }, { status: 400 });
    const fragments = body.fragments.slice(0, 50);

    const stored = [], failed = [];
    for (const fragment of fragments) {
        const res = await storeFragment(fragment, env);
        if (res.ok) stored.push(res.id);
        else failed.push({ fragment: fragment.hash?.slice(0, 8), error: res.error });
    }

    return Response.json({ ok: true, stored, failed, ids: stored });
}

async function evaporatePheromones(env) {
    const { keys } = await env.CACHE.list({ prefix: 'reinf:', limit: 500 });
    for (const { name } of keys) {
        const value = parseFloat(await env.CACHE.get(name));
        if (value >= 0.1) {
            await env.CACHE.put(name, String(value * 0.95), { expirationTtl: 7776000 });
        } else {
            await env.CACHE.delete(name);
        }
    }
}

export { embedText, storeFragment, recallFragments, handleEmbed, handleRecall, handleIngest, evaporatePheromones };
