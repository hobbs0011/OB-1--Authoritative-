/**
 * GATE 10 — Load / concurrency (autocannon, real HTTP round-trips at student scale)
 *
 * The token endpoint does KV reads + builds the full agent prompt on every call, and
 * touches the circuit breaker. This fires realistic peak concurrency at the LIVE endpoint
 * and asserts:
 *   - 0 non-2xx responses (no errors under load)
 *   - p99 latency under threshold
 *   - circuit breaker still serving AFTER the burst (a final token fetch returns 200)
 *
 * Modest by design — prod is sacred. ~10 concurrent ≈ real peak (active roster is small).
 * Real signal: actual latency percentiles + error count, not a guess.
 *
 * Usage: node test/preflight-load.mjs [baseUrl]
 */

import autocannon from "autocannon";

const BASE = process.argv[2] || "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const URL = `${BASE}/api/deepgram-token?studentId=sov100-test-magic`;
const P99_LIMIT_MS = 4000; // token build + KV reads; generous but catches pathological regressions

console.log(`GATE 10 — load test: 10 connections / 5s against ${URL}`);

// Track exact status codes so a failure tells us WHAT broke (503 = breaker, 500 = handler, etc.)
const codes = {};
const instance = autocannon({ url: URL, connections: 10, duration: 5, timeout: 15 });
instance.on("response", (client, statusCode) => { codes[statusCode] = (codes[statusCode] || 0) + 1; });

const result = await new Promise((resolve) => autocannon.track(instance, { renderProgressBar: false }) || instance.on("done", resolve));

const non2xx = result.non2xx;
const p99 = result.latency.p99;
console.log(`  requests: ${result.requests.total} | non-2xx: ${non2xx} | p99: ${p99}ms | avg: ${result.latency.average}ms`);
console.log(`  status codes: ${JSON.stringify(codes)}`);

// Status code breakdown table
console.log('\nStatus code breakdown:');
if (result.statusCodeStats) {
  for (const [code, count] of Object.entries(result.statusCodeStats)) {
    const emoji = code.startsWith('2') ? '✅' : '❌';
    console.log(`  ${emoji} ${code}: ${count} requests`);
  }
}
const non2xxDetailed = Object.entries(result.statusCodeStats || {})
  .filter(([code]) => !code.startsWith('2'))
  .reduce((sum, [, count]) => sum + count, 0);
console.log(`\nNon-2xx total: ${non2xxDetailed} / ${result.requests.total}`);
if (non2xxDetailed > 0) process.exitCode = 1;

// Post-burst: confirm circuit breaker did NOT trip (endpoint still serves a token)
const after = await fetch(URL);
const afterOk = after.status === 200 && (await after.json()).token;
console.log(`  post-burst fetch: ${after.status} (breaker ${afterOk ? "closed" : "OPEN/error"})`);

let red = false;
if (non2xx > 0) { console.error(`GATE 10 RED — ${non2xx} non-2xx response(s) under load: ${JSON.stringify(codes)}`); red = true; }
if (p99 > P99_LIMIT_MS) { console.error(`GATE 10 RED — p99 ${p99}ms exceeds ${P99_LIMIT_MS}ms limit`); red = true; }
if (!afterOk) { console.error(`GATE 10 RED — circuit breaker tripped under load (post-burst fetch: ${after.status})`); red = true; }

if (!red) console.log("GATE 10 GREEN — endpoint survives peak load, breaker stays closed");
process.exitCode = red ? 1 : 0;
