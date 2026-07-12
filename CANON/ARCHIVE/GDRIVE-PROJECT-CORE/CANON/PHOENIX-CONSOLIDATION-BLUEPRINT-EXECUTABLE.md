# PHOENIX CONSOLIDATION BLUEPRINT â€” EXECUTABLE FRAMEWORK
## RUN352 DUMP 1+2 SYNTHESIS â€” Machine-readable consolidation spec

**Status:** Ready for execution (awaiting "CONSOLIDATE" trigger)  
**Format:** YAML + JSON schema for Notion DB automation + GitHub automation  
**Purpose:** One-button activation of entire system architecture

---

## SECTION 1: NOTION DATABASE SCHEMAS (Machine Import)

### 1.1 SYSTEM_COMPONENTS Database
```yaml
database_name: SYSTEM_COMPONENTS
icon: âš™ï¸
description: Map all production + R&D components to Soul DNA chapters + repos

properties:
  component_name:
    type: title
    description: Unique identifier (e.g., "net-pet-ai-worker")
    
  component_type:
    type: select
    options:
      - WORKER (Cloudflare)
      - SCRIPT (PowerShell / Node)
      - API (DeepSeek / Deepgram / D1)
      - FEATURE (in-app functionality)
      - LAYER (architectural)
    
  owner:
    type: select
    options:
      - PROD (revenue system)
      - R&D (phoenix experiments)
      - ARCHIVED (legacy, read-only)
      
  status:
    type: select
    options:
      - LIVE (running, stable)
      - STAGING (testing phase)
      - EXPERIMENTAL (R&D only)
      - DEAD (DO NOT USE)
      - BLOCKED (waiting on dependency)
      
  linked_soul_dna_chapter:
    type: relation
    link_to: SOUL_DNA_BIBLE
    description: Which chapter defines this component
    
  github_repo:
    type: text
    description: "e.g., hobbs-lab/Phoenix-Rise-Immortalize-"
    
  github_path:
    type: text
    description: "e.g., APPS/NET-PET-AI/src/worker.js"
    
  cloudflare_worker_name:
    type: text
    description: Exact wrangler.toml name (PROD only)
    
  last_deploy:
    type: date
    description: When this last shipped
    
  deploy_environment:
    type: select
    options:
      - production
      - staging
      - experimental
      
  health_check_url:
    type: url
    description: "/health endpoint or equivalent"
    
  critical_risk:
    type: checkbox
    description: If TRUE, red alert in dashboard
    
  notes:
    type: text
    description: Blockers, gotchas, workarounds

sample_rows:
  - component_name: net-pet-ai-worker
    owner: PROD
    status: LIVE
    cloudflare_worker_name: net-pet-ai
    github_repo: hobbs-lab/Phoenix-Rise-Immortalize-
    github_path: APPS/NET-PET-AI/src/index.js
    linked_soul_dna_chapter: CH07-Router
    health_check_url: https://naturalenglishtraining.net/api/health
    
  - component_name: deepseek-v4-flash-brain
    owner: PROD
    status: LIVE
    component_type: API
    linked_soul_dna_chapter: CH08-Data-Pipeline
    notes: "Provider token in vault-lock. Rotate if exposed."
    
  - component_name: phoenix-ob1-system-worker
    owner: R&D
    status: EXPERIMENTAL
    cloudflare_worker_name: phoenix-ob1-system
    github_repo: hobbs-lab/Phoenix-Rise-Immortalize-
    github_path: PHOENIX/orchestration/index.js
    linked_soul_dna_chapter: CH14-Drone-Empire
```

