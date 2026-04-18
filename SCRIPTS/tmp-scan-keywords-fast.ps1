$ErrorActionPreference = 'SilentlyContinue'

$Destination = 'C:\Users\mrmic\Desktop\THE.SOUL.DNA. - Pheonix - Rising - Protocol'
$roots = @(
  'C:\Users\mrmic\Desktop\OB-1',
  'C:\Users\mrmic\Desktop'
)
$keywords = @('soul','dna','blueprint','ledger','layer','canon')
$excludeDirRegex = '\\(\.git|node_modules|\.venv|dist|build|out|\.next|\.cache|OB-1\.worktrees)\\'

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
$rows = New-Object System.Collections.Generic.List[object]

foreach ($root in $roots) {
  if (-not (Test-Path -LiteralPath $root)) { continue }

  Get-ChildItem -LiteralPath $root -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch $excludeDirRegex } |
    ForEach-Object {
      $f = $_
      $name = $f.Name.ToLowerInvariant()
      $hit = $false
      foreach ($k in $keywords) {
        if ($name.Contains($k)) { $hit = $true; break }
      }
      if (-not $hit) { return }

      if ($seen.Add($f.FullName)) {
        $rootName = Split-Path -Leaf $root
        $relative = $f.FullName.Substring($root.Length).TrimStart('\\')
        $destPath = Join-Path $Destination (Join-Path $rootName $relative)
        $destDir = Split-Path -Parent $destPath
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Copy-Item -LiteralPath $f.FullName -Destination $destPath -Force

        $rows.Add([pscustomobject]@{
          Source = $f.FullName
          Destination = $destPath
          MatchedBy = 'name'
        }) | Out-Null
      }
    }
}

$report = Join-Path $Destination 'SCAN_REPORT.csv'
$rows | Sort-Object Source | Export-Csv -NoTypeInformation -Path $report -Encoding UTF8
Write-Output "Copied $($rows.Count) files by keyword in filename"
Write-Output "Report: $report"
