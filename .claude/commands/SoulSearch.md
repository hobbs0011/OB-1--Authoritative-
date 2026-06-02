---
description: "SoulSearch — query the SOULKEYS index, resolve STARMAP pointers, return exact SOUL + DNA hits verbatim. The search engine front door."
---
# /SoulSearch <term>

LAW: return verbatim hits, never paraphrase. SOUL = Michael's words. DNA = agent words/blueprints.

1. Run `pwsh -File SCRIPTS/soul-search.ps1 -Query "<term>"` (add `-BlueprintsOnly` for blueprint-only hits)
2. Engine does: SOULKEYS lookup → STARMAP pointer resolve → RRL/LEDGER exact retrieval → rank (weight × recency)
3. Blueprint DNA hits surface first — your high-token output is the thing most worth finding.

NO whole-file dumps. Pointers + snippets only (anti-bloat = STARMAP's job).
