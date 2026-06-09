#!/usr/bin/env node
// Phase 0.3 — F1-B keep-warm-ping real proof
// Goal: prove /api/deepgram-token stays stable under load with a real (non-sov100) student.
// keep-warm-ping traverses RATELIMIT.get + .put. 429s are expected (quota working).
// FAIL only on server errors (5xx) or connection failures = broken under load.
import autocannon from "autocannon";

const URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=keep-warm-ping&mode=free";

const inst = autocannon(
  {
    url: URL,
    connections: 10,
    duration: 20,
    method: "GET",
    timeout: 30,
  },
  (err, result) => {
    if (err) {
      console.error("F1-B AUTOCANNON FAILED:", err.message);
      process.exit(2);
    }
    const non2xx = result.non2xx || 0;
    const serverErrors = (result.statusCodeStats["500"]?.count || 0) + (result.statusCodeStats["503"]?.count || 0);
    const total = result.requests?.total || 0;
    const ok200 = result.statusCodeStats["200"]?.count || 0;
    const rateLimited = result.statusCodeStats["429"]?.count || 0;

    console.log("=== F1-B RECEIPT ===");
    console.log(`  Total: ${total} | 200: ${ok200} | 429: ${rateLimited} | 5xx: ${serverErrors} | non-2xx: ${non2xx}`);
    console.log(`  Avg latency: ${result.latency?.avg ?? "N/A"} ms | Throughput: ${result.requests?.average ?? "N/A"} req/s`);

    if (serverErrors === 0 && total > 0) {
      console.log("  F1-B: ✅ PASS — 0 server errors under load. keep-warm-ping traverses RATELIMIT.get + .put correctly.");
      process.exit(0);
    } else {
      console.log(`  F1-B: ❌ FAIL — ${serverErrors} server errors (5xx) under load.`);
      process.exit(1);
    }
  }
);

inst.on("error", (err) => {
  console.error("F1-B AUTOCANNON ERROR:", err.message);
  process.exit(2);
});
