# XI. CLEANUP PIPELINE (SURGICAL STRIKE)
## RUN352 PURGE PHASE — Non-negotiable drift elimination

**Status:** READY FOR EXECUTION  
**Trigger:** After CONSOLIDATION security lock (Day 0)  
**Timeline:** 2-3 hours  
**Outcome:** Ghost-free, single-truth infrastructure

---

## OBJECTIVE: System Hygiene Before Scale

Your infrastructure has accumulated **zombie workers and legacy baggage**:

```
CLOUDFLARE:
  ✅ net-pet-ai (PROD) — KEEP
  ✅ phoenix-ob1-system (R&D) — KEEP
  ❌ phoenix-ob1 (GHOST)
  ❌ phoenix-empire (ZOMBIE)
  ❌ phoenix-rising-protocol (DEAD)
  ❌ obi-system (ORPHAN)

GITHUB REPOS:
  ✅ hobbs-lab/Phoenix-Rise-Immortalize- (PRIMARY)
  ❌ mrmichaelhobbs1234-lang/phoenix-ob1-system (LEGACY)
  
EXTERNAL PLATFORMS:
  ⚠️  Make.com (active? confirm)
  ⚠️  ManyChat (active? confirm)
  ❓ Vercel (kill or keep?)
  ⚠️  Cloudflare R2 (audit for orphaned files)
```

**This phase clears the noise so you can hear signal.**

---

## TIER 1: CLOUDFLARE WORKER PURGE (30 min)

### Target: Delete 4 ghost workers

**Why:** Every ghost is a security surface + potential conflicting deployment  
**Risk if skipped:** Ghost gets accidentally deployed, shadows net-pet-ai behavior, students see mixed versions

### Action 1: List current workers
```bash
#!/bin/bash
# SCRIPTS/inventory-workers.sh

wrangler list --format json > /tmp/workers-current.json

echo "Current Cloudflare Workers:"
jq -r '.[] | "\(.name) — \(.created_on // "?") — Status: \(.status // "unknown")"' /tmp/workers-current.json

# Count by status
echo ""
echo "Summary:"
jq -r '.[] | .name' /tmp/workers-current.json | wc -l | xargs echo "Total workers:"
```

**Expected output:**
```
net-pet-ai — 2026-03-15 — Status: active
phoenix-ob1-system — 2026-04-10 — Status: active
phoenix-ob1 — 2025-12-20 — Status: active
phoenix-empire — 2025-11-15 — Status: active
phoenix-rising-protocol — 2025-10-01 — Status: active
obi-system — 2025-09-18 — Status: active

Total workers: 6
```

### Action 2: Verify canonical workers are healthy

```bash
#!/bin/bash
# SCRIPTS/verify-canonical-workers.sh

set -e

echo "🔍 Verifying canonical workers before purge..."

# 1. net-pet-ai (PROD)
echo "1. net-pet-ai (PROD)..."
wrangler deployments list --name net-pet-ai | head -5
HEALTH=$(curl -s https://naturalenglishtraining.net/api/health | jq -r '.status // "error"')
if [ "$HEALTH" = "ok" ] || [ "$HEALTH" = "healthy" ]; then
  echo "   ✅ PROD worker healthy"
else
  echo "   ⚠️  PROD health check: $HEALTH"
fi

# 2. phoenix-ob1-system (R&D)
echo "2. phoenix-ob1-system (R&D)..."
wrangler deployments list --name phoenix-ob1-system | head -5
echo "   ✅ R&D worker exists (not tested, per spec)"

# If either fails, abort
if [ "$HEALTH" != "ok" ] && [ "$HEALTH" != "healthy" ]; then
  echo "❌ ERROR: PROD worker not healthy. Abort purge."
  exit 1
fi

echo ""
echo "✅ Canonical workers verified safe"
```

### Action 3: DELETE ghost workers (one by one, with log)

```bash
#!/bin/bash
# SCRIPTS/purge-ghost-workers.sh

set -e

GHOSTS=("phoenix-ob1" "phoenix-empire" "phoenix-rising-protocol" "obi-system")
PURGE_LOG="/tmp/worker-purge-log-$(date +%Y%m%d_%H%M%S).txt"

echo "🗑️  Ghost Worker Purge Starting..."
echo "Log: $PURGE_LOG"
echo ""

# Confirmation
read -p "Delete these 4 workers? (type 'DELETE GHOSTS' to confirm): " confirm
if [ "$confirm" != "DELETE GHOSTS" ]; then
  echo "Purge cancelled."
  exit 0
fi

echo ""
for ghost in "${GHOSTS[@]}"; do
  echo "→ Deleting: $ghost"
  
  # Get worker info before deletion
  echo "  (info: $(wrangler list --format json | jq -r ".[] | select(.name==\"$ghost\") | \"created=\(.created_on // \"?\"), status=\(.status // \"?\")\"")" >> "$PURGE_LOG"
  
  # Delete
  wrangler delete "$ghost" --force 2>&1 | tee -a "$PURGE_LOG"
  
  echo "  ✅ Deleted"
done

echo ""
echo "✅ Ghost worker purge complete"
echo "Purge log saved: $PURGE_LOG"

# Final verification
echo ""
echo "Remaining workers:"
wrangler list
```

