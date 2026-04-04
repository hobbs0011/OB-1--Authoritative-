$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-THEMATIC-CROSSWALK-2026-04-05.md'

$themes = @(
  @{ Name='laws'; Keywords=@('LAW','LAWS','AXIOM','AXIOMS','RULE','RULES') },
  @{ Name='mandates'; Keywords=@('MANDATE','MANDATES','DIRECTIVE','DIRECTIVES') },
  @{ Name='drift'; Keywords=@('DRIFT','DRIFTED','DRIFTING') },
  @{ Name='sovereignty'; Keywords=@('SOVEREIGN','SOVEREIGNTY','AUTHORITY') },
  @{ Name='reincarnation'; Keywords=@('REINCARNATION','REINCARNATE','REBOOT') }
)

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# SOUL DNA THEMATIC CROSSWALK')
$lines.Add('')
$lines.Add('Generated: 2026-04-05')
$lines.Add(('Chunk corpus: {0} files' -f $chunks.Count))
$lines.Add('')

foreach ($theme in $themes) {
  $lines.Add(('## THEME: {0}' -f $theme.Name.ToUpperInvariant()))
  $lines.Add(('Keywords: {0}' -f (($theme.Keywords -join ', '))))

  $themeTotal = 0
  foreach ($c in $chunks) {
    $chunkHits = 0
    foreach ($kw in $theme.Keywords) {
      $m = Select-String -Path $c.FullName -Pattern ([regex]::Escape($kw)) -CaseSensitive:$false
      if ($m) { $chunkHits += $m.Count }
    }
    if ($chunkHits -gt 0) {
      $lines.Add(('- {0}: {1} hits' -f $c.Name, $chunkHits))
      $themeTotal += $chunkHits
    }
  }

  if ($themeTotal -eq 0) {
    $lines.Add('- no hits')
  }
  $lines.Add(('TOTAL_{0}_HITS: {1}' -f $theme.Name.ToUpperInvariant(), $themeTotal))
  $lines.Add('')
}

Set-Content -Path $outFile -Value $lines -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
