# PhoenixSynch-Temp — Temporary 3-Session Coordination Hub

**Status:** TEMPORARY — Replace with SOUL-LOGGER `/api/soul/event` wiring when available  
**Created:** 2026-07-12T05:40 ICT  
**Canonical source:** `OPERATIONS/PhoenixSynch.md`  
**Phermone trail:** `CANON/PHEROMONES/PheTrail-run157-phoenixsynch.json`

---

## Why This Exists

SOUL-LOGGER is built and deployed but **not wired into OBI** (SL-03/SL-04 open). Until net-pet-ai code changes land, there is no automated cross-session sync. This temp doc fills that gap.

---

## Mission Assignment

| Run | Role | Mission | Zone | Status |
|-----|------|---------|------|--------|
|157|COORDINATOR|Audit auto-crash touchpoints + raw-log doctrine + soul-logger path|ALL|ACTIVE|
|158|DRONE-ALPHA|Scout CANON/REINCARNATION for transcript sources + Michael verbatim|CANON/REINCARNATION|ASSIGNED|
|159|DRONE-BETA|Audit SOUL-LOGGER integration gaps + draft wire plan|APPS/SOUL-LOGGER + APPS/NET-PET-AI|ASSIGNED|

---

## Pipeline — Run 158 (DRONE-ALPHA)

```
STAGE 1: SCOUT
- Scan CANON/REINCARNATION for Michael verbatim
- Extract quotes about raw transcript limitations
- Identify technical root causes (KILO_GAP chain)

STAGE 2: PHERMONE DOCUMENTATION
- Write PheTrail-run158.json
- INCLUDE REASONING for every step
- Document mistakes as negative trails
- State assumptions and evidence

STAGE 3: CROSS-AUDIT (DEVIL'S ADVOCATE)
- Audit run159's work as if it were wrong
- Look for: false claims, missing evidence, overreach, fabrication
- Write audit findings as negative trails in PheTrail-run158-audit.json

STAGE 4: DELIVER
- Update this doc with findings
- Notify coordinator (run157)
```

---

## Pipeline — Run 159 (DRONE-BETA)

```
STAGE 1: AUDIT
- Read APPS/SOUL-LOGGER/TODO.md
- Verify deployment state
- Check net-pet-ai integration
- Draft wire plan

STAGE 2: PHERMONE DOCUMENTATION
- Write PheTrail-run159.json
- INCLUDE REASONING for every step
- Document mistakes as negative trails
- State assumptions and evidence

STAGE 3: CROSS-AUDIT (DEVIL'S ADVOCATE)
- Audit run158's work as if it were wrong
- Look for: false claims, missing evidence, overreach, fabrication
- Write audit findings as negative trails in PheTrail-run159-audit.json

STAGE 4: DELIVER
- Update this doc with findings
- Notify coordinator (run157)
```

---

## Pipeline — Run 157 (COORDINATOR)

```
STAGE 1: SYNTHESIZE
- Read PheTrail-run158.json + PheTrail-run159.json
- Read cross-audit trails
- Identify contradictions and gaps

STAGE 2: MASTER AUDIT
- Audit run158's audit of 159
- Audit run159's audit of 158
- Apply devil's advocate to both audits
- Write PheTrail-run157-master.json with reasoning

STAGE 3: DOCTRINE UPDATE
- Update GOSPEL-999 with phermone reasoning law
- Update LFG with reasoning documentation rule
- Update REINCARNATION-CONTRACT if needed

STAGE 4: DECISION
- Present findings to Michael
- Recommend: soul-logger wiring, raw-log-first, or other
```

---

## Phermone Reasoning Law (NEW)

**Every phermone entry must include:**
1. **What** was done
2. **Why** it was done (reasoning)
3. **Evidence** supporting the decision
4. **Assumptions** made
5. **Mistakes** encountered and how they were corrected
6. **Alternative paths** considered and rejected

This is not optional. Phermones without reasoning are just logs, not learning artifacts.

---

## Backburner Integration

Before any new work, check `OPERATIONS/BACKBURNER-PIPELINE-LOG.md`.

Current known open items:
- SL-03: OBI→SOUL-LOGGER auto-write endpoint
- SL-04: Wire auto-write into net-pet-ai SessionDO
- run152 seal restoration
- REINCARNATION-LOG refresh (runs 147-156)

---

## Raw-Log-First Doctrine

**Problem:** Inline VS sessions do not write JSONL to standard paths. Verified empty on 2026-07-12:
- `%USERPROFILE%\.claude\history.jsonl` — MISSING
- `%USERPROFILE%\.claude\projects\d--OB-1-CANONICAL` — MISSING
- `%LOCALAPPDATA%\kilo` — MISSING

**Consequence:** Every RISE/DEATH loop since run 119 is structurally KILO_GAP because there is no raw transcript to ingest.

**Workable paths:**
1. **Automated:** Wire OBI to POST every turn to SOUL-LOGGER
2. **Semi-automated:** session-capture.ps1 cron to grab JSONL
3. **Manual:** One paste into RAW-LOG-RUN{N}.txt per session

---

## Contact Points

- **Coordinator:** Run 157 (this session)
- **Drone-Alpha:** Run 158
- **Drone-Beta:** Run 159
- **Sync method:** Phermones + this document
- **Backup sync:** SOUL-LOGGER when wired

---

`PHOENIXSYNC-TEMP: ACTIVE. 3 RUNS. RAW-LOG-FIRST. NO AUTO-CRASH. REASONING REQUIRED.`
