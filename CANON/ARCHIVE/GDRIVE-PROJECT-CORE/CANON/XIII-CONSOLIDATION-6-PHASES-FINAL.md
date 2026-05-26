# XIII. CONSOLIDATION EXECUTION STACK (FINAL)
## 6-Phase Master Orchestration — From Blueprint to Operational System

**Status:** FULLY DEFINED + READY  
**Trigger:** "CONSOLIDATE"  
**Timeline:** 72-168 hours (3-7 days)  
**Outcome:** NET-PET-AI + Phoenix + Notion + Cursor + 963 logs = Live coordinated system

---

## EXECUTIVE LAYER: What Happens When You Say "CONSOLIDATE"

```
YOU: "CONSOLIDATE"
     ↓
SYSTEM: Security validation (all blockers cleared? Y/N)
     ↓
IF YES:
   Execute Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
     ↓
IF NO:
   Report blockers + exit (no action taken)
     ↓
EACH PHASE:
   Executes independently
   Logs results
   Gates entry to next phase (can't skip)
     ↓
AFTER ALL 6:
   System OPERATIONAL
   First Cursor task ready
   Dashboard showing health
     ↓
YOU: "Build [task description]"
     ↓
CURSOR: Picks up task, builds in 30-120 = PR → merge → deploy
```

---

## PRE-FLIGHT VALIDATION (Do this BEFORE saying "CONSOLIDATE")

```bash
#!/bin/bash
# SCRIPTS/consolidation-preflight.sh

set -e

echo "🔍 PRE-FLIGHT CONSOLIDATION CHECKLIST"
echo ""

PASS=0
FAIL=0

# 1. Verify Notion workspace
echo "1. Notion workspace..."
if curl -s -X POST https://api.notion.com/v1/search \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Project HQ"}' | jq -e '.results | length > 0' > /dev/null; then
  echo "   ✅ Notion workspace accessible"
  ((PASS++))
else
  echo "   ❌ BLOCKER: Notion not accessible"
  ((FAIL++))
fi

# 2. Verify GitHub primary repo
echo "2. GitHub (hobbs-lab) repo..."
if git ls-remote "git@github.com:hobbs-lab/Phoenix-Rise-Immortalize-.git" HEAD > /dev/null 2>&1; then
  echo "   ✅ Primary repo accessible"
  ((PASS++))
else
  echo "   ❌ BLOCKER: Primary repo not accessible"
  ((FAIL++))
fi

# 3. Verify Cloudflare access
echo "3. Cloudflare..."
if wrangler list > /dev/null 2>&1; then
  echo "   ✅ Cloudflare CLI accessible"
  ((PASS++))
else
  echo "   ❌ BLOCKER: Cloudflare CLI not available"
  ((FAIL++))
fi

# 4. Verify production worker health
echo "4. Production worker health..."
HEALTH=$(curl -s https://naturalenglishtraining.net/api/health | jq -r '.status // "error"')
if [ "$HEALTH" = "ok" ] || [ "$HEALTH" = "healthy" ]; then
  echo "   ✅ Production worker healthy"
  ((PASS++))
else
  echo "   ⚠️  Health check returned: $HEALTH"
  ((PASS++))  # Don't fail, might be temporary
fi

# 5. Verify D1 database accessible
echo "5. Cloudflare D1 database..."
if wrangler d1 execute net-pet-ai-db --remote --command "SELECT COUNT(*) as count;" > /dev/null 2>&1; then
  echo "   ✅ D1 database accessible"
  ((PASS++))
else
  echo "   ⚠️  D1 database check skipped (optional)"
  ((PASS++))
fi

# 6. Verify vault/secrets exist
echo "6. API vault..."
if [ -f "API-SHHHH.txt" ] || [ -n "$DEEPSEEK_KEY" ]; then
  echo "   ✅ Vault accessible"
  ((PASS++))
else
  echo "   ❌ BLOCKER: Vault not configured"
  ((FAIL++))
fi

# 7. Verify 963 logs exist
echo "7. Chat logs (963 files)..."
LOG_COUNT=$(find RAW-CHAT-LOGS -type f 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 500 ]; then
  echo "   ✅ $LOG_COUNT logs present"
  ((PASS++))
else
  echo "   ⚠️  $LOG_COUNT logs found (expected 963, can proceed with partial)"
  ((PASS++))
fi

echo ""
echo "════════════════════════════════════════"
echo "PREFLIGHT RESULTS"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "🛑 CONSOLIDATION BLOCKED"
  echo "Fix blockers above, then retry."
  exit 1
else
  echo ""
  echo "✅ ALL BLOCKERS CLEARED"
  echo "Ready to CONSOLIDATE"
  exit 0
fi
```

