# Quick Reference: Operation Console Cards

## CARD 1: Daily Start 🌅

```powershell
# ONE COMMAND - Everything
pwsh -File SCRIPTS/god-mode.ps1 -Mode activate

# What it does:
✓ Activate Python venv
✓ Run doctor diagnostic
✓ Run build verification
✓ Audit MCP connections
✓ Check development tools
✓ Verify Cloudflare config
✓ Capture system state
```

**Output**: Green checkmarks = Ready to code

---

## CARD 2: Quick Diagnostics 🩺

| Task | Command |
|------|---------|
| Health check | `pwsh -File SCRIPTS/god-mode.ps1 -Mode health` |
| MCP status | `pwsh -File SCRIPTS/god-mode.ps1 -Mode mcp-audit` |
| Tools check | `pwsh -File SCRIPTS/god-mode.ps1 -Mode tools-check` |
| Full debug | `pwsh -File SCRIPTS/god-mode.ps1 -Mode debug` |
| Build verify | `pwsh -File SCRIPTS/obi.ps1 verify` |
| System doctor | `pwsh -File SCRIPTS/obi.ps1 doctor` |

---

## CARD 3: Git Workflow + Tools 🔧

### GitKraken (Visual Git)
```bash
gitkraken
# Start GitKraken from command line
# Visualize branches, resolve conflicts graphically
```

### GitLens (VS Code)
- View commit blame: `Ctrl+Shift+P` → "GitLens: Show Blame"
- Open code lens: Shows who edited each line
- Browse history: Right-click file → "Open in GitLens"

### Kilo (Agent Protocol)
```powershell
pwsh -File SCRIPTS/obi.ps1 <command>
# See AGENTS.md for available commands
```

### Google Extensions
- Google Cloud Code: Deploy to GCP (if needed)
- Google Sheets: Export student data
- Translate: Vietnamese ↔ English hints

---

## CARD 4: Pre-Deploy Checklist ✅

```powershell
# 1. Health
pwsh -File SCRIPTS/god-mode.ps1 -Mode health

# 2. Build
pwsh -File SCRIPTS/obi.ps1 verify

# 3. Git clean
git status
# Should show: "working tree clean"

# 4. MCP ready
pwsh -File SCRIPTS/god-mode.ps1 -Mode mcp-audit
# Cloudflare: ✓
# GitHub: ✓
# Notion: ✓

# 5. Deploy
wrangler deploy --env production

# 6. Verify live
curl https://natural-english-training.net/health
```

---

## CARD 5: VS Code Tasks 🎯

Press `Ctrl+Shift+B` to see all tasks:

- **⚡ Super Saiyan - Activate Environment** (default on folder open)
- 🌀 God Mode - Full Activation
- 🌀 God Mode - Health Check
- 🌀 God Mode - MCP Audit
- 🌀 God Mode - Debug Bundle
- 🌀 God Mode - Tools Check
- 📊 System Health Report
- 🩺 Doctor Check
- ✅ Verify Build
- 🚀 Deploy to Cloudflare

---

## CARD 6: Troubleshooting 🐛

### Venv Broken?
```powershell
pwsh -File SCRIPTS/supersaiyan.ps1 -Mode force-reset
# Deletes old venv, rebuilds from scratch
```

### Git State Corrupted?
```powershell
cd D:\OB-1
git reset --hard HEAD
git clean -fd
git worktree prune --verbose
```

### MCP Connection Failed?
```powershell
# Check Cloudflare auth
wrangler whoami

# Check GitHub auth
gh auth status

# Retry full activation
pwsh -File SCRIPTS/god-mode.ps1 -Mode activate
```

### Build Verification Fails?
```powershell
cd D:\OB-1\APPS\NET-PET-AI
node --check src/index.js
# Shows syntax errors if any
```

---

## CARD 7: Important Files 📁

| File | Purpose |
|------|---------|
| `SCRIPTS/god-mode.ps1` | Master orchestrator (⭐ START HERE) |
| `SCRIPTS/supersaiyan.ps1` | Venv activation |
| `SCRIPTS/system-health.ps1` | Health tracking |
| `SCRIPTS/obi.ps1` | Build verification |
| `.vscode/tasks.json` | VS Code task definitions |
| `OPERATIONS/GOD-MODE-OPERATIONS.md` | Full documentation |
| `OPERATIONS/MCP-ROADMAP.md` | MCP integration plan |
| `APPS/NET-PET-AI/wrangler.toml` | Cloudflare config |
| `.github/copilot-instructions.md` | Copilot rules |

---

## CARD 8: MCP Status 🔌

| MCP | Status | Purpose |
|-----|--------|---------|
| Cloudflare | ✅ Active | Worker runtime, DO, KV, R2 |
| GitHub | ✅ Active | Version control, PR automation |
| Notion | ✅ Active | Student data, lesson tracking |
| NotebookLM | 🚀 Planned | Lesson generation + audio |
| Deepgram | 🎤 Planned | Voice input/output |
| Stripe | 💳 Planned | Payments + subscriptions |
| Twilio | 📱 Planned | SMS notifications |
| Google Sheets | 📊 Future | Data export |

See `OPERATIONS/MCP-ROADMAP.md` for details.

---

## CARD 9: Emergency Commands 🚨

```powershell
# Last resort: Full rebuild
git checkout main
git pull origin main
pwsh -File SCRIPTS/supersaiyan.ps1 -Mode force-reset
pwsh -File SCRIPTS/god-mode.ps1 -Mode debug

# Rollback last deploy
git revert HEAD --no-edit
wrangler deploy --env production

# Get debug bundle (for support)
pwsh -File SCRIPTS/god-mode.ps1 -Mode debug
# Creates timestamp log file for troubleshooting
```

---

## CARD 10: Developer Workflow 💻

```
1. Folder Open
   ↓
2. VS Code: Run default task (⚡ Super Saiyan)
   ↓
3. Make changes
   ↓
4. Pre-commit: pwsh -File SCRIPTS/obi.ps1 verify
   ↓
5. Git commit + push
   ↓
6. Pre-deploy: pwsh -File SCRIPTS/god-mode.ps1 -Mode health
   ↓
7. Deploy: wrangler deploy --env production
   ↓
8. Monitor: wrangler tail --format pretty
```

---

## Keep These Bookmarked

- 📖 **GOD-MODE-OPERATIONS.md** - Full reference
- 🛣️ **MCP-ROADMAP.md** - Integration plans
- 🎯 **THIS FILE** - Quick ref card
- 📋 **.vscode/tasks.json** - Available tasks
- 🔑 **AGENTS.md** - Agent commands
- ⚙️ **copilot-instructions.md** - Copilot rules

---

**Last Updated**: April 16, 2026  
**Status**: ✓ OPERATIONAL - FULL GOD MODE ACTIVE
