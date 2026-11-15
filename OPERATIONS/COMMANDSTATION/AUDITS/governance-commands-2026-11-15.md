# Governance command audit (2026-11-15, run 38)

Order: verify governance documents don't point to or initiate old commands; with Kilo only canon-pointer commands (Field Guide Agent 99) are allowed.

## Method
Content greps (not title checks) over: `src/canon/` (GOSPEL-999, LegionnaireFieldGuide), `src/999.md`, `src/444.md`, `src/SESSIONS/proposal-fieldguide-agent99-20261030.md`, FGA99 45-source import (`Copy_of_FieldGuideAgent99_45_sources`), live `CANON_REGISTRY` (37 rows) + `CANON_ONLY` (9).

## Findings
1. **Canon docs clean.** No retired/never-built names (`/halt /stabilize /supersaiyan /SoulSearch /dnaREGISTRY /Centurion-Code /netstock /netvoice /a2zmarketing`) and no dead-lane initiators (`/relay /masterlink /brain sync`) appear as runnable in `src/canon/`, `999.md`, `444.md`, or the FGA99 45-source text. GATE references in GOSPEL-999 (`/ilog anchors`, `/ilog verify`, `/omega`, `/lesson check`, `/canon registry`, `/brand …`) name live station commands as verification gates — legitimate pointers, not initiations.
2. **`/omega` is live, not stale.** It is the short alias of `/phoenixomegaprotocol` (app.js gate card). GOSPEL-999 OMEGA.005's `/omega` reference resolves.
3. **Residual references are history/engineering, not governance.** `/relay`, `/masterlink`, `/brain` appear in `src/README.md`, `src/HANDOFF.md`, `src/Backburner.md`, `src/REPO.md` describing lanes that exist, plus explicit do-not-run rules (Backburner:125). The registry marks every command BUILT ✓/✗ + ORIGIN (canon/station/proposed) so nothing presents itself as what it isn't.
4. **Kilo-safe vs browser-only** (recorded in `KILO.md`, binding): Kilo reads files, cites canon paths, verifies hashes/anchors. All initiating writes (`/canon sync`, `/ilog push`, `/gh backup`, `/forge apply`, `/vault seal/push`, gated writes, relay/brain/masterlink syncs) are browser-session-only. Retired names are never runnable.

## Verdict
Governance documents point only at live commands and canon paths. No stale-pointer fix required. The Field Guide Agent 99 rename (proposal 2026-10-30, blockers: straight-rename-vs-new-content, CCC index line, lineage) executes via the box lane; `KILO.md` already uses the new name with the current canon path as address.
Ledger 689/run 38. No deletions, no canon writes, no model calls.