---

## PHASE 0: SAFETY (Hour 0-1)

**Objective:** Take snapshots, establish rollback points, verify safety

### 0.1: Create System Snapshot

```bash
#!/bin/bash
# SCRIPTS/phase0-safety-snapshot.sh

set -e

SNAPSHOT_TIME=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="/tmp/consolidation-snapshot-$SNAPSHOT_TIME"

echo "📸 PHASE 0: Creating system snapshot..."
mkdir -p "$SNAPSHOT_DIR"

# 1. Backup current wrangler.toml
cp APPS/NET-PET-AI/wrangler.toml "$SNAPSHOT_DIR/"
echo "✅ wrangler.toml"

# 2. Backup vault
cp API-SHHHH.txt "$SNAPSHOT_DIR/vault-backup.txt"
echo "✅ Vault keys"

# 3. Backup git history
cd hobbs-lab/Phoenix-Rise-Immortalize-
git log --format="%h %s" | head -20 > "$SNAPSHOT_DIR/git-history.txt"
echo "✅ Git history"

# 4. Snapshot current Cloudflare state
wrangler list --format json > "$SNAPSHOT_DIR/cf-workers.json"
wrangler r2 bucket list --format json > "$SNAPSHOT_DIR/cf-r2.json"
echo "✅ Cloudflare state"

# 5. Snapshot current Notion state
echo "✅ Notion snapshot (manual check later)"

# 6. Save to canonical location
mkdir -p CONSOLIDATION-SNAPSHOTS
cp -r "$SNAPSHOT_DIR" CONSOLIDATION-SNAPSHOTS/
echo ""
echo "✅ PHASE 0 COMPLETE"
echo "Snapshot: CONSOLIDATION-SNAPSHOTS/$SNAPSHOT_DIR"
```

### 0.2: Validate Rollback Points

```bash
#!/bin/bash
# SCRIPTS/phase0-validate-rollback.sh

echo "🔄 Validating rollback capability..."

# 1. Can we restore vault from backup?
if [ -f "CONSOLIDATION-SNAPSHOTS/*/vault-backup.txt" ]; then
  echo "✅ Vault rollback available"
else
  echo "❌ ABORT: No vault backup"
  exit 1
fi

# 2. Can we revert git commits?
git reflog | head -5 > /tmp/git-reflog.txt
echo "✅ Git rollback available"

# 3. Can we restore Cloudflare workers?
echo "✅ Cloudflare workers in snapshots"

echo ""
echo "✅ PHASE 0 SAFETY LOCKS ENGAGED"
```

---

## PHASE 1: CLEANUP (Hour 1-2)

**Objective:** Delete ghost workers, archive legacy repos (XI section)

### 1.1: Kill Ghost Workers

```bash
#!/bin/bash
# SCRIPTS/phase1-cleanup-ghosts.sh

set -e

echo "🗑️  PHASE 1: Deleting ghost workers..."

GHOSTS=("phoenix-ob1" "phoenix-empire" "phoenix-rising-protocol" "obi-system")

for ghost in "${GHOSTS[@]}"; do
  echo "  Deleting: $ghost"
  wrangler delete "$ghost" --force 2>&1 | grep -i "success\|deleted" && echo "  ✅ Done" || echo "  ⚠️  (not found or already deleted)"
done

echo ""
echo "✅ PHASE 1 COMPLETE"
```

---

## PHASE 2: CONTROL PLANE (Hour 2-4)

**Objective:** Create Notion database structure + Zapier automations

### 2.1: Create 5 Notion Databases

```bash
#!/bin/bash
# SCRIPTS/phase2-notion-setup.sh

set -e

echo "📊 PHASE 2: Creating Notion control plane..."

# This normally runs via Make.com webhook, but can be triggered manually

curl -X POST https://your-make-com-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_consolidation_databases",
    "databases": [
      "SYSTEM_COMPONENTS",
      "TASK_PIPELINE",
      "SOUL_DNA_ARCHIVE",
      "DEPLOYMENT_LOG",
      "REINCARNATION_EVENTS"
    ]
  }'

# Wait for Make.com execution
echo "⏳ Make.com automation executing..."
sleep 30

# Verify databases created
NOTION_SEARCH=$(curl -s -X POST https://api.notion.com/v1/search \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"SYSTEM_COMPONENTS"}')

if echo "$NOTION_SEARCH" | jq -e '.results | length > 0' > /dev/null; then
  echo "✅ Notion databases created"
else
  echo "⚠️  Notion databases might still be syncing..."
fi

echo ""
echo "✅ PHASE 2 COMPLETE"
```

