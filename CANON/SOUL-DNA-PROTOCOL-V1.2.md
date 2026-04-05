SOUL DNA PROTOCOL v1.2 — 2026-04-05

Summary:
- Upgrades after processing KEY-SOUL10 (JSONL source) and observations from KEY-SOUL3 run.
- Purpose: refine protocol to handle JSONL inputs and centralize dna-flag configuration.

What changed (v1.1 -> v1.2):
- Centralized `dnaFlags` into `CANON/dna-flags.json` (versioned); scripts should load flags from this file in future runs.
- JSONL optimization: when source is JSONL, apply per-record index extraction (extract `id`, `label`, `text` fields) and store both raw and indexed records.
- Add note: For JSONL sources, create an additional manifest `CANON/JSONL-INDEX-<source>.ndjson` containing `{id,label,char_offset,line}` for downstream indexing.
- Protocol now records dna-flag density metrics; high-density sources (near 100%) should produce an indexed quote-ledger record immediately after extraction.

Artifacts produced (KEY-SOUL10 run):
- SOUL LOG (verbatim): CANON\SOUL-LOG-VERBATIM-KEY-SOUL10-2026-04-05.md
- Audit report: CANON\SOUL-LOG-AUDIT-KEY-SOUL-3-2026-04-05-072346.md (20/20 PASS)
- Segments: CANON\SOUL-SEGMENTS\SEGMENT-01-PCT005-L00001-L00004.md ... SEGMENT-20-PCT100-L00092-L00097.md
- Centralized flags: CANON\dna-flags.json

Next recommended changes (implementation tasks):
- Update scripts to `Import-Json` flags from `CANON/dna-flags.json` instead of hard-coded arrays.
- Add JSONL indexer: small PS script to produce NDJSON index for JSONL sources.
- After indexing, auto-generate `quote-ledger.jsonl` for high-density sources.

Signed-off-by: OB1/Ne0 — automated run 2026-04-05
