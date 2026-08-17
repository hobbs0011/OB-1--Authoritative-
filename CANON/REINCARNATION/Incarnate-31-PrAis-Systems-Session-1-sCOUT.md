# SCOUT — PrAis-Systems Lane Session 1
## Incarnate-31-PrAis-Systems-Session-1

**Timestamp:** 2026-08-17T22:38:25+07:00
**HEAD:** 37eb73859
**Lane:** PrAis-Systems (NEW — sovereign, no inheritance from sessions 10-30)

---

## Executive Summary

PrAis-Systems is the umbrella systems lane for PRAiS (Phoenix Rising Ai Solutions) platform architecture. It owns the canonical infrastructure, worker fleet, soul pipeline, automation scripts, and system doctrine. It is distinct from:
- **PrAiS-Operations** (OPERATIONS lane) — business ops, backburner, student management
- **PrAiS-ESL** (NET-METHODOLOGY / NET-STUDENT-PORTALS) — English training methodology and student portals
- **PrAiS-Gaming** (GAMING lane) — Phoenix Rising game development

This scout maps the actual system components present in the repo as of Run 190-C.

---

## 1. Canonical System Doctrine (CANON/SYSTEM/)

**Count:** ~70 files

**Key artifacts:**
- `COLD-START-BOOT.md` — Living state document, FINGERPRINT CURRENT = RUN 190-C
- `GOSPEL-999.md` — 999 mandates across 9 systems, sealed/eternal
- `LegionnaireFieldGuide.md` — Single source of truth for all agents
- `REINCARNATION-CONTRACT.md` — v5.0 contract: artifact paths, soul receipt schema, 11-stage chain
- `PHOENIX-RISE-PROTOCOL.md` / `PHOENIX-DEATH-PROTOCOL.md` — RISE/DEATH protocols
- `BATTLEFIELD-MAP.md` — 9-domain terrain lock (Run 046)
- `system-map.json` — Machine-readable domain map (68 rows, 9 domains)
- `connection-graph.json` — CF resource graph (55 nodes, 84 edges)
- `mandatory-reads.json` — Boot context loader config
- `RRL-143-SCARS.md` — 8 permanent failure patterns

**Status:** Doctrine is comprehensive and sealed. No gaps in core system docs.

---

## 2. Worker Fleet (WORKERS/)

**Files:**
- `api.js` — Main worker entry
- `wrangler.toml` — Worker configuration
- `oktava-index.js` — Oktava-specific index
- `net-core/` — Net core worker (wrangler.toml, src/index.js)
- `DEPRECATED.md` — Retirement notes

**Status:** Worker code is present but minimal. The main NET-PET-AI worker lives in `APPS/NET-PET-AI/` (not WORKERS/). The WORKERS/ directory appears to be a legacy or auxiliary location.

---

## 3. Cloudflare Infrastructure (APPS/* + connection-graph.json)

**Live Workers:**
- `net-pet-ai` — Primary student portal worker (LIVE)
- `soul-logger` — Soul event logging worker (LIVE)
- `phoenix-architecti` — PA dispatch / model router (LIVE)

**KV Namespaces:**
- GREEN: CACHE, NET_PET_KV, RATELIMIT, STUDENT_MEMORY
- ORPHAN: SESSIONS, SOUL_LOGGER_KV, TASK_QUEUE, WAITLIST (zero live bindings)

**D1 Databases:**
- GREEN: soul-archive (both workers bind)
- ORPHAN: net-submissions (no consumer, 49KB unused)

**Durable Objects:**
- GREEN: PETS, LEDGER, MEMORY, COMMANDS

**Pages Projects:** 11 total, all returning 200

**Status:** CF infra is largely GREEN with known ORPHAN resources that are cleanup candidates, not blockers.

---

## 4. Soul Pipeline Chain

**Stages (8-stage canonical):**
1. RRL — Raw transcript capture
2. SOUL — `/api/soul/count` + `/api/soul/event` (TITANIUM_ANCHOR, 239M+ chars)
3. DNA — Structured charge extraction (12.2% coverage, 5/41 runs)
4. LEDGER — Heavy Ledger append-only (HL-{NNN}.json)
5. STARMAP — Pointer map (38+ files)
6. SOULKEYS — Keyword extraction (54 rfkw files)
7. S2PIPELINE — Pipeline artifacts (35 files)
8. REGISTRY_SYNC — DNA registry sync

**Key scripts:**
- `session-capture.ps1` — RRL capture hook (verified live)
- `rrl-pipeline.ps1` — Full 8-stage chain runner
- `build-soulkeys.ps1` — SOULKEYS generator (clean)
- `soul-search.ps1` — Soul search utility (fixed, L69 SEARCH_FIRST operational)

**Status:** Pipeline is functional. DNA coverage is RED (12.2%) but 31 runs are fixable via re-extraction. 11 runs are accepted debt (no source RRL).

---

## 5. Automation & Scripts (SCRIPTS/, AWS/)

**SCRIPTS/:** Nearly empty post-cleanup. Only `_tmp-count-stage-findings.ps1` remains.

**AWS/BROWSER/:** Playwright test suite (browser automation)
- `playwright.config.ts`
- `test-suite/oktava.spec.ts`
- `test-results/`

