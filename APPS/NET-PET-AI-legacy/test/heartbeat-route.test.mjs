#!/usr/bin/env node
// ⛔ HEARTBEAT ROUTE LOCK — DO NOT DELETE.
// /api/heartbeat (or /api/v1/heartbeat) must exist and be accessible for health checks.
// Cloudflare worker health depends on this route for uptime monitoring.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");
const legacy = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// Must have a heartbeat route in router.js or index.js
const hasRouterHeartbeat = router.includes("heartbeat");
const hasLegacyHeartbeat = legacy.includes("heartbeat");

if (!hasRouterHeartbeat && !hasLegacyHeartbeat) {
  errors.push("MISSING: /api/heartbeat (or similar) route in router.js or index.js");
}

// Must return 200 for successful heartbeat
if (!router.includes("200") && !legacy.includes("200")) {
  errors.push("MISSING: 200 response status reference in heartbeat route");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ HEARTBEAT ROUTE: /api/heartbeat exists and returns 200.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ HEARTBEAT ROUTE VIOLATED ⛔\n" + msg);
  console.error("\nHeartbeat route is required for Cloudflare uptime monitoring.");
  process.exit(1);
}
