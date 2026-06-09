#!/usr/bin/env node
// ⛔ API CONTRACT LOCK — DO NOT DELETE. Prevents STT API cargo-culting into Voice Agent settings.
// Run 101 root cause: listen.endpointing does not exist in Voice Agent API. Caused silent failure.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

// Find the settings block (Voice Agent settings object)
const settingsIdx = src.indexOf("const settings = {");
if (settingsIdx === -1) fail("Cannot find Voice Agent settings object. Did it move?");
const settingsBlock = src.slice(settingsIdx, settingsIdx + 2000);

const FORBIDDEN_IN_VOICE_AGENT = [
  { pattern: /listen\s*:\s*\{[^}]*endpointing\s*:/, label: "listen.endpointing (STT API field, not Voice Agent)" },
  { pattern: /listen\s*:\s*\{[^}]*smart_format\s*:/, label: "listen.smart_format (STT API field)" },
  { pattern: /listen\s*:\s*\{[^}]*interim_results\s*:/, label: "listen.interim_results (STT API field)" },
  { pattern: /listen\s*:\s*\{[^}]*encoding\s*:/, label: "listen.encoding (raw audio field, not Voice Agent)" },
];

const REQUIRED_IN_SETTINGS = [
  { text: "agent: {", label: "agent block missing" },
  { text: "think: {", label: "think block missing" },
  { text: "listen: {", label: "listen block missing" },
  { text: "speak: {", label: "speak block missing" },
];

const errors = [];
for (const { pattern, label } of FORBIDDEN_IN_VOICE_AGENT) {
  if (pattern.test(settingsBlock)) errors.push(`FORBIDDEN field detected: ${label}`);
}
for (const { text, label } of REQUIRED_IN_SETTINGS) {
  if (!settingsBlock.includes(text)) errors.push(`REQUIRED structure missing: ${label}`);
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ API CONTRACT: Voice Agent settings shape is clean. No STT cargo-culting detected.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ API CONTRACT VIOLATED ⛔\n" + msg);
  console.error("\nDo NOT copy fields from Deepgram STT API into Voice Agent settings. Different APIs.");
  process.exit(1);
}