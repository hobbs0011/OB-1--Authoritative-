$ErrorActionPreference = 'Stop'

$inDir = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$outFile = 'CANON/SOUL-DNA-BIBLE-QUOTE-CANONICAL-2026-04-05.md'

$chunks = Get-ChildItem -Path $inDir -File -Filter '*.md' |
	Where-Object { $_.Name -ne 'INDEX.md' } |
	Sort-Object Name

$quoteMap = @{}
$totalOccurrences = 0

foreach ($c in $chunks) {
	$content = Get-Content -LiteralPath $c.FullName
	for ($i = 0; $i -lt $content.Count; $i++) {
		$line = $content[$i]
		if ($line -match '^\s*>\s?.+') {
			$quoteHash = (Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($line))) -Algorithm SHA256).Hash

			if (-not $quoteMap.ContainsKey($quoteHash)) {
				$quoteMap[$quoteHash] = [pscustomobject]@{
					Quote = $line
					Occurrences = New-Object System.Collections.Generic.List[object]
				}
			}

			[void]$quoteMap[$quoteHash].Occurrences.Add([pscustomobject]@{
				Chunk = $c.Name
				Line = $i + 1
			})

			$totalOccurrences++
		}
	}
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# SOUL DNA QUOTE CANONICALIZATION')
$lines.Add('')
$lines.Add('Generated: 2026-04-05')
$lines.Add(('Chunk corpus: {0} files' -f $chunks.Count))
$lines.Add(('Unique quote hashes: {0}' -f $quoteMap.Count))
$lines.Add(('Total quote occurrences: {0}' -f $totalOccurrences))
$lines.Add(('Exact duplicates removed: {0}' -f ($totalOccurrences - $quoteMap.Count)))
$lines.Add('')

$sorted = $quoteMap.GetEnumerator() | Sort-Object Name
foreach ($entry in $sorted) {
	$hash = $entry.Key
	$payload = $entry.Value
	$lines.Add(('## HASH: {0}' -f $hash))
	$lines.Add(('Occurrences: {0}' -f $payload.Occurrences.Count))
	$lines.Add(('Quote: {0}' -f $payload.Quote))
	$lines.Add('Sources:')
	foreach ($occ in $payload.Occurrences) {
		$lines.Add(('- {0}:L{1}' -f $occ.Chunk, $occ.Line))
	}
	$lines.Add('')
}

Set-Content -Path $outFile -Value $lines -Encoding UTF8
$fi = Get-Item -LiteralPath $outFile
Write-Output ('OUT_FILE={0}' -f $fi.FullName)
Write-Output ('BYTES={0}' -f $fi.Length)
Write-Output ('UNIQUE_QUOTES={0}' -f $quoteMap.Count)
Write-Output ('TOTAL_OCCURRENCES={0}' -f $totalOccurrences)
