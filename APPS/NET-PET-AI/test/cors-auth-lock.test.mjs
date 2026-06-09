#!/usr/bin/env node
// ⛔ CORS AUTH LOCK — DO NOT DELETE OR WEAKEN.
// CSRF origin guard + TRUSTED_ORIGINS must live in router.js (Hono), NOT index.js (legacy Worker).
// Run 106 root cause: cors-auth-lock targeted wrong file (index.js) → lock was checking dead code.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");
const legacy = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// The TRUSTED_ORIGINS Set must be defined in router.js
if (!router.includes("TRUSTED_ORIGINS")) {
  errors.push("MISSING TRUSTED_ORIGINS in src/router.js — CSRF guard moved or deleted?");
}

// The Set literal with production origins must exist
if (!router.includes("'https://net-pet-ai.mrmichaelhobbs123.workers.dev'")) {
  errors.push("MISSING production origin (net-pet-ai) in router.js TRUSTED_ORIGINS");
}

// The /api/* CSRF middleware must be in router.js
if (!router.includes("app.use('/api/*'")) {
  errors.push("MISSING app.use('/api/*') CSRF middleware in router.js");
}

// The origin check + 403 response must be in router.js
if (!router.includes("CSRF: origin not allowed")) {
  errors.push("MISSING CSRF rejection handler in router.js");
}

// Guard: ensure the TRUSTED_ORIGINS Set is NOT defined in index.js (should be router-only)
if (legacy.includes("TRUSTED_ORIGINS")) {
  errors.push("TRUSTED_ORIGINS found in src/index.js — duplicate definition, CSRF logic must be in router.js only");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CORS AUTH LOCK: TRUSTED_ORIGINS + CSRF origin guard in router.js. index.js clean.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CORS AUTH LOCK VIOLATED ⛔\n" + msg);
  console.error("\nCSRF origin guard must be in src/router.js (Hono middleware).");
  console.error("Run 106 lesson: targeting index.js checked dead/legacy code, not the live gate.\n");
  process.exit(1);
}
