export async function withIdempotency(env, request, handler) {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey) return handler();

  const data = new TextEncoder().encode(idempotencyKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hexHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const kvKey = `idempotency:${hexHash}`;

  const cached = await env.NET_PET_KV.get(kvKey, 'json');
  if (cached) {
    return new Response(JSON.stringify(cached.body), {
      status: cached.status,
      headers: { 'Content-Type': 'application/json', 'X-Idempotent-Replay': 'true' },
    });
  }

  const response = await handler();
  if (response.ok) {
    try {
      const body = await response.clone().json();
      await env.NET_PET_KV.put(kvKey, JSON.stringify({ status: response.status, body }), {
        expirationTtl: 86400,
      });
    } catch {}
  }
  return response;
}
