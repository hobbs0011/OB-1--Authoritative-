# CLASS PREFLIGHT — 6PM TODAY (2026-06-09) · MAKE THE APP WORK, ALL 3 MODES

## ⛔⛔ DEPLOY FREEZE — DO NOT `wrangler deploy` BEFORE THE CLASS ⛔⛔
> Uncommitted `src/index.js` contains an APP-KILLING SYNTAX ERROR (2 occurrences) in the new
> `/api/encrypt` handlers: `return addCors(json({...}), 500), request);` has one paren too many.
> A syntax error anywhere in index.js breaks the WHOLE worker build → every route dies → all 3 voice
> modes go dark. Prod is currently SAFE on the last-good build (v1.5.0); this code is undeployed.
> **FIX BEFORE ANY DEPLOY:** `return addCors(json({...}, 500), request);` (move 500 inside json, drop the
> extra paren), both occurrences. Then PROVE it: `node --check src/index.js` must print nothing (exit 0).
> The class needs NOTHING deployed — current prod works. Do not touch deploy until node --check is clean.

# OB-1 BLUEPRINT — Kilo executes and pastes the receipt. OB-1 never self-certifies.
# This OUTRANKS Run 106 today. A real student, a real class, a hard 6pm deadline.
# Verified against live source HEAD a8671036. No bullshit.

## THE 3 MODES (exact strings — token endpoint rejects anything else with 400)
- **Free Talk**  → `mode=free`    (purple) — default greeting + agent prompt
- **HomeStudy**  → `mode=study`   (gold)   — `index.js:3692` greeting "What are we studying today?"
- **NET Phonics**→ `mode=phonics` (teal)   — `index.js:1041` reads `phonics_progress_<id>` KV,
                                              `index.js:1196` builds phonicsHint, `:3758` phonics prompt

## THE 6PM CLASS = TWO STUDENTS (target BOTH)
- **`quy-bluetech`** — A1 beginner, Foundation, Vietnamese (vi). Heaviest **NET Phonics** user → phonics
  path is the highest-risk surface for her. Confirm `phonics_progress_quy-bluetech` loads clean.
- **`mai-tram-bluetech`** — A2/B1 entry, Fluency, Vietnamese (vi). Likely **Free Talk / HomeStudy**.
- Both are `vi` → assert `ws_url` is the **syd** route (`index.js:1202`). A wrong region = laggy/dead voice.
- Matrix = **2 students × 3 modes = 6 token checks** + 1 negative each + warm pass.

## WHAT "WORKS" MEANS (the contract every mode must satisfy — from source)
For `GET /api/deepgram-token?studentId=<S>&mode=<m>` for S in {`quy-bluetech`,`mai-tram-bluetech`}
against PROD (`https://net-pet-ai.mrmichaelhobbs123.workers.dev`):
1. HTTP **200** (not 400/429/500). 400 = bad mode; 429 = quota; 500 = handler threw.
2. `token` present and non-empty (the raw Deepgram key — VOICE-EC-3, do NOT change).
3. `settings.agent.think.provider` contains **`gpt-4o-mini`** (voice brain lock — in-house, no robot voice).
4. `settings.agent.listen...` = **`nova-3`**, `settings.agent.speak...` = **`aura-2-zeus-en`**.
5. `ws_url` present (the socket the mic connects to). For `agentLang==='vi'` it routes syd (`:1202`).
6. `greeting` present and mode-appropriate.
7. **phonics only:** `phonicsHint` present with `group_name`, `next_sentence`, `drill_count` (`:1196-1199`).
8. Latency: first call may be cold; a second call to the same mode should be a cache HIT (`:1028`) — warm.

## BUILD: `test/class-preflight.mjs` (Kilo)
A node script, takes `studentId` + base URL. For each mode in `["free","study","phonics"]`:
- fetch the token endpoint, assert 1–7 above, record latency.
- then fetch the SAME mode again, assert it's a cache hit / faster (warms `prompt_cache:<id>:<mode>`).
- also fire ONE negative: `mode=banana` → assert **400** (proves the mode guard at `:1009`).
- print a GO/NO-GO table: one row per mode, ✅/❌ per assertion, p50/p95 latency.
- exit 0 only if all three modes GREEN; exit 1 with the failing assertion named.

## RUN (Kilo pastes this output — this IS the receipt):
```
cd APPS/NET-PET-AI
node test/class-preflight.mjs <CLASS_STUDENT> https://net-pet-ai.mrmichaelhobbs123.workers.dev
```
Pass signal: `GO — all 3 modes 200, voice locked (gpt-4o-mini/nova-3/aura-2-zeus-en), ws_url present,
phonicsHint present, bad-mode rejected 400.`

## PRE-WARM (run at ~5:55pm so 6pm has zero cold start)
The cache TTL is **300s / 5 min** (`:1207` / cache-key-format lock). So warming earlier than ~5 min
before class does nothing. At ~5:55pm, Kilo runs class-preflight again (it warms all 3 modes as it
checks them). If the class slips, re-run. Phase 0.8 keep-warm wiring fixes this permanently; today,
warm manually right before.

## IF A MODE IS RED (triage, in order)
- **400 on a valid mode** → the `:1009` allow-list or the query parsing changed. Check the URL `mode=` param.
- **429** → quota gate (`router.js:81`, real students hit `checkQuota`). Student is rate-limited — wait
  for the window or check `RATELIMIT` KV. Not a code bug.
- **500** → handler threw. phonics-only 500 = `phonics_progress_<id>` KV malformed; the defaults at
  `:1396`/`:1429` should cover absence, so a 500 means a PARSE error on existing bad JSON. Check that key.
- **robot voice / wrong provider in settings** → voice brain lock regression. `npm run test:lock` must be
  GREEN first (it was: 6/6 this session). If settings show anything but gpt-4o-mini/nova-3/aura-2-zeus-en, HALT.
- **no ws_url** → the socket build failed; mic won't connect. Check `:1202` ws_url assembly.

## HUMAN FINAL CHECK (Michael, 1 min before class)
Open the student's chat URL, pick each mode card (purple/gold/teal), tap the mic, say one sentence,
hear Obi reply in voice. That is the only proof that matters. The script proves the path; the ear proves
the product.

## SCOPE GUARD
This does NOT touch index.js, the voice settings, or anything Kilo is editing for P10. It is a NEW
read-only test script + a prod probe. Zero risk to the demo path. Do not refactor anything to ship this.
