$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-SOURCE-CHRONOLOGY-MATRIX-2026-04-05.md'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$rows = New-Object System.Collections.Generic.List[object]

function Get-Cluster([string]$sourcePath) {
  if ($sourcePath -like 'ARCHIVE/*') { return 'ARCHIVE' }
  if ($sourcePath -like 'CANON/*') { return 'CANON' }
  if ($sourcePath -like 'TEMP-PHOENIX-IMMORTALIZE/*') { return 'TEMP-PHOENIX-IMMORTALIZE' }
  if ($sourcePath -like 'Phoenix-Rising-Ultimate/*') { return 'PHOENIX-RISING-ULTIMATE' }
  if ($sourcePath -like 'OB-1.worktrees/*') { return 'OB-1.WORKTREES' }
  return 'OTHER'
}

function Get-YearTag([string]$text) {
  $m = [regex]::Match($text, '(19|20)\d{2}')
  if ($m.Success) { return $m.Value }
  return 'NA'
}

foreach ($c in $chunks) {
  $content = Get-Content -LiteralPath $c.FullName
  $sourceLine = $content | Where-Object { $_ -like 'Source: *' } | Select-Object -First 1
  $source = if ($sourceLine) { $sourceLine.Substring(8) } else { '' }
  $cluster = Get-Cluster $source
  $year = Get-YearTag $source

  $rows.Add([pscustomobject]@{
    Chunk = $c.Name
    Source = $source
    Cluster = $cluster
    YearTag = $year
  }) | Out-Null
}

$clusterSummary = $rows | Group-Object Cluster | Sort-Object Name
$yearSummary = $rows | Group-Object YearTag | Sort-Object Name

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# SOUL DNA SOURCE CHRONOLOGY MATRIX')
$lines.Add('')
$lines.Add('Generated: 2026-04-05')
$lines.Add(('Chunk corpus: {0} files' -f $chunks.Count))
$lines.Add('')
$lines.Add('## Cluster Summary')
$lines.Add('| Cluster | Count |')
$lines.Add('|---|---:|')
foreach ($g in $clusterSummary) {
  $lines.Add(('| {0} | {1} |' -f $g.Name, $g.Count))
}
$lines.Add('')
$lines.Add('## Year Tag Summary (from source path)')
$lines.Add('| YearTag | Count |')
$lines.Add('|---|---:|')
foreach ($g in $yearSummary) {
  $lines.Add(('| {0} | {1} |' -f $g.Name, $g.Count))
}
$lines.Add('')
$lines.Add('## Chronology Matrix')
$lines.Add('| Chunk | Cluster | YearTag | Source |')
$lines.Add('|---|---|---|---|')
foreach ($row in $rows) {
  $safeSource = $row.Source -replace '\|', '\\|'
  $lines.Add(('| {0} | {1} | {2} | {3} |' -f $row.Chunk, $row.Cluster, $row.YearTag, $safeSource))
}

Set-Content -Path $outFile -Value $lines -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('TOTAL_ROWS={0}' -f $rows.Count)
