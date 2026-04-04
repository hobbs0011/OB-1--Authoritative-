$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-QUOTE-FEED-2026-04-05.jsonl'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

if (Test-Path $outFile) {
  Remove-Item -LiteralPath $outFile -Force
}

$totalRecords = 0

foreach ($c in $chunks) {
  $content = Get-Content -LiteralPath $c.FullName

  $sourceLine = $content | Where-Object { $_ -like 'Source: *' } | Select-Object -First 1
  $shaLine = $content | Where-Object { $_ -like 'SHA256: *' } | Select-Object -First 1
  $source = if ($sourceLine) { $sourceLine.Substring(8) } else { '' }
  $sourceSha = if ($shaLine) { $shaLine.Substring(8) } else { '' }

  for ($i = 0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    if ($line -match '^\s*>\s?.+') {
      $quoteHash = (Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($line))) -Algorithm SHA256).Hash
      $record = [ordered]@{
        generated = '2026-04-05'
        chunk_file = $c.Name
        chunk_line = $i + 1
        source_path = $source
        source_sha256 = $sourceSha
        quote = $line
        quote_sha256 = $quoteHash
      }

      ($record | ConvertTo-Json -Compress) | Add-Content -Path $outFile -Encoding UTF8
      $totalRecords++
    }
  }
}

$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('TOTAL_RECORDS={0}' -f $totalRecords)