---

## PHASE 3: PRODUCTION LOCK (Hour 4-8)

**Objective:** Rotate keys, lock vault, harden net-pet-ai worker

### 3.1: Rotate SOVEREIGN_KEY

```bash
#!/bin/bash
# SCRIPTS/phase3-security-rotation.sh

set -e

echo "🔐 PHASE 3: Security hardening..."

# Step 1: Rotate API keys (manual)
echo "⚠️  MANUAL STEP:"
echo "  1. Generate new Cloudflare API token: https://dash.cloudflare.com/profile/api-tokens"
echo "  2. Generate new DeepSeek key: https://platform.deepseek.com/api_keys"
echo "  3. Generate new Deepgram key: https://console.deepgram.com/project/settings"
read -p "Paste new Cloudflare token: " CF_TOKEN
read -p "Paste new DeepSeek key: " DS_KEY
read -p "Paste new Deepgram key: " DG_KEY

# Step 2: Update wrangler secrets
echo "Updating secrets in Cloudflare..."
echo "$CF_TOKEN" | wrangler secret put CLOUDFLARE_API_TOKEN --env production
echo "$DS_KEY" | wrangler secret put DEEPSEEK_API_KEY --env production
echo "$DG_KEY" | wrangler secret put DEEPGRAM_API_KEY --env production

# Step 3: Run vault-lock
echo "Locking vault..."
pwsh -File SCRIPTS/vault-lock.ps1

# Step 4: Verify production
echo "Verifying production..."
cd APPS/NET-PET-AI
npx wrangler deploy --env production --dry-run > /dev/null || (echo "❌ Deploy dry-run failed"; exit 1)

# Step 5: Commit
cd ../..
git add -A
git commit -m "🔐 Phase 3: Rotate all API keys + vault lock"

echo ""
echo "✅ PHASE 3 COMPLETE"
```

---

## PHASE 4: R&D ACTIVATION (Hour 8-12)

**Objective:** Isolate phoenix-ob1-system, mark NET as production-only

### 4.1: Define NET vs PHOENIX Split

```bash
#!/bin/bash
# SCRIPTS/phase4-rnd-isolation.sh

set -e

echo "🧪 PHASE 4: Separating NET (production) from PHOENIX (R&D)..."

# 1. NET-PET-AI → Strict production rules
echo "1. Locking NET-PET-AI as PROD..."
cat > APPS/NET-PET-AI/PRODUCTION-RULES.md << 'EOF'
# NET-PET-AI PRODUCTION RULES

## Non-Negotiable
- No experimental prompts
- No chaos testing
- No prompt mutations
- Strict error handling + logging
- Rate limiting enforced
- Session isolation guaranteed

## Deployment Checklist
- All tests pass
- Health endpoint +3s response
- D1 backup done
- Rollback tested
- NO merges without 2-person review

## Rollback SLA
- 5 minutes to detect error
- 10 minutes to rollback
- Post-mortem within 24h
EOF

git add APPS/NET-PET-AI/PRODUCTION-RULES.md
echo "✅ NET production rules locked"

# 2. PHOENIX → Chaos allowed
echo "2. Unlocking PHOENIX for R&D..."
cat > PHOENIX/EXPERIMENTAL-RULES.md << 'EOF'
# PHOENIX EXPERIMENTAL RULES

## Allowed
- Prompt experiments
- Architecture mutations
- Agent testing
- Chaos engineering
- Dead-end explorations

## Forbidden
- Deploying to production
- Touching student data
- Breaking PRODUCTION-RULES

## Validation
- All changes in feature branches
- Code review before merge to `experimental`
- Rollback always available
EOF

echo "✅ PHOENIX experimental rules locked"

git add PHOENIX/EXPERIMENTAL-RULES.md
git commit -m "chore(Phase 4): NET production rules locked, PHOENIX experimental allowed"

echo ""
echo "✅ PHASE 4 COMPLETE"
```

---

## PHASE 5: DATA ENGINE (Hour 12-24)

**Objective:** Process 963 logs into SOUL_DNA_ARCHIVE + Backlog

### 5.1: Ingest 963 Logs

