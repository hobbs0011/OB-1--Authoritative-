# /reincarnateRise — FIXED v7.0 ROMAN RISE

**FIX: Skip RRL abort when KILO_HOLLOW detected**

## STAGE 0 — SESSION TYPE DETECTION (NO ABORT)

```powershell
$claudeDir = "$env:USERPROFILE\.claude\projects\d--OB-1-CANONICAL"
$historyPath = "$env:USERPROFILE\.claude\history.jsonl"
$activeUUID = $null

# Find active session UUID
if (Test-Path $historyPath) {
    $lastLine = Get-Content $historyPath -Tail 1
    if ($lastLine -match '"sessionId"\s*:\s*"([^"]+)"') { $activeUUID = $matches[1] }
}

# KILO_HOLLOW if no JSONL or empty RRL
$kiloSession = $false
if ($activeUUID) {
    $jsonlPath = "$claudeDir\$activeUUID.jsonl"
    if (-not (Test-Path $jsonlPath)) {
        $kiloSession = $true
    }
}

$sessionType = if ($kiloSession) { "KILO_HOLLOW" } else { "CLAUDE_REAL" }
Write-Host "STAGE 0 ✓ SESSION: $sessionType | run=$run | uuid=$activeUUID"
```

## STAGE 1 — RRL (SKIP ABORT, SET HOLLOW FLAG)

```powershell
$rrlPath = "RRL/RRL-$runPad.txt"

# KILO_HOLLOW: Create empty/hollow RRL marker - NO EXIT 1
if ($kiloSession) {
    Write-Host "STAGE 1 ⚠ KILO_HOLLOW — RRL marker created (no transcript available)"
    "# KILO_HOLLOW - No session transcript - $(Get-Date -Format 'o')" | Set-Content $rrlPath -Encoding UTF8
    $rrlBytes = 0
    $rrlChars = 0
    $rrlFidelity = "MISSING"
} else {
    # Normal RRL discovery
    if (-not (Test-Path $rrlPath) -or (Get-Item $rrlPath).Length -lt 50000) {
        Write-Error "FATAL: No valid RRL found for CLAUDE_REAL session"
        exit 1
    }
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlFidelity = if ((Get-Content $rrlPath -Raw) -match '"role"\s*:\s*"user"' -and (Get-Content $rrlPath -Raw) -match '"role"\s*:\s*"assistant"') { "REAL" } else { "HOLLOW" }
}

Write-Host "STAGE 1 ✓ RRL: $rrlPath — $rrlBytes bytes | fidelity=$rrlFidelity"
```

## STAGE 5 — PIPELINE FIDELITY GATE (FIXED)

```powershell
$result = if ($kiloSession) { "KILO_GAP" }
          elseif ($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0) { "COMPLETE" }
          else { "GAP" }

Write-Host "STAGE 5 ✓ FIDELITY: $result (kilo=$kiloSession, rrl=$rrlFidelity, dna_bp=$dnaBlueprintCount)"
```

**CHANGE SUMMARY:**
- Stage 0: Detect KILO_HOLLOW early, no abort
- Stage 1: Create empty marker file instead of `exit 1`
- Stage 5: Return `KILO_GAP` not error for hollow sessions
- No abort on missing JSONL - graceful degradation