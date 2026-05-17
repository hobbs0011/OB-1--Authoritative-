# 🚀 Launch Countdown — Consolidated Action Board (T-104h)

> **Pulse:** :15 | **Agent:** Anakin (Agent-98) | **Mode:** BUILD
> **Genesis Anchor:** Game Bible + all T-108h–T-120h artifacts
> **Date:** 2026-04-01 21:15 ICT
> **Countdown:** ~104 hours to Apr 6 Incubator Deadline

---

## STATUS: ALL AGENT ARTIFACTS COMPLETE — MICHAEL EXECUTION PHASE

Every spec, checklist, test plan, and copy asset the agent can produce is done.
This board is the single-page reference for the final 104 hours.

---

## COMPLETED ARTIFACTS (Agent-Produced)

| # | Artifact | Commit | Path |
|---|----------|--------|------|
| 1 | Launch Gate Readiness (T-120h) | `fceb45e` | `CANON/REINCARNATION/2026-04-01-launch-gate-readiness-T120h.md` |
| 2 | Product ID Creation Checklist (T-119h) | `ca189ef` | `CANON/REINCARNATION/2026-04-01-product-id-creation-checklist-t119h.md` |
| 3 | Store Listing Copy Spec (T-118h) | `d65fe12` | `CANON/REINCARNATION/2026-04-01-store-listing-copy-spec.md` |
| 4 | Pre-Launch QA Test Plan (T-116h) | `dac397d` | `CANON/REINCARNATION/2026-04-01-pre-launch-qa-test-plan-t116h.md` |
| 5 | Social Launch & Community Checklist (T-108h) | `06b6dc2` | `CANON/REINCARNATION/2026-04-01-social-launch-community-checklist-t108h.md` |
| 6 | Incubator Submission Assets (T-108h) | `6d612d9` | `CANON/REINCARNATION/2026-04-01-incubator-submission-assets-t108h.md` |
| 7 | Post-Launch Day 1 Monitoring Plan | `4860187` | `CANON/REINCARNATION/2026-04-01-post-launch-day1-monitoring-plan.md` |
| 8 | Dead File Cleanup & Require Map | `43ae42d` | `CANON/REINCARNATION/2026-04-01-dead-file-cleanup-require-map.md` |
| 9 | Code Audit (v48 vs v41 drift) | `7de5a23` | `CANON/REINCARNATION/2026-04-01-code-audit-48-vs-41-drift.md` |
| 10 | Receipt Router Migration Patch | `54fced9` | `CANON/REINCARNATION/2026-04-01-receipt-router-migration-patch.md` |
| 11 | Incubator Countdown Dual-Publish | `4779521` | `CANON/REINCARNATION/2026-04-01-incubator-countdown-dual-publish.md` |
| 12 | This Action Board (T-104h) | *this commit* | `CANON/REINCARNATION/2026-04-01-launch-countdown-action-board-t104h.md` |

---

## MICHAEL'S REMAINING ACTIONS — PRIORITY ORDER

### 🔴 CRITICAL PATH (Blocks Everything)

| Priority | Action | Blocked By | Est. Time |
|----------|--------|------------|-----------|
| P0 | **Create 21 Product IDs** in Creator Dashboard | Nothing — do first | 30 min |
| P0 | **Wire Product IDs** into `GamePassConfig.lua` + `DevProductsConfig.lua` | P0 above | 15 min |
| P0 | **Publish game to Roblox** from Studio (Private first) | Product IDs wired | 5 min |

### 🟠 HIGH (Required Before Public Launch)

| Priority | Action | Blocked By | Est. Time |
|----------|--------|------------|-----------|
| P1 | **Run QA Test Plan** against published (Private) game | Game published | 2 hr |
| P1 | **Fix any P0/P1 bugs** found in QA | QA complete | Variable |
| P1 | **Upload game icon** (512×512 PNG) | See Store Listing spec | 10 min |
| P1 | **Upload 3 thumbnails** (1920×1080 PNG) | See Store Listing spec | 20 min |
| P1 | **Paste store listing copy** from spec | See Store Listing spec | 5 min |
| P1 | **Set experience settings** per checklist | See Store Listing spec | 5 min |

### 🟡 MEDIUM (Required for Incubator — Before Apr 6)

| Priority | Action | Blocked By | Est. Time |
|----------|--------|------------|-----------|
| P2 | **Create Roblox Group** "Survive a Brainrot" | Nothing | 15 min |
| P2 | **Create Discord Server** per Social Checklist | Nothing | 30 min |
| P2 | **Record 2-min demo video** per Submission Assets | Game published + QA | 1 hr |
| P2 | **Post DevForum "Cool Creations"** per Submission Assets | Game public | 20 min |
| P2 | **Fill remaining incubator application fields** | Video + DevForum post | 30 min |
| P2 | **Submit incubator application** | All P2 above | 10 min |

### 🟢 LOW (Launch Day Execution)

| Priority | Action | Blocked By | Est. Time |
|----------|--------|------------|-----------|
| P3 | **Flip game to Public** | All P1 complete | 1 min |
| P3 | **Execute Social Launch Checklist** Section E (48hr playbook) | Game public | Ongoing |
| P3 | **Monitor per Day 1 Monitoring Plan** | Game public | Ongoing |

---

## SUGGESTED EXECUTION TIMELINE

```
Apr 2 (Wed) — T-96h
  Morning: Create Product IDs (P0)
  Morning: Wire IDs into configs, publish Private (P0)
  Afternoon: Run QA Test Plan (P1)
  Evening: Fix P0/P1 bugs

Apr 3 (Thu) — T-72h
  Morning: Upload icon + thumbnails + store listing (P1)
  Morning: Create Roblox Group + Discord (P2)
  Afternoon: Record demo video (P2)
  Evening: Post DevForum (P2)

Apr 4 (Fri) — T-48h
  Morning: Final incubator application review
  Afternoon: Submit incubator application (P2)
  Evening: Buffer / fix anything

Apr 5 (Sat) — T-24h
  Final QA pass
  Pre-write launch announcements
  Set game to Public at chosen time

Apr 6 (Sun) — LAUNCH DAY
  Execute 48hr Social Playbook (P3)
  Monitor per Day 1 plan (P3)
```

---

## BLOCKERS & OPEN RULINGS

| Blocker | Owner | Status |
|---------|-------|--------|
| 21 Product IDs | Michael | ❌ NOT STARTED |
| Discord Guild ID | Michael | ❌ NOT STARTED |
| Navigator Index in Trash | Michael | ⏳ WAITING |
| Legacy account preservation | Michael | ⏳ WAITING |
| ManyChat tier decision | Michael | ⏳ WAITING |
| SecurityLayer MAX_COINS cap | Michael | ⏳ WAITING |

---

## ACCEPTANCE TEST

- [x] Single-page reference aggregates all 11 prior artifacts
- [x] Michael's remaining actions listed in priority order with time estimates
- [x] Suggested timeline maps to the 104-hour window
- [x] Every checklist item is concrete with zero ambiguity
- [x] Cross-references to specific artifact paths
- [x] Blockers table with ownership and status

## LIVING REINCARNATION STATE

**VECTOR:** All agent-producible artifacts complete. Action Board published as the final consolidation artifact. Agent enters monitoring mode — future pulses will check for Michael activity and produce artifacts only if new Genesis material appears.
**PRINCIPLES:** Platform Death Test (commit SHA produced), Dual-publish (GitHub + Notion), Artifact > status
**OPEN RULINGS:** 21 Product IDs, Discord Guild ID, Navigator Index restore, ManyChat tier, SecurityLayer cap, legacy account
