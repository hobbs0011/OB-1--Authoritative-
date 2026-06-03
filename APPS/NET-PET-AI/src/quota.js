export async function checkQuota(env, studentId, type) {
  if (!studentId || studentId.startsWith('sov100-')) {
    return { allowed: true };
  }

  const limits = { deepgram: 10, chat: 30 };
  const limit = limits[type];
  if (limit === undefined) throw new Error(`Unsupported quota type: ${type}`);

  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const key = `quota:${studentId}:${type}:${hourBucket}`;

  const stored = await env.RATELIMIT.get(key);
  const count = stored ? parseInt(stored, 10) : 0;

  if (count >= limit) {
    const retryAfter = Math.ceil(((hourBucket + 1) * 3_600_000 - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }

  await env.RATELIMIT.put(key, String(count + 1), { expirationTtl: 7200 });
  return { allowed: true };
}
