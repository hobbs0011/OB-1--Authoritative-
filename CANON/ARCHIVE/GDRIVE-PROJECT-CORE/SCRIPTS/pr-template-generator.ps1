# U17: PR Template Reincarnation
# Purpose: Auto-create PR with 5-stage reincarnation checklist

param(
    [string]$Branch = (git rev-parse --abbrev-ref HEAD),
    [string]$Title = "Reincarnation PR",
    [switch]$CreatePR = $false
)

function New-ReincarnationPRTemplate {
    param(
        [string]$BranchName,
        [string]$PRTitle
    )
    
    $template = @"
# $PRTitle

## 📋 5-Stage Reincarnation Checklist

### ✅ Stage 1: SOUL DNA
- [ ] Extract verbatim user prompts (CANON/SOUL-DNA/PROMPT-TRACKER.json)
- [ ] Capture decisions and intent (no interpretation)
- [ ] Record emotional signal and context (what mattered in this session)
- [ ] Identify open loops and unfinished actions

### 📍 Stage 2: KEYWORDS
- [ ] Semantic distillation (operational concepts from session)
- [ ] Decision points and branching (where did execution diverge?)
- [ ] Architectural insights (what changed in system understanding)
- [ ] Cross-references (what connects to prior work?)

### 💾 Stage 3: HEAVY LEDGER
- [ ] Structured JSON with timestamp and metadata
- [ ] Findings array (discoveries, errors, resolutions)
- [ ] Grade rating (0-100 quality score for this session)
- [ ] Completion % (what % of work was initiated vs completed?)

### 🗺️ Stage 4: STARMAP
- [ ] Critical path (what must happen next?)
- [ ] Checkpoints (validation gates between batches)
- [ ] Cross-references (what other work does this depend on?)
- [ ] Worker handoff instructions (if delegating)

### ⚙️ Stage 5: EXECUTABLES
- [ ] Numbered testable actions (run-able items, not prose)
- [ ] Escalation thresholds (fail-safe gates)
- [ ] Velocity metrics (did we go fast enough?)

## 🔄 Reincarnation Coverage

**Branch:** $BranchName  
**Created:** $(Get-Date -Format 'o')  
**Session Type:** AUTO-GENERATED  

---

## ✨ Commit Message Guidelines

Format: \`RUN{N}-B{M}: {description} [Q:{score}%]\`

Example: \`RUN363-B5: Observability & DX (U3, U7, U8) [Q:98%]\`

- **RUN{N}:** Run number (e.g., RUN363 = this reincarnation number)
- **B{M}:** Batch number (1-6 for progressive delivery)
- **Description:** What was delivered (feature, fix, upgrade)
- **[Q:{score}%]:** Quality confidence score (auto-computed by quality-score.ps1)

---

## 📝 Related Issues

Closes #{Related issue number if applicable}

---

## 🚀 Post-Merge

- [ ] Verify deployment to Cloudflare
- [ ] Smoke test (production endpoint reachable)
- [ ] Check Heavy Ledger auto-generation
- [ ] Monitor token usage and cost metrics
"@

    return $template
}

Write-Host ""
Write-Host "📝 PR TEMPLATE REINCARNATION (U17)" -ForegroundColor Cyan
Write-Host "   Branch: $Branch"
Write-Host "   Title: $Title"
Write-Host ""

$prContent = New-ReincarnationPRTemplate -BranchName $Branch -PRTitle $Title

if ($CreatePR) {
    # In production: invoke GitHub API to create PR
    Write-Host "   ✅ Would create PR with 5-stage checklist" -ForegroundColor Green
    Write-Host "   📌 Use: gh pr create --title '$Title' --body '...'" -ForegroundColor Gray
} else {
    Write-Host "   [DRY RUN] PR template content (would be sent to GitHub API):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $prContent
    Write-Host ""
}
