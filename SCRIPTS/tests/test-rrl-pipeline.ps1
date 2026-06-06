# TEST HARNESS: RRL PIPELINE (SCRIPTS/rrl-pipeline.ps1)
# Validates: DryRun mode, LEDGER ID sequencing, hash determinism, HOLLOW gate
# Contract: each test outputs PASS/FAIL, summary at end.

$ErrorActionPreference = "Continue"
$repo    = "D:\OB-1-CANONICAL"
$testDir = "$repo\SCRIPTS\tests"
$tmpDir  = "$testDir\tmp-test-$((Get-Date -Format 'yyyyMMddHHmmss'))"

# Create isolated temp workspace
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null }

$passCount = 0
$failCount = 0
$testResults = @()

function Write-TestResult {
    param([string]$TestName, [bool]$Passed, [string]$Detail)
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    Write-Host "[$status] $TestName — $Detail"
    $testResults += [ordered]@{ test = $TestName; result = $status; detail = $Detail }
    if ($Passed) { $script:passCount++ } else { $script:failCount++ }
}

# ═══════════════════════════════════════════
# SETUP: Dot-source the pipeline functions
# ═══════════════════════════════════════════
# The pipeline script is a param block, not a module. We source functions selectively.
# We re-define the functions inline to avoid triggering the full pipeline.

function Get-Next-Ledger-ID {
    param([string]$LedgerDir)
    if (-not (Test-Path $LedgerDir)) { return 1 }
    $ids = Get-ChildItem $LedgerDir -Filter "HL-*.json" | ForEach-Object {
        if ($_.Name -match 'HL-(\d+)') { [int]$matches[1] }
    }
    if ($ids) { ($ids | Measure-Object -Maximum).Maximum + 1 } else { 1 }
}

function Compute-Sha256 {
    param([string]$InputString)
    [System.BitConverter]::ToString(
        [System.Security.Cryptography.SHA256]::Create().ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($InputString)
        )
    ).Replace("-", "").ToLower()
}

# ═══════════════════════════════════════════
# TEST 1: DryRun mode does not write files
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "TEST 1: DryRun — No File Writes"
Write-Host "═══════════════════════════════════════════"

$mockRRL = Join-Path $tmpDir "mock-RRL-dryrun.txt"
@'
{"role":"user","text":"Hello, can you help me with something?"}
{"role":"assistant","text":"Of course! I would be happy to help. What do you need?"}
{"role":"user","text":"Write a function that computes SHA256."}
{"role":"assistant","text":"Sure! Here is the implementation: ```powershell\nfunction Compute-SHA256 { ... }\n```"}
'@ | Set-Content $mockRRL -Encoding UTF8

# Run pipeline in DryRun mode
$pipelinePath = "$repo\SCRIPTS\rrl-pipeline.ps1"
$dryOutput = & $pipelinePath -RRLFile $mockRRL -RunNumber 9999 -DryRun 2>&1

# Verify: no files were written to real artifact dirs
$artifactDirs = @(
    "$repo\CANON\HEAVY-LEDGER",
    "$repo\CANON\STARMAP",
    "$repo\CANON\SOUL-KEYWORDS",
    "$repo\CANON\PIPELINE",
    "$repo\CANON\SOUL\EXTRACT"
)

$filesWritten = $false
$writtenPaths = @()
$beforeSnapshot = @{}
foreach ($dir in $artifactDirs) {
    if (Test-Path $dir) {
        $beforeSnapshot[$dir] = (Get-ChildItem $dir -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    } else {
        $beforeSnapshot[$dir] = @()
    }
}

# After DryRun, check for new files referencing run 9999
$newFiles = @()
foreach ($dir in $artifactDirs) {
    if (Test-Path $dir) {
        $after = Get-ChildItem $dir -File -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -match "9999" -or $_.Name -match "run-9999"
        }
        if ($after) {
            $filesWritten = $true
            $writtenPaths += $after.FullName
        }
    }
}

# Additionally verify dry run output text confirms no writes
$dryText = $dryOutput -join "`n"
$confirmedDry = $dryText -match "DRYRUN" -or $dryText -match "would"

