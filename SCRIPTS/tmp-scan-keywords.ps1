$ErrorActionPreference = 'SilentlyContinue'

$Destination = 'C:\Users\mrmic\Desktop\THE.SOUL.DNA. - Pheonix - Rising - Protocol'
$roots = @(
  'C:\Users\mrmic\Desktop\OB-1',
  'C:\Users\mrmic\Desktop'
)
$keywords = @('soul','dna','blueprint','ledger','layer','canon')
$textExt = @(
  '.md','.txt','.json','.jsonl','.csv','.yml','.yaml','.xml','.html','.htm',
  '.js','.ts','.tsx','.jsx','.py','.ps1','.sh','.sql','.toml','.ini','.cfg','.log'
)
$excludeDirRegex = '\\(\.git|node_modules|\.venv|dist|build|out|\.next|\.cache|OB-1\.worktrees)\\'

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$matches = New-Object System.Collections.Generic.List[object]

foreach ($root in $roots) {
  if (-not (Test-Path -LiteralPath $root)) { continue }

  Get-ChildItem -LiteralPath $root -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch $excludeDirRegex } |
    ForEach-Object {
      $file = $_
      $full = $file.FullName
      $nameLower = $file.Name.ToLowerInvariant()

      $nameHit = $false
      foreach ($k in $keywords) {
        if ($nameLower -like "*$k*") { $nameHit = $true; break }
      }

      $contentHit = $false
      if (-not $nameHit -and ($textExt -contains $file.Extension.ToLowerInvariant())) {
        try {
          $sample = Get-Content -LiteralPath $full -Raw -TotalCount 12000
          if ($null -ne $sample) {
            $lc = $sample.ToLowerInvariant()
            foreach ($k in $keywords) {
              if ($lc -like "*$k*") { $contentHit = $true; break }
            }
          }
        } catch {}
      }

      if ($nameHit -or $contentHit) {
        $rootName = Split-Path -Leaf $root
        $relative = $full.Substring($root.Length).TrimStart('\\')
        $destPath = Join-Path $Destination (Join-Path $rootName $relative)
        $destDir = Split-Path -Parent $destPath

        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Copy-Item -LiteralPath $full -Destination $destPath -Force

        $matches.Add([pscustomobject]@{
          Source = $full
          Destination = $destPath
          MatchedBy = if ($nameHit) { 'name' } else { 'content' }
        }) | Out-Null
      }
    }
}

$uniq = $matches | Sort-Object Source -Unique
$report = Join-Path $Destination 'SCAN_REPORT.csv'
$uniq | Export-Csv -NoTypeInformation -Path $report -Encoding UTF8

Write-Output "Copied $($uniq.Count) unique files"
Write-Output "Report: $report"
