$repo = "D:\OB-1-CANONICAL"
$run = 75
$ledgerDir = "$repo\CANON\HEAVY-LEDGER"
$rrlPath = "$repo\RRL\RRL-75.txt"
$rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlBytes = (Get-Item $rrlPath).Length
$rrlChars = $rrlText.Length

# Get next HL ID by numeric prefix (handles HL-037-..., HL-100-..., etc.)
$existing = Get-ChildItem $ledgerDir -Filter "HL-*.json" -File | ForEach-Object {
    if ($_.BaseName -match '^HL-(\d+)') { [int]$matches[1] }
} | Sort-Object
$nextHL = ($existing | Select-Object -Last 1) + 1

# Get parent hash from highest HL file
$allHLFiles = Get-ChildItem $ledgerDir -Filter "HL-*.json" -File
$maxFile = $allHLFiles | Sort-Object { [int]($_.BaseName -replace 'HL-', '') -replace '-.*','' } | Select-Object -Last 1
$parentHash = "GENESIS"
if ($maxFile) {
    $lastJson = Get-Content $maxFile.FullName -Raw | ConvertFrom-Json
    $parentHash = if ($lastJson.merkle_hash) { $lastJson.merkle_hash } else { "PARENT_GAP" }
}

# Compute hashes
function Compute-Sha256([string]$text) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return ([System.BitConverter]::ToString($hash) -replace '-', '').ToLower()
}

$timestamp = (Get-Date -Format 'o')
$soulHash = Compute-Sha256 $rrlText

$dnaPath = "$repo\CANON\SOUL\EXTRACT\dna-run$run.json"
$dnaHash = "DNA_GAP"
if (Test-Path $dnaPath) {
    $dnaText = Get-Content $dnaPath -Raw -Encoding UTF8
    $dnaHash = Compute-Sha256 $dnaText
}

$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"

$ledgerEntry = [ordered]@{
    hl_id = "HL-$nextHL"
    session_id = "sov100-roman-run$run"
    rrl_source = $rrlPath
    char_count = $rrlChars
    byte_count = $rrlBytes
    soul_hash = $soulHash
    dna_hash = $dnaHash
    merkle_parent = $parentHash
    merkle_hash = $ledgerHash
    sealed_at = $timestamp
    sov100 = $true
    run = $run
}

$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
Write-Host "STAGE 4 OK: HL-$nextHL → parent $parentHash | soul=$($soulHash.Substring(0,16))... | ledger=$($ledgerHash.Substring(0,16))..."
