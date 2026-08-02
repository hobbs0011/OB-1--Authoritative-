// src/payments.js — payment event schema, webhook verification, fulfillment helper
// Supports: manual confirm, webhook callback, queue message

const PAYMENT_EVENT_TYPES = new Set([
  'payment.confirmed',
  'payment.failed',
  'payment.refunded',
  'subscription.renewed',
  'subscription.expired',
]);

function normalizePaymentEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const eventType = String(raw.type || raw.event_type || '').trim().toLowerCase();
  if (!PAYMENT_EVENT_TYPES.has(eventType)) return null;
  const provider = String(raw.provider || raw.source || 'manual').trim().toLowerCase();
  const txnId = String(raw.txnId || raw.transaction_id || raw.id || '').trim();
  const amountVND = Number(raw.amountVND ?? raw.amount ?? 0);
  const plan = String(raw.plan || raw.planId || '').trim().toLowerCase();
  const studentId = String(raw.studentId || raw.customer_id || '').trim();
  const companyCode = String(raw.companyCode || raw.company_code || '').trim().toUpperCase();
  const status = String(raw.status || 'confirmed').trim().toLowerCase();
  const occurredAt = String(raw.occurredAt || raw.createdAt || new Date().toISOString()).trim();
  const meta = typeof raw.meta === 'object' ? raw.meta : {};
  if (!txnId || !plan) return null;
  return {
    eventType, provider, txnId, amountVND, plan, studentId, companyCode, status, occurredAt, meta,
  };
}

function verifyWebhookSignature(secret, signature, body) {
  if (!secret || !signature) return false;
  // Simple HMAC-SHA256 verification; replace with provider-specific format as needed.
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(String(secret));
    const msgData = typeof body === 'string' ? encoder.encode(body) : encoder.encode(JSON.stringify(body));
    return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(key => crypto.subtle.sign('HMAC', key, msgData))
      .then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''))
      .then(computed => computed === String(signature).trim().toLowerCase());
  } catch {
    return false;
  }
}

export {
  PAYMENT_EVENT_TYPES,
  normalizePaymentEvent,
  verifyWebhookSignature,
};

