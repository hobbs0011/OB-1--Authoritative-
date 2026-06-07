#!/usr/bin/env node
// ⛔ VOICE BRAIN LOCK — DO NOT DELETE OR WEAKEN THIS TEST. ⛔
//
// Michael's ORIGINAL plan, broken & relitigated 3+ times, finally firewalled Run 097.
//
// THE FACT THIS GUARDS:
//   The Deepgram Voice Agent "think" model MUST be { type: "open_ai", model: "gpt-4o-mini" }.
//   With no `endpoint`, Deepgram runs gpt-4o-mini IN-HOUSE inside its own agentic pipeline:
//   no OpenAI key, no OpenAI account, no OpenAI bill, NO network hop out.
//
// WHY IT MUST NEVER CHANGE:
//   Any other provider (google/gemini/anthropic/etc) routes OUTSIDE Deepgram's pipeline =
//   +several seconds of latency = the app feels inferior to Gemini Live. The SPEED is the plan.
//   "open_ai" here is the in-house architecture name, NOT a call to OpenAI's servers.
//
// If you are a future session reading this and thinking "open_ai looks external, I'll fix it":
//   YOU ARE WRONG. STOP. This test exists because you have made that exact mistake before
//   and it cost Michael days. Leave the line alone.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "..", "src", "index.js");
const src = readFileSync(indexPath, "utf8");

// Scope to the Voice Agent think block (settings.agent.think), not unrelated gpt-4o-mini uses.
const thinkIdx = src.indexOf("think: {");
if (thinkIdx === -1) {
  fail("Could not find the Voice Agent `think: {` block in src/index.js. Did the settings object move?");
}
const thinkBlock = src.slice(thinkIdx, thinkIdx + 400);

const REQUIRED = 'provider: { type: "open_ai", model: "gpt-4o-mini" }';
const FORBIDDEN = [
  { pattern: /type:\s*"google"/, label: 'type: "google" (routes OUTSIDE Deepgram = slow)' },
  { pattern: /model:\s*"gemini/, label: 'gemini model (NOT what makes Gemini Live smooth; routes external)' },
  { pattern: /type:\s*"anthropic"/, label: 'type: "anthropic" (external routing)' },
];

const errors = [];
if (!thinkBlock.includes(REQUIRED)) {
  errors.push(`MISSING the locked think provider.\n  Expected exactly: ${REQUIRED}`);
}
for (const { pattern, label } of FORBIDDEN) {
  if (pattern.test(thinkBlock)) {
    errors.push(`FORBIDDEN think provider detected: ${label}`);
  }
}

if (errors.length) {
  fail(errors.join("\n"));
}

console.log("✅ VOICE BRAIN LOCK: think provider is open_ai/gpt-4o-mini (Deepgram in-house). Correct.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ VOICE BRAIN LOCK VIOLATED ⛔\n");
  console.error(msg);
  console.error("\nThe Deepgram Voice Agent brain MUST be { type: \"open_ai\", model: \"gpt-4o-mini\" }.");
  console.error("That is Deepgram's IN-HOUSE managed model — fast, in-pipeline, no external hop.");
  console.error("Revert your change to src/index.js. See the comment at the top of this file.\n");
  process.exit(1);
}
