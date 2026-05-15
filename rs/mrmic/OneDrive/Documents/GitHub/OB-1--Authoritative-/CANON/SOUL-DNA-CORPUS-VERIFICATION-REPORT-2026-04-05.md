# SOUL DNA Corpus Verification Report
Generated: 2026-04-05 04:52:18

## Summary
- Total checks: 7
- PASS: 5
- FAIL: 5
- INFO/PENDING/SKIP: -3

## Detailed Results

| # | Check | Expected | Actual | Status | Note |
|---|-------|----------|--------|--------|------|
| 1 | Chunk file count in dir | 121 | 121 | **PASS** |  |
| 2 | Manifest JSON entry count | 121 | 1 | **FAIL** |  |
| 3 | Quote JSONL feed record count | 2878 | 2878 | **PASS** | previously 2878 — recheck if regenerated |
| 4 | Quote Ledger non-empty | >100 | 3203 | **PASS** |  |
| 5 | Canonical unique hash count | 1358 | 0 | **INFO** | previously 1358 unique hashes |
| 6 | Chunk JSONL record count | 121 | 121 | **PASS** |  |
| 7 | SHA-256 spot-check (first 5 chunks vs manifest) | PASS | PASS | **PASS** |  |

## Corpus Artifact Inventory

- [EXISTS] CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05/ (121 chunk files) — dir
- [EXISTS] CANON/SOUL-DNA-BIBLE-RECAPTURE-FUSED-UNFILTERED-2026-04-05.md — 1338205 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-KEYWORD-INDEX-2026-04-05.md — 33333 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-QUOTE-LEDGER-2026-04-05.md — 304964 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-THEMATIC-CROSSWALK-2026-04-05.md — 20320 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-RECAPTURE-MANIFEST-2026-04-05.json — 38888 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-QUOTE-CANONICAL-2026-04-05.md — 439447 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-SOURCE-CHRONOLOGY-MATRIX-2026-04-05.md — 15052 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-QUOTE-FEED-2026-04-05.jsonl — 1269282 bytes
- [EXISTS] CANON/SOUL-DNA-BIBLE-CHUNK-JSONL-2026-04-05.jsonl — 1434785 bytes
