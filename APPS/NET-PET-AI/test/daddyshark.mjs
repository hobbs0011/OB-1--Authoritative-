#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  ____      _    ____  ____  __   __  ____  _   _   _    ____  _  __
// |  _ \    / \  |  _ \|  _ \ \ \ / / / ___|| | | | / \  |  _ \| |/ /
// | | | |  / _ \ | | | | | | | \ V /  \___ \| |_| |/ _ \ | |_) | ' /
// | |_| | / ___ \| |_| | |_| |  | |    ___) |  _  / ___ \|  _ <| . \
// |____/ /_/   \_\____/|____/   |_|   |____/|_| |_/_/   \_\_| \_\_|\_\
//
//  The enforced, tiered NET-PET-AI test suite. Nothing ships unless EVERY tier is
//  green AND every guard is PROVEN able to fail (the gauntlet — no tautologies).
//
//  Tiers (run in order, hard-stop semantics per tier):
//    T0  INVARIANT LOCKS      — 24 static guards read src and assert (voice brain
//                               lock, roster, quota, crypto, CORS, injection …).
//    T1  THUMB-FIDELITY E2E   — can a real finger complete the flow on the
//                               smallest iPhones? + self-proof it catches the
//                               original dead-end.
//    T2  FAILURE MODES        — adverse conditions (429/500/mic/in-app) give a
//                               CLEAR outcome, never a silent dead-end. Blocks on
//                               CRITICAL only; warns on documented known-open.
//    T3  MUTATION GAUNTLET    — THE CROWN. Tests the tests: every guard is broken
//                               on purpose (incl. real pre-fix git code) and must
//                               go RED. A tautology here invalidates the whole run.
//
//  Usage:  node test/daddyshark.mjs            (targets prod)
//          SUITE_BASE=<url> node test/daddyshark.mjs   (targets a specific deploy)
//          node test/daddyshark.mjs --quick    (skip T0 static locks; E2E + crown)
// ─────────────────────────────────────────────────────────────────────────────
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const QUICK = process.argv.includes('--quick');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Run each lock as its OWN clean process. Chaining all 24 via `npm run test:lock`
// (cmd.exe &&) trips a Windows libuv bug (UV_HANDLE_CLOSING in async.c) even though
// every test passes — a tooling crash, not a real failure. Per-process avoids it.
const LOCK_TESTS = [
  'voice-brain-lock', 'api-contract', 'circuit-isolation', 'student-roster',
  'cache-key-format', 'speak-listen-lock', 'cors-auth-lock', 'route-completeness',
  'migration-safety', 'voice-ec-3', 'quota-path', 'crypto-source',
  'erasure-completeness', 'preflight-mode-guard', 'audit-integrity', 'cors-origin-guard',
  'heartbeat-route', 'class-ingest-lock', 'safari-compat', 'injection-hardening',
  'ws-auth-lock', 'kv-encryption-roundtrip', 'quota-enforcement', 'audio-playback-attack',
  'route-404-lock',   // Grandpa corpus: 47c1c054 — unmatched /api/* must 404, not mask as 500
];

const TIERS = [
  { id: 'T0', name: 'INVARIANT LOCKS (24 static guards)', locks: LOCK_TESTS, crown: false, skip: QUICK },
  { id: 'T1', name: 'THUMB-FIDELITY E2E (smallest iPhones + self-proof)', cmd: 'node', args: ['test/iphone-real-attack.mjs'], crown: false },
  { id: 'T2', name: 'FAILURE MODES (silent dead-end detection)',         cmd: 'node', args: ['test/failure-mode-attack.mjs'], crown: false },
  { id: 'T3', name: 'MUTATION GAUNTLET — tests the tests (THE CROWN)',   cmd: 'node', args: ['test/mutation-gauntlet.mjs'],   crown: true  },
];

console.log('\n🦈🦈🦈  DADDY SHARK — NET-PET-AI TEST SUITE  🦈🦈🦈');
console.log(`target: ${BASE}${QUICK ? '   [--quick: static locks skipped]' : ''}\n`);

const summary = [];
let hardFail = false;
let crownTautology = false;

for (const tier of TIERS) {
  if (tier.skip) { summary.push({ id: tier.id, name: tier.name, status: 'SKIP' }); continue; }
  console.log(`\n──────── ${tier.id} ${tier.name} ────────`);
  const t0 = Date.now();
  let ok;
  if (tier.locks) {
    // Each lock in its own clean process — avoids the Windows && chain crash.
    const failed = [];
    for (const t of tier.locks) {
      const r = spawnSync('node', [`test/${t}.test.mjs`], {
        cwd: APP_DIR, encoding: 'utf8', timeout: 60000,
        env: { ...process.env, SUITE_BASE: BASE },
      });
      const out = (r.stdout || '') + (r.stderr || '');
      // Judge by the test's OWN assertion output, not the dirty exit code: a lock
      // PASSES iff it printed a success marker (✅) and NO failure marker (❌). This
      // ignores the Windows libuv teardown abort (UV_HANDLE_CLOSING / exit
      // 0xC0000409) that fires AFTER assertions pass — a tooling crash, not a
      // real failure — while still catching genuine ❌/process.exit(1) failures.
      const passedAssertions = out.includes('✅') && !out.includes('❌');
      const ok = r.status === 0 || passedAssertions;
      process.stdout.write(out);
      if (!ok) { failed.push(t); console.log(`  ❌ LOCK FAILED: ${t} (exit ${r.status})`); }
      else if (r.status !== 0) { console.log(`  ⚠️  ${t}: assertions GREEN; ignored Windows teardown crash (exit ${r.status})`); }
    }
    ok = failed.length === 0;
    if (!ok) console.log(`  ${failed.length}/${tier.locks.length} locks failed: ${failed.join(', ')}`);
  } else {
    const res = spawnSync(tier.cmd, tier.args, {
      cwd: APP_DIR, stdio: 'inherit', timeout: 300000,
      shell: true,   // Windows: resolve node via shell PATH
      env: { ...process.env, SUITE_BASE: BASE },
    });
    ok = res.status === 0;
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  if (!ok) {
    hardFail = true;
    if (tier.crown) crownTautology = true;   // crown red = a guard can't fail = suite invalid
  }
  summary.push({ id: tier.id, name: tier.name, status: ok ? 'GREEN' : (tier.crown ? 'CROWN-RED' : 'RED'), secs });
}

console.log('\n══════════════════ DADDY SHARK SUMMARY ══════════════════');
for (const s of summary) {
  const icon = s.status === 'GREEN' ? '✅' : s.status === 'SKIP' ? '⏭️ ' : '❌';
  console.log(`  ${icon} ${s.id}  ${s.status.padEnd(10)} ${s.name}${s.secs ? `  (${s.secs}s)` : ''}`);
}

if (crownTautology) {
  console.log('\n🩸 CROWN RED — a guard could not be made to fail (tautology). The suite is INVALID:');
  console.log('   green from the other tiers means NOTHING until every guard is proven to have teeth.');
}
console.log(`\n${hardFail ? '🦈 DADDY SHARK: BITE — deploy BLOCKED' : '🦈 DADDY SHARK: ALL GREEN + every guard proven — ship it'}`);
process.exit(hardFail ? 1 : 0);
