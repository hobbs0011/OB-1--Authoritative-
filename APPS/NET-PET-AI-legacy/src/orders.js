// src/orders.js — NET order/fulfillment: purchases, access grants, invoices
import { assignSeat } from './seats.js';

const ORDER_INDEX_KEY = "orders:index";
const PAYMENT_INDEX_KEY = "payment:index";

function orderKey(id) {
  return `order:${id}`;
}
function accessKey(studentId) {
  return `access:${studentId}`;
}
function paymentKey(txnId) {
  return `payment:${txnId}`;
}
function invoicePrefix() {
  return "inv:";
}

function generateOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

// Deterministic order ID for duplicate detection: based on cart content hash
function generateDeterministicOrderId(ownerType, ownerId, lineItems, totalVND) {
  const itemsHash = Array.isArray(lineItems) ? lineItems.map(i => `${i.type}:${i.id}:${i.qty}`).join('|') : '';
  const raw = `${ownerType}:${ownerId}:${itemsHash}:${totalVND}`;
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `ORD-DET-${Date.now().toString(36).toUpperCase()}-${hex}`;
}

export async function createOrder(env, { ownerType, ownerId, studentId, companyCode, lineItems, subtotalVND, totalVND, promo, source, idempotencyKey }) {
  // Check for duplicate order by idempotency key or deterministic content hash
  let existingOrderId = null;
  if (idempotencyKey) {
    const idempKey = `idempotency:order:${idempotencyKey}`;
    const existingIdemp = await env.NET_PET_KV.get(idempKey).catch(() => null);
    if (existingIdemp) {
      const existingOrder = await getOrder(env, existingIdemp);
      if (existingOrder) return existingOrder;
    }
  }
  
  // Also check for duplicate by content hash (prevents accidental double-submit)
  const detOrderId = generateDeterministicOrderId(ownerType, ownerId, lineItems, totalVND);
  const detKey = orderKey(detOrderId);
  const existingDet = await env.NET_PET_KV.get(detKey).catch(() => null);
  if (existingDet) {
    try { return JSON.parse(existingDet); } catch { /* continue */ }
  }

  const orderId = idempotencyKey ? detOrderId : generateOrderId();
  const now = new Date().toISOString();
  const order = {
    orderId,
    ownerType: ownerType || "student",
    ownerId: ownerId || studentId || companyCode,
    studentId: studentId || null,
    companyCode: companyCode || null,
    lineItems: Array.isArray(lineItems) ? lineItems : [],
    subtotalVND: Number(subtotalVND || 0),
    promo: promo || null,
    totalVND: Number(totalVND || 0),
    status: "pending",
    source: source || "manual",
    createdAt: now,
    updatedAt: now,
  };

  await env.NET_PET_KV.put(orderKey(orderId), JSON.stringify(order));
  const idxRaw = await env.NET_PET_KV.get(ORDER_INDEX_KEY).catch(() => null);
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  if (!idx.includes(orderId)) { idx.push(orderId); await env.NET_PET_KV.put(ORDER_INDEX_KEY, JSON.stringify(idx.slice(-2000))); }

  // Store idempotency key for duplicate detection
  if (idempotencyKey) {
    await env.NET_PET_KV.put(`idempotency:order:${idempotencyKey}`, orderId, { expirationTtl: 86400 * 7 });
  }

  // Employer seat assignment
  if (ownerType === "employer" && companyCode && lineItems) {
    const planItems = lineItems.filter(i => i.type === "plan");
    const studentIds = [studentId].filter(Boolean);
    // If no specific studentId provided, create placeholder employer record
    if (studentIds.length === 0 && planItems.length > 0) {
      // Order created but seats not yet assigned to specific students
    }
  for (const sid of studentIds) {
    await assignSeat(env, companyCode, sid, { plan: planItems[0]?.id || order.companyCode, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() });
  }
  }

  // Create invoice record
  try {
    const { createInvoice } = await import('./invoices.js');
    await createInvoice(env, order, { status: 'pending', sendEmail: false });
  } catch (e) {
    console.warn(`[ORDER] Failed to create invoice for ${order.orderId}:`, e.message);
  }

  return order;
}

export async function getOrder(env, orderId) {
  const raw = await env.NET_PET_KV.get(orderKey(orderId)).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function updateOrderStatus(env, orderId, status, meta = {}) {
  const raw = await env.NET_PET_KV.get(orderKey(orderId)).catch(() => null);
  if (!raw) return null;
  const order = JSON.parse(raw);
  order.status = status;
  order.updatedAt = new Date().toISOString();
  Object.assign(order, meta);
  await env.NET_PET_KV.put(orderKey(orderId), JSON.stringify(order));
  return order;
}

export async function listOrders(env, limit = 100) {
  const idxRaw = await env.NET_PET_KV.get(ORDER_INDEX_KEY).catch(() => null);
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  const slice = idx.slice(-limit);
  const orders = await Promise.all(slice.map(id => getOrder(env, id)));
  return orders.filter(Boolean);
}

export async function grantAccess(env, { studentId, plan, paidUntil, orderId, txnId, source }) {
  const key = accessKey(studentId);
  const raw = await env.NET_PET_KV.get(key).catch(() => null);
  const current = raw ? JSON.parse(raw) : {};
  const record = {
    studentId,
    plan: plan || current.plan || "none",
    status: "active",
    paidUntil: paidUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
    orderId: orderId || current.orderId || null,
    txnId: txnId || current.txnId || null,
    source: source || current.source || "manual",
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(key, JSON.stringify(record));
  return record;
}

export async function getAccess(env, studentId) {
  const raw = await env.NET_PET_KV.get(accessKey(studentId)).catch(() => null);
  if (!raw) return { studentId, plan: "none", status: "no_access" };
  try { return JSON.parse(raw); } catch { return { studentId, plan: "none", status: "no_access" }; }
}

export async function revokeAccess(env, studentId) {
  const record = { studentId, plan: "none", status: "revoked", updatedAt: new Date().toISOString() };
  await env.NET_PET_KV.put(accessKey(studentId), JSON.stringify(record));
  return record;
}

export async function listActiveAccess(env, limit = 500) {
  const listed = await env.NET_PET_KV.list({ prefix: "access:" }).catch(() => ({ keys: [], list_complete: true }));
  const out = [];
  for (const k of listed.keys.slice(0, limit)) {
    const raw = await env.NET_PET_KV.get(k.name).catch(() => null);
    if (!raw) continue;
    try {
      const row = JSON.parse(raw);
      if (row.status === "active" && row.paidUntil && new Date(row.paidUntil) > new Date()) out.push(row);
    } catch { /* skip */ }
  }
  out.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return out;
}
