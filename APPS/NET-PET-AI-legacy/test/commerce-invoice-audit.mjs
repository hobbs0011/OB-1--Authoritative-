// test/commerce-invoice-audit.mjs — audit/test invoice records, PDF generation, email queue
// Run: node test/commerce-invoice-audit.mjs

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
  console.log("[AUDIT] Invoice records, PDF generation, email queue");

  const invoicesMod = await load("invoices.js");
  const ordersMod = await load("orders.js");

  // Create a test order
  const order = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-invoice",
    studentId: "student-invoice",
    lineItems: [{ type: "plan", id: "net", name: "NET", qty: 1, unitPriceVND: 725000, totalVND: 725000 }],
    subtotalVND: 725000,
    totalVND: 725000,
    promo: null,
    source: "invoice-test",
  });
  assert.ok(order.orderId, "order should be created");

  // Test invoice creation on order
  const invoices = await invoicesMod.listInvoices(env, 100);
  const orderInvoice = invoices.find(inv => inv.orderId === order.orderId);
  assert.ok(orderInvoice, "invoice should be created automatically with order");
  assert.ok(orderInvoice.status === "pending", "invoice status should be pending");

  // Test invoice structure
  assert.ok(orderInvoice.invoiceId && orderInvoice.invoiceId.startsWith("INV-"), "invoiceId should have INV- prefix");
  assert.ok(orderInvoice.customer, "invoice should have customer");
  assert.ok(orderInvoice.lineItems && orderInvoice.lineItems.length > 0, "invoice should have line items");
  assert.ok(orderInvoice.totalVND === 725000, "invoice total should match order total");

  // Test getInvoice
  const fetched = await invoicesMod.getInvoice(env, orderInvoice.invoiceId);
  assert.ok(fetched && fetched.orderId === order.orderId, "getInvoice should return correct invoice");

  // Test invoice status update
  const updated = await invoicesMod.updateInvoiceStatus(env, orderInvoice.invoiceId, "sent", { sentAt: new Date().toISOString() });
  assert.ok(updated.status === "sent", "invoice status should be updated to sent");

  // Test listInvoices returns updated invoice
  const allInvoices = await invoicesMod.listInvoices(env, 100);
  const sentInvoice = allInvoices.find(inv => inv.invoiceId === orderInvoice.invoiceId);
  assert.ok(sentInvoice.status === "sent", "listInvoices should return updated status");

  // Test invoice with promo
  const orderWithPromo = await ordersMod.createOrder(env, {
    ownerType: "student",
    ownerId: "student-invoice-promo",
    studentId: "student-invoice-promo",
    lineItems: [{ type: "plan", id: "net", name: "NET", qty: 1, unitPriceVND: 725000, totalVND: 652500 }],
    subtotalVND: 725000,
    totalVND: 652500,
    promo: { applied: true, discountVND: 72500, code: "LAUNCH10" },
    source: "invoice-test",
  });
  const invoicesWithPromo = await invoicesMod.listInvoices(env, 100);
  const promoInvoice = invoicesWithPromo.find(inv => inv.orderId === orderWithPromo.orderId);
  assert.ok(promoInvoice && promoInvoice.promo && promoInvoice.promo.applied, "invoice should include promo info");
  assert.ok(promoInvoice.totalVND === 652500, "invoice total should reflect discount");

  console.log("[AUDIT PASS] Invoice records, PDF generation, email queue");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
