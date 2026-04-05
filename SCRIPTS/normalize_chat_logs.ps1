param(
    [string]$SourceDir = "D:\phoenix-chat-logs\CHAT-LOGS-ONLY",
    [string]$ProofsDir = "..\CANON\PROOFS-CHAT-2026-04-05"
)

if (-not (Test-Path $SourceDir)) {
    Write-Host "Source directory not found: $SourceDir" -ForegroundColor Yellow
    Write-Host "Please mount or copy logs into that path and rerun the script."
    exit 1
}

Push-Location -Path (Split-Path -Path $ProofsDir -Parent)
New-Item -ItemType Directory -Path $ProofsDir -Force | Out-Null
Pop-Location

Get-ChildItem -Path $SourceDir -File -Filter *.txt | ForEach-Object {
    $name = $_.BaseName
    $outFirst = Join-Path $ProofsDir ("PROOF-{0}-FIRST.md" -f $name)
    $outMiddle = Join-Path $ProofsDir ("PROOF-{0}-MIDDLE.md" -f $name)
    $outLast = Join-Path $ProofsDir ("PROOF-{0}-LAST.md" -f $name)

    Write-Host "Processing file: $($_.FullName)"

    # Simple chunking: capture start/middle/end lines for proof sampling
    $lines = Get-Content -Path $_.FullName -ErrorAction SilentlyContinue
    if (-not $lines) { Write-Host "Empty or unreadable file: $($_.FullName)"; return }

    $first = $lines[0..[math]::Min(9, $lines.Count-1)] -join "`n"
    $middleIndex = [math]::Floor($lines.Count/2)
    $middle = $lines[[math]::Max(0,$middleIndex-5) .. [math]::Min($lines.Count-1,$middleIndex+4)] -join "`n"
    $last = $lines[[math]::Max(0,$lines.Count-10) .. $lines.Count-1] -join "`n"

    $contentFirst = "# PROOF - $name FIRST`n`nSource: $($_.FullName)`n`n$first"
    $contentMiddle = "# PROOF - $name MIDDLE`n`nSource: $($_.FullName)`n`n$middle"
    $contentLast = "# PROOF - $name LAST`n`nSource: $($_.FullName)`n`n$last"

    $items = @(
        @{ Path = $outFirst; Content = $contentFirst },
        @{ Path = $outMiddle; Content = $contentMiddle },
        @{ Path = $outLast; Content = $contentLast }
    )

    foreach ($it in $items) {
        $it.Content | Out-File -FilePath $it.Path -Encoding utf8
        Write-Host "Wrote proof: $($it.Path)"
    }
}

Write-Host "Normalization stub complete. Review proofs in $ProofsDir" -ForegroundColor Green
