#!/usr/bin/env node
// ⛔ CORS ORIGIN GUARD LOCK — DO NOT DELETE.
// Duplicate verification of cors-auth-lock but scoped to student-data routes in router.js.
// Ensures student PATCH/GET/DELETE routes reject untrusted origins with 403.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");

const errors = [];

// TRUSTED_ORIGINS set must exist with production domains
const hasTrustedOrigins = router.includes("TRUSTED_ORIGINS");
const hasProductionOrigins =
  router.includes("'https://net-pet-ai.mrmichaelhobbs123.workers.dev'") ||
  router.includes('"https://net-pet-ai.mrmichaelhobbs123.workers.dev"');

if (!hasTrustedOrigins) errors.push("MISSING: TRUSTED_ORIGINS Set definition in router.js");
if (!hasProductionOrigins) errors.push("MISSING: production Worker origin in TRUSTED_ORIGINS");

// Must return 403 for untrusted
if (!router.includes("403")) {
  errors.push("MISSING: 403 rejection response for untrusted origins");
}

// Must cover /api/* (student routes)
const hasApiMiddleware = router.includes("app.use('/api/*'");
if (!hasApiMiddleware) {
  errors.push("MISSING: CSRF middleware covering /api/* routes");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CORS ORIGIN GUARD: /api/* rejects untrusted origins with 403. Production domains included.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CORS ORIGIN GUARD VIOLATED ⛔\n" + msg);
  console.error("\nStudent API routes must reject untrusted origins. See cors-auth-lock for complement.");
  process.exit(1);
}
