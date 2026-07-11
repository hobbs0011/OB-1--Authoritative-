// src/cart.js — NET cart: line items, promo codes, expiry, student/employer scoped

import { getPlans, getAddons } from "./catalog.js";

const CART_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function cartKey(ownerId) {
  return `cart:${ownerId}`;
}

export function normalizeCartInput(body) {
  const ownerType = (body?.ownerType === "employer" ? "employer" : "student");
  const ownerId = String(body?.ownerId || "").trim();
  const studentId = String(body?.studentId || "").trim();
  const companyCode = String(body?.companyCode || "").trim();
  if (!ownerId) return { error: "ownerId required" };
  const items = Array.isArray(body?.items)
    ? body.items
        .filter(
          item =>
            item &&
            ((item.type === "plan" && item.planId) || (item.type === "addon" && item.addonId)) &&
            Number(item.qty || 1) >= 1
        )
        .map(item => ({
          type: item.type,
          planId: item.planId || null,
          addonId: item.addonId || null,
          qty: Number(item.qty || 1),
          label: item.label || null,
        }))
    : [];
  const promo = String(body?.promo || "").trim() || null;
  return { ownerType, ownerId, studentId, companyCode, items, promo };
}

export async function getCart(env, ownerId) {
  const raw = await env.NET_PET_KV.get(cartKey(ownerId)).catch(() => null);
  if (!raw) return { ownerId, items: [], promo: null, updatedAt: null };
  try { return JSON.parse(raw); } catch { return { ownerId, items: [], promo: null, updatedAt: null }; }
}

export async function saveCart(env, cart) {
  const payload = {
    ownerId: cart.ownerId,
    items: Array.isArray(cart.items) ? cart.items.slice(-50) : [],
    promo: cart.promo || null,
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(cartKey(payload.ownerId), JSON.stringify(payload), { expirationTtl: CART_TTL_SECONDS });
  return payload;
}

export async function clearCart(env, ownerId) {
  await env.NET_PET_KV.put(cartKey(ownerId), JSON.stringify({ ownerId, items: [], promo: null, updatedAt: new Date().toISOString() }), { expirationTtl: CART_TTL_SECONDS });
}

export async function applyCart(env, ownerId, nextCart) {
  const current = await getCart(env, ownerId);
  const mergedItems = [...(Array.isArray(current.items) ? current.items : [])];
  for (const item of Array.isArray(nextCart.items) ? nextCart.items : []) {
    const idx = mergedItems.findIndex(
      existing => existing.type === item.type && existing.planId === item.planId && existing.addonId === item.addonId
    );
    if (idx >= 0) {
      mergedItems[idx] = { ...mergedItems[idx], qty: mergedItems[idx].qty + (item.qty || 1) };
    } else {
      mergedItems.push(item);
    }
  }
  const payload = {
    ownerId,
    items: mergedItems.slice(-50),
    promo: nextCart.promo || current.promo || null,
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(cartKey(ownerId), JSON.stringify(payload), { expirationTtl: CART_TTL_SECONDS });
  return payload;
}

export async function validateCartForCheckout(env, cart) {
  const plans = await getPlans(env);
  const addons = await getAddons(env);
  const planMap = new Map(plans.filter(p => p.active).map(p => [p.id, p]));
  const addonMap = new Map(addons.filter(a => a.active).map(a => [a.id, a]));
  const errors = [];
  const lineItems = [];
  let totalVND = 0;

  for (const item of cart.items || []) {
    if (item.type === "plan") {
      const plan = planMap.get(item.planId);
      if (!plan) { errors.push(`Plan not found: ${item.planId}`); continue; }
      const qty = Math.max(1, Math.min(item.qty || 1, 10));
      totalVND += Number(plan.priceVND || 0) * qty;
      lineItems.push({ type: "plan", id: plan.id, name: plan.name, qty, unitPriceVND: Number(plan.priceVND || 0), totalVND: Number(plan.priceVND || 0) * qty });
    } else if (item.type === "addon") {
      const addon = addonMap.get(item.addonId);
      if (!addon) { errors.push(`Addon not found: ${item.addonId}`); continue; }
      const qty = Math.max(1, Math.min(item.qty || 1, 20));
      totalVND += Number(addon.priceVND || 0) * qty;
      lineItems.push({ type: "addon", id: addon.id, name: addon.name, qty, unitPriceVND: Number(addon.priceVND || 0), totalVND: Number(addon.priceVND || 0) * qty });
    } else {
      errors.push(`Unsupported item type: ${item.type}`);
    }
  }

  let promoResult = { discountVND: 0, applied: false };
  if (cart.promo) {
    const { calculateDiscount } = await import('./promos.js');
    const discountResult = await calculateDiscount(env, cart.promo, { items: lineItems, subtotalVND: totalVND });
    promoResult = { ...discountResult, code: cart.promo };
    if (!discountResult.applied && discountResult.error) {
      errors.push(discountResult.error);
    }
  }

  // Employer seat enforcement
  if (cart.ownerType === "employer" && cart.companyCode) {
    const { enforceSeatLimit } = await import('./seats.js');
    const requestedSeats = lineItems.filter(i => i.type === "plan").reduce((sum, i) => sum + i.qty, 0);
    const seatCheck = await enforceSeatLimit(env, cart.companyCode, requestedSeats);
    if (!seatCheck.allowed) {
      errors.push(seatCheck.error);
    }
  }

  const checkout = {
    ownerId: cart.ownerId,
    items: lineItems,
    subtotalVND: totalVND,
    promo: promoResult.applied ? promoResult : null,
    totalVND: totalVND - (promoResult.applied ? promoResult.discountVND : 0),
    errors,
  };
  return checkout;
}
