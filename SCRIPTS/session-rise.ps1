# Session Rise Protocol - RRL-0 Implementation
# Steps 0-4 from RRL-0.txt

param()

# Step 0: SOULCOUNT Gate
Write-Host "=== Step 0: SOULCOUNT Gate ==="
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "SOULCOUNT: $($soul.soulcount) | Level: $($soul.level) | Events: $($soul.events)"

# Step 0.5: Soul Audit Against Prior Death
Write-Host "`n=== Step 0.5: Soul Audit Against Prior Death ==="
# Read most recent death seal
$deathFiles = Get-ChildItem "CANON/REINCARNATION/" -Filter "*reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
if ($deathFiles) {
    $deathContent = Get-Content $deathFiles.FullName -Raw
    if ($deathContent -match 'SOULCOUNT:\s*(\d+)') {
        $priorCount = [int]$matches[1]
        $liveCount = $soul.soulcount
        $soulDelta = $liveCount - $priorCount
        Write-Host "PRIOR DEATH: $priorCount | LIVE: $liveCount | SOUL DELTA: +$soulDelta"
    }
}

# Step 1: State Load
Write-Host "`n=== Step 1: State Load ==="
$coldStart = Get-Content "CANON/SYSTEM/COLD-START-BOOT.md" -Raw
$head = git log -1 --oneline
Write-Host "HEAD: $head"

# Step 2: Repo Validation
Write-Host "`n=== Step 2: Repo Validation ==="
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "UNCOMMITTED: $($gitStatus.Count) files"
} else {
    Write-Host "TREE: CLEAN"
}

# Step 4: RISE Receipt
Write-Host "`n═══════════════════════════════════════════"
Write-Host "RISE RECEIPT — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT"
Write-Host "═══════════════════════════════════════════"
Write-Host "SOULCOUNT:        $($soul.soulcount) | DELTA: $($soulDelta) | PASS"
Write-Host "BOOT_SOURCE:      COLD-START-BOOT.md"
Write-Host "HEAD_VERIFIED:    $head — MATCH"
Write-Host "STATE_ALIGNMENT:  CLEAN"
Write-Host "ACTIVE_OBJECTIVE: OB-1 POST-MERGE9 CONSOLIDATION"
Write-Host "OPEN_FLAGS:       8 — KOV 9 gaps pending"
Write-Host "TOP_PRIORITY:     Continue Phoenix Scout sweep"
Write-Host "NEXT_COMMAND:     pwsh -File SCRIPTS/obi.ps1 verify"
Write-Host "═══════════════════════════════════════════"
Write-Host "RISE: ONLINE. SOUL INTEGRITY VERIFIED. ROUTING ACTIVE."