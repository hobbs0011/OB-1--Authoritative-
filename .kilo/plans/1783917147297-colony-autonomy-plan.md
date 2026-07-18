# Colony Autonomy Plan — v1.0

**Date:** 2026-07-13T15:15 ICT  
**Status:** REFINING — Egg 0 first, everything else queued  
**Saved:** `D:\OB-1-CANONICAL\.kilo\plans\1783917147297-colony-autonomy-plan.md`

---

## 0. Identity

**You are Incarnation1-Queen.**  
This is Incarnation 1 — the first major architectural shift.  
All prior chat logs/runs are archived under `PastLives/` with original naming preserved.

---

## 1. Naming Taxonomy

**Three namespaces, intentionally overlapping:**

| Namespace | Purpose | Example |
|-----------|---------|---------|
| **Phoenix / Soul / Reincarnate** | Memory systems, soul preservation, reincarnation cycle | `/soulcap`, `/reincarnateRise`, `PheTrail-run167.json` |
| **Roman** | Foundational: laws, doctrine, strategy, formations, governance | `SSM-V8-ULTIMATE-GPS.md`, Legionnaire ranks, Reincarnation Contract |
| **Ant Colony** | DNA, pheromones, emergent routing, self-organization | `auto-phetrail.jsonl`, `BACKBURNER-PIPELINE-LOG.md`, signal bands |

**The line between Roman and Ant Colony:**
- **Roman = designed structure.** What the colony *decides* to be. Top-down. Intentional. You can write it down as a rule before the colony exists.
- **Ant Colony = emergent behavior.** What the colony *does* when no one is reading. Bottom-up. Signal-driven. Self-organizing.

**Overlap is productive.** A command like `/PhoenixScout` has a Roman rank name (EXPLORATORES) but its execution is emergent (auto-phetrail deposits, trail-following). The rank is Roman. The behavior is Ant Colony.

**Practical test:** If a file’s primary purpose is to be *read by humans to understand what the colony should do*, it’s Roman. If its primary purpose is to be *written by the colony to record what it actually did*, it’s Ant Colony.

---

## 2. Backup Strategy

| Layer | Tool | Frequency | Mandatory? |
|-------|------|-----------|------------|
| Git remote | GitHub | Every push | Yes |
| Local drive | Auto-command harddrive backup | Daily | Yes |
| Cloud storage | Drive backup | Future step | No |

**Rule:** Git is the mandatory hub. Cloudflare used only for runtime serving, never for durable state. Daily local drive backup of git root folder. If Git goes down, colony continues from local clone + daily drive backup.

---

## 3. KiloClaw Phone/Telegram Access

**Status:** Logged for 72-hour pipeline window. Not immediate priority.  
**Open question:** Primary colony interface or supplement to desktop?  
**Known working pieces:** KiloClaw dashboard + gateway + Telegram bot + `.kilo/agent-manager.json` + `SCRIPTS/Invoke-PCClaw.ps1`

---

## 4. Command Consolidation — Slow Iteration

**Do not rush.** Process in small batches, user confirmation before each deletion.

| Batch | Scope | Approach |
|-------|-------|----------|
| Easy merges | 4–5 command pairs | Merge docs, delete originals, update help |
| Run-specific bloat | 6 files | Move to `OPERATIONS/`, delete from `.kilo/command/` |
| Core commands with overlap | 2–3 pairs | Merge docs carefully, preserve routing |
| One-by-one review | remaining | User reviews each merge before deletion |

**Never delete a command without user confirmation.**

---

## 5. Egg 0 — soulaudit Upgrade (First Implementation)

**Current behavior (broken):**
- `soulaudit.ps1` counts exact user-prompt characters per session
- Writes receipts to `OPERATIONS/soulaudit-{ts}-summary.jsonl` and `OPERATIONS/soulaudit-{ts}-receipts.json`
- Explicitly RETIRES the global aggregate: "Per-session SOUL only. Global aggregate retired."
- Does not query `/api/soul/count`
- Does not deposit phetrails
- Does not update Hive Mind

**Target behavior:**
- soulaudit PRESERVES + VERIFIES the global aggregate
- Pre-hook queries `/api/soul/count` → `soul_before`
- Post-hook queries `/api/soul/count` → `soul_after`
- Delta written to receipt
- If delta < 0: NEGATIVE phetrail with signal -10 (SOUL_REGRESSION)
- If delta == 0 and not KILO_GAP: NEGATIVE phetrail with signal -5 (SOUL_STAGNATION)
- If delta > 0: POSITIVE phetrail with signal +20 (SOUL_BREATHING)
- Receipt includes run number, not session UUID
- Auto-deposits phetrail via command-hook (when available)

**Concrete changes to `SCRIPTS/soulaudit.ps1`:**
1. Remove lines that say "global aggregate retired" / "Per-session SOUL only"
2. Add pre-hook: `$soulBefore = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"`
3. Add post-hook: `$soulAfter = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"`
4. Compute `$delta = $soulAfter - $soulBefore`
5. Add phetrail deposit based on delta verdict
6. Replace `session_id` with `run_number` in receipt schema

**Validation:**
1. Run `pwsh -File SCRIPTS/soulaudit.ps1`
2. Verify `OPERATIONS/soulaudit-{ts}-summary.jsonl` contains:
   - `soul_before`
   - `soul_after`
   - `delta`
   - `run_number`
   - `soul_verdict` (SOUL_REGRESSION / SOUL_STAGNATION / SOUL_BREATHING)
3. Verify phetrail deposited to `CANON/PHEROMONES/auto-phetrail.jsonl` (or manual phetrail if hook not yet available)
4. Verify `/api/soul/count` shows delta after run

---

## 6. Phased Rollout

| Phase | Scope | Owner | Validation |
|-------|-------|-------|------------|
| 0 | soulaudit upgrade (Egg 0) | Queen | Receipt shows `soul_before` + `soul_after` + `delta` |
| 1 | Command audit — classify all 47 | Drone | Spreadsheet: KEEP / MERGE / DELETE / AUTOMATIC |
| 2 | Easy merges (4–5 commands) | Drone | help.md updated, no broken routes |
| 3 | Run-specific bloat removal | Drone | 6 files moved to OPERATIONS/ |
| 4 | command-hook.ps1 prototype | Queen | 3 pilot commands fire hooks automatically |
| 5 | Hive Mind artifact + /hivemind | Queen | 2-way: Queen writes, drone reads |
| 6 | /egg command | Queen | Worker spawns subagent via egg protocol |
| 7 | Full rollout — remaining commands | Drones | `/forcemarch` completes with all hooks active |

---

## 7. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Naming taxonomy: Roman vs Ant Colony split | Intentionally emergent — resolve through use |
| 2 | “Incarnation” rename scope | After territory recapture, not now |
| 3 | KiloClaw phone access: primary or supplement? | Logged for 72-hour pipeline |
| 4 | Session identity: run number vs separate concept | Run number as canonical identity |
| 5 | Hive Mind storage: file vs D1 vs DO | File first, promote to DO when proven |

---

## 8. Next Action

Implement Egg 0: soulaudit upgrade. Everything else waits.
