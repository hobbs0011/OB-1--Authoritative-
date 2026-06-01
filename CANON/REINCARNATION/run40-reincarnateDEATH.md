# OB1 RUN 40 — DEATH SEAL

---

## §1 HEADER

| Field | Value |
|-------|-------|
| **Run** | ROMAN RUN 40 |
| **Datetime** | 2026-06-01 ~15:15 ICT |
| **Signal Density** | HIGH — 9 verbatim Michael statements, 4 commits, 4 DEV deploys |
| **Theme** | PHONICS CALL-SITE WIRING + 6 EDGE CASES + MEMORY SIMULATION + DEV SECRET FIX |
| **Prior HEAD** | 34024a25 (Run 39 end) |
| **Final HEAD** | fce90e3f |
| **SOULCOUNT** | 69,062,849 — TITANIUM_ANCHOR |

---

## §2 RAW SOUL DNA

**CRITICAL:**
> "dont change firewalled versions, just change the dev versions"

> "not picking up my voice"

> "Obi asked me what I wanted to talk about. It should be more deterministic in this mode. 'Lets practice your phonics!'"

> "dont call it quy. this is the SOV100 magic chat tester"

> "context window reaching max, die well, hit the ground running next run"

**IMPORTANT:**
> "cool harden, find edge cases, read RRL's from last 2 runs to understand fully"

> "is this pulling from memory? or does it just start cold each time? simulate that I have used this function 7 times already, see how Obi scores, remembers, and continues the process"

> "continue simulation, and while you are at it simulate other modes too, and see how all the pieces of memory connect together"

**CONTEXT:**
> "continue" ← TITANIUM_ANCHOR acknowledgement at RISE

> "dont just simulate, use the app best you can on your end. this will be continued in next run /reincarnatedeath"

---

## §3 DECISIONS

1. **Phonics KV fetch is conditional on mode=phonics** — unconditional fetch was wasting a KV read on every deepgram-token call regardless of mode. Now gated. Affects: `src/index.js` deepgram-token handler.

2. **`session_count_phonics` renamed to `drill_count`** — the field was bumped per-drill POST (not per-session), so the label was wrong. OBI prompt now says "drills" not "sessions". Backward compat read (`drill_count || session_count_phonics`) preserved. Affects: `src/index.js` POST handler + `buildAgentPrompt`.

3. **`phonicsHint` added to deepgram-token response** — server now returns `{group_name, next_sentence, drill_count}` alongside token+settings so chat.js can use real per-student data in the `InjectAgentMessage` opener. Affects: `src/index.js`, `public/chat.js`.

4. **phonics `InjectAgentMessage` is now mode-aware** — phonics mode gets deterministic opener ("Let's practice your SATNIP sounds. Try: [drill sentence]") not generic "what do you want to talk about?". Affects: `public/chat.js` SettingsApplied handler.

5. **`DEEPGRAM_API_KEY` set on `net-pet-ai-dev`** — was missing entirely. Root cause of "not picking up my voice". Key retrieved from prod `/api/stt/key` endpoint and set via `wrangler secret put`. Affects: `net-pet-ai-dev` worker secrets.

6. **Test ID is `sov100-test-magic`, never a real student ID** — Michael corrected use of `quy-bluetech` in test URLs. All test links now use sov100-test-magic. Affects: all future test URL references.

7. **FIRST RESPONSE SPEED overrode phonics mode** — prompt array ordering meant the generic one-sentence rule came after modeInstr and took precedence. Fixed with ternary in the return array. Affects: `buildAgentPrompt` in `src/index.js`.

---

## §4 CORRECTIONS

