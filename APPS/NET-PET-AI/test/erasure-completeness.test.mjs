#!/usr/bin/env node
// ⛔ ERASURE COMPLETENESS LOCK — DO NOT DELETE.
// deletion.js must cover: all KV prefixes + all 3 DOs (PETS, LEDGER, MEMORY).
// Gap = partial erasure = GDPR breach.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "deletion.js"), "utf8");

const errors = [];

// KV prefixes that MUST be purged
const REQUIRED_PREFIXES = [
  "student_profile_",
  "session_history_",
  "phonics_progress_",
  "vocab_list_",
  "subscription:",
  "student_pw_",
  "streak:",
  "anticheat:",
  "chat_memory:",
  "srs:",
  "saveface:",
  "referral-list:",
];

for (const prefix of REQUIRED_PREFIXES) {
  if (!src.includes(prefix)) {
    errors.push(`MISSING KV prefix in deletion.js: ${prefix}`);
  }
}

// DO purge for each of the 3 required DOs
const REQUIRED_DOS = [
  { name: "PET", pattern: "env.PETS" },
  { name: "LEDGER", pattern: "env.LEDGER" },
  { name: "MEMORY", pattern: "env.MEMORY" },
];

for (const { name, pattern } of REQUIRED_DOS) {
  if (!src.includes(pattern)) {
    errors.push(`MISSING DO purge for ${name} in deletion.js`);
  }
  if (!src.includes("/purge")) {
    errors.push(`/purge call missing for ${name}`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ ERASURE COMPLETENESS: All KV prefixes + 3 DOs (PETS/LEDGER/MEMORY) covered.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ ERASURE COMPLETENESS VIOLATED ⛔\n" + msg);
  console.error("\nHandleStudentErase must purge all KV prefixes and all 3 DOs.");
  process.exit(1);
}