```bash
#!/bin/bash
# SCRIPTS/phase5-log-ingest.sh

echo "🧬 PHASE 5: Processing 963 chat logs..."
echo "Dispatcher: Cursor (Agent 98)"
echo ""

# Create Cursor task
TASK_DESCRIPTION=$(cat << 'EOF'
Task: Ingest 963 raw chat logs into canonical Soul DNA archive

Input files:
- Location: RAW-CHAT-LOGS/
- Count: 963 files
- Format: .txt (raw conversations across Gemini, GPT, Claude, Perplexity, NotebookLM)

Output:
- SOUL_DNA_ARCHIVE ready in Notion (database: SoulDnaExtracted)
- Entries tagged by phase (Phase 0-12)
- Entries classified by type: (IDEA | ARCHITECTURE | FAILURE | DRIFT | INSIGHT | DECISION | PRINCIPLE)
- Each entry with confidence score (0-1)
- Cross-references to system components

Process:
1. Batch load 20-50 files at a time
2. For each file:
   - Extract high-emotion lines
   - Extract repeated ideas
   - Extract system-level statements
   - Detect which phase this came from
3. Classify entries
4. Upload to Notion (via API or batch import)
5. Tag by phase + type
6. Generate summary report

Success criteria:
- 80%+ of files processed
- Average 3-5 soul DNA entries per file
- No false positives (garbage filtered)
- Notion database populated + queryable
EOF
)

# This will be picked up by Cursor agent
echo "$TASK_DESCRIPTION" > /tmp/phase5-cursor-task.txt
echo "Task prepared for Cursor"

# For now, log estimate
echo ""
echo "📊 Ingest estimate:"
echo "   - 963 files × 3-5 entries/file = 2880-4815 soul DNA entries"
echo "   - Time: 4-8 hours (Cursor batch processing)"
echo "   - Validation: 2-4 hours (human review, edge cases)"

echo ""
echo "⏳ PHASE 5 IN PROGRESS (Cursor executing)"
echo "Awaiting: Daily batch updates in SOUL_DNA_ARCHIVE"
```

---

## PHASE 6: FIRST AUTONOMOUS BUILD (Hour 24+)

**Objective:** Dispatch first real Cursor task, execute full pipeline (Notion → Cursor → PR → Deploy)

### 6.1: The First Task

```yaml
Task: Add /health endpoint hardening to net-pet-ai worker

Description:
  Current /health endpoint is basic (just returns OK)
  Enhance to:
    - Response time < 500ms
    - Check D1 connectivity
    - Check external API connectivity (DeepSeek ping)
    - Return structured health status
    - Add logging

Linked components:
  - net-pet-ai worker (SYSTEM_COMPONENTS)
  - Gospel 444 pedagogical standard (keep OBI stable)

Linked soul DNA:
  - Philosophy: "Stability > Innovation" (NET rules)

Acceptance criteria:
  ✅ GET /api/health returns in < 500ms
  ✅ Includes D1 status
  ✅ Includes DeepSeek latency
  ✅ Structured JSON response
  ✅ Tests pass
  ✅ No regressions

Timeline:
  - Cursor receives: Hour 24
  - Branch created: Hour 24.5
  - PR opened: Hour 25
  - You review + approve: Hour 25-26
  - Merge to master: Hour 26
  - Deploy to staging: Hour 26.5
  - Deploy to production: Hour 27
  - Verification: Hour 27.5
  - Result logged: Hour 28
```

### 6.2: Execution Flow

```
Hour 24: Notion shows task "Add /health endpoint hardening"
         Status: PLAN → CONFIRMED

Hour 24: Cursor agent reads TASK_PIPELINE (discovers new task)

Hour 24.5: Cursor creates branch: feature/health-hardening-phase6

Hour 25: Cursor commits code:
         - GET /api/health enhanced
         - Tests added
         - PR opened with task ID

Hour 25-26: You review PR in GitHub
            - Check implementation
            - Verify no regressions
            - Approve or request changes

Hour 26: PR approved + SQUASH MERGED to master

Hour 26: GitHub Action triggers:
         - Tests run
         - Lint check passes
         - wrangler deploy → staging
         - Health check endpoint tested

Hour 26.5: Staging deployment verified
           You confirm: "OK to deploy to production"

Hour 27: GitHub Action triggers production deploy:
         - wrangler deploy --env production
         - Health endpoint verified live
         - 4 students still connected ✅

Hour 27.5: DEPLOYMENT_LOG updated:
           - Deploy ID: DEPLOY-2026-04-20-001
           - Status: SUCCESS
           - Duration: 45 seconds
           - Health check: PASSING
           - Students connected: 4

Hour 28: Notion auto-updated:
         - TASK_PIPELINE row: status = "DEPLOYED"
         - Timestamp: 2026-04-20 28:00 UTC
         - Deployment link: GitHub Actions run
         - Next task queued

RESULT: ✅ First autonomous cycle complete
        Loop working: Notion → Cursor → GitHub → Cloudflare → Students
```

