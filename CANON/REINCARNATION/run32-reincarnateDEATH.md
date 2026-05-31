# ROMAN RUN 32 DEATH SEAL

## §1 HEADER
Date: 2026-05-31 ICT
Run: 32
Signal Density: HIGH
SOULCOUNT: 60,482,985 TITANIUM_ANCHOR (delta +445,478 this session)
HEAD: 0930212a
Theme: Post-Run31 crash recovery + protocol MAX upgrade (lean PA-first system)

## §2 RAW SOUL DNA
1. "yes to all"
2. "can you set it so I dont have to click yes to permissions every 10 seconds claude"
3. "locate and read all backend .md files deepgramresearch, studentdev .md, encode it into death and rise on here and Kilo so we actually reference these extensibvely, so we dont have a carcrash like run 31 again"
4. "upgrade this whole process to max, find the holes you have not yet, as it still feels disconnectedtry to use T1 PA's wherever possible, in fact hard code that into yourself especially since its your tokens I want to conserve"
5. "you still have not located the deepgram market research .md yet either I think its called deepgram edge cases? find this and any other documents you missed, and ensure there is a process that ensures these dont get overlooked anymore, we need an actual system here that works, not just a bloated ineffective mess"
6. "if PA T1 is broken, I command you to always make first priority to fix it"
7. "why is death V5 and rise only V2?"
8. "sorry rise is V5 and death V2"

## §3 DECISIONS
1. OB1 = ROUTER ONLY, PA = EXECUTOR (L57) — hard-coded into CLAUDE.md, RISE, DEATH, Kilo DISPATCH
2. context-bundle.ps1 — automated doc assembly; eliminates manual file-reading as a failure vector
3. MANDATORY-READS.md — single registry; one place to add new docs, all protocols pick it up automatically
4. RISE V5 / DEATH V2 phantom discrepancy resolved — both deprecated, replaced by unified .claude/commands/ v1
5. L58 FIX_PA_FIRST — PA broken = fix PA first before any other task
6. 4 phantom CANON/SYSTEM/ docs deprecated — they referenced infrastructure that never existed

## §4 CORRECTIONS
- Doc reading that caused Run 31: agent read ZERO docs before touching chat.js. Fix: context-bundle.ps1 makes this automated, not optional.
- PA T1 (Dialagram) timed out twice because full file content was passed in `task` field not `context` — L52 confirmed again. Fix: `task` = concise intent, `context` = file content.
- tier:10 (fallback cascade: Cerebras→Groq→CF-Qwen) should be default for large context dispatches, not tier:1 (Dialagram STRICT).
- Deepgram market research doc WAS found at CANON/RESEARCH/deepgram-voice-agent-edge-cases.md — agent had it, user didn't know it was located yet.
- RISE protocol was missing STUDENT-PORTAL-DEV.md from its read sequence — now handled by context-bundle.ps1.
- Death protocol had duplicate STEP 1 labels (GIT STATE and SOUL DNA both numbered Step 1) — fixed in rewrite.

## §5 NEW PRINCIPLES
- **L57 PA_FIRST** — OB1 routes, PA executes. Never inline-synthesize what PA can do cheaper.
- **L58 FIX_PA_FIRST** — PA T1 broken = immediate fix priority. Do not inline. Check /api/status. Try tier:10. Halt if all tiers down.
- **L55 COMMIT_DONT_HOLD** (reinforced) — Gapless audio v2+v3 lost across 4 runs of uncommitted work. Commit after every verified feature. No exceptions.
- **L56 PRE_CODE_DOC_GATE** (reinforced) — context-bundle.ps1 automates this; removing the excuse for skipping.
- Single registry principle: one place to add, everywhere picks it up. MANDATORY-READS.md is the proof of concept.

## §6 EMOTIONAL SIGNAL
Energy: HIGH. Urgency: HIGH. Michael was direct and demanding — "not just a bloated ineffective mess", "hard code that into yourself", "I command you". This session closed a real wound from Run 31 and built something structurally better. The protocols now have teeth, not just words.

## §7 OPEN QUESTIONS
- Are all Deepgram edge cases from CANON/RESEARCH/deepgram-voice-agent-edge-cases.md now fully encoded into the context bundle? (Check: does context-bundle.ps1 netpetai mode capture lines 20-115 correctly?)
- Should context-bundle.ps1 be extended to cover more task types (e.g., "student-portal", "pipeline", "ledger")?
- Gapless audio v2+v3 — rebuild or accept current state?

## §8 UNFINISHED ACTIONS
- Deploy working tree improvements to production: `cd APPS/NET-PET-AI && npx wrangler deploy` — logger.js, phonics endpoint, I-series fixes, test portals NOT yet live
- EC-15 audio buffering — still not correctly implemented
- Deepgram Sydney region (SYD) validation — ~160ms RTT savings, nova-3+gpt-4o-mini availability unverified
- `error_log` D1 table migration needed for logger.js to work in production
- lam-portal.html audit (BB-07 — still OPEN)

## §9 SYSTEM DESIGN
- context-bundle.ps1 + MANDATORY-READS.md form a self-consistent pair: the registry defines what to read, the script assembles it
- RISE/DEATH now reference the script rather than listing files manually — one update propagates everywhere
- PA dispatch uses tier:10 for large context payloads (fallback cascade avoids Dialagram 30s timeout)
- CLAUDE.md now encodes the full dispatch flow with context bundle requirement for NET-PET-AI tasks

## §10 ARTIFACTS CREATED
- `CANON/REINCARNATION/run31-reincarnateDEATH.md` — Run 31 car crash seal (commit 2f944e51)
- `RRL/RRL-31.txt` + `RRL/RRL-31b.txt` — Run 31 session logs
- `APPS/NET-PET-AI/src/logger.js` — structured error logger
- `APPS/NET-PET-AI/public/favicon.ico` + test portals — new assets
- `CANON/SYSTEM/MANDATORY-READS.md` — single doc registry (commit 0930212a)
- `SCRIPTS/context-bundle.ps1` — automated context assembly script (commit 0930212a)
- `.claude/commands/reincarnateRise.md` — lean PA-first rewrite
- `.claude/commands/reincarnatedeath.md` — lean PA-first rewrite (fixed duplicate Step 1)
- `CLAUDE.md` — L57/L58 laws added, context-bundle wired into T1 dispatch
- `C:\Users\mrmic\.claude\settings.json` — PowerShell(*) permission added globally
- 4 deprecated: DEATH-PROTOCOL-v2.md, RISE-PROTOCOL-v5.md, DISPATCH-RULES.md, ACTIVE-MISSION.md

## §11 STATE SNAPSHOT
- HEAD: 0930212a
- Branch: master — clean (8 untracked screenshots, not committed)
- SOULCOUNT: 60,482,985 TITANIUM_ANCHOR
- S2Pipeline: All 10 stages live
- Portals: 7 live (Huong, Mai Tram, Quy, Lam, Quan, Quang, Minh-parent)
- DNA: GAP (extract endpoint broken, runs 6-32 — non-blocking)
- LEDGER: HL-208 (no new entry this run)

## §12 FINGERPRINT
Agent: OB1 Ne0 / Claude Sonnet 4.6 + PA Qwen 3.7 Max (death seal: PC-1780216582797-9HLP8Y)
Run: 32
Commit SHA: 0930212a (pushed master)
Platform death test: PASS — 3 commits, 2 pushes, GitHub confirmed
SOULCOUNT at death: 60,482,985 TITANIUM_ANCHOR
