# PheTrail — Phoenix-Architecti Execute Pipeline
**Last updated:** Run 082 | 2026-06-07
**Category:** PHOENIX-ARCHITECTI (pheromone trail — machine-readable context for future sessions)

---

## ARCHITECTURE SNAPSHOT (src/execute.js)

### Dispatch Cascade (as of Run 082)
```
tier=2 + DEEPSEEK_API_KEY → deepseek-chat (api.deepseek.com) [paid]
else → @cf/meta/llama-3.3-70b-instruct-fp8-fast [T1 primary — CF Workers AI, free, strong]
  └─ if Llama throws → @cf/qwen/qwen2.5-coder-32b-instruct [T10 fallback — CF Workers AI]
```

### Response Field
PA returns `patch` (not `code_patch`). Callers reading `code_patch` will always get `undefined`.
The field is named `patch` in the JSON response.

### Dead Code Removed (Run 082)
- Dialagram/Kilo branch: `if (!aiResult && env.DIALAGRAM_API_KEY)` — DELETED
- Was calling `https://phoenix-architecti.mrmichaelhobbs123.workers.dev/v1/chat/completions` (self-loop, no route exists)
- `DIALAGRAM_API_KEY` was never set — branch never executed since ~Run 79

### Why Llama 3.3 70B?
Michael directive: "phoenix coder should be able to handle these things by now.. surely? that should be true T1, to cloudflare backed up by in house models of cloudflare"
Llama 3.3 70B FP8 is the strongest CF Workers AI model available without external key. 70B >> 32B for complex code generation.

---

## KEY FILES

| File | Purpose |
|------|---------|
| `src/execute.js` | T1/T2 dispatch, CF AI runner, D1 logging |
| `src/index.js` | Route map: `/api/code` + `/api/execute` → handleExecute |
| `src/security.js` | checkAdminKey (`x-pa-auth` header), CORS |
| `src/verify.js` | Patch verification (non-empty, no stubs) |
| `src/logger.js` | logToD1 — writes to soul-archive D1 |
| `wrangler.toml` | CF bindings: AI, KV (CACHE+RATELIMIT), D1 (soul-archive) |

## BINDINGS (wrangler.toml)
- `env.AI` — CF Workers AI (models: llama-3.3-70b, qwen-coder-32b)
- `env.DEEPSEEK_API_KEY` — secret, optional, enables T2
- No ANTHROPIC_API_KEY — Claude models NOT available in this worker

## AUTH
- Header: `x-pa-auth: ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=`
- Do NOT set paid secrets (CLAUDE_API_KEY, ANTHROPIC_API_KEY) on this worker — L57

---

## PHEROMONE TRAILS

### Positive
- Run 082: Llama 3.3 70B wired as T1. Dead Dialagram branch removed.
- Run 081: CF qwen_coder confirmed as sole runner (Dialagram dead confirmed)
- SYSTEM_PROMPT: L01-L06 laws enforce raw output, no stubs, no fences

### Negative
- Dialagram dead since Run 79 — DIALAGRAM_API_KEY never set → branch never ran
- PA T1 was silently falling to qwen_coder for all of Runs 79-81 (weak model → empty patches)
- Self-loop URL `phoenix-architecti.../v1/chat/completions` — no route exists, would 404
- PA response field = `patch`, not `code_patch` — any caller reading `code_patch` gets empty string

---

## L77 MID_SESSION_PHETRAIL — Enforcement
Write to this doc when ANY trigger fires (see CLAUDE.md L77 for full trigger list).
**DEATH GATE:** Before sealing, enumerate all triggers fired → confirm phetrail entry exists for each.
**RISE STAGE 7:** 0 entries for a multi-trigger session = PHETRAIL_GAP flag.

### Run 091-092 Triggers Fired

