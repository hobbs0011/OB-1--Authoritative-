# MURPHY'S LAW PASS + DEVIL'S ADVOCATE — with edge-case solutions BUILT IN (2026-11-06, BB-RUN-39)

Rule of this pass: every failure gets detection + mitigation + cost, and the mitigation
is CODE or it doesn't count. Guards live in `src/kilo-lane-guards.js` (window.KiloGuards,
self-tested live this pass). References are precedents with dates, not vibes.

## MURPHY — 12 pre-mortems, all guarded

| # | Failure | Detection | Solution (built in) | Cost |
|---|---|---|---|---|
| M1 | Full-state dump truncates page_eval (2.6M precedent) | result too big / signal timeout | E1 `sessionSummary` + `safeSlice` — keys and slices only, never full Stores | $0, permanent |
| M2 | Direct fetch to runner fails (CORS) | `TypeError: Failed to fetch` on 200-alive worker | E2 superFetch-only rule + `runnerCheckNote()` | $0, permanent |
| M3 | Prompt >650ch eats the spec tail (s1-shell LD7: 686ch, cut every try) | `fitPrompt` reports trim | E3 trim context HEAD, keep every spec char; tail-risk flag forces section split (LD8) | $0, permanent |
| M4 | Empty prior poisons next prompt (LD5 amnesia) | summary blank after SKIP | E4 `[previous section missing]` placeholder | $0, permanent |
| M5 | Hollow phase burns ~150 empty tries | 2 consecutive empties per model | E5 breaker: 2 empties → 10min skip; probe-then-run gate, 20min backoff | $0, saves ~80% wasted calls |
| M6 | Keeper loops forever on DONE-EMPTY (LD5) | keeper exits after one all-empty pass | E6 cap 5, exit 2 = failure-escape (fix driver, don't grind); exit 0 only on real DONE | $0, permanent |
| M7 | Long prompts starve reasoning (size-dependent empties, proven 10-28) | >650ch prompt + empty replies while pings flow | E7 `sizeVerdict`: ≤300 whole, ≤650 guarded, else one-upgrade-per-call | $0, permanent |
| M8 | Thin captures ("?"/"undefined") filed as soul (#294-295, #314) | SCHOLAR span shows 1-char entries | E8 `soulWorthy` refuses placeholders; re-capture verbatim | $0, permanent |
| M9 | Stale model rotation (3 dead slugs while 16 live) | gateway_models vs driver diff | E9 rotation pinned to measured slugs; re-measure before changing | $0, permanent |
| M10 | Backup race: cron pulse lands mid-drive → 422 | ref moved under the drive | E10 re-read ref per batch; rebuild tree on new head (2026-10-25 precedent) | $0, permanent |
| M11 | Plain-chat orders never auto-capture (10, 8, 23 backfills) | MARCH HOLLOW on SOUL=0 | E11 backfill verbatim + late-capture footnotes, THEN re-measure SCHOLAR (this reseal does it) | $0, discipline |
| M12 | Paid lane dies mid-mission (OR 8-day 401 streak; CF 401s) | keyed 401 on live lane | E12 degrade to free map (box + runner + free rotation); halt only on order | $0, permanent |

Self-test this pass: 11/11 PASS (E1×2, E3, E4, E6×2, E7, E8, E9, E5×2) + 4 standing notes. Re-run anytime: `KiloGuards.selfTest()`.

## DEVIL'S ADVOCATE — 5 steelmen, answered by measurement

**D1. "Just pay for Kilo credits / Claw and skip the box."**
Answered: the box + runner already cover the 30% Claw can't replace in-Kilo (Telegram control, persistent memory, true always-on — BB-KILOCLAW-02 replacement map). Paid inference buys speed, not architecture. Standing: Kilo credits on order, Meshy Pro month (~$10) on roster lock — first $ only on proof (tool-stack §6).

**D2. "n8n replaces the runner + box cron."**
Answered: n8n is the best OUTSIDE candidate for the automation half only (schedules + Telegram + 600 integrations, self-host free). It is weak at autonomous repo coding — pairs with Kilo/box, never replaces (full-tab scout 2026-11-06). Adopt as Community on box, after Kepler proves.

**D3. "Kepler replaces hand-rolled mission control."**
Answered: plausibly yes for the control plane (agent-agnostic, worktrees, Agent Graph, SSH/WSL remotes, mobile). Unproven until: Kepler free installed + Kilo CLI session over SSH to the box + one parallel worktree merge. Until then it is a hypothesis with a test plan, not a claim.

**D4. "The free lane is too flaky — go paid-first."**
Answered: flakiness is SIZE-dependent, not quota (proven 2026-10-28: 10tok pings flow while 400tok halves empty, both routes). The fix is calibration (budgets, halves, one-upgrade-per-call — E3/E7), not money. Paid lane had its own bad phase the same night (Pro empty ×3 + flash). Free carries; paid is the pressure valve with budgets.

**D5. "Skills should live inside Kilo for speed."**
Answered: refused by standing law — skills never live inside Kilo/Claw (pointer docs only). Reason measured: the `.kilo/` lineage is NOT authority (RECON.003 wrong-tree trap ×2, canon correction CANON.001–.010). Speed never outranks provenance.

## What "reseal with edgecases built in" means, concretely
The Incarnate-48 seal (this pass) is the first seal where M1–M12 are code, not advice:
guards module shipped + wired + self-tested, reboot sim corrections in BOOT.md,
subscription confirmed, Kilo lane re-proven live ($0 Pong). Next session inherits
solutions that RUN, not notes that warn.
