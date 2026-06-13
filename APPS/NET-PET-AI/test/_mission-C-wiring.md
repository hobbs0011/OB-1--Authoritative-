# MISSION C WIRING — Grandpa Shark Corpus Expansion

## Summary

Expanded `test/grandpashark.mjs` corpus from **6 to 14 ancestral bugs**. All commits analyzed, guards mapped, zero orphans.

## Corpus Table

| Commit | Bug Description | Guard Source |
|--------|---------------|------------|
| cf9f32f7 | mode-select dead-end (Start below fold on short iPhone) | T1 thumb-fidelity + T3 gauntlet git-truth |
| a08668fe | orb silences Obi on iOS (createMediaElementSource trap) | T1/T3 no-playback-mediaElementSource |
| 47c1c054 | unmatched /api/* → 500 masks real errors | T0 route-404-lock (static assertion) |
| b12303fc | navigator.mediaDevices.getUserMedia crash in in-app browsers | chat.js direct assertion (Grandpa) |
| c2e7bab9 | deepgram token quota starves a live class (10/hr) | T0 quota-enforcement (static assertion) |
| 9263b2a8 | token-failure shows "Tap to start" → silent dead-end | chat.js direct assertion (Grandpa) |
| f67091b9 | listen.endpointing bare integer rejected by Deepgram VA API | T0 api-contract-lock |
| 39644661 | double-reconnect race — agentWsId zombies old handlers | chat.js direct assertion (Grandpa) |
| 5ca983f6 | gapless audio breaks — N-1 silence gaps between Deepgram TTS chunks | T0 audio-playback-attack (splice(0), watchdog) |
| b2194ecf | voice agent init race — mode selection ignored on landing confirm | T0 safari-compat |
| ae5c39d4 | PA XSS filter false positive on "response =" code pattern | T0 injection-hardening |
| 405e07c4 | dual voice (browser + agent) overlap on WS handshake gap | T0 audio-playback-attack (agentWs check) |
| dd5556f6 | MP3 small chunks cause choppy audio — accumulator flush missing | T0 audio-playback-attack (agentAudioQ splice(0)) |
| ecdd0c64 | P0 prod crash — static asset security headers break Chrome extension | WONTGUARD — infra fix, not runtime bug |

## New Lock Tests Created

None — all ancestral bugs already had guards in existing T0 lock tests.

## Files Modified

| File | Change |
|------|--------|
| `test/grandpashark.mjs` | Expanded corpus array (6 → 14 entries) + added WONTGUARD handling logic |
| `test/_mission-C-wiring.md` | This file — no changes needed for merge |

## Notes for Michael

- **Corpus expansion complete**: 14 entries, 0 orphans, 0 regressed
- No new lock tests required — existing T0 tests cover all meaningful bugs
- The T2 failures causing Daddy RED are pre-existing issues outside Mission C scope
- The corpus verification line shows: `bloodline bugs: 14 | guarded/forbidden: 13 | regressed: 0 | orphans: 0 | wontguard: 1`