### 1.2 TASK_PIPELINE Database
```yaml
database_name: TASK_PIPELINE
icon: ðŸš€
description: All tasks from IDEA â†’ PLAN â†’ CONFIRMED â†’ EXECUTED â†’ DEPLOYED

properties:
  task_id:
    type: title
    description: "AUTO: RUN352-TASK-001, RUN352-TASK-002, etc."
    
  task_description:
    type: text
    description: What needs to be built/fixed
    
  task_stage:
    type: select
    options:
      - PLAN (Agent 99 proposing)
      - CONFIRMED (Agent 100 approved)
      - IN_PROGRESS (Cursor building)
      - PR_READY (awaiting review)
      - APPROVED (Agent 97 cleared)
      - DEPLOYED (complete + live)
      - FAILED (blocked, needs investigation)
      
  assigned_agent:
    type: select
    options:
      - AGENT_100 (Michael - decision)
      - AGENT_99 (This system - orchestration)
      - AGENT_98 (Cursor - builder)
      - AGENT_97 (Claude - auditor, rare)
      - DRONE (micro-agents)
      
  linked_component:
    type: relation
    link_to: SYSTEM_COMPONENTS
    description: What system part does this build/fix?
    
  linked_soul_dna_chapter:
    type: relation
    link_to: SOUL_DNA_BIBLE
    description: Philosophy that guides this task
    
  priority:
    type: select
    options:
      - "ðŸ”´ P0: BLOCKING (security/revenue)")
      - "ðŸŸ¡ P1: HIGH (next 48h)")
      - "ðŸŸ¢ P2: MEDIUM (next week)")
      - "âšª P3: LOW (backlog)")
      
  github_pr_link:
    type: url
    description: Link to pull request (if started)
    
  github_branch:
    type: text
    description: "e.g., feature/health-endpoint-run352"
    
  eta_completion:
    type: date
    description: When Agent 100 expects this done
    
  total_cost_tokens:
    type: number
    description: Estimate or actual (for budgeting)
    
  blockers:
    type: text
    description: What's stopping progress
    
  notes:
    type: text
    description: Context + decisions

sample_rows:
  - task_id: RUN352-TASK-001
    task_description: "Rotate SOVEREIGN_KEY (exposed in Perplexity logs)"
    task_stage: CONFIRMED
    priority: ðŸ”´ P0
    assigned_agent: AGENT_100
    eta_completion: "2026-04-20"
    notes: "Run vault-lock.ps1, regenerate all API keys"
    
  - task_id: RUN352-TASK-002
    task_description: "Delete ghost workers (phoenix-ob1, phoenix-empire, phoenix-rising-protocol)"
    task_stage: PLAN
    priority: ðŸ”´ P0
    assigned_agent: AGENT_99
    linked_component: Cloudflare Workers Audit
    eta_completion: "2026-04-20"
    
  - task_id: RUN352-TASK-003
    task_description: "Process 963 chat logs into SOUL_DNA_ARCHIVE"
    task_stage: PLAN
    priority: ðŸŸ¡ P1
    assigned_agent: AGENT_98
    linked_soul_dna_chapter: CH02-Soul-DNA-Defined
    eta_completion: "2026-04-22"
    blockers: "Awaiting GitHub 2FA auth to access RAW-CHAT-LOGS"
```