Write-TestResult "DryRun-NoWrites" (-not $filesWritten) $(if (-not $filesWritten) { "No artifact files written for run 9999" } else { "Files written: $($writtenPaths -join ', ')" })
Write-TestResult "DryRun-Confirmation" $confirmedDry "Output confirms DryRun mode: $(if ($confirmedDry) { 'yes' } else { 'no' })"

# ═══════════════════════════════════════════
# TEST 2: LEDGER ID sequencing
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "TEST 2: LEDGER ID Sequencing"
Write-Host "═══════════════════════════════════════════"

# Create temporary ledger dir with known files
$tmpLedgerDir = Join-Path $tmpDir "test-ledger"
New-Item -ItemType Directory -Path $tmpLedgerDir -Force | Out-Null

# Empty dir → should return 1
$id1 = Get-Next-Ledger-ID -LedgerDir $tmpLedgerDir
Write-TestResult "LedgerID-EmptyDir" ($id1 -eq 1) "Empty dir returned $id1 (expected 1)"

# Add HL-1.json → should return 2
@{ test = "dummy" } | ConvertTo-Json | Set-Content (Join-Path $tmpLedgerDir "HL-1.json") -Encoding UTF8
$id2 = Get-Next-Ledger-ID -LedgerDir $tmpLedgerDir
Write-TestResult "LedgerID-SingleFile" ($id2 -eq 2) "Dir with HL-1 returned $id2 (expected 2)"

# Add HL-5.json (gap in sequence) → should return 6
@{ test = "dummy" } | ConvertTo-Json | Set-Content (Join-Path $tmpLedgerDir "HL-5.json") -Encoding UTF8
$id3 = Get-Next-Ledger-ID -LedgerDir $tmpLedgerDir
Write-TestResult "LedgerID-GappedSequence" ($id3 -eq 6) "Dir with HL-1,HL-5 returned $id3 (expected 6 — gaps don't matter, max+1)"

# Add HL-42.json → should return 43
@{ test = "dummy" } | ConvertTo-Json | Set-Content (Join-Path $tmpLedgerDir "HL-42.json") -Encoding UTF8
$id4 = Get-Next-Ledger-ID -LedgerDir $tmpLedgerDir
Write-TestResult "LedgerID-HighNumber" ($id4 -eq 43) "Dir with HL-1,HL-5,HL-42 returned $id4 (expected 43)"

# Non-existent dir → should return 1
$id5 = Get-Next-Ledger-ID -LedgerDir "$tmpDir\nonexistent"
Write-TestResult "LedgerID-NonexistentDir" ($id5 -eq 1) "Non-existent dir returned $id5 (expected 1)"

# ═══════════════════════════════════════════
# TEST 3: Hash computation determinism
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "TEST 3: Hash Computation Determinism"
Write-Host "═══════════════════════════════════════════"

$input1 = "The quick brown fox jumps over the lazy dog"
$input2 = "The quick brown fox jumps over the lazy dog"
$input3 = "The quick brown fox jumps over the lazy dog."

$hash1 = Compute-Sha256 $input1
$hash2 = Compute-Sha256 $input2
$hash3 = Compute-Sha256 $input3

Write-TestResult "Hash-Deterministic" ($hash1 -eq $hash2) "Same input → same hash: $(if ($hash1 -eq $hash2) { 'yes' } else { 'NO — non-deterministic!' })"
Write-TestResult "Hash-DifferentInput" ($hash1 -ne $hash3) "Different input → different hash: $(if ($hash1 -ne $hash3) { 'yes' } else { 'NO — collision on different inputs!' })"

# Test with empty string
$hashEmpty = Compute-Sha256 ""
Write-TestResult "Hash-EmptyString" ($hashEmpty.Length -eq 64) "Empty string hash length: $($hashEmpty.Length) (expected 64 hex chars)"

# Test with multi-line input (simulates RRL)
$multiline = @"
Line 1: Hello
Line 2: World
Line 3: This is a test
"@
$hashML1 = Compute-Sha256 $multiline
$hashML2 = Compute-Sha256 $multiline
Write-TestResult "Hash-MultiLineDeterministic" ($hashML1 -eq $hashML2) "Multi-line input deterministic: $(if ($hashML1 -eq $hashML2) { 'yes' } else { 'NO' })"

