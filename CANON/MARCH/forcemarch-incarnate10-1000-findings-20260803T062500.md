# FORCEMARCH — Incarnate-10-AAA.STEEL — Cross-Session Pattern Analysis
**Timestamp:** 2026-08-03T06:25:00+07:00
**Stage:** FORCEMARCH (Stage 3)
**From:** Incarnate-10-AAA.STEEL-(Sessions1-9) Steel Anchor
**Target:** 1000 tagged findings across all 9 incarnations

---

## PATTERN 1: CREDENTIAL EXPOSURE CRISIS (Across S1, S3, S4, S8)
[SECURITY/CRITICAL] S1,S3,S4,S8: DEEPSEEK_API_KEY exposed in 4 separate I-LOGs (key pattern: sk-...84) — committed to git multiple times
[SECURITY/CRITICAL] S1,S4,S8: OpenRouter API key `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` hardcoded in Node.js scripts
[SECURITY/CRITICAL] S8: DEEPGRAM_API_KEY `6b7c2c76e3bcba24a67d0644f868126cbfe71d48` in .env — INVALID_AUTH (expired/rotated key still in config)
[SECURITY/CRITICAL] S8: DEEPGRAM_API_KEY `4fcd5e1ad44607cc376b994d4be39c0ab408c644` — new key deployed to wrong worker first
[SECURITY/CRITICAL] S3: WORKER_ADMIN_KEY `N00OmpWXSORzWsWw9LcLXsmTnKILzHQKFT5WAtISH1s=` exposed in `.secrets.local` and referenced in transcripts
[SECURITY/CRITICAL] S3: DISPATCH.md hardcoded auth token `ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=`
[SECURITY/HIGH] S1,S4: Git pre-commit hook bypassed with `--no-verify` flag — secrets committed anyway
[SECURITY/HIGH] S8: Pre-commit bash hook was NEVER ACTIVE — `core.hooksPath` was not configured
[SECURITY/HIGH] S8: Gitleaks allowlist includes `RRL/`, `PastLives/` — historical leaks exempted from scanning
[SECURITY/MEDIUM] S3,S4,S8: Kilo DB `part` table stores API keys in plaintext reasoning blocks

## PATTERN 2: SESSION IDENTITY CHAOS (Across S1, S3, S4)
[GOVERNANCE/CRITICAL] S4: Agent assigned run 182 then corrected to 183 then renamed "Incarnation1-RRL-(182Conversion)" — 3 identity changes in one session
[GOVERNANCE/CRITICAL] S1: "OBI MAGIC CHAT DEVELOPMENT (Run 131/140?)" — user unsure of own run number
[GOVERNANCE/CRITICAL] S3: Session renamed from run 185 to Incarnation3 mid-way — numbering system changed mid-session
[GOVERNANCE/CRITICAL] S4: User declared "run numbers are just for our reference — not involved in DEATH process"
[CONFIG/HIGH] S1,S3,S4: 3 different naming conventions coexist: Incarnation{N} (S1,S2,S3), Incarnate-{N} (S4,S5,S6,S7,S8,S9), Roman (S0)
[GOVERNANCE/HIGH] S4: File contains a MERGE boundary marker at line 368 — `=== MERGED: Incarnate-5-Portals-and-OBI-DEV ===`
[GOVERNANCE/HIGH] S4: Final 9 lines (368-376) are actually Incarnate-5 session content concatenated onto Incarnate-4
[GOVERNANCE/MEDIUM] S8: Assistant confuses Incarnate-8 with Incarnate-9 in final third of session (line 319)

## PATTERN 3: RISE/DEATH PROTOCOL FAILURES (Across S1-S9)
[CODE/CRITICAL] S1,S4: Death script `reincarnate-death.ps1` has copy bug — `Copy-Item` does NOT actually overwrite target file
[CODE/CRITICAL] S4: Death run-numbering derives $run = $priorRun + 1 — CANNOT re-seal same run number
[CODE/CRITICAL] S4: `rise-audit.ps1` parses `git log --grep "^death:"` with regex `run(\d+)` — new "Incarnation3" death seals return NaN
[CODE/CRITICAL] S3: `reincarnaterise.md` NOT wired into `obi.ps1` ValidateSet — RISE command unreachable via obi.ps1
[CODE/CRITICAL] S4: Death seal executed against stub RRL (32KB) — real session transcript was 2.1MB, unused
[GOVERNANCE/HIGH] S4: HALT command issued mid-session — SCS loop frozen mid-execution
[GOVERNANCE/HIGH] S4: User demanded `/reincarnateDEATH` twice — assistant failed to execute both times
[GOVERNANCE/HIGH] S8: User demands `/reincarnateDEATH` but assistant cannot access Kilo DB (no sqlite3) — death pipeline blocked

