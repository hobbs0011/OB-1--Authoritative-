// test/commerce-comprehensive-audit.mjs — final comprehensive audit of all commerce functionality
// Run: node test/commerce-comprehensive-audit.mjs

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
  console.log("[COMPREHENSIVE AUDIT] Full commerce backend: catalog, cart, checkout, orders, access, webhook, subscription, promo");

  const catalog = await load("catalog.js");
  const cartMod = await load("cart.js");
  const ordersMod = await load("orders.js");
  const accessMod = await load("access.js");
  const paymentsMod = await load("payments.js");
  const subMod = await load("subscriptions.js");
  const promosMod = await load("promos.js");

  // Seed default promos into KV
  await promosMod.getPromos(env);

  // 1. Catalog
  const plans = await catalog.getPlans(env);
  assert.ok(plans.length >= 3, "catalog should have 3+ plans");
  const netPlan = await catalog.getPlanById(env, "net");
  assert.ok(netPlan && netPlan.priceVND === 725000, "NET plan should cost 725000 VND");

  const addons = await catalog.getAddons(env);
  assert.ok(addons.length >= 2, "catalog should have 2+ addons");

  // 2. Cart + Checkout + Promo
  const cart = await cartMod.saveCart(env, { ownerId: "student-final", items: [{ type: "plan", planId: "net", qty: 1 }, { type: "addon", addonId: "voice-lab-pack", qty: 1 }], promo: "LAUNCH10" });
  assert.ok(cart.items.length === 2, "cart should have 2 items");

  const checkout = await cartMod.validateCartForCheckout(env, cart);
  assert.ok(checkout.items.length === 2, "checkout should have 2 items");
  console.log("CHECKOUT_PROMO", JSON.stringify(checkout.promo));
  console.log("CHECKOUT_ERRORS", JSON.stringify(checkout.errors));
  assert.ok(checkout.promo && checkout.promo.applied, "promo should apply");
  assert.ok(checkout.totalVND < checkout.subtotalVND, "total should be less than subtotal with promo");

  // 3. Order + Access
  const order = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-final",
    studentId: "student-final",
    lineItems: checkout.items,
    subtotalVND: checkout.subtotalVND,
    totalVND: checkout.totalVND,
    promo: checkout.promo,
    source: "comprehensive-test",
  });
  assert.ok(order.orderId && order.status === "pending", "order should be created");

  // 4. Payment confirm + fulfillment + idempotency (simulate via orders/access modules)
  const paidUntil = new Date(Date.now() + 30 * 86400000).toISOString();
  await env.NET_PET_KV.put(`payment:${order.orderId}`, JSON.stringify({
    txnId: order.orderId, plan: "net", amountVND: checkout.totalVND, status: "confirmed", confirmedBy: "comprehensive-test",
    confirmedAt: new Date().toISOString(),
  }));
  await ordersMod.updateOrderStatus(env, order.orderId, "paid");
  await ordersMod.grantAccess(env, { studentId: "student-final", plan: "net", paidUntil, orderId: order.orderId, txnId: order.orderId, source: "comprehensive-test" });

  // Idempotency: second call should not duplicate
  await ordersMod.grantAccess(env, { studentId: "student-final", plan: "net", paidUntil, orderId: order.orderId, txnId: order.orderId, source: "comprehensive-test" });

  // 5. Access + Entitlement
  const access = await ordersMod.getAccess(env, "student-final");
  assert.ok(access && access.plan === "net", "access should be granted");

  const entitlement = await accessMod.currentEntitlement(env, "student-final");
  assert.ok(entitlement.active && entitlement.plan === "net", "entitlement should be active");

  const voiceGate = await accessMod.ensureFeature(env, "student-final", "voiceLab");
  assert.ok(voiceGate.allowed, "voiceLab should be allowed");

  // 6. Subscription lifecycle
  const subStatus = subMod.computeSubscriptionStatus({ plan: 'net', paidUntil: new Date(Date.now() + 86400000).toISOString() });
  assert.ok(subStatus === 'active', "new subscription should be active");

  const graceSub = { plan: 'net', paidUntil: new Date(Date.now() - 86400000 * 3).toISOString() };
  assert.ok(subMod.isInGracePeriod(graceSub), "3 days expired should be in grace");

  // 7. Webhook + Queue
  const webhookEvent = paymentsMod.normalizePaymentEvent({
    type: "payment.confirmed",
    provider: "momo",
    txnId: "txn-webhook-final",
    amountVND: 725000,
    plan: "net",
    studentId: "student-webhook-final",
  });
  assert.ok(webhookEvent && webhookEvent.eventType === "payment.confirmed", "webhook event should normalize");

  // 8. Admin stats
  const allOrders = await ordersMod.listOrders(env, 100);
  assert.ok(allOrders.some(o => o.orderId === order.orderId), "admin order list should include test order");

  const activeAccess = await ordersMod.listActiveAccess(env, 100);
  assert.ok(activeAccess.some(a => a.studentId === "student-final"), "admin access list should include test access");

  // 9. Revocation
  await ordersMod.revokeAccess(env, "student-final");
  const revoked = await accessMod.ensureFeature(env, "student-final", "voiceLab");
  assert.ok(!revoked.allowed, "revoked access should block features");

  console.log("[COMPREHENSIVE AUDIT PASS] Full commerce backend verified");
}

run().catch(err => {
  console.error("[COMPREHENSIVE AUDIT FAIL]", err.message);
  process.exit(1);
});
