#!/usr/bin/env node
// ⛔ STUDENT ROSTER LOCK — DO NOT DELETE.
// Active students are exactly: quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-test-magic, keep-warm-ping.
// Any other student accessing voice tokens is unauthorized. Billing and GDPR risk.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");
const sec = readFileSync(join(__dirname, "..", "src", "security.js"), "utf8");

// Combine both files since roster can be in either
const combined = src + "\n" + sec;

const AUTHORIZED_STUDENTS = new Set([
  "mai-tram-bluetech",
  "huong-bluetech",
  "sov100-test-magic",
  "keep-warm-ping"
]);

// Find the student roster definition — look for ACTIVE_STUDENT_ROSTER Set or array
// Handle both Set([...]) and Set([...]) formats
let rosterMatch = combined.match(/ACTIVE_STUDENT_ROSTER\s*=\s*new\s*Set\s*\(\s*\[([^\]]+)\]/s);
let found = [];
if (rosterMatch) {
  found = [...rosterMatch[1].matchAll(/['"`]([a-z0-9\-]+)['"`]/g)].map(m => m[1]);
} else {
  // Try array format
  rosterMatch = combined.match(/(?:ACTIVE_STUDENTS|AUTHORIZED_STUDENTS|activeStudents|validStudents)\s*=\s*\[([^\]]+)\]/s);
  if (!rosterMatch) fail("Cannot find student roster array in src/index.js or src/security.js. Search for ACTIVE_STUDENT_ROSTER or equivalent.");
  found = [...rosterMatch[1].matchAll(/['"`]([a-z0-9\-]+)['"`]/g)].map(m => m[1]);
}

const errors = [];
for (const id of found) {
  if (!AUTHORIZED_STUDENTS.has(id)) {
    errors.push(`UNAUTHORIZED student ID in roster: ${id}`);
  }
}
for (const id of AUTHORIZED_STUDENTS) {
  if (!found.includes(id)) {
    errors.push(`MISSING authorized student ID: ${id}`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log(`✅ STUDENT ROSTER: Exactly ${found.length} authorized students. Roster matches canonical list.`);
process.exit(0);

function fail(msg) {
  console.error("\n⛔ STUDENT ROSTER VIOLATED ⛔\n" + msg);
  console.error("Authorized roster: mai-tram-bluetech, huong-bluetech, sov100-test-magic, keep-warm-ping");
  process.exit(1);
}