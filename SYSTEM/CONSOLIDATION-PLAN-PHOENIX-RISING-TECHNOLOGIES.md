# Phoenix-Rising-Ai-Solutionsnologies — Consolidation Plan

## Commissioned: 2026-04-09 | Run 266 | Status: PHASE 1 COMPLETE

> This document is the canonical preservation of the 9-phase, 32-step consolidation plan designed during the architecture-discovery session (Run 266). The plan transforms the OB-1 monorepo into the clean, scalable Phoenix-Rising-Ai-Solutionsnologies platform.
>
> **CRITICAL:** Read this file at the start of any consolidation session. Execute phases in order. Do NOT skip or merge phases.

---

## Context

The current repo (`hobbs0011/Phoenix-Rising-Ultimate`) contains years of accumulated technical debt:

- TEMP dirs with extracted scripts (safe to delete)
- A broken submodule (355 dirty files)
- Loose root junk (tmp\_\* files, nul, CON, desktop.ini)
- Products not yet organized under APPS/
- Binary assets mixed into git
- 4 dead stashes
- Stale worktrees
- No .gitignore coverage for media/docs/archives

The goal: **Phoenix-Rising-Ai-Solutionsnologies** — a clean, wing-organized, Cloudflare-native monorepo that can scale for years.

---

## Architecture Decisions (Non-Negotiable)

1. **Repo name:** `Phoenix-Rising-Ai-Solutionsnologies` (GitHub rename pending)
2. **Wing taxonomy:** Education, Gaming, Marketing, Development — flat APPS/ with `wing:X` tags, NO nested dirs
3. **Binary assets:** Cloudflare R2 + `ASSETS/manifest.json` — never in git
4. **Chat logs:** Separate repo `hobbs0011/phoenix-pheromone-trails` — never in main repo
5. **Heavy Ledger:** Stays in monorepo (git LFS if needed)
6. **Cloudflare tier:** Workers Paid $5/mo — everything else free tier

---

## Phase Status Tracker

| Phase | Name               | Status         | Blocker                     |
| ----- | ------------------ | -------------- | --------------------------- |
| 1     | Backup + preflight | ✅ COMPLETE    | —                           |
| 2     | Nuke dead weight   | ✅ COMPLETE    | —                           |
| 3     | Restructure APPS/  | ❌ NOT STARTED | none                        |
| 4     | Clean root         | ❌ NOT STARTED | Phase 3 must complete first |
| 5     | Harden .gitignore  | ❌ NOT STARTED | Phase 4 must complete first |
| 6     | R2 Asset Manifest  | ❌ NOT STARTED | Phase 5 must complete first |
| 7     | CI/CD + Docs       | ❌ NOT STARTED | Phase 6 must complete first |
| 8     | Git hygiene        | ❌ NOT STARTED | Phase 7 must complete first |
| 9     | Seal + push        | ❌ NOT STARTED | Phase 8 must complete first |

---

## Phase 1: Backup + Preflight ✅ COMPLETE

**Goal:** Ensure nothing can be permanently lost before destructive steps.

### Steps

1. [x] Create full backup bundle: `git bundle create ../OB-1-backup-2026-04-09.bundle --all`
   - Result: `../OB-1-backup-2026-04-09.bundle` — 639.8 MB, all branches + tags
2. [x] Confirm git status clean (only dirty item: Phoenix-Rising-Ultimate/ submodule)
3. [x] List all stashes: 4 remaining (stash@{0} through stash@{3})
4. [x] List all worktrees: 4 worktrees (OB-1.worktrees/ + net-tiger-assessment.worktrees/)
5. [x] Extract TEMP-PHOENIX-IMMORTALIZE valuable script before deletion:
   - `ARCHIVE/phoenix-reincarnate-plex-v5.js` ← extracted from TEMP-PHOENIX-IMMORTALIZE/

---

## Phase 2: Nuke Dead Weight ✅ COMPLETE (Run 268)

**Goal:** Remove all dead dirs, stashes, worktrees, and root junk. Reduce repo size by 20-40%.

