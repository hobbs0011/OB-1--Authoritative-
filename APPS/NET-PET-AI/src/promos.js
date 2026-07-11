// src/promos.js — NET promo/discount engine: codes, validation, calculation

const PROMO_PREFIX = "promo:";

function promoKey(code) {
  return `${PROMO_PREFIX}${code.toUpperCase().trim()}`;
}

const DEFAULT_PROMOS = [
  {
    code: "LAUNCH10",
    type: "percentage",
    value: 10,
    currency: "VND",
    minAmountVND: 0,
    maxDiscountVND: 500000,
    planIds: ["net", "team"],
    addonIds: [],
    usageLimit: 1000,
    usedCount: 0,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2027-01-01T00:00:00Z",
    active: true,
  },
  {
    code: "TEAM50K",
    type: "fixed",
    value: 50000,
    currency: "VND",
    minAmountVND: 1000000,
    maxDiscountVND: 50000,
    planIds: ["team"],
    addonIds: [],
    usageLimit: 500,
    usedCount: 0,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2027-01-01T00:00:00Z",
    active: true,
  },
];

export async function getPromos(env) {
  // Promos are stored as individual keys; scan for them
  const listed = await env.NET_PET_KV.list({ prefix: PROMO_PREFIX }).catch(() => ({ keys: [], list_complete: true }));
  const promos = [];
  for (const k of listed.keys) {
    const raw = await env.NET_PET_KV.get(k.name).catch(() => null);
    if (!raw) continue;
    try { promos.push(JSON.parse(raw)); } catch { /* skip */ }
  }
  if (promos.length === 0) {
    await seedDefaultPromos(env);
    return DEFAULT_PROMOS.slice();
  }
  return promos;
}

export async function getPromoByCode(env, code) {
  if (!code) return null;
  const raw = await env.NET_PET_KV.get(promoKey(code)).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function validatePromo(env, code, cart) {
  const promo = await getPromoByCode(env, code);
  if (!promo) return { valid: false, reason: "Promo code not found" };
  if (!promo.active) return { valid: false, reason: "Promo code is inactive" };
  const now = new Date();
  if (promo.startsAt && new Date(promo.startsAt) > now) return { valid: false, reason: "Promo code has not started yet" };
  if (promo.expiresAt && new Date(promo.expiresAt) < now) return { valid: false, reason: "Promo code has expired" };
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { valid: false, reason: "Promo code usage limit reached" };
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const hasEligiblePlan = items.some(i => (i.type === "plan" && (promo.planIds.includes(i.planId) || promo.planIds.includes(i.id))));
  const hasEligibleAddon = items.some(i => (i.type === "addon" && (promo.addonIds.includes(i.addonId) || promo.addonIds.includes(i.id))));
  if (!hasEligiblePlan && !hasEligibleAddon) return { valid: false, reason: "No eligible items in cart" };
  return { valid: true, promo };
}

export async function calculateDiscount(env, code, cart) {
  const validation = await validatePromo(env, code, cart);
  if (!validation.valid) return { discountVND: 0, applied: false, error: validation.reason };
  const promo = validation.promo;
  const subtotal = (cart.items || []).reduce((sum, i) => sum + (i.totalVND || 0), 0);
  if (subtotal < (promo.minAmountVND || 0)) return { discountVND: 0, applied: false, error: `Minimum order amount is ${promo.minAmountVND} VND` };
  let discount = 0;
  if (promo.type === "percentage") {
    discount = Math.round(subtotal * (promo.value / 100));
  } else if (promo.type === "fixed") {
    discount = Math.min(promo.value, subtotal);
  }
  discount = Math.min(discount, promo.maxDiscountVND || discount);
  return { discountVND: discount, applied: true, promoCode: promo.code, type: promo.type, value: promo.value };
}

export async function redeemPromo(env, code) {
  const promo = await getPromoByCode(env, code);
  if (!promo || !promo.active) return null;
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return null;
  const updated = { ...promo, usedCount: (promo.usedCount || 0) + 1, lastUsedAt: new Date().toISOString() };
  await env.NET_PET_KV.put(promoKey(code), JSON.stringify(updated));
  return updated;
}

export async function createPromo(env, promo) {
  if (!promo?.code) return null;
  const normalized = {
    ...promo,
    code: promo.code.toUpperCase().trim(),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(promoKey(normalized.code), JSON.stringify(normalized));
  return normalized;
}

export async function updatePromo(env, code, updates) {
  const existing = await getPromoByCode(env, code);
  if (!existing) return null;
  const updated = { ...existing, ...updates, code: existing.code, updatedAt: new Date().toISOString() };
  await env.NET_PET_KV.put(promoKey(code), JSON.stringify(updated));
  return updated;
}

export async function deletePromo(env, code) {
  await env.NET_PET_KV.delete(promoKey(code)).catch(() => {});
}

async function seedDefaultPromos(env) {
  for (const promo of DEFAULT_PROMOS) {
    await env.NET_PET_KV.put(promoKey(promo.code), JSON.stringify(promo));
  }
}
