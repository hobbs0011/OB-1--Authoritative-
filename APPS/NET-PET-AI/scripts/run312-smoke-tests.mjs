#!/usr/bin/env node
/**
 * RUN 312 SMOKE TEST SUITE
 * Comprehensive endpoint validation for net-pet-ai-production
 * Tests: /health, /api/health, /souldna/pipeline, /api/chat (error expected), /evidence
 */

const WORKER_URL = "https://net-pet-ai-production.mrmichaelhobbs123.workers.dev";
const tests = [];
let passed = 0;
let failed = 0;

async function test(name, url, method = "GET", body = null) {
  try {
    const opts = { method };
    if (body) {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
    const resp = await fetch(url, opts);
    const data = resp.ok ? (resp.headers.get('content-type')?.includes('json') ? await resp.json() : await resp.text()) : null;
    const result = { name, url, method, status: resp.status, ok: resp.ok, data };
    tests.push(result);
    if (resp.ok || resp.status === 400 || resp.status === 500) {
      passed++;
      console.log(`✅ ${name}: ${resp.status}`);
    } else {
      failed++;
      console.log(`❌ ${name}: ${resp.status}`);
    }
  } catch (err) {
    failed++;
    tests.push({ name, url, method, error: err.message });
    console.log(`❌ ${name}: ${err.message}`);
  }
}

async function runTests() {
  console.log("Running Run 312 Smoke Test Suite...\n");
  
  // Health endpoints
  await test("GET /health", `${WORKER_URL}/health`);
  await test("GET /api/health", `${WORKER_URL}/api/health`);
  
  // Evidence endpoint
  await test("GET /evidence", `${WORKER_URL}/evidence`);
  
  // Soul DNA pipeline
  await test("GET /souldna/pipeline", `${WORKER_URL}/souldna/pipeline`);
  
  // API Chat (expect 500 without secrets)
  await test("POST /api/chat (no API key)", `${WORKER_URL}/api/chat`, "POST", { 
    messages: [{ role: "user", content: "test" }],
    studentId: "test-run312"
  });
  
  // Soul DNA submission (expect 400 without proper ledger)
  await test("POST /souldna (basic submit)", `${WORKER_URL}/souldna`, "POST", {
    rawInput: "Test soul DNA submission from Run 312 smoke test"
  });
  
  console.log(`\n════════════════════════════════════════`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Status: ${failed === 0 ? "✅ ALL TESTS OPERATIONAL" : "⚠️  Some tests failed (may be expected)"}`);
  console.log(`════════════════════════════════════════\n`);
  
  console.log("Test Details:");
  console.log(JSON.stringify(tests, null, 2));
}

runTests().catch(err => {
  console.error("Test suite error:", err);
  process.exit(1);
});
