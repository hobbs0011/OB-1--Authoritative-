---
name: soul-search
description: "SoulSearch — query the SOULKEYS index, resolve STARMAP pointers, return exact SOUL + DNA hits verbatim. The search engine front door for the reincarnation pipeline. Use this BEFORE any grep/glob/glob when asked 'where is X' or 'find X in past runs'."
argument-hint: "<term> [--blueprints-only] [--max-results N]"
---

# SoulSearch Skill

## What This Is

SoulSearch is the front door to the reincarnation pipeline's memory. When asked "where's the Phase 0 spec?" or "find the blueprint for X," this skill turns a blind grep into a one-query lookup.

**Chain:** SOULKEYS (inverted-index.json) → STARMAP (pointer map) → RRL/LEDGER (exact words)

## When to Use

- "Where is X?" / "Find X" / "Search for X" / "Look up X"
- Any query about past runs, blueprints, specs, decisions
- BEFORE using grep/glob on CANON/ or RRL/ — SoulSearch is the canonical front door
- When asked about keywords from past sessions

**Search-First Law:** SoulSearch is the FIRST tool touched. Never grep the archive first.

## How It Works

1. **SOULKEYS lookup:** `SCRIPTS/soul-search.ps1 -Query "<term>"` queries `CANON/SOUL-KEYWORDS/inverted-index.json` → returns matching runs with weights
2. **STARMAP resolve:** for each run, reads `CANON/STARMAP/starmap-run{N}.json` → gets pointers {rrl_path, ledger_id, soul_turn_ids, dna_turn_ids, blueprint_locations}
3. **Content retrieval:** pulls exact snippets from RRL/{run}.txt (SOUL = Michael's words) and CANON/SOUL/EXTRACT/dna-run{N}.json (DNA = agent blueprints)
4. **Ranking:** weight × recency. Blueprint DNA hits surface first.

## Command

```powershell
pwsh -File SCRIPTS/soul-search.ps1 -Query "<term>" [-MaxResults 10] [-BlueprintsOnly]
```

### Flags
| Flag | Effect |
|------|--------|
| `-Query "<term>"` | Search term (required) |
| `-MaxResults N` | Limit hits (default 10) |
| `-BlueprintsOnly` | Return only blueprint-type DNA hits |

## Output Shape

```
🔎 "phase 0" — 3 hits

[run 43 · weight 9 · 2026-06-02]
  SOUL  RRL-43.txt:turn 12 → "find the blueprints from past run, audit..."
  DNA   dna-run43.json:seq 7 [blueprint] → "PHASE 0 — KNOW THE BATTLEFIELD (hardened spec)..."
  LEDGER HL-218 (soul_hash ✓ dna_hash ✓)
```

**Verbatim only. Never paraphrase. Return the real words.**

## Anti-Patterns

- ❌ Grep/glob CANON/ or RRL/ before running SoulSearch
- ❌ Whole-file dumps — pointers + snippets only (STARMAP's job is anti-bloat)
- ❌ Summarizing or paraphrasing hits
- ❌ Ignoring blueprint-type hits — your high-token output is the most valuable

## Dependencies

SoulSearch only returns truth once:
- RRL captures both sides (Stage 1)
- DNA extraction runs (Stage 3)
- STARMAP pointer maps exist (Stage 5)

Build those first. SoulSearch lights up — including retroactively as runs get backfilled.
