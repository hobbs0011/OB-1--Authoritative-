#!/usr/bin/env node
// ⛔ CACHE KEY FORMAT LOCK — DO NOT DELETE.
// prompt_cache:{studentId}:{sessionMode} with 300s TTL is the Layer 6 performance contract.
// Format change = cache miss = 1000ms latency regression = broken voice agent for students.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const REQUIRED_KEY_FORMAT = "prompt_cache:${studentId}:${sessionMode}";
const REQUIRED_TTL = "expirationTtl: 300";
const REQUIRED_CACHE_READ_TTL = "cacheTtl: 300";

const errors = [];
if (!src.includes(REQUIRED_KEY_FORMAT)) {
  errors.push(`MISSING cache key format: ${REQUIRED_KEY_FORMAT}`);
}
if (!src.includes(REQUIRED_TTL)) {
  errors.push(`MISSING cache write TTL: ${REQUIRED_TTL}`);
}
if (!src.includes(REQUIRED_CACHE_READ_TTL)) {
  errors.push(`MISSING cache read TTL: ${REQUIRED_CACHE_READ_TTL}`);
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CACHE KEY FORMAT: prompt_cache:{studentId}:{sessionMode} with 300s TTL. Layer 6 contract intact.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CACHE KEY FORMAT VIOLATED ⛔\n" + msg);
  console.error("Cache key must be: prompt_cache:{studentId}:{sessionMode} with expirationTtl: 300");
  process.exit(1);
}