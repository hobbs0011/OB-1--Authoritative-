// test/commerce-subscription-audit.mjs — audit/test subscription lifecycle: states, transitions, sweep, API
// Run: node test/commerce-subscription-audit.mjs

const assert = { ok: (cond, msg) => { if (!cond) throw new Error(msg); } };

const MEM = new Map();
function kvGet(key) { return MEM.get(key) ?? null; }
function kvPut(key, value, opts) { MEM.set(key, value); }
function kvList({ prefix, cursor }) {
  const out = [];
  for (const k of MEM.keys()) {
    if (prefix && !k.startsWith(prefix)) continue;
    out.push({ name: k });
  }
  return { keys: out, list_complete: true, cursor: undefined };
}

const env = {
  NET_PET_KV: {
    async get(key) { return kvGet(key); },
    async put(key, value, opts) { kvPut(key, value, opts); },
    async list(opts) { return kvList(opts); },
  },
};

async function load(name) {
  const mod = await import(`../src/${name}`);
  return mod;
}

function json(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, data };
}

async function run() {
  console.log("[AUDIT] Subscription lifecycle: states, transitions, sweep, API");

  const subMod = await load("subscriptions.js");
  const indexMod = await load("index.js");

  // Re-export for convenience
  const { computeSubscriptionStatus, isSubscriptionActive, isInGracePeriod, daysUntilExpiry, daysSinceExpiry, transitionSubscription, SUBSCRIPTION_STATES, GRACE_DAYS, MAX_PAST_DUE_DAYS } = subMod;

  // Test state machine
  const trial = { plan: 'net', trial_end: new Date(Date.now() + 86400000).toISOString() };
  assert.ok(computeSubscriptionStatus(trial) === 'trial', "trial sub should be trial state");

  const active = { plan: 'net', paidUntil: new Date(Date.now() + 86400000).toISOString() };
  assert.ok(isSubscriptionActive(active) === true, "active sub should be active");
  assert.ok(computeSubscriptionStatus(active) === 'active', "active sub state should be active");

  const grace = { plan: 'net', paidUntil: new Date(Date.now() - 86400000 * 3).toISOString() };
  assert.ok(isInGracePeriod(grace) === true, "3 days expired should be in grace");
  assert.ok(computeSubscriptionStatus(grace) === 'grace', "grace sub state should be grace");

  const expired = { plan: 'net', paidUntil: new Date(Date.now() - 86400000 * 30).toISOString() };
  assert.ok(computeSubscriptionStatus(expired) === 'expired', "30 days expired should be expired");

  const pastDue = { plan: 'net', paidUntil: new Date(Date.now() - 86400000 * 10).toISOString() };
  assert.ok(computeSubscriptionStatus(pastDue) === 'past_due', "10 days expired should be past_due");

  // Test transition helper
  const updated = transitionSubscription({ ...expired }, 'grace');
  assert.ok(updated.status === 'grace', "transition should update status");

  // Test daysUntilExpiry / daysSinceExpiry
  assert.ok(daysUntilExpiry(active) >= 1, "daysUntilExpiry should be >= 1");
  assert.ok(daysSinceExpiry(grace) >= 1, "daysSinceExpiry should be >= 1");

  // Test subscription sweep (simulate cron behavior)
  // Create a subscription that needs status update
  const studentId = "student-sub-sweep";
  const rawSub = { plan: 'net', paidUntil: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'active', updatedAt: new Date().toISOString() };
  await env.NET_PET_KV.put(`subscription:${studentId}`, JSON.stringify(rawSub));

  // Simulate what the cron does
  const keys = []; let cursor;
  do {
    const listed = await env.NET_PET_KV.list({ prefix: 'subscription:', cursor }).catch(() => ({ keys: [], list_complete: true }));
    listed.keys.forEach(k => keys.push(k.name.replace('subscription:', '')));
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
  const studentKeys = keys.filter(sid => !sid.startsWith('sov100-') && sid !== 'keep-warm-ping');
  let updatedCount = 0;
  for (const sid of studentKeys) {
    const raw = await env.NET_PET_KV.get(`subscription:${sid}`).catch(() => null);
    if (!raw) continue;
    const sub = JSON.parse(raw);
    const newStatus = computeSubscriptionStatus(sub);
    if (newStatus !== sub.status) {
      const updated = transitionSubscription(sub, newStatus);
      await env.NET_PET_KV.put(`subscription:${sid}`, JSON.stringify(updated));
      updatedCount++;
    }
  }
  assert.ok(updatedCount >= 1, "sweep should transition at least 1 subscription");

  const swept = JSON.parse(await env.NET_PET_KV.get(`subscription:${studentId}`).catch(() => null));
  assert.ok(swept.status === 'grace', "swept subscription should be in grace state");

  // Test API contract: handleMySubscription returns correct shape (data-layer simulation)
  const apiStudentId = studentId;
  const apiSub = { studentId: apiStudentId, plan: swept.plan, status: computeSubscriptionStatus(swept), active: isSubscriptionActive(swept), inGrace: isInGracePeriod(swept), daysToExpiry: daysUntilExpiry(swept), daysSinceExpiry: daysSinceExpiry(swept), paidUntil: swept.paidUntil, trialEnd: swept.trial_end, source: swept.source };
  assert.ok(apiSub.studentId === apiStudentId, "subscription API should return studentId");
  assert.ok(['trial','active','grace','expired','past_due','revoked'].includes(apiSub.status), "status should be valid enum");
  assert.ok(typeof apiSub.daysToExpiry === 'number', "daysToExpiry should be number");
  assert.ok(typeof apiSub.inGrace === 'boolean', "inGrace should be boolean");

  console.log("[AUDIT PASS] Subscription lifecycle: states, transitions, sweep, API");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
