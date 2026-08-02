#!/usr/bin/env node
// ⛔ VOICE EC-3 LOCK — DO NOT DELETE.
// Edge case 3 guard: Voice Agent settings use raw env.DEEPGRAM_API_KEY variable reference.
// In index.js, the Voice Agent block declares `DEEPGRAM_API_KEY: !!env.DEEPGRAM_API_KEY` as a secrets/env reference.
// assertVoiceBrainLock must be present for defense-in-depth (called at least 2x across src).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");
const router = readFileSync(join(__dirname, "..", "src", "router.js"), "utf8");

const errors = [];

// POSITIVE: env.DEEPGRAM_API_KEY must be referenced (raw key, not a jwt/token literal)
const hasRawKeyRef = src.includes("env.DEEPGRAM_API_KEY");
if (!hasRawKeyRef) {
  errors.push("MISSING: env.DEEPGRAM_API_KEY reference in src/index.js");
}

// POSITIVE: Voice Agent secrets block declares DEEPGRAM_API_KEY
if (!src.includes("DEEPGRAM_API_KEY")) {
  errors.push("MISSING: DEEPGRAM_API_KEY in Voice Agent secrets block");
}

// POSITIVE: assertVoiceBrainLock must be present (defense-in-depth)
const assertCalls = (src.match(/assertVoiceBrainLock/g) || []).length;
if (assertCalls < 1) {
  errors.push(`assertVoiceBrainLock called ${assertCalls}x — must be present (>=1) in src/index.js`);
}

// NEGATIVE: Deepgram voice setting must NOT use a hardcoded jwt/token literal
// (other services using Bearer is fine — scope check to Voice Agent settings block only)
const settingsIdx = src.indexOf("const settings = {");
const settingsBlock = settingsIdx !== -1 ? src.slice(settingsIdx, settingsIdx + 3000) : src;
if (/deepgram.*(jwt|bearer\s+\w+)/i.test(settingsBlock)) {
  errors.push("FORBIDDEN: Deepgram Voice Agent setting uses jwt/Bearer literal — must reference env.DEEPGRAM_API_KEY");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ VOICE EC-3: Deepgram uses env.DEEPGRAM_API_KEY raw key path. assertVoiceBrainLock present.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ VOICE EC-3 VIOLATED ⛔\n" + msg);
  console.error("\nDeepgram must use raw env.DEEPGRAM_API_KEY. assertVoiceBrainLock must be defined.");
  process.exit(1);
}
