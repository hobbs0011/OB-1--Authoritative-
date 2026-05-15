# Phoenix Rising Protocol - God Mode Operations Manual
# Consolidated bootup, health checks, MCP routing, optimal toolstack

# SECTION 1: ENVIRONMENT INITIALIZATION
This is the single source of truth for:
- System health checks
- MCP connections (customer + internal)
- Tool routing (GitKraken, GitLens, Kilo, Google Extensions)
- Cloudflare God Mode verification
- Debug & troubleshooting pipeline

## Quick Start

```powershell
# One-command full activation:
pwsh -File SCRIPTS/god-mode.ps1 -Mode activate

# Health check only:
pwsh -File SCRIPTS/god-mode.ps1 -Mode health

# MCP audit:
pwsh -File SCRIPTS/god-mode.ps1 -Mode mcp-audit

# Full diagnostic with debug:
pwsh -File SCRIPTS/god-mode.ps1 -Mode debug
```

---

## SECTION 2: SYSTEM ARCHITECTURE

### Core Components
1. **[supersaiyan.ps1]** - Environment + venv activation
2. **[system-health.ps1]** - Doctor/verify + state capture
3. **[god-mode.ps1]** - Master orchestrator (THIS FILE)
4. **[obi.ps1]** - Wrangler verification + build checks

### Git Toolchain
- **GitKraken** - Visual conflict resolution, branch management
- **GitLens** - Commit history, blame, code lens
- **Kilo** - Agent orchestration, protocol management
- **.github/instructions/** - Copilot custom instructions

### MCP Network
#### Internal MCPs
- Cloudflare (wrangler, DO state, KV)
- Notion (student progress tracking)
- GitHub (PR/issue automation)

#### Customer MCPs (To Implement)
- NotebookLM (lesson generation, audio synthesis)
- Deepgram (voice input/output)
- Stripe (payment + subscription)
- Twilio (SMS for student notifications)

#### Future MCPs
- Google Sheets (student data export)
- Slack (team notifications)
- Discord (bot notifications)

---

## SECTION 3: OPERATIONS CHECKLIST

### Pre-Deploy
- [ ] `god-mode.ps1 -Mode health` passes all checks
- [ ] Doctor config verified (GitHub token, Cloudflare API)
- [ ] Git working tree clean
- [ ] MCP connections tested
- [ ] System state captured in health log

### Deploy to Production
```powershell
# From D:\OB-1
wrangler deploy --env production

# Verify live:
curl https://natural-english-training.net/health

# Cloudflare Analytics:
wrangler tail --format pretty
```

### Incident Response
```powershell
# Full diagnostic bundle
pwsh -File SCRIPTS/god-mode.ps1 -Mode debug

# Quick rollback:
git checkout <last-good-commit>
wrangler deploy --env production
```

---

## SECTION 4: MCP DEVELOPMENT ROADMAP

### Phase 1: NotebookLM Integration ✅ PLAN
**Goal**: Auto-generate lessons + audio from lesson specs

**Implementation**:
```
APPS/NET-PET-AI/src/integrate-notebooklm.js
├── Lesson prompt synthesis
├── Audio generation pipeline
├── Student progress correlation
└── Galaxy Lessons auto-population
```

**Trigger**: 
- Manual: MCP call from command-line
- Scheduled: Nightly lesson generation job
- Manual: Dashboard "Generate Lesson" button

**Output Channels**:
- Notion (lesson metadata)
- R2 (audio files)
- Redis (cache hot lessons)

### Phase 2: Customer Payment Gateway 📋 PLAN
Stripe MCP for:
- Student subscription tier verification
- Lesson unlock based on payment status
- Usage-based billing for power features

---

## SECTION 5: TOOLCHAIN OPTIMIZATION

### VS Code Extensions (Mandatory)
```
GitHub Copilot - AI coding
GitLens - Git history lens
GitKraken - Visual git
Kilo Agent - Codex protocol runner
Notion Web Clipper - Content capture
Google Cloud Code - Cloud integration
```

### Commands & Workflows
```powershell
# Git workflow (GitKraken visual)
gitkraken

# Agent protocol execution (Kilo)
pwsh -File SCRIPTS/obi.ps1 <command>

# Copilot instructions (GitHub)
# See: .github/copilot-instructions.md

# Notion sync (customer learning data)
# See: APPS/NET-PET-AI/src/notion.js
```

---

## SECTION 6: DEBUG PIPELINE

### Log Locations
- System health: `OPERATIONS/system-health-logs/system-health-YYYY-MM-DD.log`
- Git state: `OPERATIONS/system-health-logs/system-state.json`
- Wrangler: `APPS/NET-PET-AI/.wrangler/`
- Build errors: `APPS/NET-PET-AI/err.txt`

### Quick Diagnosis
```powershell
# 1. Environment:
pwsh -File SCRIPTS/god-mode.ps1 -Mode health

# 2. Git state:
git status --short && git log --oneline -5

# 3. Cloudflare:
wrangler whoami && wrangler deployments list

# 4. MCP status:
pwsh -File SCRIPTS/god-mode.ps1 -Mode mcp-audit

# 5. Full bundle (for support):
pwsh -File SCRIPTS/god-mode.ps1 -Mode debug
```

---

## SECTION 7: RUNNING THIS SYSTEM

### Entry Points

**Every Session Start** (Automatic on folder open in VS Code):
```
→ Tasks: ⚡ Super Saiyan - Activate Environment
```

**Manual Health Check**:
```
→ Tasks: 📊 System Health Report
```

**Pre-Deployment**:
```
→ Tasks: ✅ Verify Build
```

**Deploy to Production**:
```
→ Tasks: 🚀 Deploy to Cloudflare
```

---

## SECTION 8: CUSTOMER MCP ROADMAP

### Priority 1: NotebookLM
- [ ] API authentication
- [ ] Prompt templating
- [ ] Audio sync to R2
- [ ] Notion publishing
- [ ] Voice lab HTML UI

### Priority 2: Deepgram
- [ ] Voice input recognition
- [ ] Real-time transcription
- [ ] Feedback voice synthesis
- [ ] Accent preservation

### Priority 3: Payment Gateway
- [ ] Stripe webhook handler
- [ ] Student tier verification
- [ ] Usage-based metrics
- [ ] Invoice dashboard

---

## Last Updated
April 16, 2026 - Phoenix Rising Consolidation Phase
Current Status: ✓ ACTIVE - God Mode Ready
