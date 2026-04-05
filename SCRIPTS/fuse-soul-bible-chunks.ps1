$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-FUSED-UNFILTERED-2026-04-05.md'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
  Where-Object { $_.Name -ne 'INDEX.md' } |
  Sort-Object Name

$writer = [System.IO.StreamWriter]::new((Join-Path (Get-Location).Path $outFile), $false, [System.Text.Encoding]::UTF8)
try {
  $writer.WriteLine('# SOUL DNA BIBLE RECAPTURE - FUSED RAW VERBATIM UNFILTERED')
  $writer.WriteLine('')
  $writer.WriteLine('Generated: 2026-04-05')
  $writer.WriteLine('Source basis: chunked authoritative set from CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05/')
  $writer.WriteLine(('Total chunks fused: {0}' -f $chunks.Count))
  $writer.WriteLine('')
  $writer.WriteLine('---')
  $writer.WriteLine('')

  foreach ($c in $chunks) {
    $writer.WriteLine(('## BEGIN CHUNK: {0}' -f $c.Name))
    $writer.WriteLine('')
    Get-Content -LiteralPath $c.FullName -ReadCount 500 | ForEach-Object {
      foreach ($line in $_) { $writer.WriteLine($line) }
    }
    $writer.WriteLine('')
    $writer.WriteLine(('## END CHUNK: {0}' -f $c.Name))
    $writer.WriteLine('')
    $writer.WriteLine('---')
    $writer.WriteLine('')
  }
}
finally {
  $writer.Flush()
  $writer.Dispose()
}

$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('LINES={0}' -f ((Get-Content -LiteralPath $outFile | Measure-Object -Line).Lines))
