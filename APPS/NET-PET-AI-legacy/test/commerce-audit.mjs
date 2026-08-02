// test/commerce-audit.mjs — audit/test steps 1-4: catalog, cart, orders, access
// Run: node test/commerce-audit.mjs

const assert = { ok: (cond, msg) => { if (!cond) throw new Error(msg); } };

const MEM = new Map();
const env = {
  NET_PET_KV: {
    async get(key) {
      const v = MEM.get(key);
      return v ?? null;
    },
    async put(key, value, opts) {
      MEM.set(key, value);
      if (opts?.expirationTtl) {
        // simplified: ignore actual expiry in audit
      }
    },
    async list({ prefix, cursor }) {
      const out = [];
      for (const k of MEM.keys()) {
        if (prefix && !k.startsWith(prefix)) continue;
        out.push({ name: k });
      }
      return { keys: out, list_complete: true, cursor: undefined };
    },
  },
};

async function load(name) {
  const mod = await import(`../src/${name}`);
  return mod;
}

async function run() {
  console.log("[AUDIT] Step 1-4: catalog, cart, orders, access");

  // Catalog
  const catalog = await load("catalog.js");
  let plans = await catalog.getPlans(env);
  assert.ok(Array.isArray(plans) && plans.length >= 3, "catalog seed plans missing");
  const plan = await catalog.getPlanById(env, "net");
  assert.ok(plan && plan.id === "net", "plan lookup failed");
  await catalog.replacePlans(env, plans.slice(0, 2));
  plans = await catalog.getPlans(env);
  assert.ok(plans.length === 2, "replacePlans did not persist");

  let addons = await catalog.getAddons(env);
  assert.ok(addons.length >= 2, "catalog seed addons missing");
  const addon = await catalog.getAddonById(env, "voice-lab-pack");
  assert.ok(addon && addon.id === "voice-lab-pack", "addon lookup failed");

  // Cart
  const cartMod = await load("cart.js");
  let cart = await cartMod.getCart(env, "student-1");
  assert.ok(Array.isArray(cart.items), "empty cart missing items array");
  cart = await cartMod.saveCart(env, { ownerId: "student-1", items: [{ type: "plan", planId: "net", qty: 1 }] });
  assert.ok(cart.items.length === 1, "saveCart missing item");
  cart = await cartMod.applyCart(env, "student-1", { items: [{ type: "addon", addonId: "voice-lab-pack", qty: 2 }], promo: "LAUNCH10" });
  assert.ok(cart.items.length === 2, "applyCart merge failed");
  const checkout = await cartMod.validateCartForCheckout(env, cart);
  assert.ok(checkout.items.length === 2, "checkout validation lost items");
  assert.ok(checkout.totalVND > 0, "checkout total should be >0");
  assert.ok(!checkout.errors.length, `checkout errors: ${checkout.errors.join(",")}`);

  // Orders
  const ordersMod = await load("orders.js");
  const order = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-1",
    studentId: "student-1",
    lineItems: checkout.items,
    subtotalVND: checkout.subtotalVND,
    totalVND: checkout.totalVND,
    promo: checkout.promo,
    source: "web",
  });
  assert.ok(order.orderId && order.status === "pending", "order creation failed");
  const fetched = await ordersMod.getOrder(env, order.orderId);
  assert.ok(fetched && fetched.orderId === order.orderId, "order fetch failed");

  const updated = await ordersMod.updateOrderStatus(env, order.orderId, "paid", { txnId: "txn-123" });
  assert.ok(updated && updated.status === "paid", "order status update failed");

  const access = await ordersMod.grantAccess(env, { studentId: "student-1", plan: "net", paidUntil: new Date(Date.now() + 86400000).toISOString(), orderId: order.orderId, txnId: "txn-123", source: "web" });
  assert.ok(access && access.plan === "net", "grantAccess failed");

  const fetchedAccess = await ordersMod.getAccess(env, "student-1");
  assert.ok(fetchedAccess && fetchedAccess.plan === "net", "getAccess failed");

  // Access entitlement
  const accessMod = await load("access.js");
  const entitlement = await accessMod.currentEntitlement(env, "student-1");
  assert.ok(entitlement.plan === "net", "entitlement plan mismatch");
  assert.ok(entitlement.active, "entitlement should be active");

  const featureGate = await accessMod.ensureFeature(env, "student-1", "voiceLab");
  assert.ok(featureGate.allowed, "voiceLab should be allowed on net plan");

  const freeGate = await accessMod.ensureFeature(env, "student-1", "aiTutor");
  assert.ok(freeGate.allowed, "aiTutor should be allowed on net plan");

  await ordersMod.revokeAccess(env, "student-1");
  const revoked = await accessMod.ensureFeature(env, "student-1", "voiceLab");
  assert.ok(!revoked.allowed, "voiceLab should be blocked after revoke");

  // List orders/access
  const allOrders = await ordersMod.listOrders(env, 50);
  assert.ok(Array.isArray(allOrders) && allOrders.length >= 1, "listOrders empty");
  const activeAccess = await ordersMod.listActiveAccess(env, 50);
  assert.ok(Array.isArray(activeAccess), "listActiveAccess not array");

  console.log("[AUDIT PASS] Steps 1-4: catalog, cart, orders, access");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