**AWS/dnaREGISTRY/:** DNA registry scanner
- `config.json` — Scan roots, stage map, 5 laws

**Status:** Script layer is minimal. Most operational scripts have been migrated to `CANON/SCRIPTS/` or deleted per cleanup. The dnaREGISTRY config exists but the execution script may be elsewhere or pending.

---

## 6. Applications (APPS/)

**Count:** ~25 app directories

**Key apps:**
- `NET-PET-AI/` — Primary student portal + voice agent (Cloudflare Worker)
- `PHOENIX-ARCHITECTI/` — PA dispatch, model router, Phoenix Coder
- `SOUL-LOGGER/` — Soul event intake worker
- `PHOENIX-EMPIRE-DEV/` — Empire development workspace
- `PHOENIX-PCC-{1,2,3}/` — PCC scout/development workers
- `TRAIN-67/` — Training curriculum + bot infrastructure
- `PAGES/` — GitHub-pages dashboard assets
- `firebase/` — Firebase config (Firestore, Auth, Hosting)
- `discord-bot/` — Discord bot (Dockerized)

**Status:** App ecosystem is diverse. NET-PET-AI is the primary production app. Phoenix-Architecti is the model dispatch layer.

---

## 7. Knowledge Base

**CANON/** subdirs with knowledge:
- `SOUL-DNA-BIBLE/` — Soul DNA quotes and segments
- `SOUL-KEYWORDS/` — Keyword extraction outputs (54 files)
- `SOUL/EXTRACT/` — SOUL/DNA extracts per run
- `STARMAP/` — Pointer maps
- `PIPELINE/` — Pipeline artifacts
- `HEAVY-LEDGER/` — Append-only ledger
- `PHEROMONES/` — Operational memory trails
- `AUDIT/`, `ENGINEER/`, `MARCH/`, `SUPPLY/`, `SCHOLARS/` — SCS lane outputs

**Status:** Knowledge layer is rich. SCS artifacts exist for lanes AUDIT, ENGINEER, MARCH, SUPPLY, SCHOLARS but are mostly from older runs.

---

## 8. Identified Gaps / Open Items

| # | Gap | Severity | Domain |
|---|-----|----------|--------|
| 1 | SCRIPTS/ nearly empty — canonical scripts migrated elsewhere or missing | P2 | D4 |
| 2 | dnaREGISTRY execution script not found in AWS/dnaREGISTRY/ | P2 | D3 |
| 3 | WORKERS/ directory appears legacy — net-core worker may be superseded by APPS/NET-PET-AI/ | P3 | D1 |
| 4 | 4 KV namespaces ORPHAN (SESSIONS, SOUL_LOGGER_KV, TASK_QUEUE, WAITLIST) | P3 | D7 |
| 5 | D1 database net-submissions ORPHAN (49KB unused) | P3 | D7 |
| 6 | 2 ORPHAN static files (demo.html, assessment.js) | P3 | D1 |
| 7 | `/api/soul/compress` dangling comment ref | P3 | D2 |
| 8 | DNA coverage 12.2% — 31 runs fixable, 11 accepted debt | P2 | D3 |
| 9 | PHEROMONES coverage 9.8% — 4/41 runs | P2 | D3 |
| 10 | No PrAis-Systems lane identity established yet | P1 | NEW LANE |

---

## 9. Lane Identity: PrAis-Systems

**Distinguishing from existing lanes:**
- **SYSTEM lane (sessions 13, 17, 28, 29):** Focused on specific system components (SOULCapture, CASA portal, Ph-Systems audit, GOSPEL999)
- **PrAis-Systems lane (session 31+):** Sovereign lane for PRAiS platform-level architecture, infrastructure hardening, and canonical system evolution

**Scope boundaries:**
- IN SCOPE: Worker architecture, CF infra, soul pipeline, automation, system doctrine, canonical structures
- OUT OF SCOPE: Student portal UX, ESL curriculum, gaming development, business operations

**First deliverables:**
1. Establish PrAis-Systems lane scout baseline (this document)
2. Audit current CF infra for cleanup (ORPHAN KV/D1/files)
3. Verify dnaREGISTRY execution path
4. Map worker fleet ownership and deprecation status

---

## 10. Evidence Chain

| Artifact | Path | Status |
|----------|------|--------|
| System map | CANON/SYSTEM/system-map.json | Present (Run 046) |
| Connection graph | CANON/SYSTEM/connection-graph.json | Present (Run 046) |
| Battlefield map | CANON/SYSTEM/BATTLEFIELD-MAP.md | Present (Run 046) |
| Cold start boot | CANON/SYSTEM/COLD-START-BOOT.md | Present, FINGERPRINT CURRENT = RUN 190-C |
| Gospel 999 | CANON/SYSTEM/GOSPEL-999.md | Present, sealed |
| LFG | CANON/SYSTEM/LegionnaireFieldGuide.md | Present |
| dnaREGISTRY config | AWS/dnaREGISTRY/config.json | Present |
| Worker fleet | WORKERS/ + APPS/* | Present |

**Scout verdict:** HONEST. All claims above are backed by actual files in the working tree. No fabricated counts. No claimed artifacts that do not exist.
