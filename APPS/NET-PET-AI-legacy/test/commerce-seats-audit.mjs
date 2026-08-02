// test/commerce-seats-audit.mjs — audit/test employer/team seat enforcement
// Run: node test/commerce-seats-audit.mjs

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
  console.log("[AUDIT] Employer/team seat enforcement");

  const seatsMod = await load("seats.js");
  const cartMod = await load("cart.js");

  // Test employer creation
  const employer = await seatsMod.createEmployer(env, { companyCode: "TESTCORP", name: "Test Corp", seatLimit: 3 });
  assert.ok(employer && employer.companyCode === "TESTCORP", "employer should be created");
  assert.ok(employer.seatLimit === 3, "seatLimit should be 3");

  // Test seat assignment within limit
  const seat1 = await seatsMod.assignSeat(env, "TESTCORP", "student-seat-1", { plan: "team" });
  assert.ok(seat1.success, "seat assignment should succeed within limit");
  assert.ok(seat1.employer.assignedSeats === 1, "assignedSeats should be 1");

  // Test seat assignment at limit
  await seatsMod.assignSeat(env, "TESTCORP", "student-seat-2", { plan: "team" });
  const seat3 = await seatsMod.assignSeat(env, "TESTCORP", "student-seat-3", { plan: "team" });
  assert.ok(seat3.success, "third seat assignment should succeed at limit");
  assert.ok(seat3.employer.assignedSeats === 3, "assignedSeats should be 3");

  // Test seat assignment beyond limit
  const seat4 = await seatsMod.assignSeat(env, "TESTCORP", "student-seat-4", { plan: "team" });
  assert.ok(!seat4.success, "fourth seat assignment should fail beyond limit");
  assert.ok(seat4.error && seat4.error.includes("limit"), "error should mention limit");

  // Test seat removal
  const removed = await seatsMod.removeSeat(env, "TESTCORP", "student-seat-1");
  assert.ok(removed.success, "seat removal should succeed");
  assert.ok(removed.employer.assignedSeats === 2, "assignedSeats should be 2 after removal");

  // Test seat enforcement in cart checkout
  const cart = { ownerType: "employer", companyCode: "TESTCORP", items: [{ type: "plan", planId: "team", qty: 1 }] };
  const checkout = await cartMod.validateCartForCheckout(env, cart);
  // Should pass since we have 1 seat available (limit 3, 2 assigned)
  assert.ok(checkout.errors.length === 0 || !checkout.errors.some(e => e.includes("limit")), "checkout should not have seat limit error when within limit");

  // Test seat enforcement beyond limit
  const cartOver = { ownerType: "employer", companyCode: "TESTCORP", items: [{ type: "plan", planId: "team", qty: 2 }] };
  const checkoutOver = await cartMod.validateCartForCheckout(env, cartOver);
  assert.ok(checkoutOver.errors.some(e => e.includes("limit")), "checkout should fail with seat limit error");

  // Test employer stats
  const stats = await seatsMod.getEmployerStats(env, "TESTCORP");
  assert.ok(stats && stats.activeSeats === 2, "activeSeats should be 2");
  assert.ok(stats.utilization === 66 || stats.utilization === 67, "utilization should be ~66%");

  // Test seat listing
  const seats = await seatsMod.listEmployerSeats(env, "TESTCORP");
  assert.ok(seats.length === 2, "should list 2 active seats");

  // Test getEmployer
  const fetched = await seatsMod.getEmployer(env, "TESTCORP");
  assert.ok(fetched && fetched.name === "Test Corp", "getEmployer should return correct name");

  console.log("[AUDIT PASS] Employer/team seat enforcement");
}

run().catch(err => {
  console.error("[AUDIT FAIL]", err.message);
  process.exit(1);
});
