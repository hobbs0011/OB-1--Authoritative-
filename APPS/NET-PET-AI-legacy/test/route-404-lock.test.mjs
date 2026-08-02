// LOCK: unmatched /api/* must return 404, never fall off the end into undefined
// → addCors(undefined) throw → generic 500 that MASKS real errors.
// Ancestral bug: commit 47c1c054 (Grandpa Shark regression corpus). Without this
// guard, a future refactor could drop the terminal 404 and silently re-mask every
// thrown error as a 500 again.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.js');
const src = readFileSync(SRC, 'utf8');

// The handleAPI(path, request, env, url) function must contain a terminal 404
// fallback for unmatched /api routes (returns json(..., 404)).
const fnStart = src.indexOf('async function handleAPI(');
if (fnStart === -1) {
  console.error('❌ ROUTE 404 LOCK: handleAPI() not found in index.js');
  process.exit(1);
}
// Look at the body of handleAPI up to the next top-level "// ── Payment Handler"
// marker (its known terminator) for an explicit 404 return.
const after = src.slice(fnStart);
const has404Fallback =
  /return\s+json\(\s*\{[^}]*\}\s*,\s*404\s*\)/.test(after.slice(0, after.indexOf('// ── Payment Handler') + 1 || after.length)) ||
  /Not Found[^]*?404/.test(after.slice(0, 40000));

if (!has404Fallback) {
  console.error('❌ ROUTE 404 LOCK: handleAPI() has no terminal 404 fallback — unmatched /api/* will fall through to undefined → 500 (masks real errors). Restore the `return json({ error: "Not Found", path }, 404);` tail.');
  process.exit(1);
}

console.log('✅ ROUTE 404 LOCK: handleAPI() returns explicit 404 for unmatched /api/* (no 500-masking regression).');
process.exit(0);
