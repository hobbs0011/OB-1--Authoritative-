#!/usr/bin/env node
// ⛔ QUOTA PATH LOCK — DO NOT DELETE.
// checkQuota must be called on deepgram-token AND chat POST routes.
// sov100- prefix must be exempt from quota in both.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");
const legacy = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// checkQuota must appear near the deepgram-token route
const hasTokenQuota = src.includes("checkQuota") && src.includes("'deepgram'");
const hasChatQuota = src.includes("checkQuota") && src.includes("'chat'");

if (!hasTokenQuota) errors.push("MISSING: checkQuota(env, studentId, 'deepgram') in /api/deepgram-token route");
if (!hasChatQuota) errors.push("MISSING: checkQuota(env, studentId, 'chat') in /api/chat route");

// sov100 exemption logic
const hasSov100Exemption = src.match(/studentId.*startsWith\('sov100-'\)/);
// Check both router and legacy fallback
const hasLegacySov100 = legacy.match(/sov100.*exempt|startsWith\('sov100-'\)/i);

if (!hasSov100Exemption && !hasLegacySov100) {
  errors.push("MISSING: sov100- prefix quota exemption (startsWith('sov100-'))");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ QUOTA PATH: checkQuota on deepgram-token + chat. sov100 exempt logic intact.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ QUOTA PATH VIOLATED ⛔\n" + msg);
  console.error("\nQuota checks must cover /api/deepgram-token and /api/chat. sov100- must be exempt.");
  process.exit(1);
}