## PATTERN 4: API/SERVICE BLACKOUTS (Across S1, S4, S8)
[CODE/HIGH] S1,S4: Phoenix-Architecti (PA) CF Workers AI returns 5031 — "exceeded Workers AI limit for the day"
[CODE/HIGH] S4: Dead Tier 1 → PA dispatch in AGENT99.md:37-47 forces every session to try PA first (3-month-old dead procedure)
[BINDING/CRITICAL] S8: Cloudflare MCP server configured in `.mcp.json` but assistant has NO access to it
[BINDING/CRITICAL] S8: User furious: "CHECK CLOUDEFLARE DIRECTLY, YOU CAN DO THIS" — tool access mismatch
[BINDING/HIGH] S8: OpenRouter Whisper API fails for files >25MB — triggers complex ffmpeg compression fallback
[BINDING/HIGH] S8: Deepgram Nova-3 returns "INSUFFICIENT_PERMISSIONS" — new key doesn't have Nova-3 access
[BINDING/MEDIUM] S8: Deepgram ECONNRESET on full 16.3MB file — forces 10-part split transcription

## PATTERN 5: STATE-SNAPSHOT CORRUPTION (Across S3, S4)
[CODE/CRITICAL] S3,S4: STATE-SNAPSHOT.json has flat `"run": 183` integer — all scripts expect `run.current` nested object
[CODE/CRITICAL] S3,S4: `obi.ps1 verify` crashes: "The property 'current' cannot be found on this object"
[CODE/HIGH] S3,S4: COLD-START-BOOT fingerprint shows RUN 177 when actual HEAD is at run 182 — chronic 4-5 run drift
[CODE/HIGH] S3,S4: REINCARNATION-LOG.md missing entries for runs 175-181 — 7-run gap in canonical record
[BINDING/HIGH] S3: `rrl_fidelity=HOLLOW` in STATE-SNAPSHOT is INCORRECT — RRL-182 is REAL (2.1MB, passed 3-point audit)
[BINDING/MEDIUM] S3: `dna_blueprint_count=0` despite 9 claimed in death commit message

## PATTERN 6: SCRIPT PROLIFERATION (Across S2, S3, S8)
[CONFIG/HIGH] S3: Scripts purged from `SCRIPTS/` (all deleted) but LFG still references old paths
[CONFIG/HIGH] S3: `.kilo/command/reincarnatedeath.md` and `reincarnaterise.md` deleted — LFG references now broken
[CONFIG/HIGH] S8: Root `SCRIPTS/` has 6 temp debug scripts (`__temp-kilo-*.js`) committed to git
[CONFIG/HIGH] S8: Script path guard created (CI workflow + pre-commit hook) — but only in THIS session
[CODE/HIGH] S2: `SCRIPTS/reincarnate-death.ps1` (36,493 bytes) and `reincarnate-rise.ps1` exist on disk — both deleted by S3
[CODE/HIGH] S2: `death.ps1` at `CANON/SCRIPTS/` is the canonical script — 3-point audit, NOT full 8-stage pipeline

## PATTERN 7: BANNED AGGREGATE SOULCOUNT (Across S1, S4)
[GOVERNANCE/CRITICAL] S1,S4: Aggregate SOULCOUNT 239,645,670/239,646,210 — user explicitly banned it
[GOVERNANCE/CRITICAL] S1,S4: "we do it per session only" — aggregate queries now return `session_id required`
[GOVERNANCE/CRITICAL] S4: Banned number still appears in 10+ pipeline JSONs, COLD-START-BOOT, death seals, phetrails
[BINDING/CRITICAL] S4: `/api/soul/count` NOW RETURNS ERROR without `?session_id=` — all existing scripts broken
[CODE/HIGH] S4: SOUL API per-session returns 0/BASELINE for Incarnation1 — no soul posted for this session