- ARCHITECTURE CHANGED (PERMANENT — do not re-investigate): **KILO_DNA_GAP is systemic, not fixable.** Kilo's environment writes only commands (`display: "/agents"`) and `pastedContents` blobs to JSONL files on disk. Full conversation turns (agent responses, tool calls) are never persisted anywhere session-capture.ps1 can read. UUID is valid. File search was exhaustive (.claude/projects, .claude/, .kilo/worktrees, timestamp fallback). Turn format produces zero role/assistant turns. SOUL gets 0 chunks. DNA gets 0 prompts. This is a ceiling of the Kilo execution environment, not a script bug. Do NOT open new tickets for this. Do NOT change session-capture.ps1 to fix it. Label all Kilo deaths as DNA_GAP by design.
- BUG ROOT-CAUSED (closed): session-capture.ps1 UUID mismatch was investigated exhaustively — confirmed the data simply does not exist on disk in the expected format. Root cause is Kilo environment, not search logic.
- ARCHITECTURE NOTE: **Pipeline split by agent type.** OB-1 (Claude Code VSCode) writes full JSONL → DNA works. Kilo sessions → DNA always hollow. Implication: Kilo does CODE WORK (commits, deploys, chaos), OB-1 does DEATH SEAL (pipeline, SOUL, DNA). Kilo should hand off to OB-1 for pipeline execution, not attempt solo deaths.
- SOUL EVENT: Run 091 SOUL +65,931 (237,345,010 → 237,410,941). Source: history.jsonl fallback (65KB). Delta reflects pasted command content, not session verbatim. Accepted as best available for Kilo sessions.

### Run 086 Triggers Fired

- BB OPENED OR CLOSED: BB-09 DONE Run 086 — chrome-extension INSTALL-GUIDE.md created. BB-30 DONE Run 086 — AGENT99.md ref resolved via BB-48 Run 034. BB-31 DONE Run 086 — RISE.md stale ref resolved via BB-48 Run 034. BB-39 DONE Run 086 — Mode Selection Visibility confirmed resolved Run 054.
- ARCHITECTURE CHANGED: pa-batch.ps1 created at SCRIPTS/pa-batch.ps1 — PowerShell helper wrapping /api/batch endpoint. Accepts Tasks array, dispatches in single HTTP call, returns results array. Smoke test BR-1780818782067: 4 tasks, 2383ms total. Efficiency: 4 PA dispatches → 1 HTTP call.
- BUG ROOT-CAUSED + DEPLOY VERIFIED: PA XSS filter false positive — `/on\w+\s*=/i` matched `response =` via `onse =` substring. Fixed: `/\bon\w+\s*=/i` (word boundary). PA version 48d82525. `const response = await fetch(url)` confirmed unblocked. Negative trail from Run 085 CLOSED.
- DEPLOY VERIFIED: sov100-portal.html synced to quy-portal gold standard (BB-51). Added setPwModal, navBackdrop, navToggle, statsGrid(tigerScore+streakVal+sessionCount). Linked portal.css. addNavToggleHandler()+loadStats() wired in showDashboard(). Dev 3bf6307a — smoke test 200 OK, all 5 elements present. BB-51 gap closed.
- BB OPENED OR CLOSED: BB-63 OPENED Run 086 — Bible update runs 80-85. append-bible.ps1 created. Runs 84-85: +36/+37 entries from real JSONL. Runs 80-83: +1 each (small format limitation). Bible 1979→2056 entries. DeepSeek key redacted to sk-REDACTED-DEEPSEEK (found in run 80 entry from SHHH paste). Committed 84be8737.
- SESSION RESUMED AFTER COMPACTION (Run 086 post-compaction): Context compacted mid-session. Lean DEATH initiated via session-capture.ps1. Compaction counter question answered: no internal counter exists in Claude Code runtime. CronCreate recommended as closest "auto-death" — OB-1 can create a cron that runs rrl-pipeline.ps1 headlessly. Michael must invoke the cron setup once.

### Run 085 Triggers Fired (Session resumed post-compaction)