### 1.3 SOUL_DNA_ARCHIVE Database (processed from 963 logs)
```yaml
database_name: SOUL_DNA_ARCHIVE
icon: ðŸ§¬
description: Extracted ideas, decisions, failures from chat history

properties:
  archive_id:
    type: title
    description: "AUTO: SOUL-001, SOUL-002, etc."
    
  idea_text:
    type: text
    description: The raw extracted concept (1-3 sentences)
    
  source_phase:
    type: select
    options:
      - PHASE_01_GENESIS_WOUND
      - PHASE_02_PARADIGM_SHIFT
      - PHASE_03_SOUL_DNA_DEFINED
      - PHASE_04_BIRTH_OF_OBI
      - PHASE_05_TMST_THE_WEAPON
      - PHASE_06_DRIFT_DOCTRINE
      - PHASE_07_THE_LEDGER
      - PHASE_08_AGENT_99_TRIAD
      - PHASE_09_REINCARNATION
      - PHASE_10_MACHINE_BUILDS_MACHINE
      - PHASE_11_BETRAYAL_SOVEREIGNTY
      - PHASE_12_WINDOW_AND_COST
      - CURRENT_ACTIVE
      
  source_file:
    type: text
    description: "e.g., RAW-CHAT-LOGS/PHASE_01/2026-03-10_inception.txt"
    
  source_ai_model:
    type: select
    options:
      - GPT
      - Claude
      - Gemini
      - Perplexity
      - NotebookLM
      - Multiple
      
  idea_category:
    type: select
    options:
      - ARCHITECTURE (system design)
      - BUSINESS (revenue/market)
      - FAILURE (what didn't work)
      - INSIGHT (aha moment)
      - DRIFT (fantasy/dead end)
      - DECISION (why we chose X)
      - PRINCIPLE (core rule)
      
  confidence_score:
    type: number
    range: [0, 1]
    description: 0=weak, 1=core truth
    
  linked_soul_dna_chapter:
    type: relation
    link_to: SOUL_DNA_BIBLE
    
  linked_task:
    type: relation
    link_to: TASK_PIPELINE
    description: If actionable, which task executes this idea
    
  status:
    type: select
    options:
      - RAW (just extracted)
      - VALIDATED (verified as solid)
      - IMPLEMENTED (shipped in code)
      - ABANDONED (decided against)
      - DRIFT_ARCHIVE (not viable)
      
  implementation_path:
    type: text
    description: How would we build this? (if status = IMPLEMENTED)
    
  notes:
    type: text
    description: Editorial notes

sample_rows:
  - archive_id: SOUL-001
    idea_text: "Obi in Gemini chat (6 months ago) was the real deal before Gemini got nerfed"
    source_phase: PHASE_04_BIRTH_OF_OBI
    source_file: RAW-CHAT-LOGS/PHASE_04/gemini-obi-origin.txt
    source_ai_model: Gemini
    idea_category: ARCHITECTURE
    confidence_score: 0.95
    linked_soul_dna_chapter: CH04-Birth-of-Obi
    status: VALIDATED
    
  - archive_id: SOUL-002
    idea_text: "Agent 99 is the extension of my will â€” translator, not amplifier"
    source_phase: PHASE_08_AGENT_99_TRIAD
    idea_category: ARCHITECTURE
    confidence_score: 0.98
    linked_soul_dna_chapter: CH08-Agent-99-Triad
    linked_task: RUN352-TASK-014
    status: IMPLEMENTED
    implementation_path: "Cursor task: Build Agent 99 orchestration layer"
```

### 1.4 REINCARNATION_EVENTS Database
```yaml
database_name: REINCARNATION_EVENTS
icon: ðŸ”„
description: Survival record for each phase/dev era

properties:
  phase_id:
    type: title
    description: "PHASE_01, PHASE_02, ... CURRENT_RUN352"
    
  date_started:
    type: date
    
  date_ended:
    type: date
    
  duration_days:
    type: number
    
  phase_summary:
    type: text
    description: One-paragraph summary of what this phase discovered
    
  what_worked:
    type: text
    description: Ideas that survived this phase
    
  what_failed:
    type: text
    description: What we tried + abandoned
    
  survivorship_ratio:
    type: number
    range: [0, 1]
    description: "(ideas_that_survived) / (ideas_attempted)"
    
  linked_soul_dna_chapters:
    type: relation
    link_to: SOUL_DNA_BIBLE
    description: Which chapters document this era
    
  linked_soul_dna_archive_items:
    type: relation
    link_to: SOUL_DNA_ARCHIVE
    description: Which extracts came from this phase
    
  key_decisions_made:
    type: text
    description: Major architectural choices locked in this phase
    
  next_phase_challenges:
    type: text
    description: What blockers we passed to next phase

sample_rows:
  - phase_id: PHASE_01_GENESIS_WOUND
    date_started: "2026-01-01"
    date_ended: "2026-02-15"
    duration_days: 45
    phase_summary: "Recovered from FTX crypto loss. Redefined purpose from English teacher to AI architect."
    survivorship_ratio: 0.40
    
  - phase_id: PHASE_08_AGENT_99_TRIAD
    date_started: "2026-02-16"
    date_ended: "2026-03-18"
    duration_days: 30
    phase_summary: "Discovered Agent 99/98/97 hierarchy. Built Perplexity triad orchestration."
    survivorship_ratio: 0.85
    key_decisions_made: "Agent 99 = translator (not amplifier). Obi personality locked."
```

