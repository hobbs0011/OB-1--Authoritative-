// test/commerce-promo-audit.mjs — audit/test promo system: validation, discount calculation, redemption, admin CRUD
// Run: node test/commerce-promo-audit.mjs

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
  console.log("[AUDIT] Promo system: validation, discount, redemption, admin CRUD");

  const promosMod = await load("promos.js");
  const cartMod = await load("cart.js");

  // Seed default promos
  await promosMod.getPromos(env);

  // Test promo lookup
  const promo = await promosMod.getPromoByCode(env, "LAUNCH10");
  assert.ok(promo && promo.code === "LAUNCH10", "promo lookup should find LAUNCH10");

  const missing = await promosMod.getPromoByCode(env, "MISSING");
  assert.ok(missing === null, "missing promo should return null");

  // Test validation: eligible cart
  const cart = { items: [{ type: "plan", planId: "net", totalVND: 725000 }] };
  const valid = await promosMod.validatePromo(env, "LAUNCH10", cart);
  assert.ok(valid.valid, "LAUNCH10 should be valid for NET plan");

  // Test validation: ineligible cart
  const invalidCart = { items: [{ type: "plan", planId: "free", totalVND: 0 }] };
  const invalid = await promosMod.validatePromo(env, "LAUNCH10", invalidCart);
  assert.ok(!invalid.valid, "LAUNCH10 should be invalid for FREE plan");

  // Test discount calculation: percentage
  const discount1 = await promosMod.calculateDiscount(env, "LAUNCH10", { items: cart.items, subtotalVND: 725000 });
  assert.ok(discount1.applied === true, "discount should apply");
  assert.ok(discount1.discountVND === 72500, "10% of 725000 should be 72500");

  // Test discount calculation: fixed
  const discount2 = await promosMod.calculateDiscount(env, "TEAM50K", { items: [{ type: "plan", planId: "team", totalVND: 2490000 }], subtotalVND: 2490000 });
  assert.ok(discount2.applied === true, "TEAM50K should apply to team plan");
  assert.ok(discount2.discountVND === 50000, "TEAM50K should discount 50000");

  // Test redemption increments count
  const redeemed = await promosMod.redeemPromo(env, "LAUNCH10");
  assert.ok(redeemed && redeemed.usedCount >= 1, "redemption should increment usedCount");

  // Test admin CRUD
  const created = await promosMod.createPromo(env, { code: "TEST50", type: "fixed", value: 50000, planIds: ["net"], usageLimit: 10 });
  assert.ok(created && created.code === "TEST50", "create promo should succeed");

  const updated = await promosMod.updatePromo(env, "TEST50", { value: 60000, usageLimit: 20 });
  assert.ok(updated && updated.value === 60000, "update promo should succeed");

  const deleted = await promosMod.deletePromo(env, "TEST50");
  assert.ok(deleted === undefined || deleted === null, "delete promo should succeed");

  // Test cart checkout with promo
  const checkout = await cartMod.validateCartForCheckout(env, { ownerId: "student-promo", items: [{ type: "plan", planId: "net", qty: 1 }], promo: "LAUNCH10" });
  console.log("CHECKOUT", JSON.stringify(checkout, null, 2));
  assert.ok(checkout.promo && checkout.promo.applied === true, "checkout should apply promo");
  assert.ok(checkout.totalVND === 652500, "checkout total should be 652500 after 10% discount");

  console.log("[AUDIT PASS] Promo system: validation, discount, redemption, admin CRUD");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