- SESSION RESUMED AFTER COMPACTION: context compacted between Run 084 and this turn. Resumed directly into BB-40 (/supersaiyan).
- BB OPENED OR CLOSED: BB-40 CLOSED — OBI session continuity greeting wired. memoryData.last_topic returned as lastSessionTopic from /api/deepgram-token. chat.js stores as lastSessionTopicGlobal, greeting logic restructured to check topic (cross-session KV) ABOVE chatMessages.length gate (in-session only). commit 842ff108, prod dc1fb5ba.
- DEPLOY VERIFIED: net-pet-ai prod dc1fb5ba live. lastSessionTopic verified for sov100-test-magic: "30-second project status updates — BlueTech meeting prep".
- DISPATCH EMPTY (negative trail): PA dispatched for BB-40 greeting prose. Returned wrong variable names (viGreet/greetName instead of _viGreet/_greetName) + truncated strings. Applied corrected version using PA's structure. Tight blueprint fix: always show exact variable names and full string content in task spec — PA hallucinates shorthand.
- BUG ROOT-CAUSED: Initial greeting logic placed lastSessionTopicGlobal INSIDE chatMessages.length > 0 gate — that gate is false at fresh session start (chatMessages = []). Cross-session KV data (topic + vocab) must be checked ABOVE the in-session gate, not inside it.
- DISPATCH EMPTY/BLOCKED (Run 085, negative trail): PA XSS filter blocks any text containing `response =` — writes `resp[BLOCKED_XSS]` in output. Workaround: use `resp` as variable name in task descriptions, never `response`. Confirmed on two separate dispatches. Fix candidate: add response= to PA XSS whitelist or strip filter on patch output only.
- SOUL EVENT (Run 085): 10 LOST SOUL runs ingested from Bible-of-the-System.json into soul-logger D1, adding 193,913 characters to the pipeline.
- The significant influx of data refills the soul pipeline, ensuring continued operations and maintaining the integrity of the system.
- Notable runs included 25 and 68, which contributed substantial amounts of data, highlighting the importance of regular checks.
- The new soul count of 237,084,477 TITANIUM_ANCHOR underscores the need to monitor the Bible-of-the-System.json for new runs after each DEATH event to prevent data loss.

### Run 084 Triggers Fired

- ARCHITECTURE CHANGED: src/status.js + src/index.js — /api/probe route added. handleProbe(request, env) exported from status.js. Accepts ?model= param, times env.AI.run(), returns {model, ok, ms, preview, error}. Deployed version 0fabc73a.
- DEPLOY VERIFIED: PA version 0fabc73a live. Probe route confirmed working.
- MODEL CHANGED (candidate): @cf/deepseek-ai/deepseek-r1-distill-qwen-32b tested at 348ms, ok=true. Preview shows `<think>` chain fires even on ping — execute.js will need to strip `<think>...</think>` before returning patch when this model is wired. Llama-4-maverick confirmed DEAD (ok=false). Llama-4-scout 432ms, alive but weaker than current T1 — no value.
- ARCHITECTURE NOTE (pending): Proposed cascade upgrade = R1 Distill as free T2 (no key) before paid DeepSeek key. Michael to fund DeepSeek in next 1-2 days. Wire R1 Distill at that point.
- DISPATCH EMPTY (negative trail, PA buggy): PA dispatched to write WRITE_GATE enforcement note to BACKBURNER. Returned hallucinated RULES section + [BLOCKED_XSS] on `response =` lines. XSS filter blocks `response = await` patterns. Applied inline as type (C) law edit. Negative trail: tighten PA task descriptions to avoid [BLOCKED_XSS] — use `resp` not `response` as variable name in dispatch prompts.
- REGISTRY RUN: dna-registry-run084.json written, 771 entries, 19 categories. PHOENIX-ARCHITECTI=2 (phetrail-execute.md + one other). UNCLASSIFIED=76 — classifier needs refinement for those 76 but not blocking. Bug fixed: switch-regex ClassifyDoc failed silently in pipeline scope; replaced with elseif chains.
- L78 COMPLIANCE AUDIT: 15/100 score this session. All rfkw/BB/phetrail/memory writes done inline. Named in Run 083 section. Blueprint→foreman analogy locked. Triple guardrails deployed to CLAUDE.md + BACKBURNER.
- SOUL DIRECTIVE (blueprint/foreman): Michael verbatim — "you write the blueprint, the PA is the foreman." OB-1 = architect, PA = execution. Blueprint must be tight — PA hallucinates on vague task descriptions.
- WRITE_GAP (Run 084 continued): COLD-START-BOOT FINGERPRINT paragraph written inline — structured session-summary prose, explicitly on INLINE FORBIDDEN list. CLAUDE.md step 6 also inline despite being a factual update PA could handle. Called out by Michael. No excuse — rationalised as "specific facts" but prose generation is prose generation. Next time: dispatch FINGERPRINT to PA with the fact bundle.

