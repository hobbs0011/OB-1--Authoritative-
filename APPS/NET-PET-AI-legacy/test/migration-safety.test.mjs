#!/usr/bin/env node
// ⛔ MIGRATION SAFETY LOCK — DO NOT DELETE.
// All student-data DO classes must expose a /purge endpoint for GDPR erasure parity.
// Mandate: PETS/LEDGER/MEMORY each have /purge. Missing = incomplete erasure = GDPR breach.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "durable_objects.js"), "utf8");

// Verify each required DO class has a /purge handler by searching for the
// pattern: class export → fetch method → /purge check
function classHasPurge(className) {
  const needle = `export class ${className}`;
  const start = src.indexOf(needle);
  if (start === -1) return false;
  const limit = src.indexOf("\nexport class ", start + 1);
  const scope = limit === -1 ? src.slice(start) : src.slice(start, limit);
  return scope.includes('/purge');
}

const errors = [];
if (!classHasPurge("PetDO"))     errors.push("PET DO: /purge endpoint missing after class definition");
if (!classHasPurge("LedgerDO"))  errors.push("LEDGER DO: /purge endpoint missing after class definition");
if (!classHasPurge("MemoryDO"))  errors.push("MEMORY DO: /purge endpoint missing after class definition");

if (errors.length) fail(errors.join("\n"));
console.log("✅ MIGRATION SAFETY: PETS/LEDGER/MEMORY all have /purge endpoints. GDPR erasure parity OK.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ MIGRATION SAFETY VIOLATED ⛔\n" + msg);
  console.error("\nAll student-data DO classes (PET/LEDGER/MEMORY) must expose /purge for GDPR erasure.");
  process.exit(1);
}
