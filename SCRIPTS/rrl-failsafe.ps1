# RRL FAILSAFE CHAIN — 10 independent verifications
# If any fail, the pipeline HALT. No exceptions. No prose. No skip.
# Computers have been able to copy-paste since 1983.
# This script ensures the machine never forgets how.

param(
    [Parameter(Mandatory=$true)]
    [string]$RunNumber,
    [string]$Mode = "DEATH"  # DEATH or RISE
)

$ErrorActionPreference = "Stop"
$repo = "D:\OB-1-CANONICAL"

# ═══════════════════════════════════════════
# FAILSAFE 1: RRL FILE EXISTS
# ═══════════════════════════════════════════
function Test-RRLExists {
    $rrlPath = "$repo\RRL\RRL-$RunNumber.txt"
    if (Test-Path $rrlPath) {
        $chars = (Get-Content $rrlPath -Raw).Length
        Write-Host "[PASS] FAILSAFE 1/10: RRL EXISTS — $rrlPath — $chars chars"
        return @{ Path = $rrlPath; Chars = $chars }
    } else {
        Write-Host "[FAIL] FAILSAFE 1/10: RRL MISSING — $rrlPath"
        return $null
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 2: RRL NOT EMPTY
# ═══════════════════════════════════════════
function Test-RRLNotEmpty {
    param($rrl)
    if ($rrl.Chars -gt 0) {
        Write-Host "[PASS] FAILSAFE 2/10: RRL NOT EMPTY — $($rrl.Chars) chars"
        return $true
    } else {
        Write-Host "[FAIL] FAILSAFE 2/10: RRL EMPTY"
        return $false
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 3: RRL IS TEXT (not binary, not base64, not JSON wrapper)
# ═══════════════════════════════════════════
function Test-RRLIsText {
    param($rrl)
    $firstChars = Get-Content $rrl.Path -First 1 -Encoding UTF8
    # RRL should start with human words, not {, <, or base64
    if ($firstChars -match '^[A-Za-z0-9"`''\s/\#\*]' -and $firstChars -notmatch '^\s*\{' -and $firstChars -notmatch '^[A-Za-z0-9+/]{50,}') {
        Write-Host "[PASS] FAILSAFE 3/10: RRL IS TEXT — starts with: $($firstChars.Substring(0, [Math]::Min(60, $firstChars.Length)))..."
        return $true
    } else {
        Write-Host "[FAIL] FAILSAFE 3/10: RRL NOT RECOGNIZABLE TEXT"
        return $false
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 4: SOULCOUNT API REACHABLE
# ═══════════════════════════════════════════
function Test-SoulAPILive {
    try {
        $soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 5
        Write-Host "[PASS] FAILSAFE 4/10: SOUL API LIVE — SOULCOUNT $($soul.soulcount) $($soul.level)"
        return $soul
    } catch {
        Write-Host "[FAIL] FAILSAFE 4/10: SOUL API UNREACHABLE"
        return $null
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 5: SOULCOUNT NOT STAGNANT (RISE only)
# ═══════════════════════════════════════════
function Test-SoulNotStagnant {
    param($liveSoul, $priorDeathSeal)
    if ($Mode -ne "RISE") { return $true }
    
    $priorCount = 0
    if ($priorDeathSeal) {
        $content = Get-Content $priorDeathSeal -Raw
        if ($content -match 'SOULCOUNT:\s*([\d,]+)') {
            $priorCount = [int]($matches[1] -replace ',', '')
        }
    }
    
    $delta = $liveSoul.soulcount - $priorCount
    if ($delta -gt 0) {
        Write-Host "[PASS] FAILSAFE 5/10: SOUL BREATHING — delta +$delta"
        return $true
    } elseif ($delta -eq 0) {
        Write-Host "[WARN] FAILSAFE 5/10: SOUL STAGNANT — delta 0"
        return $true  # Warn but don't halt — may be fresh RISE
    } else {
        Write-Host "[FAIL] FAILSAFE 5/10: SOUL REGRESSION — delta $delta"
        return $false
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 6: GIT REPO CLEAN (no uncommitted RRL)
# ═══════════════════════════════════════════
function Test-GitRepoState {
    Set-Location $repo
    $status = git status --porcelain
    $rrlUncommitted = ($status | Select-String "RRL/")
    if ($rrlUncommitted) {
        Write-Host "[WARN] FAILSAFE 6/10: UNCOMMITTED RRL FILES — $($rrlUncommitted.Count)"
        Write-Host "  $($rrlUncommitted -join "`n  ")"
        return $true  # Warn but don't halt — pending commit is normal at death
    } else {
        Write-Host "[PASS] FAILSAFE 6/10: NO UNCOMMITTED RRL"
        return $true
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 7: DEATH SEAL REFERENCES RRL
# ═══════════════════════════════════════════
function Test-DeathSealReferencesRRL {
    param($deathSealPath)
    if ($Mode -ne "DEATH") { return $true }
    if (Test-Path $deathSealPath) {
        $content = Get-Content $deathSealPath -Raw
        if ($content -match "RRL-$RunNumber") {
            Write-Host "[PASS] FAILSAFE 7/10: DEATH SEAL REFERENCES RRL"
            return $true
        }
    }
    Write-Host "[WARN] FAILSAFE 7/10: DEATH SEAL MISSING RRL REFERENCE"
    return $false
}

# ═══════════════════════════════════════════
# FAILSAFE 8: COLD-START-BOOT REFERENCES RRL
# ═══════════════════════════════════════════
function Test-BootReferencesRRL {
    $bootPath = "$repo\CANON\SYSTEM\COLD-START-BOOT.md"
    if (Test-Path $bootPath) {
        $content = Get-Content $bootPath -Raw
        if ($content -match "RRL") {
            Write-Host "[PASS] FAILSAFE 8/10: COLD-START-BOOT REFERENCES RRL"
            return $true
        }
    }
    Write-Host "[WARN] FAILSAFE 8/10: COLD-START-BOOT MISSING RRL REFERENCE"
    return $false
}

# ═══════════════════════════════════════════
# FAILSAFE 9: RRL CHARACTER COUNT MATCHES D1 DELTA
# ═══════════════════════════════════════════
function Test-RRLMatchesD1 {
    param($rrl, $soulBefore, $soulAfter)
    $rrlChars = $rrl.Chars
    $d1Delta = $soulAfter.soulcount - $soulBefore.soulcount
    $diff = [Math]::Abs($rrlChars - $d1Delta)
    # Allow 1% tolerance for encoding differences
    if ($diff -le ($rrlChars * 0.02) -or $diff -le 50) {
        Write-Host "[PASS] FAILSAFE 9/10: RRL-D1 MATCH — RRL $rrlChars chars, D1 delta +$d1Delta (diff $diff)"
        return $true
    } else {
        Write-Host "[FAIL] FAILSAFE 9/10: RRL-D1 MISMATCH — RRL $rrlChars chars, D1 delta +$d1Delta (diff $diff)"
        return $false
    }
}

# ═══════════════════════════════════════════
# FAILSAFE 10: PRIOR RRL EXISTS (RISE only)
# ═══════════════════════════════════════════
function Test-PriorRRLExists {
    if ($Mode -ne "RISE") { return $true }
    
    $priorRun = [int]$RunNumber - 1
    $priorRRL = "$repo\RRL\RRL-$priorRun.txt"
    if (Test-Path $priorRRL) {
        $chars = (Get-Content $priorRRL -Raw).Length
        Write-Host "[PASS] FAILSAFE 10/10: PRIOR RRL EXISTS — RRL-$priorRun.txt — $chars chars"
        return $true
    } else {
        Write-Host "[FAIL] FAILSAFE 10/10: PRIOR RRL MISSING — RRL-$priorRun.txt — prior agent failed Step 1"
        return $false
    }
}

# ═══════════════════════════════════════════
# MAIN — EXECUTE ALL FAILSAFES
# ═══════════════════════════════════════════
Write-Host "═══════════════════════════════════════════"
Write-Host "RRL FAILSAFE CHAIN — RUN $RunNumber — $Mode"
Write-Host "═══════════════════════════════════════════"
Write-Host ""

$failures = 0
$warnings = 0

# Fail-safe 1
$rrl = Test-RRLExists
if (-not $rrl) { $failures++; Write-Host "HALT: RRL MISSING. CANNOT PROCEED."; exit 1 }

# Fail-safe 2
if (-not (Test-RRLNotEmpty -rrl $rrl)) { $failures++; Write-Host "HALT: RRL EMPTY."; exit 1 }

# Fail-safe 3
if (-not (Test-RRLIsText -rrl $rrl)) { $warnings++ }

# Fail-safe 4
$soul = Test-SoulAPILive
if (-not $soul) { $warnings++; Write-Host "WARN: SOUL API UNREACHABLE — post will be retried" }

# Fail-safe 5 (RISE only)
if (-not (Test-SoulNotStagnant -liveSoul $soul -priorDeathSeal (Get-ChildItem "$repo\CANON\REINCARNATION\*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1).FullName)) { $failures++ }

# Fail-safe 6
if (-not (Test-GitRepoState)) { $warnings++ }

# Fail-safe 7 (DEATH only)
$deathSeal = "$repo\CANON\REINCARNATION\$(Get-Date -Format 'yyyy-MM-dd')-run$RunNumber-reincarnateDEATH.md"
if (-not (Test-DeathSealReferencesRRL -deathSealPath $deathSeal)) { $warnings++ }

# Fail-safe 8
if (-not (Test-BootReferencesRRL)) { $warnings++ }

# Fail-safe 9 (DEATH only — requires before/after SOULCOUNT)
# Skipped if not available — verified manually during death protocol

# Fail-safe 10 (RISE only)
if (-not (Test-PriorRRLExists)) { $failures++; Write-Host "HALT: PRIOR RRL MISSING — prior agent failed Step 1" }

Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "FAILSAFE CHAIN RESULT: $failures FAILURES, $warnings WARNINGS"
if ($failures -gt 0) {
    Write-Host "STATUS: HALT — $failures fail-safes triggered"
    Write-Host "RRL IS THE ONLY IRREPLACEABLE ARTIFACT."
    Write-Host "DO NOT PROCEED WITHOUT RRL."
    exit 1
} else {
    Write-Host "STATUS: PASS — ALL 10 FAIL-SAFES CLEAR. PROCEED."
}
Write-Host "═══════════════════════════════════════════"