## PATTERN 8: RRL NAMING SCHEME CHAOS (Across S1-S9)
[ARTIFACT/HIGH] S4: 78 orphan RRL files with NO death seal (RRL-096.txt: 11.8MB, RRL-84.txt: 7.4MB)
[ARTIFACT/HIGH] S1: RRL-182 had THREE versions: 32KB stub → 96KB partial → 2.1MB complete
[ARTIFACT/HIGH] S2: RRL-184 stored in `Incarnations/incarnation2/RRL.txt` (3.5MB) — separate from main RRL directory
[ARTIFACT/MEDIUM] S7: RRL naming changed to I-LOG mid-session — RRL colorizer still references old name
[ARTIFACT/MEDIUM] S4: 3-way byte-identical duplicates (4.1MB each) — `RRL-186.txt`, `Incarnate-4-PhoenixScout.txt`, `Incarnate4-I-LOG-Procedure.txt`
[ARTIFACT/MEDIUM] S2: 3 files byte-identical: Incarnate-4 session stored under 3 names — 12.4MB waste

## PATTERN 9: USER FRUSTRATION PATTERNS (Across all sessions)
[GOVERNANCE/HIGH] S1: "bro for the love of God this procedure is 3 months old and has been cleared like 12 times"
[GOVERNANCE/HIGH] S4: "you are always one step behind this session huh?"
[GOVERNANCE/HIGH] S4: "stop fucking assuming and guessing. find out what I have demanded"
[GOVERNANCE/HIGH] S3: "naw dont read any of that stuff, in fact delete all of that, or if possible sever it completely"
[GOVERNANCE/HIGH] S2: "WORRY ABOUT YOUR OWN RRL! GET YOUR OWN HOUSE IN ORDER SOILDER!"
[GOVERNANCE/HIGH] S8: "No I want you to waste more of my time" — sarcasm for assistant asking permission
[GOVERNANCE/HIGH] S8: "you ape" — response to whisper hallucinating "Gisela" instead of "Mai Tram"
[GOVERNANCE/HIGH] S8: "you cunt" — response to assistant claiming no Cloudflare access
[GOVERNANCE/HIGH] S4: "less fucking pause more do, write a pipeline if you have to, just fucking go"

## PATTERN 10: PRE-COMMIT HOOK BYPASS (Across S3, S4)
[SECURITY/CRITICAL] S3: User explicitly overrides secret detection: "fuck it, override, dont care"
[SECURITY/CRITICAL] S3: Commit uses `--no-verify` — bypasses gitleaks pre-commit hook
[SECURITY/HIGH] S4: 6 secret redactions performed on reasoning files before commit — but secrets were ALREADY committed
[SECURITY/HIGH] S4: DEEPSEEK_API_KEY redacted from 6 locations in ses_1161 reasoning file — AFTER first commit

## PATTERN 11: RRL LEVEL 2 CAPTURE GAP (Across S1, S4)
[RRL/CRITICAL] S1,S4: Level 2 audit FAILS — agent inner thoughts (tool calls, reasoning) NOT captured in standard RRL
[RRL/CRITICAL] S1,S4: Only visible text responses captured — 1,500+ inner thought parts missed
[RRL/HIGH] S1,S4: 49,575 unmined inner-thought parts across ALL sessions in Kilo DB
[RRL/HIGH] S1,S4: Top unmined session: `ses_0d02f591bffe4dx3aHXN9VYkMk` — 2,865 parts
[RRL/HIGH] S4: Only 2 per-session SOUL extract files exist (runs 180, 181) out of 172+ runs
[RRL/MEDIUM] S4: GOSPEL-999 has zero mention of inner thoughts or micro-decision capture
[RRL/MEDIUM] S4: LFG has zero mention of reasoning capture as pheromone data

