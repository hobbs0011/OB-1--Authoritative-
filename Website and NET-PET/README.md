# Website and NET-PET

Canonical home for all website and NET-PET-AI application artifacts.

## Scope

- **naturalenglishtraining.net** — student-facing website (Cloudflare Workers)
- **NET-PET-AI** — the production app (worker, D1, DO, KV, R2, DeepSeek, Deepgram)
- **Gospel 444** — brand spec, palette, visual law
- **Landing page** — single-page conversion build
- **Asset pack** — tiger hero, mouse contrast, textures, icons

## Rules

- No raw secrets in this directory
- Gospel 444 palette enforced: Void `#0f0f1a`, Soul Purple `#a855f7`, Imperial Gold `#f59e0b`, NO BLUE
- Student-facing brand = **Natural English Training** (never Phoenix Rising)
- Append-first for all canonical content

## Consolidation Note: NET-PET-AI Duplicates (2026-04-05)

**Status:** Documented, awaiting cleanup decision

There are two NET-PET-AI directories:

| Location | Status | Description |
|----------|--------|-------------|
| `APPS/NET-PET-AI/` | **CANONICAL** ✅ | Full app with src/, public/, test/, package.json with dependencies |
| `Website and NET-PET/NET-PET-AI/` | **BACKUP** ⏸️ | Older copy, may have unique files |

### Comparison

**APPS/NET-PET-AI/ (10 files/folders):**
- src/, public/, test/ directories
- package.json (596 bytes, more complete)
- package-lock.json (50KB)
- wrangler.toml
- scripts/, .gitignore
- test-chat.mjs, test-direct.mjs

**Website and NET-PET/NET-PET-AI/ (9 files/folders):**
- src/, public/ directories
- package.json (529 bytes, older)
- wrangler.toml (573 bytes, similar)
- No test/ directory
- No package-lock.json

### Action Taken

- ✅ Canonical location established: `APPS/NET-PET-AI/`
- ✅ Documented in this README
- ⏸️ This backup preserved pending review of unique files
- ⏸️ "Website and NET-PET/" folder kept intact (may contain other important files)

### Next Steps

1. Compare src/ directories for unique code in backup
2. Check if any assets exist only in backup
3. Migrate any unique files to canonical location
4. Decide on final disposition of backup
