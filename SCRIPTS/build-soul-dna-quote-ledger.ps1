$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-QUOTE-LEDGER-2026-04-05.md'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# SOUL DNA QUOTE LEDGER')
$lines.Add('')
$lines.Add('Generated: 2026-04-05')
$lines.Add(('Chunk corpus: {0} files' -f $chunks.Count))
$lines.Add('Quote rule: Markdown blockquote lines only (exact line copy).')
$lines.Add('')

$totalQuotes = 0

foreach ($c in $chunks) {
  $content = Get-Content -LiteralPath $c.FullName
  $hits = @()
  for ($i = 0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    if ($line -match '^\s*>\s?.+') {
      $hits += [pscustomobject]@{
        LineNumber = $i + 1
        Quote = $line
      }
    }
  }

  if ($hits.Count -gt 0) {
    $lines.Add(('## {0}' -f $c.Name))
    $lines.Add(('QuoteCount: {0}' -f $hits.Count))
    foreach ($h in $hits) {
      $lines.Add(('- L{0}: {1}' -f $h.LineNumber, $h.Quote))
    }
    $lines.Add('')
    $totalQuotes += $hits.Count
  }
}

$lines.Insert(5, ('Total quotes found: {0}' -f $totalQuotes))

Set-Content -Path $outFile -Value $lines -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('TOTAL_QUOTES={0}' -f $totalQuotes)