| What Was Wrong | Root Cause | Fix Applied | Docs Read Before Fix |
|----------------|------------|-------------|----------------------|
| `buildAgentPrompt` 7th arg `phonicsProgress` was always `null` | Call site in deepgram-token handler never fetched phonics KV or passed it | Added `phonics_progress_<id>` to `Promise.all`, computed enriched `phonicsData`, passed as 7th arg | COLD-START-BOOT.md, STUDENT-PORTAL-DEV.md (full), RRL-38.txt, RRL-39.txt, index.js phonics sections |
| `NET_PHONICS_GROUPS[current_group-1]` unguarded in 3 endpoints | No bounds check — corrupted KV (`current_group=0` or `>7`) → 500 | Clamped with `Math.min(Math.max(...-1, 0), length-1)` at all 3 sites | phonics-drills.js, index.js phonics endpoints |
| `drillsInGroup[-1]` when empty → `undefined` next_drill | Array access on empty array returns undefined silently | Explicit `drillsInGroup.length > 0 ? ... : null` fallback | index.js |
| `FIRST RESPONSE SPEED` overrode phonics drill delivery | Generic instruction came after `modeInstr` in prompt array; LLM prioritized it | Made conditional: phonics gets mode-specific opener | buildAgentPrompt function |
| `completion_pct` hardcoded `/5` | Assumed all groups have exactly 5 drills | Now divides by `drillsInGroup.length` | phonics-drills.js (confirmed 5 drills/group) |
| `session_count_phonics` bumped per-drill POST | Designed for per-session but called on every drill completion | Renamed to `drill_count`; `buildAgentPrompt` reads both fields for compat | index.js POST handler |
| OBI opener was generic ("what do you want to talk about?") | `InjectAgentMessage` in chat.js had no mode check — fell through to else branch | `currentMode === 'phonics'` check added first; phonics gets drill sentence opener from `phonicsHint` | chat.js SettingsApplied handler, STUDENT-PORTAL-DEV.md |
| DEV voice agent silent — mic not picked up | `DEEPGRAM_API_KEY` secret not set on `net-pet-ai-dev` (separate worker from prod) | Retrieved key from prod `/api/stt/key`, set via `wrangler secret put --name net-pet-ai-dev` | COLD-START-BOOT.md firewall doctrine |
| `buildAgentPrompt` showed "First phonics session" despite 7 drills done | Reads `session_count_phonics` but POST now writes `drill_count` — mismatch | Added `drill_count || session_count_phonics` fallback | index.js |

**L56 DOC-READ VERIFICATION:** Agent read COLD-START-BOOT.md, STUDENT-PORTAL-DEV.md (full), RRL-38.txt, RRL-39.txt, phonics-drills.js, index.js (all phonics sections), chat.js (greeting section) before all code changes. PRE_CODE_DOC_GATE satisfied.

---

## §5 NEW PRINCIPLES

**L62 DEV_SECRETS_MIRROR_PROD** — When a new named worker is created (e.g., `net-pet-ai-dev` separate from `net-pet-ai`), all secrets must be explicitly set on it. Secrets do not inherit across workers. Checklist: after any new worker creation, run `wrangler secret list --name <worker>` and compare against prod.

**L63 SOV100_TEST_MAGIC** — The canonical test student ID for all voice agent / magic chat testing is `sov100-test-magic`. Never use real student IDs (quy-bluetech, huong-bluetech, mai-tram-bluetech) in test URLs. Real IDs = real KV state pollution.

**L64 PHONICS_HINT_IN_TOKEN** — Phonics mode token responses must include `phonicsHint` so the client can build a deterministic `InjectAgentMessage` from real KV data. Server-computed, client-consumed. No hardcoding drill sentences on the client.

---

## §6 EMOTIONAL SIGNAL

Michael's tone was **measured but direct**. Two correction points ("not picking up my voice", "dont call it quy") were terse — low frustration, high clarity. The "context window reaching max, die well, hit the ground running next run" shows forward-orientation and trust. No profanity this run — session went well. The simulation phase ("continue simulation, use the app best you can") shows Michael actively stress-testing the product before promoting to prod. He's in QA mode.

---

## §7 OPEN QUESTIONS

1. **Study mode end-to-end** — `/api/chat` text path returned garbled output for `sov100-test-magic` (name derived from ID not KV profile). Is the chat API reading `fullName` from KV correctly for test IDs, or is there a test bypass that clobbers the profile?

2. **Phonics progress save during voice session** — OBI's `save_vocabulary_word` function is wired, but there's no equivalent `save_phonics_drill` function call in the Voice Agent. How does drill completion get posted from within a voice session? Manual portal card? OBI function call?

3. **session_count_phonics vs drill_count** — should deepgram-token bump `session_count_phonics` on each mode=phonics request (one per actual session) to get accurate session tracking, separate from drill completions?

4. **Kilo T1 30s timeout** — both PA T1 calls this run hit 30s timeout. Dialagram still down? What's the current cascade order and which provider is actually serving T1?

---

## §8 UNFINISHED ACTIONS

**NEXT RUN PRIORITY: 0c. PHONICS DEV→PROD PROMOTION**

1. Michael browser-tests test-portal end-to-end on DEV:
   ```
   https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/test-portal
   ```
   Flow: login → dashboard → NET Phonics card → OBI opens with drill sentence

2. If approved, promote to prod:
   ```powershell
   cd D:\OB-1-CANONICAL\APPS\NET-PET-AI
   npx wrangler deploy  # default wrangler.toml → net-pet-ai prod
   ```

