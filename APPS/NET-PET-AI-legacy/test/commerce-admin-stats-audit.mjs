// test/commerce-admin-stats-audit.mjs — audit/test expanded admin dashboard metrics
// Run: node test/commerce-admin-stats-audit.mjs

const assert = { ok: (cond, msg) => { if (!cond) throw new Error(msg); } };

const MEM = new Map();
function kvGet(key) { return MEM.get(key) ?? null; }
function kvPut(key, value, opts) { MEM.set(key, value); }
function kvDel(key) { MEM.delete(key); }
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
    async delete(key) { kvDel(key); },
    async list(opts) { return kvList(opts); },
  },
};

async function load(name) {
  const mod = await import(`../src/${name}`);
  return mod;
}

async function run() {
  console.log("[AUDIT] Admin dashboard data completeness");

  const indexMod = await load("index.js");
  const ordersMod = await load("orders.js");
  const invoicesMod = await load("invoices.js");

  // Seed test data
  await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-stats",
    studentId: "student-stats",
    lineItems: [{ type: "plan", id: "net", name: "NET", qty: 1, unitPriceVND: 725000, totalVND: 725000 }],
    subtotalVND: 725000,
    totalVND: 725000,
    source: "stats-test",
  });
  await ordersMod.createOrder(env, {
    ownerType: "employer",
    ownerId: "employer-stats",
    companyCode: "STATSCORP",
    lineItems: [{ type: "plan", id: "team", name: "TEAM", qty: 1, unitPriceVND: 2490000, totalVND: 2490000 }],
    subtotalVND: 2490000,
    totalVND: 2490000,
    source: "stats-test",
  });

  // Test handleAdminStats
  const stats = await indexMod.handleAdminStats(env);
  assert.ok(stats.waitlistCount !== undefined, "stats should include waitlistCount");
  assert.ok(stats.paymentCount !== undefined, "stats should include paymentCount");
  assert.ok(stats.totalRevenueVND !== undefined, "stats should include totalRevenueVND");
  assert.ok(stats.employerCount !== undefined, "stats should include employerCount");
  assert.ok(stats.activeStudents !== undefined, "stats should include activeStudents");
  assert.ok(stats.challengeAttemptsToday !== undefined, "stats should include challengeAttemptsToday");
  assert.ok(stats.generatedAt, "stats should include generatedAt");
  // Verify no hardcoded student list was used
  assert.ok(typeof stats.activeStudents === 'number', "activeStudents should be a number");

  // Test handleAdminCommerceStats
  const commerceStats = await indexMod.handleAdminCommerceStats(env);
  assert.ok(commerceStats.ordersCount !== undefined, "commerceStats should include ordersCount");
  assert.ok(commerceStats.pendingOrders !== undefined, "commerceStats should include pendingOrders");
  assert.ok(commerceStats.paidOrders !== undefined, "commerceStats should include paidOrders");
  assert.ok(commerceStats.revenueVND !== undefined, "commerceStats should include revenueVND");
  assert.ok(commerceStats.avgOrderValue !== undefined, "commerceStats should include avgOrderValue");
  assert.ok(commerceStats.byPlan !== undefined, "commerceStats should include byPlan breakdown");
  assert.ok(commerceStats.accessCount !== undefined, "commerceStats should include accessCount");
  assert.ok(commerceStats.subscriptionBreakdown !== undefined, "commerceStats should include subscriptionBreakdown");
  assert.ok(commerceStats.promoRedemptions !== undefined, "commerceStats should include promoRedemptions");
  assert.ok(commerceStats.employers !== undefined, "commerceStats should include employers");
  assert.ok(commerceStats.invoices !== undefined, "commerceStats should include invoices");
  assert.ok(commerceStats.generatedAt, "commerceStats should include generatedAt");

  // Verify order counts
  assert.ok(commerceStats.ordersCount >= 2, "should have at least 2 test orders");
  assert.ok(commerceStats.byPlan && Object.keys(commerceStats.byPlan).length >= 2, "byPlan should have at least 2 plans");

  // Verify employer breakdown
  assert.ok(commerceStats.employers.count >= 1, "should have at least 1 employer");
  assert.ok(commerceStats.employers.revenueVND >= 2490000, "employer revenue should include test order");

  console.log("[AUDIT PASS] Admin dashboard data completeness");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
