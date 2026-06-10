#!/usr/bin/env node
// ⛔ ROUTE COMPLETENESS LOCK — DO NOT DELETE.
// Verifies all required API routes exist across router.js (primary) + index.js (legacy fallback).
// Run 106 root cause: this lock targeted wrong file (index.js only) → missed new router.js routes.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");
const legacy = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// 5 native routes in router.js (P6+P7+P9+P10)
const ROUTER_REQUIRED = [
  { pattern: '/api/deepgram-token', label: "/api/deepgram-token (P6 token endpoint)" },
  { pattern: '/api/chat',           label: "/api/chat (student chat)" },
  { pattern: '/api/payment/confirm', label: "/api/payment/confirm (P7 idempotent)" },
  { pattern: '/api/waitlist',       label: "/api/waitlist (P7 idempotent)" },
  { pattern: '/api/student/:id/erase',   label: "/api/student/:id/erase (P10 erasure)" },
  { pattern: '/api/student/:id/export',  label: "/api/student/:id/export (P10 GDPR export)" },
  { pattern: '/api/referral/register',   label: "/api/referral/register (P7 idempotent)" },
  { pattern: '/api/v1/health',      label: "/api/v1/health" },
  { pattern: '/api/v1/version',     label: "/api/v1/version" },
];

for (const { pattern, label } of ROUTER_REQUIRED) {
  if (!router.includes(pattern)) {
    errors.push(`MISSING in router.js: ${label}`);
  }
}

// Legacy fallback routes in index.js
const LEGACY_REQUIRED = [
  { pattern: 'api/deepgram-token', label: "legacy /api/deepgram-token handler in index.js" },
  { pattern: 'api/chat',           label: "legacy /api/chat handler in index.js" },
];

for (const { pattern, label } of LEGACY_REQUIRED) {
  if (!legacy.includes(pattern)) {
    errors.push(`MISSING in index.js (legacy fallback): ${label}`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ ROUTE COMPLETENESS: 6 native routes in router.js + legacy fallbacks in index.js.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ ROUTE COMPLETENESS VIOLATED ⛔\n" + msg);
  console.error("\nRequired: /api/deepgram-token, /api/chat, /api/payment/confirm, /api/waitlist, /api/referral/register, /api/student/:id/erase, /api/student/:id/export, /api/v1/health, /api/v1/version");
  process.exit(1);
}
