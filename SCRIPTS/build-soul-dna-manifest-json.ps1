$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-MANIFEST-2026-04-05.json'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$manifestChunks = @()

foreach ($c in $chunks) {
  $content = Get-Content -LiteralPath $c.FullName

  $sourceLine = $content | Where-Object { $_ -like 'Source: *' } | Select-Object -First 1
  $shaLine = $content | Where-Object { $_ -like 'SHA256: *' } | Select-Object -First 1

  $source = if ($sourceLine) { $sourceLine.Substring(8) } else { '' }
  $sha = if ($shaLine) { $shaLine.Substring(8) } else { '' }

  $quoteCount = ($content | Where-Object { $_ -match '^\s*>\s?.+' } | Measure-Object).Count

  $manifestChunks += [pscustomobject]@{
    chunk_file = $c.Name
    source = $source
    sha256 = $sha
    bytes = $c.Length
    line_count = $content.Count
    quote_count = $quoteCount
  }
}

$manifest = [pscustomobject]@{
  generated = '2026-04-05'
  corpus_dir = $inDir
  total_chunks = $manifestChunks.Count
  chunks = $manifestChunks
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $outFile -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('TOTAL_CHUNKS={0}' -f $manifestChunks.Count)
