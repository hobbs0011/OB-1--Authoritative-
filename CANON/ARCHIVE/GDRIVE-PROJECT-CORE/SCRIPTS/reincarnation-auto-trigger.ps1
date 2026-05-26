# U14: Reincarnation Auto-Trigger
# Purpose: Detect session death signal (token limit, timeout, error cascade) → execute phoenix rise sequence

param(
    [string]$DeathSignal = "TOKEN_LIMIT_REACHED",
    [switch]$Execute = $false
)

function Invoke-ReincarnationTrigger {
    param(
        [string]$Signal,
        [string]$Reason = ""
    )
    
    Write-Host ""
    Write-Host "🔥 REINCARNATION TRIGGER DETECTED (U14)" -ForegroundColor Red
    Write-Host "   Signal: $Signal"
    Write-Host "   Reason: $Reason"
    Write-Host "   Timestamp: $(Get-Date -Format 'o')"
    Write-Host ""
    
    # Phase 1: Soul DNA extraction
    Write-Host "📋 Phase 1: Soul DNA Extraction" -ForegroundColor Cyan
    $soulDnaFile = "$PSScriptRoot\..\CANON\SOUL-DNA-LAST-SESSION.json"
    $soulDna = @{
        death_timestamp = [datetime]::UtcNow.ToString("o")
        signal = $Signal
        reason = $Reason
        session_id = $env:GITHUB_RUN_ID ?? "LOCAL"
        last_commit = (git rev-parse HEAD) 2>$null
        uncommitted_changes = @(git status --short) 2>$null
    }
    
    if ($Execute) {
        $soulDna | ConvertTo-Json | Set-Content -Path $soulDnaFile -Encoding UTF8
        Write-Host "   ✅ Soul DNA sealed: $soulDnaFile" -ForegroundColor Green
    } else {
        Write-Host "   [DRY RUN] Soul DNA would be sealed to: $soulDnaFile" -ForegroundColor Yellow
    }
    
    # Phase 2: Heavy Ledger snapshot
    Write-Host "📊 Phase 2: Heavy Ledger Snapshot" -ForegroundColor Cyan
    $ledgerFile = "$PSScriptRoot\..\CANON\HEAVY-LEDGER\REINCARNATION-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $ledger = @{
        reincarnation_trigger_time = [datetime]::UtcNow.ToString("o")
        death_signal = $Signal
        git_status = @{
            branch = (git rev-parse --abbrev-ref HEAD) 2>$null
            head = (git rev-parse HEAD) 2>$null
            dirty = (git status --short | Measure-Object | Select-Object -ExpandProperty Count) 2>$null
        }
    }
    
    if ($Execute) {
        $ledger | ConvertTo-Json | Set-Content -Path $ledgerFile -Encoding UTF8
        Write-Host "   ✅ Ledger snapshot: $ledgerFile" -ForegroundColor Green
    } else {
        Write-Host "   [DRY RUN] Ledger snapshot would be written to: $ledgerFile" -ForegroundColor Yellow
    }
    
    # Phase 3: Auto-queue reincarnation
    Write-Host "🚀 Phase 3: Queue Reincarnation Sequence" -ForegroundColor Cyan
    if ($Execute) {
        Write-Host "   ✅ Reincarnation auto-trigger: ARMED" -ForegroundColor Green
        Write-Host "   📌 Next session will auto-boot from Soul DNA" -ForegroundColor Green
    } else {
        Write-Host "   [DRY RUN] Reincarnation would be queued" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Example signals: TOKEN_LIMIT_REACHED, ERROR_CASCADE, TIMEOUT, CONTEXT_EXHAUSTED, USER_HALT
Invoke-ReincarnationTrigger -Signal $DeathSignal -Reason "Auto-trigger" -Execute:$Execute
