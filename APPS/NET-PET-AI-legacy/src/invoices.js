// src/invoices.js — NET invoice records: generation, PDF placeholder, email queue

const INVOICE_PREFIX = "inv:";

function invoiceKey(id) {
  return `${INVOICE_PREFIX}${id}`;
}

function generateInvoiceId(orderId) {
  const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
  const suffix = orderId.slice(-6).toUpperCase();
  return `INV-${timestamp}-${suffix}`;
}

export async function createInvoice(env, order, options = {}) {
  if (!order) return null;
  const invoiceId = generateInvoiceId(order.orderId);
  const now = new Date().toISOString();
  const invoice = {
    invoiceId,
    orderId: order.orderId,
    customer: {
      studentId: order.studentId,
      companyCode: order.companyCode,
      ownerType: order.ownerType,
      ownerId: order.ownerId,
    },
    lineItems: order.lineItems || [],
    subtotalVND: order.subtotalVND || 0,
    promo: order.promo || null,
    totalVND: order.totalVND || 0,
    currency: "VND",
    status: options.status || "draft",
    issuedAt: options.issuedAt || now,
    sentAt: null,
    pdfUrl: options.pdfUrl || null,
    meta: options.meta || {},
    createdAt: now,
    updatedAt: now,
  };
  await env.NET_PET_KV.put(invoiceKey(invoiceId), JSON.stringify(invoice));
  
  // Queue invoice email if requested
  if (options.sendEmail && env.net_pet_notifications) {
    try {
      const { queueEmail } = await import('./email-service.js');
      await queueEmail(env, {
        type: "invoice",
        to: options.recipientEmail || "",
        subject: `Invoice ${invoiceId} — Natural English Training`,
        html: generateInvoiceHtml(invoice),
        invoiceId,
        orderId: order.orderId,
      });
      invoice.sentAt = now;
      invoice.status = "sent";
      await env.NET_PET_KV.put(invoiceKey(invoiceId), JSON.stringify(invoice));
    } catch (e) {
      console.warn(`[INVOICE] Failed to queue email for ${invoiceId}:`, e.message);
    }
  }
  
  return invoice;
}

export async function getInvoice(env, invoiceId) {
  const raw = await env.NET_PET_KV.get(invoiceKey(invoiceId)).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function listInvoices(env, limit = 100) {
  const listed = await env.NET_PET_KV.list({ prefix: INVOICE_PREFIX }).catch(() => ({ keys: [] }));
  const invoices = [];
  for (const k of listed.keys.slice(0, limit)) {
    const raw = await env.NET_PET_KV.get(k.name).catch(() => null);
    if (!raw) continue;
    try { invoices.push(JSON.parse(raw)); } catch { /* skip */ }
  }
  invoices.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return invoices;
}

export async function updateInvoiceStatus(env, invoiceId, status, meta = {}) {
  const existing = await getInvoice(env, invoiceId);
  if (!existing) return null;
  const updated = {
    ...existing,
    status,
    ...meta,
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(invoiceKey(invoiceId), JSON.stringify(updated));
  return updated;
}

function generateInvoiceHtml(invoice) {
  const itemsHtml = (invoice.lineItems || []).map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name || item.id}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty || 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.unitPriceVND || 0).toLocaleString('vi-VN')} VND</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.totalVND || 0).toLocaleString('vi-VN')} VND</td>
    </tr>
  `).join('');
  
  const promoHtml = invoice.promo?.applied ? `
    <tr>
      <td colspan="3" style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #22c55e;">Discount (${invoice.promo.code || invoice.promo.promoCode || 'PROMO'})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #22c55e;">-${(invoice.promo.discountVND || 0).toLocaleString('vi-VN')} VND</td>
    </tr>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Invoice ${invoice.invoiceId}</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a1a1a;">Natural English Training</h1>
      <h2 style="color: #666;">Invoice ${invoice.invoiceId}</h2>
      <p><strong>Order:</strong> ${invoice.orderId}</p>
      <p><strong>Date:</strong> ${new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}</p>
      <p><strong>Customer:</strong> ${invoice.customer?.studentId || invoice.customer?.companyCode || 'N/A'}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Unit Price</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          ${promoHtml}
          <tr style="font-weight: bold; background: #f9f9f9;">
            <td colspan="3" style="padding: 12px 8px; text-align: right;">Total</td>
            <td style="padding: 12px 8px; text-align: right;">${(invoice.totalVND || 0).toLocaleString('vi-VN')} VND</td>
          </tr>
        </tbody>
      </table>
      
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        This is a system-generated invoice. For questions, contact support@naturalenglishtraining.com.
      </p>
    </body>
    </html>
  `;
}
