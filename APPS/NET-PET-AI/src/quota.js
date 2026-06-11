export async function checkQuota(env, studentId, type) {
  if (!studentId || studentId.startsWith('sov100-')) {
    return { allowed: true };
  }
  // EC-quotanull: guard missing RATELIMIT binding (dev environment)
  if (!env.RATELIMIT) return { allowed: true };

  // deepgram = token mints/student/hour. Each WS (re)connect mints one token, and
  // mobile Safari reconnects often (backgrounding, visibilitychange, wifi blips) —
  // a real 1-hour class can legitimately need far more than 10. 60 gives a class
  // comfortable headroom while still capping a runaway reconnect loop. sov100 exempt.
  const limits = { deepgram: 60, chat: 30 };
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
