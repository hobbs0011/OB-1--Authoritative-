$ErrorActionPreference = 'Stop'
$kwRoot = "CANON/SOUL-KEYWORDS"
$idxPath = "$kwRoot/inverted-index.json"

$inverted = if (Test-Path $idxPath) {
  $raw = Get-Content $idxPath -Raw
  try { $raw | ConvertFrom-Json -AsHashtable } catch { @{} }
} else {
  @{}
}

$totalLines = 0
$newEntries = 0
Get-ChildItem "$kwRoot/rfkw-run*.txt" | ForEach-Object {
  $runName = $_.BaseName
  if ($runName -match 'rfkw-run(\d+)') {
    $runNum = [int]$matches[1]
    Get-Content $_.FullName | ForEach-Object {
      $totalLines++
      if ($_ -match '^\s*(\d+)\s*\|\s*\w+\s*\|\s*(.+?)\s*$') {
        $weight = [int]$matches[1]
        $term = $matches[2].Trim().ToLower()
        if (-not $inverted[$term]) {
          $inverted[$term] = @()
        }
        $already = $false
        foreach ($entry in $inverted[$term]) {
          if ($entry.run -eq $runNum) { $already = $true; break }
        }
        if (-not $already) {
          $inverted[$term] += @{run=$runNum; category="pipeline"; weight=$weight}
          $newEntries++
        }
      }
    }
  }
}

$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8
Write-Host "REBUILT: $idxPath"
Write-Host "  Terms: $($inverted.Count)"
Write-Host "  Raw lines processed: $totalLines"
Write-Host "  New entries added: $newEntries"
