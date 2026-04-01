# T-101h Priority Matrix — Impact-Ranked Action Queue (Incubator Apr 6)

**Pulse:** 2026-04-01 21:12 ICT (`:12` trigger)
**Mode:** BUILD
**Genesis anchor:** Game Bible + COLD-START-BOOT.json
**Cold start:** PASS — `COLD-START-BOOT.json` (SHA `1533dfe`) loaded
**Last 3 entries:** Incubator Submission Assets (`6d612d9`), Social Launch Checklist (`06b6dc2`), Pre-Launch QA Test Plan (`dac397d`)

## Mission

Build a single impact-ranked priority matrix for Michael — what to do first, second, third from now (T-101h) to Apr 6 Incubator deadline. Consolidates 12+ existing pulse artifacts into one actionable decision tool.

## Constraints

- 100% Roblox focus (per 2026-03-26 ruling)
- 21 Product IDs = 0 (Michael-only, Creator Dashboard)
- Game = CODE COMPLETE (41 Lua modules)
- No Studio access from agent
- Incubator deadline: Apr 6, 2026

## T-101h Priority Matrix

| # | Action | Time | Blocker? | Owner | Artifact Reference |
|---|--------|------|----------|-------|--------------------|
| 1 | **Create 21 Product IDs** in Roblox Creator Dashboard (7 Game Passes + 14 Dev Products). Copy exact names/prices from Product ID Creation Checklist. | 45 min | 🔴 YES | Michael | Product ID Creation Checklist (T-119h) |
| 2 | **Wire Product IDs into code.** Open each module referencing placeholder IDs, paste real IDs from Step 1. Follow Product ID Wiring Spec. | 30 min | 🔴 YES | Michael | Product ID Wiring Spec (T-119h) |
| 3 | **Run Pre-Launch QA** in Studio. Execute all 7 phases / 20+ tests. Fix any failures before publish. | 2 hr | 🔴 YES | Michael | Pre-Launch QA Test Plan (T-116h) |
| 4 | **Publish game to Roblox.** Set experience to Public. Paste Store Listing Copy (description, tags, settings). | 20 min | 🔴 YES | Michael | Store Listing Copy Spec (T-118h) |
| 5 | **Create game icon + thumbnails.** 512×512 icon, 1920×1080 thumbnails. Upload in Creator Dashboard. | 1 hr | 🟡 Soft | Michael | Store Listing Copy Spec (T-118h) |
| 6 | **Submit Incubator Application.** Review V2 draft, fill remaining [FILL] fields, attach DevForum post link + video demo link. | 1 hr | 🔴 DEADLINE | Michael | Incubator Submission Assets (T-108h) |
| 7 | **Post DevForum "Cool Creations" thread.** Copy-paste from Incubator Submission Assets artifact. | 15 min | No | Michael | Incubator Submission Assets (T-108h) |
| 8 | **Record 2-min video demo.** Follow shot-by-shot script from Submission Assets. Upload to YouTube/Roblox. | 1 hr | No | Michael | Incubator Submission Assets (T-108h) |
| 9 | **Set up Roblox Group** (if not exists). Configure roles, group store, social links per Social Launch Checklist items 9-15. | 30 min | No | Michael | Social Launch Checklist (T-108h) |
| 10 | **Create Discord server.** Channels, roles, welcome bot, game link per Social Launch Checklist items 16-22. | 45 min | No | Michael | Social Launch Checklist (T-108h) |
| 11 | **Activate Day-1 Monitoring.** Follow Post-Launch Monitoring & Rollback Plan. Watch error rates, CCU, revenue for first 4 hours. | Ongoing | No | Michael | Post-Launch Monitoring (T-114h) |
| 12 | **Launch day social posts.** Roblox group announcement, Discord @everyone, DevForum bump per Social Launch Checklist items 23-26. | 30 min | No | Michael | Social Launch Checklist (T-108h) |

## Critical Path

**Steps 1→2→3→4 are serial blockers.** Nothing else matters until the game is published with real Product IDs.

**Estimated critical path time: ~3.5 hours** (Product IDs → Wire → QA → Publish)

**Steps 5-6 are deadline-sensitive** (Incubator Apr 6). Should happen within 24h of publish.

**Steps 7-12 are launch amplifiers.** Do after publish, in order shown.

## Acceptance Test

- [x] All 12 items are concrete, copy-pasteable, Michael-executable
- [x] Each item references an existing pulse artifact by name
- [x] Critical path identified with serial dependency chain
- [x] Time estimates provided for every item
- [x] Blocker status marked (🔴/🟡/No)
- [x] Zero drift from Game Bible or prior artifacts

## Evidence

- **Notion:** Reincarnation Log entry (2026-04-01 — T-101h Priority Matrix)
- **GitHub:** This file (`CANON/REINCARNATION/2026-04-01-t101h-priority-matrix.md`)