**Commit:** daabf77 — removed 1270 files (TEMP-\*, Phoenix-Rising-Ultimate submodule, 4 stashes, root junk, duplicate PROOFS dirs)

### Pre-check: Verify ARCHIVE/phoenix-reincarnate-plex-v5.js exists before deleting TEMP-PHOENIX-IMMORTALIZE/

### Step 2.1: Remove TEMP directories

```powershell
cd C:\Users\mrmic\Desktop\OB-1
git rm -r --cached TEMP-COMMANDSTATION TEMP-PHOENIX-ULTIMATE TEMP-PHOENIX-IMMORTALIZE
Remove-Item -Recurse -Force TEMP-COMMANDSTATION, TEMP-PHOENIX-ULTIMATE, TEMP-PHOENIX-IMMORTALIZE
```

### Step 2.2: Remove broken submodule

```powershell
git rm --cached Phoenix-Rising-Ultimate
git submodule deinit -f Phoenix-Rising-Ultimate
Remove-Item -Recurse -Force Phoenix-Rising-Ultimate
# Also remove from .gitmodules
```

### Step 2.3: Drop all stashes

```powershell
git stash drop stash@{3}
git stash drop stash@{2}
git stash drop stash@{1}
git stash drop stash@{0}
# Verify: git stash list (should be empty)
```

### Step 2.4: Delete stale remote branches (check first)

```powershell
git branch -r  # List all remote branches
# Delete confirmed-stale branches (not main, not active feature branches)
```

### Step 2.5: Prune dead worktrees

```powershell
git worktree list
git worktree prune
# If OB-1.worktrees/ or net-tiger-assessment.worktrees/ are dead: remove
```

### Step 2.6: Delete root junk files

```powershell
# Delete all tmp_* files at root
Get-ChildItem -Path . -Name "tmp_*" | Remove-Item -Force
# Delete system junk
Remove-Item -Force nul, CON, "desktop.ini" -ErrorAction SilentlyContinue
# Delete tmp commit files
Get-ChildItem -Name "tmp_commit_*" | Remove-Item -Force
```

### Step 2.7: Delete duplicate PROOFS dir at root

```powershell
# Root has: PROOFS-KEY-SOUL-10-2026-04-05-2026-04-05/ AND PROOFS-KEY-SOUL10-2026-04-05-2026-04-05/
# Verify CANON/PROOFS/ has the canonical copy, then:
Remove-Item -Recurse -Force "PROOFS-KEY-SOUL-10-2026-04-05-2026-04-05"
Remove-Item -Recurse -Force "PROOFS-KEY-SOUL10-2026-04-05-2026-04-05"
```

### Step 2.8: Interim commit

```powershell
git add -A
git commit -m "nuke: remove TEMP dirs, broken submodule, stashes, root junk [Phase 2]"
```

---

## Phase 3: Restructure APPS/ ❌ NOT STARTED

**Goal:** All deployable products live under APPS/ with wing tags.

### Current APPS/ contents

- NET-PET-AI/ — Education wing — ✅ already correct
- obi-chrome-extension/ — Education wing — ✅ already correct
- firebase/ — Education wing (reference) — ✅ already correct
- TRAIN-6-7/ — Gaming wing — ✅ already correct
- ChattyNET-MOBILE-APP-V1.1.html — Education wing — flatten into APPS/ or SITE/
- PlexyNETAPP.html — Education wing — flatten into APPS/ or SITE/

### Step 3.1: Move DISCORD-BOT/ → APPS/discord-bot/

```powershell
git mv DISCORD-BOT APPS/discord-bot
```

### Step 3.2: Move net-tiger-assessment/ → APPS/net-tiger-assessment/

```powershell
# First strip .git from net-tiger-assessment (it has its own .git — if so, use subtree or just copy without .git)
git mv net-tiger-assessment APPS/net-tiger-assessment
```

### Step 3.3: Mark WORKERS/ as DEPRECATED

- Add `DEPRECATED.md` to WORKERS/ explaining superseded by NET-PET-AI
- Do NOT delete — archive value