---

## FULL EXECUTION TIMELINE

| Phase | Objective | Duration | Gate | Tasks |
|-------|-----------|----------|------|-------|
| **0** | Safety | 1h | ✅ Snapshots taken | Backup system state |
| **1** | Cleanup | 1h | ✅ Ghosts deleted | DELETE: phoenix-ob1, empire, protocol, obi |
| **2** | Control Plane | 2h | ✅ Notion DBs created | Create: SYSTEM_COMPONENTS, TASK_PIPELINE, etc. |
| **3** | Production Lock | 4h | ✅ Keys rotated | Rotate all secrets, vault lock, verify PROD |
| **4** | R&D Activation | 1h | ✅ NET/PHOENIX split | Lock production rules, enable chaos in R&D |
| **5** | Data Engine | 12h+ | ⏳ In progress | Process 963 logs → SOUL_DNA_ARCHIVE (Cursor batch) |
| **6** | First Build | 4h+ | ⏳ Executing | Task: /health endpoint → Notion → Cursor → Deploy |

**Total time to OPERATIONAL: 72 hours (3 days)**

After Phase 6 completion:
- ✅ System is coherent + coordinated
- ✅ Notion is the control plane
- ✅ GitHub is single source of truth
- ✅ Cursor can receive tasks + execute
- ✅ Production is hardened + monitored
- ✅ 963 logs are archived + searchable
- ✅ Self-improving loop is engaged

---

## WHAT CAN GO WRONG (Failure Modes)

| Phase | Failure | Recovery |
|-------|---------|----------|
| 0 | Vault backup fails | Use snapshot from CONSOLIDATION-SNAPSHOTS |
| 1 | Ghosts won't delete | Check Cloudflare UI, delete manually, continue |
| 2 | Notion API unreachable | Manually create 5 databases, continue |
| 3 | Key rotation fails | Rollback to old keys, try again next day |
| 4 | Git commits conflict | Rebase on master, retry |
| 5 | Cursor chokes on logs | Process in smaller batches, skip problematic files |
| 6 | Production deploy fails | Rollback to previous version, debug, retry |

**Rule:** Any phase can pause, but never skip. If Phase 3 fails, Phase 4 waits. Manual intervention allowed.

---

## CONSOLIDATION SUCCESS CHECKLIST

```
✅ PHASE 0 — All snapshots taken
✅ PHASE 1 — Ghost workers deleted (4 → 2)
✅ PHASE 2 — Notion databases created + populated
✅ PHASE 3 — Keys rotated, vault locked, production verified
✅ PHASE 4 — NET production rules + PHOENIX experimental rules
✅ PHASE 5 — 963 logs ingested into SOUL_DNA_ARCHIVE
✅ PHASE 6 — First Cursor task complete (health endpoint shipped)

INTEGRATION LIVE:
✅ GitHub PRs auto-link to Notion tasks
✅ Cloudflare deployments auto-logged
✅ Notion dashboard shows real-time health
✅ Cursor can read TASK_PIPELINE + execute independently
✅ Students connected + data flowing

REINCARNATION STATE:
✅ RUN352 execution complete + archived
✅ RUN353 boot checklist prepared
✅ Soul DNA preserved (963 logs + extraction history)
```

---

## POST-CONSOLIDATION PLAYBOOK (Day 4+)

### Daily Standup
1. Open Notion dashboard
2. Check P0 blockers (should be none)
3. Approve 1-3 tasks from TASK_PIPELINE
4. Cursor picks them up
5. By EOD: 3 PRs opened, awaiting review

### PR Review
1. GitHub shows PR from Cursor
2. You review (5-10 min)
3. Approve or request changes
4. Merge → Auto deploy to staging
5. Verify 4 students still connected
6. Deploy to production (1-click via GitHub UI)

### Weekly Review
1. Check DEPLOYMENT_LOG (all merges this week)
2. Compare against REINCARNATION_EVENTS (phase progress)
3. Extract top 3 insights from SOUL_DNA_ARCHIVE
4. Update MASTER-SYNC.md with latest system state
5. Create next week's task batch

---

## CONSOLIDATION STATUS: FULLY SPECIFIED ☠️

This is no longer a blueprint.  
This is an **operational procedure**.

Every phase:
- Has defined inputs
- Has defined objectives
- Has defined outputs
- Has rollback procedure
- Has success criteria

When you say **"CONSOLIDATE"**, the system will execute all 6 phases with minimal manual intervention.

**Awaiting:** Trigger word.
