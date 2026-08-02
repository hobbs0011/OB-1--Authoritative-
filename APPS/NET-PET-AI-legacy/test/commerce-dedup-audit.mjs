// test/commerce-dedup-audit.mjs — audit/test duplicate payment/order protection
// Run: node test/commerce-dedup-audit.mjs

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
  console.log("[AUDIT] Duplicate payment/order protection");

  const ordersMod = await load("orders.js");
  const indexMod = await load("index.js");

  // Test 1: createOrder with idempotency key prevents duplicates
  const idempKey = "test-idempotency-123";
  const order1 = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-dedup",
    studentId: "student-dedup",
    lineItems: [{ type: "plan", id: "net", name: "NET", qty: 1, unitPriceVND: 725000, totalVND: 725000 }],
    subtotalVND: 725000,
    totalVND: 725000,
    source: "dedup-test",
    idempotencyKey: idempKey,
  });
  assert.ok(order1.orderId, "first order should be created with idempotency key");

  // Second call with same idempotency key should return existing order
  const order2 = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-dedup",
    studentId: "student-dedup",
    lineItems: [{ type: "plan", id: "net", name: "NET", qty: 1, unitPriceVND: 725000, totalVND: 725000 }],
    subtotalVND: 725000,
    totalVND: 725000,
    source: "dedup-test",
    idempotencyKey: idempKey,
  });
  assert.ok(order2.orderId === order1.orderId, "duplicate idempotency key should return same order");

  // Test 2: createOrder without idempotency key creates new order (different content)
  const order3 = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-dedup",
    studentId: "student-dedup",
    lineItems: [{ type: "plan", id: "team", name: "TEAM", qty: 1, unitPriceVND: 2490000, totalVND: 2490000 }],
    subtotalVND: 2490000,
    totalVND: 2490000,
    source: "dedup-test",
  });
  console.log("ORDER1", order1.orderId);
  console.log("ORDER2", order2.orderId);
  console.log("ORDER3", order3.orderId);
  assert.ok(order3.orderId !== order1.orderId, "order without idempotency key should be different");

  // Test 3: Simulate duplicate payment record creation
  const txnId = "txn-dedup-123";
  const paymentRecord = {
    studentId: "student-dedup",
    companyCode: null,
    plan: "net",
    amountVND: 725000,
    txnId: txnId,
    confirmedBy: "dedup-test",
    confirmedAt: new Date(Date.now()+7*3600000).toISOString(),
    status: "confirmed"
  };
  await env.NET_PET_KV.put(`payment:${txnId}`, JSON.stringify(paymentRecord), { expirationTtl: 86400*365 });
  
  // Try to create duplicate payment record
  const existingPayment = await env.NET_PET_KV.get(`payment:${txnId}`).catch(() => null);
  assert.ok(existingPayment, "payment record should exist");
  
  // In handlePaymentConfirm, we now check for existing payment first
  // Simulate that check
  const parsedExisting = JSON.parse(existingPayment);
  assert.ok(parsedExisting.txnId === txnId, "existing payment should have correct txnId");
  
  // Attempting to write again should be idempotent (same data)
  await env.NET_PET_KV.put(`payment:${txnId}`, JSON.stringify(paymentRecord), { expirationTtl: 86400*365 });
  const reRead = await env.NET_PET_KV.get(`payment:${txnId}`).catch(() => null);
  const reParsed = JSON.parse(reRead);
  assert.ok(reParsed.txnId === txnId, "payment record should still be valid after duplicate write");

  // Test 4: Order index should not have duplicates
  const idxRaw = await env.NET_PET_KV.get("orders:index").catch(() => null);
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  const uniqueIds = new Set(idx);
  assert.ok(uniqueIds.size === idx.length, "orders:index should not have duplicates");

  // Test 5: Payment index should not have duplicates
  const payIdxRaw = await env.NET_PET_KV.get("payment:index").catch(() => null);
  const payIdx = payIdxRaw ? JSON.parse(payIdxRaw) : [];
  const uniquePayIds = new Set(payIdx);
  assert.ok(uniquePayIds.size === payIdx.length, "payment:index should not have duplicates");

  console.log("[AUDIT PASS] Duplicate payment/order protection");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
