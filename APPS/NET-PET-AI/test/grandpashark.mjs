#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//   ____ ____      _    _   _ ____  ____   _      ____  _   _   _    ____  _  __
//  / ___|  _ \    / \  | \ | |  _ \|  _ \ / \    / ___|| | | | / \  |  _ \| |/ /
// | |  _| |_) |  / _ \ |  \| | | | | |_) / _ \   \___ \| |_| |/ _ \ | |_) | ' /
// | |_| |  _ <  / ___ \| |\  | |_| |  __/ ___ \   ___) |  _  / ___ \|  _ <| . \
//  \____|_| \_\/_/   \_\_| \_|____/|_| /_/   \_\ |____/|_| |_/_/   \_\_| \_\_|\_\
//
//  THE ELDER. Daddy proves the guards have teeth. GRANDPA remembers every bug the
//  family ever shipped and proves not one can sneak back — a regression corpus
//  mined from the fix commits, plus a CENSUS that BITES if any ancestral bug has
//  no guard (an orphan). "If a bug ever shipped, a test must forever forbid it."
//
//  Layers:
//    1. Runs DADDY SHARK (foundation — the living suite must be green + proven).
//    2. ANCESTRAL CORPUS — each historical fix → a regression check that asserts
//       the bug cannot return (suite-guarded reference OR a direct assertion here).
//    3. CENSUS — every ancestral bug must map to a guard. Orphans = Grandpa bites.
//
//  Usage:  node test/grandpashark.mjs
//          SUITE_BASE=<url> node test/grandpashark.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SUITE_BASE || 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';
const readSrc = (p) => { try { return readFileSync(join(APP_DIR, p), 'utf8'); } catch { return ''; } };

console.log('\n👴🦈 GRANDPA SHARK — the elder remembers every bug in the bloodline 🦈👴');
console.log(`target: ${BASE}\n`);

// ── 1. FOUNDATION: Daddy Shark must be green (the living suite + proven guards) ──
console.log('──────── FOUNDATION: running DADDY SHARK ────────');
const daddy = spawnSync('node', ['test/daddyshark.mjs'], {
  cwd: APP_DIR, stdio: 'inherit', timeout: 360000, shell: true,
  env: { ...process.env, SUITE_BASE: BASE },
});
const daddyGreen = daddy.status === 0;

