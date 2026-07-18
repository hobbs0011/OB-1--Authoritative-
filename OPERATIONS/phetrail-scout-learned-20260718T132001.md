# Phetrail Scout Learned — 2026-07-18T13:20:01+07:00

## What Changed
- Added APPS/NET-PET-AI/ as scout target zone
- Discovered SOUL + LEDGER + DRIFT + CONFIG + GAP + VAULT findings in app code
- Cross-zone pattern: same phantom HL gaps appear in both CANON/HEAVY-LEDGER/ and APPS/NET-PET-AI/

## Lens Updates
- SOUL lens now covers RRL/ directory for unminated transcripts
- LEDGER lens checks both CANON/HEAVY-LEDGER/ disk state AND runtime API references
- VAULT lens added: student vault manifests in APPS/NET-PET-AI/public/

## Routing Changes
- PHANTOM LEDGER gaps → /api/ledger/generate (runtime DO route)
- UNMINED SOUL → /api/soul/extract with source_sha256
- DEAD portal files → verify against APPS/NET-PET-AI/public/ actual contents

## Stop Rules
- Do NOT delete portal HTML files without verifying student roster first
- Do NOT regenerate HL entries without SOV100 approval for phantom gaps
- Do NOT process ClaudeTheRetard1.txt without redaction review