**Outcome:**
```
✅ Deleted: phoenix-ob1
✅ Deleted: phoenix-empire
✅ Deleted: phoenix-rising-protocol
✅ Deleted: obi-system

Remaining workers (2):
  - net-pet-ai (PROD)
  - phoenix-ob1-system (R&D)
```

### Action 4: Audit remaining R2 buckets

```bash
#!/bin/bash
# SCRIPTS/audit-r2-buckets.sh

echo "Auditing Cloudflare R2 buckets..."
echo ""

wrangler r2 bucket list --format json | jq -r '.[] | "\(.name) — \(.creation_date // "?")"'

echo ""
echo "TODO: Manually review in Cloudflare dashboard:"
echo "  → Are any R2 buckets associated with deleted workers?"
echo "  → Any orphaned data?"
echo "  → If unused, delete via: wrangler r2 bucket delete <name>"
```

---

## TIER 2: GITHUB LEGACY REPO ARCHIVE (15 min)

### Target: Mark old repo as LEGACY/READ-ONLY

**Why:** Single source of truth in hobbs-lab, but need to preserve old repo for history  
**Action:** Tag old repo, update README, make private

```bash
#!/bin/bash
# SCRIPTS/archive-legacy-repo.sh

set -e

LEGACY_REPO="mrmichaelhobbs1234-lang/phoenix-ob1-system"
LEGACY_DIR="/tmp/legacy-repo-archive-$(date +%s)"

echo "📦 Archiving legacy repo..."
echo "Target: $LEGACY_REPO"

# 1. Clone legacy repo
echo "1. Cloning legacy repo..."
git clone "git@github.com:$LEGACY_REPO.git" "$LEGACY_DIR"
cd "$LEGACY_DIR"

# 2. Create archive branch
echo "2. Creating ARCHIVE branch..."
git checkout -b ARCHIVE-2026-04-20

# 3. Update README
cat > README.md << 'EOF'
# ⚠️ ARCHIVED — DO NOT USE

This repository is **LEGACY** and no longer maintained.

## Why archived?

The codebase has been migrated to the primary repository:
→ **[hobbs-lab/Phoenix-Rise-Immortalize-](https://github.com/hobbs-lab/Phoenix-Rise-Immortalize-)**

## What to do

- **New development:** Use `hobbs-lab/Phoenix-Rise-Immortalize-`
- **Reference old code:** It's all in this repo (immutable history)
- **Questions:** See commit history with `git log`

## Timeline

- Last active: 2026-04-20
- Archived: 2026-04-20
- Status: READ-ONLY

---

*This repo remains for historical reference. All active work is at hobbs-lab.*
EOF

# 4. Commit
git add README.md
git commit -m "docs: Mark repository as ARCHIVED (moved to hobbs-lab) — 2026-04-20"

# 5. Push archive branch
echo "3. Pushing ARCHIVE branch..."
git push origin ARCHIVE-2026-04-20

# 6. Set repo visibility (via GitHub CLI if available)
if command -v gh &> /dev/null; then
  echo "4. Setting repo visibility to PRIVATE (via CLI)..."
  gh repo edit "$LEGACY_REPO" --visibility private
else
  echo "⚠️  GitHub CLI not available. Manually set repo visibility to PRIVATE:"
  echo "   → GitHub.com → $LEGACY_REPO → Settings → Visibility → Private"
fi

echo ""
echo "✅ Legacy repo archived"
echo "Verification: git log --oneline | head -3"
git log --oneline | head -3
```

**Outcome:**
```
ARCHIVE branch created
README updated
Repo set to PRIVATE
All history preserved
```

---

## TIER 3: EXTERNAL PLATFORM AUDIT (30 min)

### Action A: Make.com confirmation

**Question:** Is Make.com (formerly Integromat) still active?

```bash
#!/bin/bash
# SCRIPTS/audit-make-integration.sh

echo "🔍 Auditing Make.com integration..."
echo ""

# Check: Is MAKE_SECRET still in vaults/secrets?
if grep -r "MAKE" . --include="*.toml" --include="*.json" 2>/dev/null | grep -v node_modules | head -5; then
  echo "✅ MAKE_SECRET found in config"
else
  echo "❌ MAKE_SECRET not found (integration inactive?)"
fi

echo ""
echo "TODO — Manual check:"
echo "  1. Browser: https://www.make.com/en/app/scenarios"
echo "  2. Check if any scenarios mention:"
echo "     - Notion webhooks"
echo "     - GitHub integration"
echo "     - Cloudflare API"
echo "  3. If active: Document scenario IDs"
echo "  4. If inactive: Delete MAKE_SECRET from vault"
```