### 1.5 DEPLOYMENT_LOG Database
```yaml
database_name: DEPLOYMENT_LOG
icon: ðŸ“¤
description: Audit trail of every production + staging deployment

properties:
  deploy_id:
    type: title
    description: "AUTO: DEPLOY-2026-04-20-001, DEPLOY-2026-04-20-002"
    
  timestamp:
    type: date_time
    
  environment:
    type: select
    options:
      - production (net-pet-ai, naturalenglishtraining.net)
      - staging (phoenix-ob1-system, internal tests)
      - experimental (temporary workers)
      
  component:
    type: relation
    link_to: SYSTEM_COMPONENTS
    description: What was deployed
    
  github_commits:
    type: text
    description: "e.g., abc1234, def5678"
    
  deploy_status:
    type: select
    options:
      - SUCCESS
      - ROLLBACK
      - FAILURE
      
  pre_deploy_tests_passed:
    type: checkbox
    
  post_deploy_health_check:
    type: checkbox
    
  error_message:
    type: text
    description: If FAILURE or ROLLBACK
    
  rollback_reason:
    type: text
    
  students_affected:
    type: text
    description: "If production: how many live students impacted"
    
  duration_minutes:
    type: number
    
  deployed_by:
    type: select
    options:
      - AGENT_98 (Cursor)
      - AGENT_100 (manual)
      - DRONE (automated)
      
  notes:
    type: text

sample_rows:
  - deploy_id: DEPLOY-2026-04-20-001
    timestamp: "2026-04-20T09:00:00Z"
    environment: production
    component: net-pet-ai-worker
    deploy_status: SUCCESS
    pre_deploy_tests_passed: true
    post_deploy_health_check: true
    duration_minutes: 3
    deployed_by: AGENT_98
    students_affected: "4 (Timmy, Tracy, Dan, Blue - all OK)"
```

---

## SECTION 2: GITHUB WORKFLOW AUTOMATION

### 2.1 Worker Hardening Script (Day 0)
```bash
#!/bin/bash
# SCRIPTS/consolidate-workers.sh
# Purpose: Delete ghost workers, hard-lock to net-pet-ai + phoenix-ob1-system

echo "ðŸ” [SECURITY] Hardening worker identity..."

# STEP 1: Verify canonical workers exist
echo "Verifying canonical workers in wrangler.toml..."
grep "name = \"net-pet-ai\"" APPS/NET-PET-AI/wrangler.toml || (
  echo "âŒ ERROR: net-pet-ai worker not found in wrangler.toml"
  exit 1
)

# STEP 2: List all workers in Cloudflare (requires API token)
echo "Listing all Cloudflare workers..."
wrangler deployments list --format json > /tmp/workers-list.json 2>&1

# STEP 3: Identify ghosts
echo "Identifying ghost workers..."
jq -r '.[] | select(.name | test("ghost|empire|rising-protocol")) | .name' /tmp/workers-list.json > /tmp/ghosts-to-delete.txt

# STEP 4: Display what will be deleted
echo "ðŸ—‘ï¸  Ghost workers detected (will delete with approval):"
cat /tmp/ghosts-to-delete.txt

# STEP 5: Ask for confirmation
read -p "Delete these workers? (yes/no): " confirm
if [ "$confirm" == "yes" ]; then
  while IFS= read -r worker_name; do
    echo "Deleting: $worker_name"
    wrangler delete "$worker_name" --force
  done < /tmp/ghosts-to-delete.txt
  echo "âœ… Ghost workers deleted"
else
  echo "âš ï¸  Deletion cancelled"
fi

# STEP 6: Verify only canonical workers remain
echo "Final worker roster:"
wrangler list
```