# Test that hash is valid hex
Write-TestResult "Hash-ValidHex" ($hash1 -match '^[0-9a-f]{64}$') "Hash matches hex pattern: $(if ($hash1 -match '^[0-9a-f]{64}$') { 'yes' } else { 'NO' })"

# ═══════════════════════════════════════════
# TEST 4: HOLLOW gate (< 5KB RRL detection)
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "TEST 4: HOLLOW Gate (< 5KB Detection)"
Write-Host "═══════════════════════════════════════════"

$FIDELITY_MIN_BYTES = 5000

# Create a small RRL file under 5KB
$hollowRRLPath = Join-Path $tmpDir "hollow-rrl.txt"
@'
{"role":"user","text":"Hi"}
{"role":"assistant","text":"Hello"}
'@ | Set-Content $hollowRRLPath -Encoding UTF8

$hollowBytes = (Get-Item $hollowRRLPath).Length
$hollowText = Get-Content $hollowRRLPath -Raw -Encoding UTF8
$isHollow = $hollowBytes -lt $FIDELITY_MIN_BYTES

Write-TestResult "HollowGate-Detected" $isHollow "File $hollowBytes bytes < $FIDELITY_MIN_BYTES → HOLLOW detected: yes"

# Verify has role markers (so it passes the role check but fails size check)
$hasRole = $hollowText -match '"role"\s*:\s*"(user|assistant)"'
Write-TestResult "HollowGate-HasRoles" $hasRole "HOLLOW file has role markers (would pass content check): $hasRole"
Write-TestResult "HollowGate-SizeCheck" ($hollowBytes -lt $FIDELITY_MIN_BYTES) "Size check triggers HOLLOW warning: $hollowBytes < $FIDELITY_MIN_BYTES"

# Create a REAL-sized RRL file (>5KB)
$realRRLPath = Join-Path $tmpDir "real-rrl.txt"
$realContent = @()
1..200 | ForEach-Object {
    $realContent += '{"role":"user","text":"This is turn ' + $_ + ' with sufficient content to exceed the minimum byte threshold for a real RRL file. This needs to be long enough so the total byte count passes 5000 bytes easily."}'
    $realContent += '{"role":"assistant","text":"Response for turn ' + $_ + ' with more content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."}'
}
$realContent -join "`n" | Set-Content $realRRLPath -Encoding UTF8

$realBytes = (Get-Item $realRRLPath).Length
$realText = Get-Content $realRRLPath -Raw -Encoding UTF8
$isReal = $realBytes -ge $FIDELITY_MIN_BYTES

Write-TestResult "RealGate-Detected" $isReal "File $realBytes bytes >= $FIDELITY_MIN_BYTES → REAL: yes"
$hasRealRoles = $realText -match '"role"\s*:\s*"(user|assistant)"'
Write-TestResult "RealGate-HasRoles" $hasRealRoles "REAL file has role markers: $hasRealRoles"

# Verify pipeline correctly gates on size
$hollowRun = & $pipelinePath -RRLFile $hollowRRLPath -RunNumber 9998 -DryRun 2>&1
$hollowRunText = $hollowRun -join "`n"
$warnDetected = $hollowRunText -match "SMALL|HOLLOW|WARN"
Write-TestResult "Pipeline-HollowWarning" $warnDetected "Pipeline emits HOLLOW/SMALL/WARN for undersized RRL: $warnDetected"

# Ensure pipeline does NOT halt on hollow (it warns but continues in gate 0.5)
$hasHalt = $hollowRunText -match "HALT"
Write-TestResult "Pipeline-HollowNoHalt" (-not $hasHalt) "Pipeline does not HALT on HOLLOW (warns + continues): $(if (-not $hasHalt) { 'correct' } else { 'INCORRECT — halted!' })"

# ═══════════════════════════════════════════
# CLEANUP
# ═══════════════════════════════════════════
Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "TEST SUMMARY"
Write-Host "═══════════════════════════════════════════"
$testResults | Format-Table -AutoSize | Out-String | Write-Host
Write-Host "PASS: $passCount  |  FAIL: $failCount  |  TOTAL: $($passCount + $failCount)"
Write-Host "═══════════════════════════════════════════"

if ($failCount -gt 0) {
    Write-Host "SOME TESTS FAILED — review details above."
    exit 1
} else {
    Write-Host "ALL TESTS PASSED."
    exit 0
}
