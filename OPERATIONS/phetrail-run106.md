# PHEROMONE TRAIL — RUN 106
# Written: 2026-06-09 ICT | Session: sov100-roman-run106 | HEAD a8671036 (entering)
# Triggers fired this session — survival trail for Run 107 RISE

---

## TRAIL-01 — SOUL DIRECTIVE: FOUNDATION LAW
**Trigger:** SOUL DIRECTIVE SPOKEN  
**Michael (verbatim):** *"You can only build up as high as your foundation is deep."*  
**What:** Governs ALL of Run 106. Reorders the masterwork. The depth gauge table sets which foundation depth unlocks which height: Phase III Living Memory requires Fortress bedrock (encrypted PII + hard auth + erasure that erases); Phase IV Scale requires behavioral tests + roster-as-data; Phase II Kill Monolith requires 15-lock net under every route BEFORE migration; the whole empire requires F1-B proven on the REAL path.  
**How to apply:** Phase 0 and Phase I are the WIDEST phases in this run. Upper phases (II-IV) do NOT begin until their depth gauge row is satisfied. We dig before we build. Always. The Rome Gate enforces this at every phase boundary.

---

## TRAIL-02 — SOUL DIRECTIVE: TWO VOWS
**Trigger:** SOUL DIRECTIVE SPOKEN  
**Michael (verbatim):** *"I don't want this to be like the other dev runs where we do all this work, and then it gets lost and breaks my app."*  
**What:** Two structural vows. (1) WORK CANNOT BE LOST — L55 COMMIT_DONT_HOLD, seal phetrail+soulcount+HL at every phase boundary. (2) APP CANNOT BREAK — dev→gates→prod never direct; red test blocks commit (never --no-verify); strangler-fig not big-bang; rollback pre-verified before every prod push.  
**How to apply:** At any moment: "if this session died right now, is the work safe AND the app intact?" must be YES. If ever NO, stop and seal first. Governs alongside Foundation Law.

---

## TRAIL-03 — MISTAKE: AGENT OVERSTEPPED (RAN TESTS ITSELF)
**Trigger:** MISTAKES MADE  
**What:** Agent ran test suite analysis and claimed to verify results itself instead of specifying receipts for Kilo. Michael corrected: *"and not you.. Kilo, you blueprint it."*  
**Rule going forward:** OB-1 specifies the receipt (exact command + exact pass signal). KILO runs it and pastes. OB-1 NEVER self-certifies. "Should pass" is not a receipt. The failure mode that caused Run 105 ghost-closures ("F1-B closed" with no real proof) was precisely self-certification.

---

## TRAIL-04 — BUG ROOT-CAUSED: APP-KILLING SYNTAX ERROR
**Trigger:** BUG ROOT-CAUSED  
**What:** Kilo's P10 additions to index.js introduced two broken `/api/encrypt` handlers: `return addCors(json({...}), 500), request)` — one extra closing paren → hard SyntaxError → entire Worker build fails → ALL routes die → class would have been dead. Caught by rear-guard audit BEFORE any deploy. Fixed by Kilo (re-read confirmed: index.js :1948 + :2000 now clean).  
**Prevention:** `node --check src/*.js` gates commits (Stage 0 of The Gauntlet). This class of error is physically blocked if the gate is in the pre-commit hook.

---

## TRAIL-05 — BUG ROOT-CAUSED: CLASS PREFLIGHT IS SHALLOW
**Trigger:** BUG ROOT-CAUSED + ARCHITECTURE CHANGED  
**What:** `test/class-preflight.mjs` checks 200 + `!!data.token` + `!!data.settings` ONLY. A robot-voice regression (wrong think provider) returns 200 with a truthy settings object → false GO. The worst class failure slips through. Tonight's real safety net was Michael's ear-check; the script doesn't prove voice works.  
**Fix (blueprinted):** add assertions: `settings.agent.think.provider` ~ `gpt-4o-mini`, listen ~ `nova-3`, speak ~ `aura-2-zeus-en`, `ws_url` present, `phonicsHint` present for phonics mode, `mode=banana` → 400 negative. Harden before trusting the script unattended.

---

## TRAIL-06 — ARCHITECTURE CHANGED: P10 ERASURE (DEFECTS A-D)
**Trigger:** ARCHITECTURE CHANGED  
**What:** Kilo's P10 work on branch `run106-p10-erasure-hardening`:
- Defect A (DO /purge missing): NOW FIXED — durable_objects.js :46 (LedgerDO), :68 (PetDO), :136 (MemoryDO)
- Defect B (colon-key purge guard): VERIFY — `lang:`/`goals:`/`subscription:`/`streak:`/`chat_memory:` keys — confirm they actually purge
- Defect C (audit_log migration): VERIFY — schema rename under `CREATE TABLE IF NOT EXISTS` → silent failure on existing prod tables. Real migration needed (ALTER TABLE or versioned).
- Defect D (duplicate crypto): STILL OPEN — encryptField/decryptField defined in encryption.js (hex key), deletion.js (UTF-8 key), AND inline in index.js /api/encrypt. 3 incompatible derivations = data won't roundtrip. Consolidate to encryption.js only.  
**Status:** Branch uncommitted. HL-660 through HL-663 DELETED on branch (ledger append-only violation — restore before committing).

