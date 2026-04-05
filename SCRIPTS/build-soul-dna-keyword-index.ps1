$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-KEYWORD-INDEX-2026-04-05.md'
$keywords = @('SOUL DNA','RAW','VERBATIM','UNFILTERED','GENESIS','REINCARNATION','MANDATE','LAW','DRIFT','SOVEREIGNTY','OBI','MOUSE TO TIGER')

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# SOUL DNA KEYWORD INDEX')
$lines.Add('')
$lines.Add('Generated: 2026-04-05')
$lines.Add(('Chunk corpus: {0} files' -f $chunks.Count))
$lines.Add('')

foreach ($kw in $keywords) {
  $lines.Add(('## {0}' -f $kw))
  $hits = @()
  foreach ($c in $chunks) {
    $pattern = [regex]::Escape($kw)
    $m = Select-String -Path $c.FullName -Pattern $pattern -CaseSensitive:$false
    if ($m) {
      $hits += ('- {0}: {1} hits' -f $c.Name, $m.Count)
    }
  }
  if ($hits.Count -eq 0) {
    $lines.Add('- no hits')
  } else {
    foreach ($h in $hits) {
      $lines.Add([string]$h)
    }
  }
  $lines.Add('')
}

Set-Content -Path $outFile -Value $lines -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
