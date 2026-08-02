#!/usr/bin/env node
// ⛔ SPEAK + LISTEN LOCK — DO NOT DELETE. Companion to voice-brain-lock.test.mjs.
// voice-brain-lock guards think only. This file guards speak + listen.
// aura-2-zeus-en = Zeus voice. Changing it changes the voice character of OBI.
// nova-3 = best accuracy model for non-native English speakers. Downgrade = worse transcription.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const settingsIdx = src.indexOf("const settings = {");
if (settingsIdx === -1) fail("Cannot find settings object");
const settingsBlock = src.slice(settingsIdx, settingsIdx + 2000);

const errors = [];

// Speak lock
if (!settingsBlock.includes('model: "aura-2-zeus-en"')) {
  errors.push('MISSING speak model: aura-2-zeus-en');
}
const FORBIDDEN_SPEAK = [
  { pattern: /model:\s*"aura-1/, label: 'aura-1 (deprecated, worse quality)' },
  { pattern: /model:\s*"aura-2-athena/, label: 'aura-2-athena (wrong voice character)' },
  { pattern: /model:\s*"aura-2-luna/, label: 'aura-2-luna (wrong voice character)' },
];
for (const { pattern, label } of FORBIDDEN_SPEAK) {
  if (pattern.test(settingsBlock)) errors.push(`FORBIDDEN speak model: ${label}`);
}

// Listen lock
if (!settingsBlock.includes('"nova-3"')) {
  errors.push('MISSING listen model: nova-3');
}
const FORBIDDEN_LISTEN = [
  { pattern: /model:\s*"nova-2/, label: 'nova-2 (worse accuracy for non-native speakers)' },
  { pattern: /model:\s*"enhanced/, label: 'enhanced (outdated tier)' },
  { pattern: /model:\s*"base/, label: 'base (outdated tier)' },
];
for (const { pattern, label } of FORBIDDEN_LISTEN) {
  if (pattern.test(settingsBlock)) errors.push(`FORBIDDEN listen model: ${label}`);
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ SPEAK + LISTEN LOCK: aura-2-zeus-en + nova-3. Voice character and transcription quality intact.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ SPEAK/LISTEN LOCK VIOLATED ⛔\n" + msg);
  console.error("speak MUST be aura-2-zeus-en. listen MUST be nova-3.");
  process.exit(1);
}