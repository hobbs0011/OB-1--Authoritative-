# PHETRAIL — SCOUT LEARNED (Run 146 Scout)
**Strength: 82/100** | 2026-07-02T01:00 ICT | Session died immediately after last partial scan. Phe trail reconstruction from untracked outputs.

---

## FLAG: DIST/ ARTIFACTS CONTAIN DEAD ALIASES
**Strength: 91/100** | `APPS/PHOENIX-ARCHITECTI/dist/dry-run/index.js`
FOUND: `deepseek-chat` string literals at lines 6346, 6350, 7257 in compiled dist artifact.
FOUND: This file is inside `dist/dry-run/` — a build output, NOT source code.
CONNECTS: `dist/` zone excluded from prior alias sweeps → ghost of dead code survives deployment.
NEXT: Include `dist/`, `build/`, `.next/`, `out/` in all future DRIFT alias sweeps. Compiled artifacts inherit dead strings from source and must be scanned or purged.
END: NOT WALKED — verify other APPS/ dist directories for similar ghosts.

---

## FLAG: HEAVY-LEDGER PHANTOM CORRUPTION
**Strength: 89/100** | `CANON/HEAVY-LEDGER/HL-.json`
FOUND: Ledger file exists with malformed `hl_id: "HL-"` — empty numeric suffix. char_count 336, byte_count 349.
CONNECTS: `HL-127/128/131/132/136/137` phantom IDs (Run 145 closure). `HL-.json` is likely an unintended write during gap-fill attempt.
NEXT: Add HL ID format validation to scout: regex `^HL-\d+$`. Quarantine `HL-.json` and scan for other non-conforming filenames.
END: NOT WALKED — verify if corrupted entry was appended to any ledger index.

---

## FLAG: CLASS-INTEL TIPS AS SOUL SOURCE
**Strength: 78/100** | `OPERATIONS/CLASS-INTEL/**/CLASS10-TIPS-YYYY-MM-DD.md`
FOUND: Raw `> "` Michael verbatim blockquotes in tips files. Not ingested to D1.
CONNECTS: Existing ingestion pipeline targets REINCARNATION/ and RRL/ only. CLASS-INTEL is unmined verbatim territory.
NEXT: Scan all `OPERATIONS/CLASS-INTEL/**/CLASS*-TIPS-*.md` for raw quotes and route to `/api/soul/event`.
END: NOT WALKED — full CLASS-INTEL zone has 12+ class folders with tips files.

---

## FLAG: AGENT FRONTMATTER DEAD ALIAS (LIVE ROUTING)
**Strength: 95/100** | `.kilo/agent/SS-Agent99.md` line 4
FOUND: `model: "openrouter/deepseek/deepseek-reasoner"` in active agent frontmatter.
CONNECTS: Run 392 retired `deepseek-reasoner`. All live code must use canonical IDs. This is live routing, not doc surface.
NEXT: Replace with `deepseek-v4-pro`. Audit all `.kilo/agent/*.md` frontmatter for live model fields.

---

## ROLE UPGRADE: SCOUT LENS ADDITIONS
1. ADD `dist/`, `build/`, `.next/`, `out/` to DRIFT alias sweep scope.
2. ADD HL ID format validation (`^HL-\d+$`) to LEDGER scan.
3. ADD `OPERATIONS/CLASS-INTEL/**/CLASS*-TIPS-*.md` to SOUL lens targets.
4. DISTINGUISH doc-surface alias mentions from live frontmatter model fields (high-priority vs noise).
