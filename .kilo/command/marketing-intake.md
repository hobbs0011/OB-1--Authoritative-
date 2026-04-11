---
description: "Marketing asset intake pipeline — scan images/PDFs, classify per Gospel 444, index into ART-ARSENAL, output INDEX.json blocks ready for MagicChat retrieval. Stage 1 of the content library build."
agent: RISE
---
# /marketing-intake — ART-ARSENAL Asset Intake Pipeline

Marketing lane active. Drop assets and execute.

## Pipeline

**Phase 1 — Soul Check**
Load `/souldna brand` — confirm Gospel 444 palette is active before any classification.

**Phase 2 — Asset Scan**
For each asset attached to this session:

1. If image: `view_image` → describe + classify
2. If PDF: `mcp_microsoft_mar_convert_to_markdown` → extract structure → each page = one entry
3. If multiple: batch all, report count before and after

**Phase 3 — Classification**
Apply `art-arsenal-intake` SKILL for each asset:
- Assign `id`, `file`, `category`, `product`, `use_slots`
- Grade Gospel 444 compliance (PASS / CONDITIONAL / FAIL)
- Source-tag the original file

**Phase 4 — Index Output**
Output complete INDEX.json block(s) ready to paste.

**Phase 5 — Append + Commit**
Append verified blocks to `ASSETS/ART-ARSENAL/INDEX.json`.
Commit: `art-arsenal: marketing-intake — {N} assets — {slug}`
Push to origin main. Return SHA.

## $ARGUMENTS

- `$ARGUMENTS = "scan-only"` → classify and report, do NOT write to INDEX
- `$ARGUMENTS = "pdf {filename}"` → target a specific PDF in workspace
- `$ARGUMENTS = "image {filename}"` → target a specific image file
- `$ARGUMENTS = "batch"` → process everything in `ASSETS/ART-ARSENAL/raw/`
- Default = process assets attached to current message

## Rules

- L13 STRONGEST_IMMEDIATE_VERSION — no skeleton index entries, full metadata or skip
- L24 PLATFORM_DEATH_TEST — run must produce GitHub commit SHA
- L01 NO_FABRICATION — if dimension unknown, write `"dimensions": "UNKNOWN"`
- Gospel 444 CONDITIONAL = flag for Michael review, still index
- Gospel 444 FAIL = index but add `"review_required": true`
