$repo = "D:\OB-1-CANONICAL"
$rrlPath = "$repo\RRL\RRL-75.txt"

if (-not (Test-Path $rrlPath)) {
    $jsonlDir = "$env:USERPROFILE\.claude\projects\d--OB-1-CANONICAL"
    if (-not (Test-Path $jsonlDir)) { Write-Error "JSONL dir not found: $jsonlDir"; exit 1 }
    $jsonlFile = Get-ChildItem $jsonlDir -Filter "*.jsonl" -ErrorAction SilentlyContinue |
                 Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $jsonlFile) { Write-Error "No JSONL in $jsonlDir"; exit 1 }
    Copy-Item $jsonlFile.FullName $rrlPath -Force
    Write-Host "RRL copied from $($jsonlFile.FullName) ($($jsonlFile.Length) bytes)"
}

$rrlBytes = (Get-Item $rrlPath).Length
$rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlChars = $rrlText.Length
Write-Host "RRL path: $rrlPath"
Write-Host "RRL bytes: $rrlBytes"
Write-Host "RRL chars: $rrlChars"

if ($rrlBytes -lt 5000) { Write-Error "RRL HOLLOW: <5KB"; exit 1 }
if ($rrlBytes -lt 50000) { Write-Warning "RRL SIZE WARN: $rrlBytes bytes (< 50KB)" }

$hasUser = $rrlText -match '"role"\s*:\s*"user"'
$hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
Write-Host "FIDELITY: user=$hasUser assistant=$hasAssistant"
if (-not $hasUser -or -not $hasAssistant) { Write-Warning "RRL FIDELITY WARN: one-sided" }

Write-Host "STAGE 1 OK"