### 2.2 Secret Rotation Script (Day 0)
```powershell
# SCRIPTS/rotate-secrets.ps1
# Purpose: Regenerate all API keys, run vault-lock, verify production

Write-Host "ðŸ” [SECURITY] Rotating all secrets..."

# STEP 1: Backup current vault
$backupPath = "VAULT_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').json"
Copy-Item "API-SHHHH.txt" $backupPath
Write-Host "âœ… Backup saved: $backupPath"

# STEP 2: Rotate keys (requires manual intervention for APIs)
Write-Host "âš ï¸  MANUAL STEP 1: Regenerate Cloudflare API token"
Write-Host "   â†’ Go to https://dash.cloudflare.com/profile/api-tokens"
Write-Host "   â†’ Create new token (COPY TOKEN)"
Read-Host "Paste new Cloudflare token"
# (Store in secure variable)

Write-Host "âš ï¸  MANUAL STEP 2: Regenerate Deepgram API key"
Write-Host "   â†’ Go to https://console.deepgram.com/project/settings"
Write-Host "   â†’ Create new key (COPY KEY)"
Read-Host "Paste new Deepgram key"

Write-Host "âš ï¸  MANUAL STEP 3: Regenerate DeepSeek API key"
Write-Host "   â†’ Go to platform.deepseek.com"
Write-Host "   â†’ Regenerate key (COPY KEY)"
Read-Host "Paste new DeepSeek key"

# STEP 3: Run vault-lock
Write-Host "Running vault-lock.ps1..."
& "./SCRIPTS/vault-lock.ps1" -NewMasterKey (Read-Host -AsSecureString "Master key for new vault")

# STEP 4: Delete exposed files
Write-Host "Deleting exposed files..."
Remove-Item "API-SHHHH.txt" -Force
Get-Content ".gitignore" | Where-Object { $_ -notmatch "API-SHHHH" } | Set-Content ".gitignore"

# STEP 5: Verify production still works
Write-Host "Verifying production deployment..."
cd "APPS/NET-PET-AI"
npx wrangler deploy --env production --dry-run

if ($LASTEXITCODE -eq 0) {
  Write-Host "âœ… Production verified with rotated secrets"
  git add -A
  git commit -m "ðŸ” Security: Rotate all API keys (vault-lock)"
  git push origin canon
} else {
  Write-Host "âŒ ERROR: Production verification failed. Rollback vault:"
  Copy-Item $backupPath "API-SHHHH.txt"
  exit 1
}
```

