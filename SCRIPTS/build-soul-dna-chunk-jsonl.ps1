# build-soul-dna-chunk-jsonl.ps1
# Emits one JSONL record per chunk — full verbatim text + metadata
# Run: pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/build-soul-dna-chunk-jsonl.ps1

$ErrorActionPreference = 'Stop'
$chunkDir  = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$indexPath = "$chunkDir/INDEX.md"
$outPath   = 'CANON/SOUL-DNA-BIBLE-CHUNK-JSONL-2026-04-05.jsonl'

if (-not (Test-Path $chunkDir)) { throw "Chunk dir missing: $chunkDir" }

$chunks = Get-ChildItem -Path $chunkDir -Filter '*.md' -File |
          Where-Object { $_.Name -ne 'INDEX.md' } |
          Sort-Object Name

$writer = [System.IO.StreamWriter]::new(
    (Resolve-Path '.').Path + '\' + $outPath,
    $false,
    [System.Text.Encoding]::UTF8
)

try {
    $seq = 0
    foreach ($f in $chunks) {
        $seq++
        $text    = Get-Content -LiteralPath $f.FullName -Raw
        $lines   = ($text -split '\r?\n').Count
        $bytes   = $f.Length
        $sha256  = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
        $relPath = $f.FullName -replace [regex]::Escape((Get-Location).Path + '\'), ''

        # Extract source path from first BEGIN FILE line if present
        $sourceLine = ($text -split '\r?\n' | Where-Object { $_ -match '^SHA256:' } | Select-Object -First 1)

        $obj = [ordered]@{
            seq        = $seq
            chunk_id   = $f.BaseName
            file_name  = $f.Name
            rel_path   = $relPath
            sha256     = $sha256
            bytes      = $bytes
            lines      = $lines
            generated  = '2026-04-05'
            corpus     = 'SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED'
            text       = $text
        }

        $json = $obj | ConvertTo-Json -Compress -Depth 3
        $writer.WriteLine($json)
    }
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

$fi = Get-Item $outPath
"WROTE: $($fi.FullName)"
"BYTES: $($fi.Length)"
"RECORDS: $seq"
