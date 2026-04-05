
# verify-soul-dna-corpus.ps1
# Cross-checks all corpus artifacts for integrity alignment
# Run: pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/verify-soul-dna-corpus.ps1

$ErrorActionPreference = 'Continue'
$chunkDir  = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$manifestF = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-MANIFEST-2026-04-05.json'
$quoteFeed = 'CANON/SOUL-DNA-BIBLE-QUOTE-FEED-2026-04-05.jsonl'
$quoteLedg = 'CANON/SOUL-DNA-BIBLE-QUOTE-LEDGER-2026-04-05.md'
$quoteCanon= 'CANON/SOUL-DNA-BIBLE-QUOTE-CANONICAL-2026-04-05.md'
$chunkJsonl= 'CANON/SOUL-DNA-BIBLE-CHUNK-JSONL-2026-04-05.jsonl'
$outPath   = 'CANON/SOUL-DNA-CORPUS-VERIFICATION-REPORT-2026-04-05.md'

$checks  = @()
$PASS    = 'PASS'
$FAIL    = 'FAIL'
$UNKNOWN = 'UNKNOWN'

function Check($name, $expected, $actual, $note='') {
    $status = if ($actual -eq $expected) { $PASS } else { $FAIL }
    [ordered]@{ name=$name; expected=$expected; actual=$actual; status=$status; note=$note }
}

# 1) Chunk dir count
$chunkFiles = Get-ChildItem -Path $chunkDir -Filter '*.md' -File |
              Where-Object { $_.Name -ne 'INDEX.md' }
$chunkCount = $chunkFiles.Count
$checks += Check 'Chunk file count in dir' 121 $chunkCount

# 2) Manifest entry count
$manifestCount = $UNKNOWN
if (Test-Path $manifestF) {
    try {
        $manifest = Get-Content $manifestF -Raw | ConvertFrom-Json
        $manifestCount = @($manifest).Count
        $checks += Check 'Manifest JSON entry count' 121 $manifestCount
    } catch {
        $checks += @{ name='Manifest JSON entry count'; expected=121; actual='PARSE_ERROR'; status=$FAIL; note=$_.Exception.Message }
    }
} else {
    $checks += @{ name='Manifest JSON entry count'; expected=121; actual='FILE_MISSING'; status=$FAIL; note='' }
}

# 3) Quote feed record count
if (Test-Path $quoteFeed) {
    $feedCount = (Get-Content $quoteFeed | Measure-Object).Count
    $checks += @{ name='Quote JSONL feed record count'; expected='2878'; actual=$feedCount; status=if($feedCount -eq 2878){$PASS}else{'INFO'}; note='previously 2878 — recheck if regenerated' }
} else {
    $checks += @{ name='Quote JSONL feed record count'; expected='2878'; actual='FILE_MISSING'; status=$FAIL; note='' }
}

# 4) Quote ledger line count check (header ~30 lines + 1 per entry)
if (Test-Path $quoteLedg) {
    $ledgLines = (Get-Content $quoteLedg | Measure-Object).Count
    $checks += @{ name='Quote Ledger non-empty'; expected='>100'; actual=$ledgLines; status=if($ledgLines -gt 100){$PASS}else{$FAIL}; note='' }
} else {
    $checks += @{ name='Quote Ledger file exists'; expected='exists'; actual='MISSING'; status=$FAIL; note='' }
}

# 5) Quote canonical unique hash count
if (Test-Path $quoteCanon) {
    $uniqueCount = (Select-String -Path $quoteCanon -Pattern '^### QH-').Count
    $checks += @{ name='Canonical unique hash count'; expected='1358'; actual=$uniqueCount; status=if($uniqueCount -eq 1358){$PASS}else{'INFO'}; note='previously 1358 unique hashes' }
} else {
    $checks += @{ name='Canonical unique hash count'; expected='1358'; actual='MISSING'; status=$FAIL; note='' }
}