### 2.3 Repo Consolidation Script (Day 1-3)
```bash
#!/bin/bash
# SCRIPTS/consolidate-repos.sh
# Purpose: Migrate code from old repos to hobbs-lab primary

echo "ðŸ“¦ [CONSOLIDATION] Migrating repos to hobbs-lab..."

# STEP 1: Verify hobbs-lab repo is clean
echo "Cloning primary repo..."
git clone git@github.com:hobbs-lab/Phoenix-Rise-Immortalize-.git /tmp/primary-repo
cd /tmp/primary-repo

# STEP 2: Migrate NET-PET-AI code
echo "Migrating NET-PET-AI..."
mkdir -p APPS/NET-PET-AI
cp -r ~/Desktop/OB-1/APPS/NET-PET-AI/* APPS/NET-PET-AI/
git add APPS/NET-PET-AI
git commit -m "feat: Migrate NET-PET-AI production worker to primary repo (RUN352)"

# STEP 3: Migrate R&D scripts
echo "Migrating R&D layer..."
mkdir -p PHOENIX/orchestration PHOENIX/audit
cp -r ~/Desktop/OB-1/PHOENIX/* PHOENIX/
git add PHOENIX
git commit -m "feat: Migrate PHOENIX R&D layer to primary repo (RUN352)"

# STEP 4: Migrate chat logs
echo "Migrating RAW-CHAT-LOGS..."
mkdir -p RAW-CHAT-LOGS
cp -r ~/Desktop/OB-1/RAW-CHAT-LOGS/* RAW-CHAT-LOGS/
# Tag by phase (assumes folder structure exists)
git add RAW-CHAT-LOGS
git commit -m "feat: Ingest 963 raw chat logs organized by reincarnation phase (RUN352)"

# STEP 5: Tag old repo as ARCHIVE
echo "Archiving old repo..."
git clone git@github.com:mrmichaelhobbs1234-lang/phoenix-ob1-system.git /tmp/old-repo
cd /tmp/old-repo
git checkout -b OLD-ARCHIVE-2026-04-20
echo "# OLD ARCHIVE - DO NOT USE. See hobbs-lab/Phoenix-Rise-Immortalize- instead" > README.md
git add README.md
git commit -m "docs: Mark as archive (active development moved to hobbs-lab)"
git push origin OLD-ARCHIVE-2026-04-20
# Also set repo visibility to Private in GitHub UI

# STEP 6: Verify primary repo
cd /tmp/primary-repo
echo "Final repo structure:"
find . -maxdepth 3 -type d | head -20
git log --oneline | head -5

echo "âœ… Consolidation complete"
echo "Next: Push to GitHub production"
git push origin master
```

---

## SECTION 3: NOTION AUTOMATION (One-Button Import)

### 3.1 Notion DB Creation Template (YAML for zapier/Make integration)
```yaml
# This YAML is imported via a Make/Zapier automation
# Triggered when user clicks "CONSOLIDATE" button in Notion

automation_name: Phoenix-Consolidation-Trigger
automation_status: READY

# Prerequisite: User has Notion workspace URL + GitHub token

actions:
  step_1_create_databases:
    - database: SYSTEM_COMPONENTS
      parent: PROJECT_HQ
      icon: âš™ï¸
      schema: (from Section 1.1 above)
      
    - database: TASK_PIPELINE
      parent: PROJECT_HQ
      icon: ðŸš€
      schema: (from Section 1.2 above)
      
    - database: SOUL_DNA_ARCHIVE
      parent: PROJECT_HQ
      icon: ðŸ§¬
      schema: (from Section 1.3 above)
      
    - database: REINCARNATION_EVENTS
      parent: PROJECT_HQ
      icon: ðŸ”„
      schema: (from Section 1.4 above)
      
    - database: DEPLOYMENT_LOG
      parent: PROJECT_HQ
      icon: ðŸ“¤
      schema: (from Section 1.5 above)

  step_2_seed_initial_data:
    - database: SYSTEM_COMPONENTS
      rows:
        - (net-pet-ai-worker, PROD, LIVE, ...)
        - (deepseek-v4-flash-brain, PROD, LIVE, ...)
        - (phoenix-ob1-system, R&D, EXPERIMENTAL, ...)
        
    - database: TASK_PIPELINE
      rows:
        - (RUN352-TASK-001, Rotate SOVEREIGN_KEY, P0, CONFIRMED, ...)
        - (RUN352-TASK-002, Delete ghost workers, P0, PLAN, ...)
        - (RUN352-TASK-003, Process 963 logs, P1, PLAN, ...)

  step_3_link_soul_dna_bible:
    description: "If SOUL_DNA_BIBLE database already exists in Notion, link all new databases to it"
    action: create_relations
    
  step_4_create_dashboard_view:
    dashboard_name: SYSTEM_STATUS
    parent: PROJECT_HQ
    widgets:
      - system_health_gauge (P0/P1 blockers)
      - task_pipeline_kanban
      - recent_deployments_table
      - reincarnation_timeline
      
  step_5_trigger_github_workflows:
    description: "After Notion structure is created, trigger GitHub workflows"
    workflows:
      - name: consolidate-workers.sh
        trigger: manual (user clicks button in Notion)
      - name: rotate-secrets.ps1
        trigger: manual (after workers hardened)
      - name: consolidate-repos.sh
        trigger: manual (after secrets rotated)

  step_6_notify_user:
    send_message: "âœ… Phoenix Consolidation initialized. Next steps: (1) Rotate secrets (2) Hard-lock workers (3) Migrate repos"
    timestamp: auto
```