### Action B: ManyChat confirmation

**Question:** Is ManyChat still needed? (Was listed in legacy platforms)

```bash
#!/bin/bash
# scripts/audit-manychat.sh

echo "🔍 Auditing ManyChat integration..."
echo ""

echo "TODO — Manual check:"
echo "  1. Browser: https://manychat.com/dashboard"
echo "  2. Are there any active campaigns or flows?"
echo "  3. Is it connected to Telegram/Facebook/Instagram?"
echo "  4. Decision:"
echo "     - Active marketing: KEEP"
echo "     - Unused: DELETE"
```

### Action C: Vercel confirmation

**Question:** Is Vercel still used? (Marked as UNCERTAIN)

```bash
#!/bin/bash
# SCRIPTS/audit-vercel.sh

echo "🔍 Auditing Vercel deployments..."
echo ""

if command -v vercel &> /dev/null; then
  echo "Vercel CLI found. Listing projects:"
  vercel projects list 2>/dev/null || echo "(no projects)"
else
  echo "Vercel CLI not installed."
fi

echo ""
echo "TODO — Decision:"
echo "  1. Is Vercel hosting any part of NET or Phoenix?"
echo "  2. If YES: Verify domain routing"
echo "  3. If NO: Delete Vercel project + integration"
```

---

## TIER 4: GITHUB ACTIONS CLEANUP (15 min)

### Verify CI/CD uses only canonical workers

```bash
#!/bin/bash
# SCRIPTS/verify-github-actions.sh

set -e

REPO_ROOT="APPS/NET-PET-AI"

echo "🔍 Verifying GitHub Actions workflows..."
echo ""

# Check: Any workflow mentions ghosts?
if grep -r "phoenix-ob1\|phoenix-empire\|phoenix-rising" .github/workflows/ 2>/dev/null; then
  echo "⚠️  WARNING: Workflow references old workers"
  echo "Action: Update .github/workflows/*.yml to use only:"
  echo "  - net-pet-ai (PROD)"
  echo "  - phoenix-ob1-system (R&D)"
else
  echo "✅ No workflow references to old workers"
fi

# Check: Deployment target
echo ""
grep -A5 "wrangler deploy" .github/workflows/*.yml | head -10 || echo "No wrangler deploy found"
```

---

## TIER 5: FINAL VERIFICATION

```bash
#!/bin/bash
# SCRIPTS/purge-verification-checklist.sh

echo "✅ CLEANUP PIPELINE VERIFICATION"
echo ""

# 1. Cloudflare workers
echo "1. Cloudflare Workers:"
WORKER_COUNT=$(wrangler list --format json | jq 'length')
echo "   Total workers: $WORKER_COUNT"
if [ "$WORKER_COUNT" -eq 2 ]; then
  echo "   ✅ Expected count (2)"
else
  echo "   ⚠️  Unexpected count (expected 2, got $WORKER_COUNT)"
fi

# 2. GitHub repo
echo ""
echo "2. GitHub Repos:"
echo "   Primary: hobbs-lab/Phoenix-Rise-Immortalize-"
git ls-remote "git@github.com:hobbs-lab/Phoenix-Rise-Immortalize-.git" HEAD > /dev/null && echo "   ✅ Accessible" || echo "   ❌ Not found"

echo "   Legacy: mrmichaelhobbs1234-lang/phoenix-ob1-system"
git ls-remote "git@github.com:mrmichaelhobbs1234-lang/phoenix-ob1-system.git" HEAD > /dev/null && echo "   ✅ Still exists (archived)" || echo "   ⚠️  Not accessible"

# 3. External platforms
echo ""
echo "3. External Platforms (manual checklist):"
echo "   ☐ Make.com: AUDIT done or SKIP"
echo "   ☐ ManyChat: AUDIT done or SKIP"
echo "   ☐ Vercel: AUDIT done or SKIP"
echo "   ☐ R2 buckets: AUDIT done or SKIP"

echo ""
echo "✅ If all above green, CLEANUP PIPELINE complete"
```

---

## CLEANUP COMPLETION CHECKLIST

```
BEFORE CONSOLIDATION:
□ All 4 ghost workers deleted
□ Legacy repo archived (README + ARCHIVE branch)
□ Make.com status confirmed
□ ManyChat status confirmed
□ Vercel status confirmed
□ R2 buckets audited
□ GitHub Actions workflows verified
□ Only net-pet-ai + phoenix-ob1-system remain

AFTER CLEANUP:
□ No orphaned resources in Cloudflare
□ No references to deleted workers in any config
□ GitHub has single source of truth (hobbs-lab primary)
□ External platforms either confirmed active or deactivated
□ System is hygenic and ready for scale
```

---

## CLEANUP STATUS: READY ☠️

Execute after Day 0 security lock completes.
Timeline: 1-2 hours.
Impact: Zero drift, single truth, production-ready infrastructure.