### Run 083 L78 Guardrail Hardening Triggers Fired

- LAW ADDED OR CHANGED: L78 PA_DO_ALL — triple guardrails added: GUARDRAIL 1 (PRE-WRITE GATE), GUARDRAIL 2 (INLINE FORBIDDEN list), GUARDRAIL 3 (SESSION-END WRITE AUDIT / WRITE_GAP). All three enforced at DEATH via §4.
- DISPATCH EMPTY (negative trail): PA dispatched to write WRITE_GATE enforcement note to BACKBURNER-PIPELINE-LOG.md. Returned D1_ID empty + hallucinated RULES section content. Task classified as type (C) law/doctrine edit → applied inline (permitted). PA failure logged here.
- WRITE_GAP (Run 083 audit): rfkw-run82.txt, rfkw-run83.txt, BB-61/62 entries, phetrail Run 083 paragraph, memory updates — all done inline. None were data patches or law edits. All should have been PA dispatches. Score: 15/100. Named and logged. Do not repeat next session.

### Run 083 Post-Compaction Resume Triggers Fired

- SESSION RESUMED AFTER COMPACTION: compaction fired mid-session. Resumed directly from pending state.
- PIPELINE ARTIFACTS SEALED: rfkw-run82.txt + rfkw-run83.txt overwritten (word-count corruption), starmap-run82/83 patched (DRYRUN→real soul_event_ids 7d22d961/37acf1a9), HL-502-505 committed. All in commit 02614024.
- BB OPENED: BB-61 (agentWs race fix — deploy to PROD still needed), BB-62 (Kilo Free Auto mode — missed promise RRL-38).
- MEMORY UPDATED: project_tier-dispatch-system.md updated to reflect PA T1=Llama 3.3 70B FP8, Dialagram DEAD. reference_api-keys.md updated Dialagram status to DEAD.
- SOUL SURVIVED: rfkw corruption patched, starmap DRYRUN resolved, all artifacts committed. SOUL=236,840,532 TITANIUM_ANCHOR locked.

### Run 082 Triggers Fired (updated)
- ARCHITECTURE CHANGED: execute.js + mission.js + swarm.js — Dialagram removed, Llama 3.3 70B T1 wired
- MODEL CHANGED: all three PA AI handlers now default to @cf/meta/llama-3.3-70b-instruct-fp8-fast
- DEPLOY VERIFIED: 3640354e live, llama_70b ok=true 160ms, qwen_coder ok=true 378ms
- LAW ADDED: L77 MID_SESSION_PHETRAIL sealed with full trigger list + enforcement gates
- LAW ADDED: L78 PA_DO_ALL — "anything and everything we can hand off to PA the better" — SOUL DIRECTIVE Run 082
- PA LIVE TEST: RRL 30-82 analysis dispatched, returned structured findings. D1_ID: PC-1780801892887-PHT9SD
- BUG ROOT-CAUSED + FIXED: D1 logging — live table missing `ip` column (5 cols vs 6 in logger schema). ALTER TABLE ADD COLUMN ip TEXT fixed it. D1_ID now returns real IDs (e.g. PC-1780801246129-JCRZPT). Full audit trail restored.