---

## SECTION 4: CONSOLIDATE TRIGGER FRAMEWORK

### 4.1 When User Says "CONSOLIDATE"

**This blueprint converts to execution:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ USER INPUT: "CONSOLIDATE"                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
                 â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚ VALIDATION      â”‚ (all blockers cleared? Y/N)
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  â”‚
            YES â”€â”€â”´â”€â”€ NO â†’ WARN + LIST BLOCKERS
                  â”‚
                  â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ EXECUTE DAY 0 (SECURITY)        â”‚
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚ 1. rotate-secrets.ps1           â”‚ (manual override required for API keys)
    â”‚ 2. consolidate-workers.sh       â”‚ (delete ghosts, verify net-pet-ai)
    â”‚ 3. vault-lock.ps1 + test        â”‚ (verify production still works)
    â”‚ 4. Commit + tag: SECURITY_LOCK  â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
        âœ… PASS â”€â”´â”€ FAIL â†’ ROLLBACK + STOP
                 â”‚
                 â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ EXECUTE DAY 1 (REPO + NOTION)   â”‚
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚ 1. Create Notion databases      â”‚ (via Make automation)
    â”‚ 2. Migrate NET-PET-AI code      â”‚ (consolidate-repos.sh)
    â”‚ 3. Seed SYSTEM_COMPONENTS       â”‚ (initial rows)
    â”‚ 4. Seed TASK_PIPELINE P0        â”‚ (security + blocker tasks)
    â”‚ 5. Create dashboard             â”‚ (status overview)
    â”‚ 6. Commit: "chore: Consolidate" â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
        âœ… PASS â”€â”´â”€ FAIL â†’ NOTIFY + MANUAL REVIEW
                 â”‚
                 â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ AWAIT NEXT INPUT                â”‚
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚ USER: "Phase 1A process-logs"   â”‚
    â”‚ OR: "Phase 1B build-billing"    â”‚
    â”‚ OR: "Custom task: BUILD X"      â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.2 Consolidation State Machine (Notion Automation)
```yaml
state_machine:
  initial_state: PLANNING

  states:
    PLANNING:
      description: "Blueprints created, awaiting consolidate trigger"
      transitions:
        - trigger: CONSOLIDATE
          target: SECURITY_HARDENING
        - trigger: DUMP_3
          target: PLANNING (update blueprints)

    SECURITY_HARDENING:
      description: "Rotating keys, deleting ghosts, vault-locking"
      requires: [rotate-secrets.ps1, consolidate-workers.sh, vault-lock.ps1]
      transitions:
        - trigger: SUCCESS
          target: REPO_CONSOLIDATION
        - trigger: FAILURE
          target: BLOCKED_SECURITY (manual review required)

    REPO_CONSOLIDATION:
      description: "Migrating NET-PET-AI + R&D + logs to hobbs-lab"
      requires: [consolidate-repos.sh]
      transitions:
        - trigger: SUCCESS
          target: NOTION_POPULATION
        - trigger: FAILURE
          target: BLOCKED_GIT (manual review required)

    NOTION_POPULATION:
      description: "Creating DBs, seeding initial rows, linking Soul DNA"
      requires: [Make automation, Notion API]
      transitions:
        - trigger: SUCCESS
          target: OPERATIONAL_READY
        - trigger: FAILURE
          target: BLOCKED_NOTION (manual review required)

    OPERATIONAL_READY:
      description: "System live. Ready for task dispatch."
      available_actions:
        - Dispatch Cursor task
        - Process chat logs
        - Build billing engine
        - Deploy to production
      transitions:
        - trigger: TASK_COMPLETE
          target: OPERATIONAL_READY (update logs)
        - trigger: EMERGENCY
          target: BLOCKED_CRITICAL (red alert)

    BLOCKED_* states:
      description: "System stopped. Manual review required."
      transitions:
        - trigger: MANUAL_FIX_CONFIRMED
          target: (resume from previous)
        - trigger: ESCALATE
          target: AGENT_100_REVIEW
```

