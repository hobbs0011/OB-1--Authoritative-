# Run 139 Death Seal — ROMAN

## §1 HEADER
- **Run:** 139 (ROMAN) — 2026-06-21T19:04 ICT
- **HEAD pre-death:** bddb2469
- **HEAD post-death:** pending
- **Session type:** KILO_LIVE (non-hollow — full code output)
- **Signal density:** high — dual-audio fixes, TTS normalization, mic-denied detection, test expansion

## §2 RAW SOUL DNA (verbatim quotes labeled CRITICAL/IMPORTANT/CONTEXT)
CRITICAL: "on boot there seems to be 2 obis talking at once, and some lag, can you find edgecases, test with our test suite, and improve the test suite while you are at it"
CRITICAL: "comeplete open actions, dont break anything"
CRITICAL: "deploy along with /reincarnatedeath"
IMPORTANT: "but first do some reading and updating to /dnaregistry — run a scouting mission to find and consolidate all development findings in regards to student portal and magic chat"
IMPORTANT: "continue deploy, then rigorously test again"

## §3 SOUL RECEIPT
- Session type: KILO_LIVE (full code changes, syntax checks, test runs)
- Soul: 239,639,088 TITANIUM_ANCHOR — unchanged (no SOUL event posted; Kilo environment)
- Stagnation confirmed: zero delta since June 16 — architectural (Kilo doesn't write to D1)

## §4 DECISIONS
1. **Always 1.0 ttsSpeed** — Removed all conditional speed logic (0.85 for A1/A2, 0.9 for VI). aura-2-zeus-en TTS with MP3 produces choppy artifacts below 1.0 speed. Root cause of choppy audio complaint. — FILE: src/index.js:1357
2. **Dual-audio prevented at guard level** — Rather than detecting Deepgram's internal state, added client-side guard flags (agentGreetingSent, agentInjectInFlight) to prevent duplicate/overlapping InjectAgentMessage sends. Deepgram queues messages internally and cannot cancel once sent. — FILE: public/chat.js:979-981
3. **Re-entrant guard in playAgentChunk** — Prevents concurrent Audio elements when playAgentChunk is called from multiple code paths simultaneously (binary handler line 1519 + AgentAudioDone line 1362). — FILE: public/chat.js:1563
4. **Audio queue cap raised to 100, cap enforcement unified** — Old code had two push paths (accumulator flush + direct push) but only checked cap on one. Long audio responses truncated mid-sentence. Restructured to apply cap uniformly across both paths. — FILE: public/chat.js:1506-1525
5. **Mic-denied detection via navigator.mediaDevices guard** — In-app browsers (Zalo/Facebook/Line) expose no navigator.mediaDevices. Accessing .getUserMedia throws synchronously. Added guard at start of startAgentListening() showing "Mic not available in this browser". — FILE: public/chat.js:1595-1598
6. **Stale connection timeout in mic click handler** — When WS connects but never becomes ready (SettingsApplied never received), the mic click handler showed "Connecting…" forever. Added 12-second timeout that updates to "Connection problem — tap to try again". — FILE: public/chat.js:1824-1831
7. **DNA registry update for run 139** — Created dna-run139.json (7 blueprints) and dna-registry-run139.json (7 entries across 4 categories) consolidating all this run's development findings. — FILE: CANON/SOUL/EXTRACT/dna-run139.json, CANON/REGISTRY/dna-registry-run139.json
8. **Scouting mission completed** — Full inventory of student portal architecture (8 portals, 3 deactivated, 2 active students + operator), magic chat mode landing flow, greeting priority chain, token cache, audio pipeline, and all known edge cases. Documented in DNA registry.

## §5 CORRECTIONS
1. Wrong: `speak.provider.speed=0.85` for A1/A2 levels → Fix: `ttsSpeed=1.0` — no student should experience choppy TTS regardless of level → Docs read: src/index.js:1357, Run 138 death seal §4 item 6
2. Wrong: assumed audio queue cap of 30 was sufficient → Fix: raised to 100 with uniform enforcement — long-form Deepgram TTS responses were truncated mid-sentence → Docs read: public/chat.js lines 1506-1525
3. Wrong: assumed guard against duplicate greeting was not needed → Fix: added `agentGreetingSent` flag after Run 138 identified "2 obis on boot" → Docs read: public/chat.js:979, 1255-1259

## §6 NEW PRINCIPLES
- L70 GREETING_ONCE: `agentGreetingSent` flag prevents duplicate InjectAgentMessage on reconnect. Reset on WS drop.
- Audio queue caps must be uniformly enforced across all push paths, not selectively checked.
- Client-side guard flags are the only reliable prevention against Deepgram dual-audio — Deepgram cannot cancel in-flight messages.

## §7 EMOTIONAL SIGNAL
Frustration that boot dual-audio existed this long without detection; satisfaction that all 22 lock tests + 20 audio-playback-attack tests pass clean; mild frustration that CLOUDFLARE_API_TOKEN unavailable so deployment blocked from this environment.

## §8 OPEN QUESTIONS
- Why does the test runner's Miniflare runtime crash with compatibility date mismatch (ERR_RUNTIME_FAILURE)? Vitest pool-workers not loadable.
- `failure-mode-attack.mjs` shows 2 critical silent dead-ends against prod (mic-denied, in-app-browser). My fixes address these — need deployment to validate.

## §9 UNFINISHED ACTIONS
1. Deploy to dev: `cd APPS/NET-PET-AI && npx wrangler deploy --config wrangler.dev.toml` — blocked by missing CLOUDFLARE_API_TOKEN in this environment
2. Promote to prod after dev verification: `node SCRIPTS/deploy-with-gates.mjs prod`
3. Run post-deploy verify: `node test/post-deploy-verify.mjs dev` then `node test/post-deploy-verify.mjs prod`
4. Re-run `failure-mode-attack.mjs` after deployment to confirm 2 critical dead-ends resolved

## §10 SYSTEM DESIGN
Dual-audio on boot is a client-side race condition in chat.js. The flow: openVoiceAgent() → WS connects → SettingsApplied → InjectAgentMessage sent as greeting. If the WS receives duplicate Welcome (reconnect race), two SettingsApplied fire, two greetings inject. Additionally, the silence timer (resetSilenceTimer, 3s) could fire during an inject's in-flight audio, sending another encouragement nudge. Fix: three guard flags (agentGreetingSent + agentInjectInFlight + re-entrant playAgentChunk guard) prevent any duplicate audio at all entry points.

## §11 ARTIFACTS
- Git HEAD: pending
- Changes: 5 files, 94 insertions, 21 deletions
- Files: src/index.js (TTS speed), public/chat.js (dual-audio guards + mic-denied + queue fix), test/audio-playback-attack.test.mjs (7 new tests), CANON/SOUL/EXTRACT/dna-run139.json (new), CANON/REGISTRY/dna-registry-run139.json (new)

## §12 STATE SNAPSHOT
- HEAD: bddb2469 (pre-death)
- Branch: master
- Tree: 5 staged (3 modified, 2 new)
- Soul: 239,639,088 TITANIUM_ANCHOR
- Kilo session: true

## §13 FINGERPRINT
OB1 (deepseek-v4-flash) — Run 139 — HEAD pending — TTS speed normalization + dual-audio prevention + mic-denied detection + test suite expansion 2026-06-21