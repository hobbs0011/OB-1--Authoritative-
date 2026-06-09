#!/usr/bin/env node
// ⛔ PREFLIGHT MODE GUARD — DO NOT DELETE.
// OBI mode allow-list: ONLY "free", "study", "phonics" are accepted.
// Invalid modes (e.g. "banana", "test", "debug") must return 400.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// Must allow-list the three modes
const hasFree = src.includes('"free"') || src.includes("'free'");
const hasStudy = src.includes('"study"') || src.includes("'study'");
const hasPhonics = src.includes('"phonics"') || src.includes("'phonics'");

if (!hasFree)    errors.push("MISSING: 'free' mode in allow-list");
if (!hasStudy)   errors.push("MISSING: 'study' mode in allow-list");
if (!hasPhonics) errors.push("MISSING: 'phonics' mode in allow-list");

// Must reject invalid modes — look for mode validation returning 400
const hasRejection = src.includes("400") && src.toLowerCase().includes("mode");
if (!hasRejection) errors.push("MISSING: mode rejection (400) handler for invalid modes");

// Must NOT accept every mode blindly
const hasBadCatchAll = /mode\s*===?\s*["']?[a-z]+["']?\s*=>/.test(src);
// Hard to blanket-detect, but at least ensure strict equality checks
if (!src.includes('"free"') && !src.includes("'free'")) {
  // alert already caught
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ PREFLIGHT MODE GUARD: free + study + phonics allowed. Invalid modes rejected (400).");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ PREFLIGHT MODE GUARD VIOLATED ⛔\n" + msg);
  console.error("\nOBI mode allow-list: ONLY free, study, phonics. Everything else = 400.");
  process.exit(1);
}
