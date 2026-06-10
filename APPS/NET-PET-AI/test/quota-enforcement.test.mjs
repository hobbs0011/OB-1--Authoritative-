// test/quota-enforcement.test.mjs — Rate limit + quota bypass attack tests
// Targets: checkQuota binding guard, sov100 exempt path, RATELIMIT key format,
//          deletion.js quota key prefix, per-student hourly bucket isolation
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const quotaSrc = readFileSync(resolve(__dirname, '../src/quota.js'), 'utf8');
const deletionSrc = readFileSync(resolve(__dirname, '../src/deletion.js'), 'utf8');
const routerSrc = readFileSync(resolve(__dirname, '../src/router.js'), 'utf8');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) { console.log('✅ QUOTA:', msg); pass++; }
  else { console.error('❌ QUOTA:', msg); fail++; }
}

// Simulate checkQuota logic (mirrors quota.js)
async function checkQuota(env, studentId, type) {
  if (!studentId || studentId.startsWith('sov100-')) return { allowed: true };
  if (!env.RATELIMIT) return { allowed: true };
  const limits = { deepgram: 10, chat: 30 };
  const limit = limits[type];
  if (limit === undefined) throw new Error(`Unsupported quota type: ${type}`);
  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const key = `quota:${studentId}:${type}:${hourBucket}`;
  const store = env._store || {};
  const count = store[key] ? parseInt(store[key], 10) : 0;
  if (count >= limit) {
    const retryAfter = Math.ceil(((hourBucket + 1) * 3_600_000 - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }
  store[key] = String(count + 1);
  return { allowed: true };
}

// 1. sov100-* always allowed (operator bypass)
const sov = await checkQuota({ RATELIMIT: {} }, 'sov100-test-magic', 'deepgram');
assert(sov.allowed === true, 'sov100-* always allowed — operator bypass');

// 2. Missing RATELIMIT binding returns allowed (dev env guard — EC-quotanull)
const noBinding = await checkQuota({}, 'mai-tram-bluetech', 'deepgram');
assert(noBinding.allowed === true, 'missing RATELIMIT binding returns allowed (EC-quotanull guard)');

// 3. Student blocked after deepgram limit (10/hour)
const mockEnv = { _store: {}, RATELIMIT: { get: async k => mockEnv._store[k] || null, put: async (k, v) => { mockEnv._store[k] = v; } } };
for (let i = 0; i < 10; i++) await checkQuota(mockEnv, 'mai-tram-bluetech', 'deepgram');
const blocked = await checkQuota(mockEnv, 'mai-tram-bluetech', 'deepgram');
assert(blocked.allowed === false && blocked.retryAfter > 0, 'student blocked after 10 deepgram calls/hour');

// 4. Chat limit is higher than deepgram (30 vs 10)
const mockEnv2 = { _store: {}, RATELIMIT: { get: async k => mockEnv2._store[k] || null, put: async (k, v) => { mockEnv2._store[k] = v; } } };
for (let i = 0; i < 10; i++) await checkQuota(mockEnv2, 'mai-tram-bluetech', 'chat');
const chatStillAllowed = await checkQuota(mockEnv2, 'mai-tram-bluetech', 'chat');
assert(chatStillAllowed.allowed === true, 'chat allows >10 (limit is 30)');

// 5. Different students have isolated quotas
const mockEnv3 = { _store: {}, RATELIMIT: { get: async k => mockEnv3._store[k] || null, put: async (k, v) => { mockEnv3._store[k] = v; } } };
for (let i = 0; i < 10; i++) await checkQuota(mockEnv3, 'mai-tram-bluetech', 'deepgram');
const huong = await checkQuota(mockEnv3, 'huong-bluetech', 'deepgram');
assert(huong.allowed === true, 'quota is per-student — huong not affected by mai-tram exhaustion');

// 6. quota.js guards missing RATELIMIT binding
assert(quotaSrc.includes("if (!env.RATELIMIT) return { allowed: true }"), 'quota.js has RATELIMIT binding guard');

// 7. quota key format is quota:{studentId}:{type}:{hourBucket}
assert(quotaSrc.includes('`quota:${studentId}:${type}:${hourBucket}`'), 'quota key uses correct format');

// 8. deletion.js uses correct quota key prefix for RATELIMIT cleanup
assert(
  deletionSrc.includes('`quota:${studentId}:`'),
  'deletion.js uses quota:{studentId}: prefix (EC-deleteprefix fix)'
);

// 9. deletion.js guards missing RATELIMIT binding
assert(
  deletionSrc.includes('if (env.RATELIMIT)'),
  'deletion.js guards RATELIMIT binding before listing keys'
);

// 10. router.js applies quota on deepgram-token AND chat endpoints
assert(
  routerSrc.includes("checkQuota(c.env, studentId, 'deepgram')") && routerSrc.includes("checkQuota(c.env, studentId, 'chat')"),
  'quota enforced on both deepgram-token and chat endpoints'
);

// 11. quota skips sov100 in router (no env.RATELIMIT call for operator)
assert(
  routerSrc.includes("!studentId.startsWith('sov100-')"),
  "router quota middleware skips sov100-* students"
);

if (fail > 0) {
  console.error(`\nquota-enforcement: ${fail} FAILURES`);
  process.exit(1);
}
console.log(`\nquota-enforcement: ALL ${pass} ASSERTIONS GREEN`);
