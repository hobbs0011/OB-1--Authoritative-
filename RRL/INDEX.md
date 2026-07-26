# RRL Directory Index

**Canonical location:** `RRL/`
**Maintained by:** Incarnation7-RRL Organization Pipeline
**Last updated:** 2026-07-26T00:21 ICT

---

## Contents

| File | Type | Size | Schema | Status |
|------|------|------|--------|--------|
| `Incarnate-4-PhoenixScout.txt` | JSONL | 4,149,140 | V2 | CANONICAL - colorized + stats |
| `Incarnate4- I-LOG Procedure.txt` | JSONL | 4,149,140 | V2 | **DUPLICATE** of PhoenixScout |
| `RRL-186.txt` | JSONL | 4,149,140 | V2 | **DUPLICATE** of PhoenixScout |
| `Incarnate3- I-LOG Procedure.txt` | JSONL | 2,254,810 | V1 | Colorized (partial - schema mismatch) |
| `Incarnate4-I-LOG-RISE.txt` | Markdown | 1,677 | N/A | RISE stage metadata, not JSONL |
| `Incarnate-4-PhoenixScout-COLORIZED.md` | Markdown | dynamic | N/A | Colorized transcript output |
| `Incarnate-4-PhoenixScout-STATS.json` | JSON | 826 | N/A | Stat metadata |
| `Incarnate3- I-LOG Procedure-COLORIZED.md` | Markdown | dynamic | N/A | Colorized transcript output |
| `Incarnate3- I-LOG Procedure-STATS.json` | JSON | dynamic | N/A | Stat metadata |
| `Incarnate4-I-LOG-RISE-COLORIZED.md` | Markdown | dynamic | N/A | Empty (not JSONL) |
| `Incarnate4-I-LOG-RISE-STATS.json` | JSON | dynamic | N/A | Zero-count stats |
| `RTL-mai-tram-ielts-2026-07-22.txt` | JSONL | 55,047 | RTL V1 | 🆕 RTL — Raw Transcript Log |
| `RTL-mai-tram-ielts-2026-07-22-COLORIZED.md` | Markdown | dynamic | N/A | RTL colorized output |
| `RTL-mai-tram-ielts-2026-07-22-STATS.json` | JSON | dynamic | N/A | RTL metadata |

## Schema Versions

### V2 (Incarnate4)
- `content[].data.{text, tool, state}` - nested data sub-object
- `role`/`time`/`content` top-level structure
- Tool calls have `tool`, `callID`, `state` fields in content block

### V1 (Incarnate3)
- `content[].{text, tool}` - fields directly on content blocks
- `role`/`time`/`content` top-level structure
- Tool calls: `tool` field directly on content block

## Directories

| Directory | Files | Description |
|-----------|-------|-------------|
| `incomplete RRL's/` | 11 stubs (0-5 bytes) | Runs 152-171, no recoverable data |
| `non-transcripts/` | 843 files | Pre-Roman era DNA-LOG files (May-June 2026) |

## Duplicate Files

The following files are byte-identical (4,149,140 bytes, same timestamp):
- `Incarnate-4-PhoenixScout.txt` ← canonical name
- `Incarnate4- I-LOG Procedure.txt`
- `RRL-186.txt`

**Recommendation:** Keep only canonical `Incarnate-N-*.txt` naming. Replace duplicates with symlinks or consolidate.