// ── 2. ANCESTRAL CORPUS — every bug this family shipped, and how it's forbidden ──
// guard: the suite tier/test that catches it (proven by Daddy). assert: a direct
// regression assertion Grandpa runs himself. An entry with NEITHER = ORPHAN.
const corpus = [
  {
    bug: 'mode-select dead-end (Start below the fold on short iPhone)',
    commit: 'cf9f32f7', guard: 'T1 thumb-fidelity + T3 gauntlet git-truth',
    assert: null,
  },
  {
    bug: 'orb silences Obi on iOS (createMediaElementSource on playback)',
    commit: 'a08668fe', guard: 'T1/T3 no-playback-mediaElementSource',
    assert: null,
  },
  {
    // Guarded statically by T0 route-404-lock (proven by Daddy). No live fetch
    // here on purpose: a single undici keepalive socket left open trips the
    // Windows libuv teardown abort at process.exit — and the elder must exit clean.
    bug: 'unmatched /api/* → 500 masks real errors',
    commit: '47c1c054', guard: 'T0 route-404-lock',
    assert: null,
  },
  {
    bug: 'navigator.mediaDevices.getUserMedia crash in in-app browsers',
    commit: 'b12303fc', guard: 'T2 in-app (known-open) + chat.js guard',
    assert: async () => {
      const js = readSrc('public/chat.js');
      const guarded = /navigator\.mediaDevices\s*&&\s*navigator\.mediaDevices\.getUserMedia/.test(js);
      return { ok: guarded, detail: guarded ? 'mediaDevices guard present in chat.js' : 'GUARD MISSING — getUserMedia unguarded again' };
    },
  },
  {
    bug: 'deepgram token quota starves a live class (10/hr)',
    commit: 'c2e7bab9', guard: 'T0 quota-enforcement',
    assert: async () => {
      const q = readSrc('src/quota.js');
      const m = q.match(/deepgram:\s*(\d+)/);
      const val = m ? parseInt(m[1], 10) : 0;
      return { ok: val >= 30, detail: `quota.js deepgram=${val}/hr (want >=30 for a live class)` };
    },
  },
  {
    bug: 'token-failure shows "Tap to start" → silent dead-end',
    commit: '9263b2a8', guard: 'T2 token-429/500',
    assert: async () => {
      const js = readSrc('public/chat.js');
      // The token-failure branch must NOT reset to the idle "Tap to start" text.
      const bad = /!tokenRes\.ok[^]{0,200}setMicStatus\(\s*["']Tap to start["']/.test(js);
      return { ok: !bad, detail: bad ? 'token-failure still resets to "Tap to start" (silent dead-end)' : 'token-failure shows an informative status' };
    },
  },
  // --- Additional corpus from full git history ---
  {
    // BROKEN 3+ times. Each time someone "fixes" the think provider thinking they're
    // improving performance, but google/anthropic routes OUTSIDE Deepgram's pipeline.
    // voice-brain-lock + speak-listen-lock test the settings object statically.
    bug: 'listen.endpointing bare integer rejected by Deepgram VA API (UNPARSABLE_CLIENT_MESSAGE)',
    commit: 'f67091b9', guard: 'T0 api-contract-lock',
    assert: null,
  },
  {
    // Double-reconnect race: agentWsId guard prevents zombie handlers.
    // If this is removed, mode switches can trigger concurrent openVoiceAgent calls.
    bug: 'double-reconnect race — agentWsId zombies old onAgentDrop handlers',
    commit: '39644661', guard: 'T0 voice-brain-lock (runtime assert) + BB-42 comment',
    assert: async () => {
      const js = readSrc('public/chat.js');
      const hasGuard = /agentWsId\s*(!==|===)/.test(js) && /if \(agentWsId !== myId\)/.test(js);
      return { ok: hasGuard, detail: hasGuard ? 'agentWsId zombie guard present' : 'zombie race condition can reoccur' };
    },
  },
  {
    // Gapless audio accumulator prevents choppy playback from small chunks.
    // If removed, audio gaps return. audio-playback-attack lock verifies splice(0).
    bug: 'gapless audio breaks — N-1 silence gaps between Deepgram TTS chunks',
    commit: '5ca983f6', guard: 'T0 audio-playback-attack (splice(0), watchdog, accumulator)',
    assert: null,
  },
  {
    // voice agent init race: mode selection ignored when agentWs already exists.
    // browser-api-safety ensures no crash on landing flow.
    bug: 'voice agent init race — mode selection ignored on landing confirm',
    commit: 'b2194ecf', guard: 'T0 safari-compat (landing flow integrity)',
    assert: null,
  },
  {
    // XSS filter false positive on "response =" pattern would break legitimate code.
    // injection-hardening lock tests sanitizeInput patterns.
    bug: 'PA XSS filter false positive on "response =" code pattern',
    commit: 'ae5c39d4', guard: 'T0 injection-hardening',
    assert: null,
  },
  {
    // BB-38: dual TTS — browser voice must stop when agentWs opens to prevent two voices.
    // audio-playback-attack checks agentWs guard in speak/fallbackSpeak.
    bug: 'dual voice (browser + agent) overlap on WS handshake gap',
    commit: '405e07c4', guard: 'T0 audio-playback-attack (agentWs check in speak path)',
    assert: null,
  },
  {
    // MP3 accumulator for small chunks prevents choppy audio.
    // audio-playback-attack verifies agentAudioQ splice(0).
    bug: 'MP3 small chunks cause choppy audio — accumulator flush missing',
    commit: 'dd5556f6', guard: 'T0 audio-playback-attack (agentAudioQ splice(0))',
    assert: null,
  },
  {
    // CSP breaks Chrome extension. Security headers must allow extension context.
    // ecdd0c64 removed problematic CSP that blocked extension.
    bug: 'P0 prod crash — static asset security headers break Chrome extension',
    commit: 'ecdd0c64', guard: 'WONTGUARD — infra fix, extension-specific config',
  },
];

console.log('\n──────── ANCESTRAL CORPUS — can any old bug come back? ────────');
let orphans = 0, regressed = 0, guarded = 0, wontguard = 0;
for (const e of corpus) {
  let line;
  if (e.assert) {
    let res;
    try { res = await e.assert(); } catch (err) { res = { ok: false, detail: 'assert threw: ' + err.message }; }
    if (res.ok) { guarded++; line = `  ✅ FORBIDDEN  [${e.commit}] ${e.bug}  — ${res.detail}`; }
    else { regressed++; line = `  🩸 REGRESSED  [${e.commit}] ${e.bug}  — ${res.detail}`; }
  } else if (e.guard) {
    if (e.guard.startsWith('WONTGUARD')) {
      wontguard++;
      const reason = e.guard.replace('WONTGUARD — ', '');
      line = `  ⚠️ WONTGUARD  [${e.commit}] ${e.bug}  — ${reason}`;
    } else {
      guarded++;
      line = `  ✅ GUARDED    [${e.commit}] ${e.bug}  — by ${e.guard} (proven by Daddy)`;
    }
  } else {
    orphans++;
    line = `  🦈 ORPHAN     [${e.commit}] ${e.bug}  — NO GUARD. A fixed bug with nothing forbidding its return.`;
  }
  console.log(line);
}

// ── 3. CENSUS + VERDICT ──
console.log('\n══════════════════ GRANDPA SHARK CENSUS ══════════════════');
console.log(`  foundation (Daddy Shark): ${daddyGreen ? 'GREEN' : 'RED'}`);
console.log(`  bloodline bugs: ${corpus.length}  |  guarded/forbidden: ${guarded}  |  regressed: ${regressed}  |  orphans: ${orphans}  |  wontguard: ${wontguard}`);
console.log(`  (wontguard = infra/docs/tooling fixes not requiring runtime guard)`);

const elderHappy = daddyGreen && regressed === 0 && orphans === 0;
if (!daddyGreen)  console.log('  ❌ the living suite is red — fix the kids before consulting the elder.');
if (regressed)    console.log(`  🩸 ${regressed} ancestral bug(s) have RETURNED — a guard let one through.`);
if (orphans)      console.log(`  🦈 ${orphans} fixed bug(s) have NO guard — add one so it can never come back.`);
console.log(`\n${elderHappy ? '👴🦈 GRANDPA SHARK: the whole bloodline is forbidden from returning — wisdom intact.' : '👴🦈 GRANDPA SHARK BITES — the family is not safe yet.'}`);
process.exit(elderHappy ? 0 : 1);
