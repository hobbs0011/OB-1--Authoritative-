#!/usr/bin/env node
// ⛔ CRYPTO SOURCE LOCK — DO NOT DELETE.
// encryptField / decryptField MUST be defined ONLY in src/encryption.js.
// If defined elsewhere (deletion.js, index.js, etc), source-of-truth is violated.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "src");
const files = [
  "encryption.js",
  "deletion.js",
  "index.js",
  "router.js",
  "security.js",
  "notion.js",
  "memory-brain.js",
  "token-track.js",
  "star-map.js",
  "vocab-srs.js",
  "phonics-drills.js",
  "durable_objects.js",
];

const errors = [];

// Must exist in encryption.js
const encSrc = readFileSync(join(srcDir, "encryption.js"), "utf8");
if (!encSrc.includes("export async function encryptField")) {
  errors.push("MISSING: encryptField in src/encryption.js");
}
if (!encSrc.includes("export async function decryptField")) {
  errors.push("MISSING: decryptField in src/encryption.js");
}

// Must NOT appear in any other src file (checked by searching for 'function encryptField' or 'function decryptField')
for (const f of files) {
  if (f === "encryption.js") continue;
  const content = readFileSync(join(srcDir, f), "utf8");
  if (/function\s+encryptField/.test(content)) {
    errors.push(`FORBIDDEN: encryptField defined in src/${f}`);
  }
  if (/function\s+decryptField/.test(content)) {
    errors.push(`FORBIDDEN: decryptField defined in src/${f}`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CRYPTO SOURCE: encryptField + decryptField defined only in src/encryption.js.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CRYPTO SOURCE VIOLATED ⛔\n" + msg);
  console.error("\nEncryption primitives must live exclusively in src/encryption.js.");
  process.exit(1);
}