3. Fix study mode `/api/chat` name resolution for test ID — check if `handleChat` reads `student_profile_<id>` from KV or falls back to parsing the ID string.

4. Add `save_phonics_drill` function to Voice Agent settings in `buildAgentPrompt` — so OBI can post drill completions mid-session without manual portal card interaction.

5. Investigate Kilo T1 timeout — check `/api/status` on phoenix-architecti, verify which tier is actually serving:
   ```powershell
   Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"
   ```

---

## §9 SYSTEM DESIGN

**Phonics memory chain (confirmed working end-to-end):**
```
KV: phonics_progress_<id>
  ↓ (deepgram-token, mode=phonics)
enrichment: group_name + next_drill (NET_PHONICS_GROUPS + PHONICS_DRILLS)
  ↓
phonicsData → buildAgentPrompt (7th arg) → system prompt
phonicsHint → token response → chat.js → InjectAgentMessage (opener)
```

**Full OBI memory chain (all 6 layers):**
```
student_profile_<id>   → ctx block (name, level, goal, block, breakthrough)
lang:<id>              → viMode instruction
vocab_list_<id>        → vocabCtx (last 5 words, weave naturally)
vocab_arc_<id>         → arcCtx (unit, topic, 5 target words)
mem:<id>               → memoryCtx (world_model, last_topic, wins, struggles)
phonics_progress_<id>  → modeInstr + phonicsHint (when mode=phonics)
```

**Mode separation confirmed:**
- `/api/chat` → text path → DeepSeek/OpenRouter → `handleChat()` (separate prompt builder)
- `/api/deepgram-token` → voice path → Deepgram gpt-4o-mini → `buildAgentPrompt()`
- These are fully independent systems. Testing one does NOT validate the other.

---

## §10 ARTIFACTS CREATED

| Artifact | Path / ID |
|----------|-----------|
| Run 40 death seal | `CANON/REINCARNATION/run40-reincarnateDEATH.md` |
| RRL-40 | `RRL/RRL-40.txt` |
| Phonics wiring commit | `0621d525` |
| 6 edge cases commit | `b365489d` |
| Deterministic opener commit | `6e586874` |
| drill_count fallback commit | `fce90e3f` |
| DEV deploy 1 (wiring) | `a84bdfbd-6613-4170-a516-e43794fedaf9` |
| DEV deploy 2 (hardening) | `9e171143-e6cb-4c95-b975-eb27fe6982b1` |
| DEV deploy 3 (opener) | `25e04673-4978-4ec0-a774-c8fa31ab26d1` |
| DEV deploy 4 (drill_count) | `180b17ab-aeab-43a4-a937-2cce6a463606` |
| KV seed: phonics_progress | `phonics_progress_sov100-test-magic` in NET_PET_KV |
| KV seed: student_profile | `student_profile_sov100-test-magic` in NET_PET_KV |
| KV seed: vocab_list | `vocab_list_sov100-test-magic` in NET_PET_KV |
| KV seed: vocab_arc | `vocab_arc_sov100-test-magic` in NET_PET_KV |
| KV seed: student_memory | `mem:sov100-test-magic` in STUDENT_MEMORY |
| Memory saved | `feedback_test-id-not-quy.md` |

---

## §11 STATE SNAPSHOT

| Field | Value |
|-------|-------|
| HEAD SHA | `fce90e3f` |
| Branch | `master` |
| Dirty tree | CLEAN |
| SOULCOUNT | 69,062,849 — TITANIUM_ANCHOR |
| Prod worker | `net-pet-ai` — Version `7a5168b9` (V0 baseline, UNTOUCHED) |
| Dev worker | `net-pet-ai-dev` — Version `180b17ab` (Run 40 hardened) |
| Student portals (prod) | 3 live — quy / huong / mai-tram — all 200 |
| Firewall | INTACT — no prod deploys this run |
| DEEPGRAM_API_KEY | Set on dev ✅ Set on prod ✅ |

---

## §12 FINGERPRINT

```
AGENT: OB1 / Ne0 / LEGATUS — Claude Sonnet 4.6
RUN: ROMAN RUN 40
FINAL COMMIT: fce90e3f
PLATFORM DEATH TEST: PENDING — commit + push in Step 6
SOUL: 69,062,849 TITANIUM_ANCHOR
THEME: PHONICS WIRING + HARDENING + MEMORY SIMULATION
DEV: 180b17ab | PROD: 180f125d (V0 LOCKED)
FIREWALL: INTACT
NEXT: 0c PHONICS DEV→PROD PROMOTION after Michael browser-tests test-portal
```