### Step 3.4: Move SEEDS content to CANON/SEEDS/

```powershell
# If SEEDS/ exists at root or nested, extract to:
New-Item -ItemType Directory -Force CANON/SEEDS
# Move content
```

### Step 3.5: Absorb NET-MARKETING (from C:\Desktop\NET-MARKETING\)

```powershell
# Copy (not git clone) into:
New-Item -ItemType Directory -Force APPS/net-marketing
Copy-Item -Recurse "C:\Users\mrmic\Desktop\NET-MARKETING\*" APPS/net-marketing/
# Stage + include
```

### Step 3.6: Create APPS/WING-INDEX.md

Wing registry document listing all products with wing tags, status, and deploy URLs.

### Step 3.7: Interim commit

```powershell
git add -A
git commit -m "restructure: APPS/ wing organization, DISCORD-BOT + net-tiger moved [Phase 3]"
```

---

## Phase 4: Clean Root ❌ NOT STARTED

**Goal:** Root has ≤15 items. Clean, professional, navigable.

### Target root structure (≤15 items)

```
AGENTS.md
APPS/            ← all products
ARCHIVE/         ← historical/deprecated
ASSETS/          ← R2 manifest only
CANON/           ← doctrine + system files
DISCORD-BOT/     ← moved to APPS/ in Phase 3
docs/            ← GitHub Pages
GALAXY-LESSONS/  ← lesson content
MASTER-SYNC.md
net-tiger-assessment/  ← moved to APPS/ in Phase 3
OPERATIONS/      ← operational docs
package.json     ← minimal
README.md
SCRIPTS/
.github/
```

### Step 4.1: Move loose HTML files to SITE/

```powershell
Move-Item app.js, chat.js, dev.html, index.html, magic-chat.html, offline.html, sw.js, manifest.json SITE/ -ErrorAction SilentlyContinue
```

### Step 4.2: Archive README-DEV.md

```powershell
Move-Item README-DEV.md ARCHIVE/
```

### Step 4.3: Interim commit

```powershell
git add -A
git commit -m "cleanup: root ≤15 items, loose files moved to SITE/ [Phase 4]"
```

---

## Phase 5: Harden .gitignore ❌ NOT STARTED

**Goal:** Git will never accidentally track binary assets again.

### Additions to .gitignore

```gitignore
# Media (goes to R2)
*.mp4
*.m4a
*.wav
*.mp3
*.mov
*.avi
*.mkv
*.webm
*.aac
*.flac

# Office/presentation docs (use Google Drive)
*.pptx
*.ppt
*.docx
*.doc
*.xlsx
*.xls
*.pdf

# Archives (use HARD-BACKUPS on D:)
*.7z
*.zip
*.rar
*.tar.gz
*.tar.bz2

# System junk
desktop.ini
.DS_Store
Thumbs.db
nul
CON

# Temp files
tmp_*
*.tmp

# Python
.venv/
__pycache__/
*.pyc
```

### Step 5.1: Update .gitignore

### Step 5.2: Run `git rm --cached` for any already-tracked files matching new patterns

### Step 5.3: Interim commit

```powershell
git add -A
git commit -m "gitignore: harden — media, docs, archives, system junk [Phase 5]"
```

---

## Phase 6: R2 Asset Manifest ❌ NOT STARTED

**Goal:** All binary assets are tracked in a manifest, not in git.

### Step 6.1: Create ASSETS/manifest.json

```json
{
  "version": "1.0.0",
  "updated": "2026-04-09",
  "r2_bucket": "phoenix-rising-assets",
  "assets": []
}
```

### Step 6.2: Create ASSETS/MANIFEST.md

Document explaining: what goes to R2, how to add new assets, naming conventions, CDN URL pattern.

### Step 6.3: Add upload script to SCRIPTS/

`SCRIPTS/upload-asset-r2.ps1` — takes local file, uploads to R2, updates manifest.json

### Step 6.4: Interim commit

```powershell
git add -A
git commit -m "assets: R2 manifest system, upload script [Phase 6]"
```