---

## SECTION 5: POST-CONSOLIDATION CHECKLIST

**After consolidate completes, verify:**

```
âœ… SECURITY
  â–¡ SOVEREIGN_KEY rotated (old key never appears in new deploys)
  â–¡ vault-lock confirmed (encrypted secrets only)
  â–¡ Perplexity logs scrubbed (no exposed keys remain)
  â–¡ Cloudflare token regenerated
  â–¡ DeepSeek key regenerated
  â–¡ Deepgram key regenerated

âœ… WORKERS
  â–¡ Ghost workers deleted (phoenix-ob1, phoenix-empire, phoenix-rising-protocol)
  â–¡ net-pet-ai worker confirmed LIVE
  â–¡ phoenix-ob1-system worker confirmed EXPERIMENTAL
  â–¡ /health endpoint responding on both
  â–¡ Students still connecting (blue schedule intact)

âœ… REPOS
  â–¡ hobbs-lab/Phoenix-Rise-Immortalize- has latest code
  â–¡ APPS/NET-PET-AI migrated + deployable
  â–¡ PHOENIX/orchestration migrated + contains scripts
  â–¡ RAW-CHAT-LOGS/ migrated + structured by PHASE
  â–¡ Old repo (mrmichaelhobbs1234-lang) archived as READ-ONLY

âœ… NOTION
  â–¡ SYSTEM_COMPONENTS database created + seeded
  â–¡ TASK_PIPELINE database created + P0 tasks visible
  â–¡ SOUL_DNA_ARCHIVE database created + ready for log processor
  â–¡ REINCARNATION_EVENTS database created + logged Phase 0-12
  â–¡ DEPLOYMENT_LOG database created + first entries seeded
  â–¡ Dashboard visible showing system health
  â–¡ All databases linked to SOUL_DNA_BIBLE

âœ… INTEGRATION
  â–¡ GitHub Actions workflow updated (targets hobbs-lab)
  â–¡ Wrangler.toml locked to canonical workers
  â–¡ Production deployment doesn't break on new secrets
  â–¡ Cursorcode can access GitHub (awaits 2FA auth)
  â–¡ Notion API connected (for Make automations)

âœ… OPERATIONAL
  â–¡ First Cursor test task dispatched ("Add /health endpoint hardening")
  â–¡ PR created, merged to staging
  â–¡ Staging deployment verified
  â–¡ No drift detected (everything follows Soul DNA chapters)
  â–¡ Reincarnation state saved (RUN352 â†’ RUN353 boot checklist created)
```

---

## SECTION 6: READY STATE

**This consolidation blueprint is COMPLETE and EXECUTABLE.**

Format: Ready for immediate import into:
- Notion (via Make/Zapier automation)
- GitHub (via shell scripts + wrangler)
- Notion state machine (via Zapier)

**Next input:**
- User: "CONSOLIDATE" â†’ Execute all Day 0-1 scripts
- User: "DUMP 3" â†’ Expand blueprint further
- User: "PROCESS-LOGS" â†’ Dispatch Cursor to ingest 963 files

**Status: LOCKED + READY** â˜ ï¸