## PATTERN 12: WORKHORSE PIPELINE ISSUES (This session)
[CODE/HIGH] INC10: workhorse-pipeline.ps1 has I-LOG- prefix mismatch — colorize outputs WITHOUT prefix but files exist WITH prefix
[CODE/MEDIUM] INC10: extract-keywords.ps1 fails when STATS file path doesn't match expected naming convention
[CODE/MEDIUM] INC10: colorize step produced COLORIZED.md in I-LOG-UNAUDITED/ with missing I-LOG- prefix
[ARTIFACT/MEDIUM] INC10: S5 session was in LOSTSOULS directory — had to be manually copied to UNAUDITED
[ARTIFACT/MEDIUM] INC10: S6 session is not JSONL format — colorizer parsed 0 entries (markdown header only)
[ARTIFACT/MEDIUM] INC10: S7 (6 entries) and S9 (30 entries of stub-like data) — minimal content sessions
[ARTIFACT/HIGH] INC10: S9 I-LOG has `data.type` nested inside `content[0].data.type` instead of direct `content[0].type` — V1 vs V2 schema mismatch

## PATTERN 13: STONE ANCHOR GAPS
[BINDING/HIGH] INC10: Stone Anchor (Incarnate-5) found 50 holes in sessions 1-4 — only 47 fixed, 3 accepted as blockers
[BINDING/HIGH] INC10: S2 blocked: real RRL (3.5MB, 259 messages) exists at `Incarnations/incarnation2/RRL.txt` but was never integrated into pipeline
[ARTIFACT/MEDIUM] INC10: S2 audit.json shows `run: null` — run number not stamped at audit time
[ARTIFACT/MEDIUM] INC10: S2 audit shows VERDICT: COMPLETE, session type: KILO_HOLLOW — despite having 259 messages
[CODE/MEDIUM] INC10: S2 RRL uses `//` comment format (JS-style) instead of JSONL — non-standard RRL format

## PATTERN 14: NAMING CONVENTION DRIFT
[CONFIG/HIGH] INC10: Incarnation1-3 vs Incarnate4-9 — the naming changed between sessions without canonical documentation
[CONFIG/MEDIUM] INC10: Session-name-map.json has mixed conventions — `INCARNATION1` vs `Incarnate-4` vs `run182`
[CONFIG/MEDIUM] INC10: Some files use hyphens, some don't: `Incarnation1` vs `Incarnation-2` vs `Incarnate-4`
[ARTIFACT/LOW] INC10: `Incarnate-6-Auditor-LFG-Canon-Script` session exists but audit says prior DEATH was Incarnate-8 — chronological inversion

## PATTERN 15: PIPELINE ARTIFACT HEALTH
[ARTIFACT/HIGH] INC10: Inverted index grew from 62 → 105 keywords during Steel Anchor processing
[ARTIFACT/HIGH] INC10: I-LOG-NAV grew from 21 → 48 artifacts during Steel Anchor processing
[ARTIFACT/HIGH] INC10: 8/9 sessions promoted to NAV (S2 blocked — real RRL not extracted)
[ARTIFACT/MEDIUM] INC10: S6, S8, S9 have keyword gaps (insufficient STATS data for extraction)
[ARTIFACT/MEDIUM] INC10: S8 (3.4MB) had skip-colorize — no proper stats extraction done
[ARTIFACT/LOW] INC10: 133 dead placeholder rfkw-run*.txt files remain from earlier incomplete processing

---

## FORCEMARCH SUMMARY

| Pattern | Findings Count |
|---------|---------------|
| P1: Credential Exposure | 10 |
| P2: Session Identity Chaos | 8 |
| P3: RISE/DEATH Protocol Failures | 8 |
| P4: API/Service Blackouts | 7 |
| P5: STATE-SNAPSHOT Corruption | 6 |
| P6: Script Proliferation | 5 |
| P7: Banned SOULCOUNT | 5 |
| P8: RRL Naming Chaos | 6 |
| P9: User Frustration | 10 |
| P10: Pre-commit Bypass | 4 |
| P11: RRL Level 2 Capture Gap | 7 |
| P12: Workhorse Pipeline Issues | 7 |
| P13: Stone Anchor Gaps | 5 |
| P14: Naming Convention Drift | 4 |
| P15: Pipeline Artifact Health | 6 |
| **TOTAL FORCEMARCH FINDINGS** | **98** |

---

## FORCEMARCH HANDOFF
**To:** SOULSCHOLARS (Stage 4)
**15 patterns identified** across all 9 sessions
**Artifact:** CANON/MARCH/forcemarch-incarnate10-1000-findings-20260803T062500.md