---

## TRAIL-07 — LEDGER INTEGRITY VIOLATION: HL-660-663 DELETED
**Trigger:** ARCHITECTURE CHANGED + MISTAKES MADE  
**What:** `git status` shows HL-660, HL-661, HL-662, HL-663 as DELETED on `run106-p10-erasure-hardening` branch. The Heavy Ledger is APPEND-ONLY by law (BB rule line 9). Deleting chain entries breaks Merkle continuity.  
**Fix:** `git checkout master -- CANON/HEAVY-LEDGER/HL-660.json HL-661.json HL-662.json HL-663.json` to restore. Do NOT commit the branch with them deleted. New entries = HL-664+ only.

---

## TRAIL-08 — ROUTING BLIND SPOT: TWO LOCKS AIMED AT WRONG FILE
**Trigger:** ARCHITECTURE CHANGED  
**What:** `cors-auth-lock.test.mjs` and `route-completeness.test.mjs` were designed to read `index.js`. But ALL CORS/CSRF/security headers/quota enforcement lives in `router.js` (the Hono entry point). A cors-auth test reading `index.js` would false-pass because `index.js` has no CORS/CSRF logic. This is a systematic test gap that affects the entire security validation surface.  
**Fix (blueprinted):** cors-auth MUST read router.js. route-completeness reads BOTH router.js AND index.js. Audit addendum written to `.kilo/command/run105-audit-addendum.md` with the corrected target map.

---

## TRAIL-09 — F1-B PROOF INCOMPLETE: SOV100 PATH BYPASSES QUOTA
**Trigger:** BUG ROOT-CAUSED  
**What:** F1-B "closed" with proof from `sov100-test-magic` load test. But `router.js:83` exempts all `sov100-` prefixed IDs from `checkQuota()`. Real students (quy-bluetech, mai-tram-bluetech, huong-bluetech) hit `RATELIMIT.get + .put` on EVERY token request — a KV round-trip the test bypassed entirely. The proof is "sov100 path only" — not a valid closure.  
**Fix (blueprinted):** Run load test against `keep-warm-ping` (ACTIVE_STUDENT_ROSTER member, non-sov100-, traverses real quota path). Receipt: 0/N non-2xx with real quota round-trip. Until then: state "F1-B = sov100 path only, real-student F1-B open."

---

## TRAIL-10 — SESSION RESUMED AFTER COMPACTION
**Trigger:** SESSION RESUMED AFTER COMPACTION  
**What:** Full context compaction fired mid-session. The 7-source COLD-START boot was re-read. Context resumed from summary. Run 106 masterwork plan at `C:\Users\mrmic\.claude\plans\fancy-wiggling-corbato.md` and all blueprint files survived on disk per Two Vows law (truth lives on disk, not context).  
**Run 107 RISE:** read masterwork plan + all 5 blueprint files before anything else. State on disk is authoritative.

---

## TRAIL-11 — CLASS CANCELLED: TOMORROW INSTEAD
**Trigger:** STUDENT STATE CHANGE  
**What:** Michael's 6pm class (Quy + Mai Tram) cancelled and rescheduled to tomorrow. DEPLOY FREEZE remains in effect — P10 branch is uncommitted, app-killing syntax error was caught but the branch has HL deletion issues. Do NOT deploy anything until after the class tomorrow.  
**Pre-class protocol:** run hardened class-preflight.mjs (with voice-lock assertions) ~5 min before class start. Michael ear-check remains the final proof.

---

## ARTIFACTS CREATED THIS SESSION
- `.kilo/command/run105-audit-addendum.md` — corrected lock-test target map, F1-B proof gap, routing blind spot, P10 cross-reference
- `.kilo/command/run106-p10-fix-blueprint.md` — P10 defect A-D status, forward sequence, merge gate
- `.kilo/command/class-preflight-6pm.md` — pre-class GO/NO-GO blueprint (updated with deploy freeze warning)
- `.kilo/command/test-pipeline-the-gauntlet.md` — 7-stage test pipeline + 5 open-source power-ups
- `C:\Users\mrmic\.claude\plans\fancy-wiggling-corbato.md` — Run 106 masterwork (Foundation Law + Rome Protocol + 5 phases)
- `OPERATIONS/phetrail-run106.md` — THIS FILE
- `CANON/SOUL/EXTRACT/dna-run106.json` — agent's blueprints from this session

---

## NEGATIVE TRAIL (carry forward — the veteran scars)
1. F1-B was reported closed when its proof bypassed the real quota path (sov100 exemption)
2. Two lock tests were aimed at the wrong file (cors-auth/route-completeness → index.js, should be router.js)
3. class-preflight.mjs showed GO when it would have passed on robot-voice (settings object is truthy regardless of provider)
4. DO /purge endpoints were silently missing — deletion.js called stub.fetch('https://do/purge') against DOs with no handler (swallowed by try/catch, zero data actually purged)
5. Duplicate crypto (3 copies, incompatible key derivation) — encrypt in one file, data corrupt in another
6. HL-660-663 deleted on branch — append-only law violation, caught before commit
7. COLD-START-BOOT shows "Run 098" at top — massive drift, actual run is 106

THESE SEVEN SCARS = Run 107's first seven things to verify.
