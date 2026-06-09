#!/usr/bin/env node
// ⛔ CIRCUIT ISOLATION LOCK — DO NOT DELETE.
// circuit:deepgram:state is CANARY-OWNED. Writing it from the token endpoint causes race conditions.
// Run 103-104 root cause: concurrent 500s traced to circuit writes under load.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

// Isolate the token endpoint handler
const handlerStart = src.indexOf('path === "/api/deepgram-token"');
if (handlerStart === -1) fail("Cannot find /api/deepgram-token handler. Did the route move?");
// Find the next route handler to bound the search
const nextHandlerMatch = src.slice(handlerStart + 100).search(/path === "\/api\//);
const handlerEnd = nextHandlerMatch === -1 ? handlerStart + 8000 : handlerStart + 100 + nextHandlerMatch;
const handlerBlock = src.slice(handlerStart, handlerEnd);

// Check for circuit writes inside this block
const CIRCUIT_WRITE_PATTERNS = [
  /\.put\s*\(\s*['"]circuit:deepgram:state['"]/,
  /NET_PET_KV\.put\s*\(\s*`circuit:/,
];

const errors = [];
for (const pattern of CIRCUIT_WRITE_PATTERNS) {
  if (pattern.test(handlerBlock)) {
    errors.push("circuit:deepgram:state WRITE detected inside /api/deepgram-token handler");
  }
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CIRCUIT ISOLATION: No circuit writes in token endpoint hot path. Canary owns the key.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CIRCUIT ISOLATION VIOLATED ⛔\n" + msg);
  console.error("Remove the circuit write from /api/deepgram-token. The canary handler is the sole writer.");
  process.exit(1);
}