---

## Phase 7: CI/CD + Documentation ❌ NOT STARTED

**Goal:** All docs accurate. CI/CD paths correct after restructure.

### Step 7.1: Update GitHub Actions path filters

- `.github/workflows/*.yml` — check `paths:` filters, update for new APPS/ structure
- Especially: `NET-PET-AI/` paths still correct after Phase 3

### Step 7.2: Rewrite README.md

- Remove stale content
- Add wing taxonomy section
- Add deploy URLs
- Add architecture diagram (Mermaid)

### Step 7.3: Update AGENTS.md

- Reflect new APPS/ structure
- Update safe edit zones
- Add wing tags reference

### Step 7.4: Update .github/copilot-instructions.md

- Add wing taxonomy
- Update architecture section
- Add R2 asset notes

### Step 7.5: Interim commit

```powershell
git add -A
git commit -m "docs: README rewrite, CI/CD path fixes, copilot-instructions updated [Phase 7]"
```

---

## Phase 8: Git Hygiene ❌ NOT STARTED

**Goal:** Clean git history, correct remote names, GitHub repo rename.

### Step 8.1: Delete stale remote branches

```powershell
git branch -r | Select-String -NotMatch "main|HEAD" | ForEach-Object {
  $branch = $_.ToString().Trim().Replace("origin/", "")
  git push origin --delete $branch
}
```

### Step 8.2: Rename GitHub repo (do via GitHub web UI)

- hobbs0011/Phoenix-Rising-Ultimate → hobbs0011/Phoenix-Rising-Ai-Solutionsnologies
- ⚠️ GitHub auto-redirects old URL, but update remote URL in git config

### Step 8.3: Update remote URL after rename

```powershell
git remote set-url origin https://github.com/hobbs0011/Phoenix-Rising-Ai-Solutionsnologies.git
```

### Step 8.4: Archive OB-1 repo (GitHub web UI)

- hobbs0011/OB-1 → mark as archived (read-only, preserves history)

### Step 8.5: Archive net-tiger-assessment repo (GitHub web UI)

- hobbs0011/net-tiger-assessment → mark as archived

### Step 8.6: Aggressive git gc

```powershell
git gc --aggressive --prune=now
```

### Step 8.7: Interim commit

```powershell
git add -A
git commit -m "hygiene: stale branches pruned, repo renamed to Phoenix-Rising-Ai-Solutionsnologies [Phase 8]"
```

---

## Phase 9: Seal + Push ❌ NOT STARTED

**Goal:** All changes committed and pushed. Documentation accurate. Mission closed.

### Step 9.1: Final status check

```powershell
git status
git log --oneline -10
```

### Step 9.2: Update MASTER-SYNC.md — mark consolidation COMPLETE

### Step 9.3: Update COLD-START-BOOT.md — new active mission

### Step 9.4: Create Heavy Ledger entry (HL-121 or next available)

### Step 9.5: Final push

```powershell
git push origin main
git push ob1 main
```

### Step 9.6: Verify on GitHub

- Check hobbs0011/Phoenix-Rising-Ai-Solutionsnologies is live
- Check Actions run (CI/CD)
- Check README renders correctly

---

## Post-Consolidation Queue (Next Missions)

After all 9 phases are complete:

1. **Create `hobbs0011/phoenix-pheromone-trails` repo**
   - Ingest D:\phoenix-chat-logs\ (600+ files)
   - Ingest D:\HARD-BACKUPS\ (8 zips, 500+ more logs)

2. **Google Drive MCP setup** (mrmichaelhobbs123@gmail.com)

3. **NotebookLM manual export** — convert key notebooks to CANON/

4. **SOVEREIGN_KEY rotation + vault-lock**

5. **HL-121 conversion** — resume Heavy Ledger pipeline

---

_Created: 2026-04-09 | Run 266 | COPILOT class_
_Owner: OB1 / Agent 99 — execute on behalf of SOV100 Michael Hobbs_
_Source: architecture-discovery session — D: drive empire map, wing taxonomy, backup bundle_