# 6) Chunk JSONL record count (if exists)
if (Test-Path $chunkJsonl) {
    $cjCount = (Get-Content $chunkJsonl | Measure-Object).Count
    $checks += Check 'Chunk JSONL record count' 121 $cjCount
} else {
    $checks += @{ name='Chunk JSONL record count'; expected=121; actual='FILE_MISSING'; status='PENDING'; note='Run build-soul-dna-chunk-jsonl.ps1 first' }
}

# 7) SHA-256 spot-check first 5 chunks vs manifest (if manifest loaded)
$sha_spot = 'SKIP'
if ($manifestCount -ne $UNKNOWN -and $manifestCount -gt 0) {
    $manifest5 = @($manifest) | Select-Object -First 5
    $mismatches = 0
    foreach ($entry in $manifest5) {
        $src = Join-Path $chunkDir $entry.file
        if (Test-Path $src) {
            $actual_sha = (Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash
            if ($actual_sha -ne $entry.sha256) { $mismatches++ }
        }
    }
    $sha_spot = if ($mismatches -eq 0) { $PASS } else { "FAIL:$mismatches mismatches" }
}
$checks += @{ name='SHA-256 spot-check (first 5 chunks vs manifest)'; expected=$PASS; actual=$sha_spot; status=if($sha_spot -eq $PASS){$PASS}elseif($sha_spot -eq 'SKIP'){'SKIP'}else{$FAIL}; note='' }

# Build report
$lines = @()
$lines += "# SOUL DNA Corpus Verification Report"
$lines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += ""
$lines += "## Summary"
$passCount = ($checks | Where-Object { $_.status -eq $PASS }).Count
$failCount = ($checks | Where-Object { $_.status -eq $FAIL }).Count
$lines += "- Total checks: $($checks.Count)"
$lines += "- PASS: $passCount"
$lines += "- FAIL: $failCount"
$lines += "- INFO/PENDING/SKIP: $($checks.Count - $passCount - $failCount)"
$lines += ""
$lines += "## Detailed Results"
$lines += ""
$lines += "| # | Check | Expected | Actual | Status | Note |"
$lines += "|---|-------|----------|--------|--------|------|"
$i = 0
foreach ($c in $checks) {
    $i++
    $lines += "| $i | $($c.name) | $($c.expected) | $($c.actual) | **$($c.status)** | $($c.note) |"
}
$lines += ""
$lines += "## Corpus Artifact Inventory"
$lines += ""
$artifacts = @(
    "CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05/ (121 chunk files)",
    "CANON/SOUL-DNA-BIBLE-RECAPTURE-FUSED-UNFILTERED-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-KEYWORD-INDEX-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-QUOTE-LEDGER-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-THEMATIC-CROSSWALK-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-RECAPTURE-MANIFEST-2026-04-05.json",
    "CANON/SOUL-DNA-BIBLE-QUOTE-CANONICAL-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-SOURCE-CHRONOLOGY-MATRIX-2026-04-05.md",
    "CANON/SOUL-DNA-BIBLE-QUOTE-FEED-2026-04-05.jsonl",
    "CANON/SOUL-DNA-BIBLE-CHUNK-JSONL-2026-04-05.jsonl"
)
foreach ($a in $artifacts) {
    $fpath = $a -split ' ' | Select-Object -First 1
    $exists = Test-Path $fpath
    $status = if ($exists) { "EXISTS" } else { "MISSING" }
    $sz = if ($exists) {
        $fi = Get-Item $fpath -ErrorAction SilentlyContinue
        if ($fi.PSIsContainer) { "dir" } else { "$($fi.Length) bytes" }
    } else { "-" }
    $lines += "- [$status] $a — $sz"
}

$lines | Set-Content $outPath -Encoding UTF8
"VERIFICATION REPORT WRITTEN: $outPath"
$lines | Select-Object -First 25 | ForEach-Object { $_ }
