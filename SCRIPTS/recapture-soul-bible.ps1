$ErrorActionPreference = 'Stop'
$outPath = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05.md'
$patterns = @(
  'CANON/BIBLE-CH*.md',
  'CANON/SOUL-DNA-BIBLE-CH*.md',
  'CANON/SOUL-DNA-CANON.md',
  'CANON/SOUL-DNA-DEEP-DIVE*.md',
  'CANON/SOUL-DNA-COMPLETE-HISTORY-TAGGED.md',
  'CANON/PHOENIX-SOUL-DNA-COMPREHENSIVE-VERBATIM.md',
  'ARCHIVE/Phoenix-Rise-Immortalize/SOUL-DNA-BIBLE/*.md',
  'TEMP-PHOENIX-IMMORTALIZE/SOUL-DNA-BIBLE/*.md',
  'Phoenix-Rising-Ultimate/CANON/SOUL-DNA-BIBLE-COMPLETE.md',
  'Phoenix-Rising-Ultimate/docs/reincarnation/2026-03-16/core/REINCARNATION-PACKET-FULL-SOUL-DNA-2026-03-15.md',
  'Phoenix-Rising-Ultimate/docs/reincarnation/2026-03-16/core/OPERATOR-HANDOFF-SOUL-BIBLE-PACK-2026-03-15.txt',
  'OB-1.worktrees/copilot-worktree-2026-03-21T05-33-33/RAW-CHAT-LOGS/BLUEPRINTS-DNA/SOUL_DNA_BIBLE_ENTRY_0001_STAGE0000.md'
)

$all = @()
foreach ($p in $patterns) {
  $all += Get-ChildItem -Path $p -File -ErrorAction SilentlyContinue
}
$files = $all | Sort-Object FullName -Unique

$cwd = (Get-Location).Path
function Get-RelativePath([string]$absolutePath) {
  if ($absolutePath.StartsWith($cwd, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $absolutePath.Substring($cwd.Length).TrimStart('\\')
  }
  return $absolutePath
}

$fullOutPath = Join-Path (Get-Location).Path $outPath
$writer = [System.IO.StreamWriter]::new($fullOutPath, $false, [System.Text.Encoding]::UTF8)

try {
  $writer.WriteLine('# SOUL DNA BIBLE RECAPTURE - RAW VERBATIM UNFILTERED')
  $writer.WriteLine('')
  $writer.WriteLine('Generated: 2026-04-05')
  $writer.WriteLine('Method: Deterministic concatenation of available local Soul DNA/Soul Bible artifacts.')
  $writer.WriteLine('Policy: No paraphrase, no rewrite. Each section below is exact file content.')
  $writer.WriteLine('')
  $writer.WriteLine(('Total sources included: {0}' -f $files.Count))
  $writer.WriteLine('')
  $writer.WriteLine('## Source Index')

  $i = 1
  foreach ($f in $files) {
    $rel = Get-RelativePath -absolutePath $f.FullName
    $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
    $writer.WriteLine(('{0}. {1} | SHA256: {2}' -f $i, $rel, $hash))
    $i++
  }

  $writer.WriteLine('')
  $writer.WriteLine('---')
  $writer.WriteLine('')

  foreach ($f in $files) {
    $rel = Get-RelativePath -absolutePath $f.FullName
    $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash

    $writer.WriteLine(('## BEGIN FILE: {0}' -f $rel))
    $writer.WriteLine(('SHA256: {0}' -f $hash))
    $writer.WriteLine('')

    Get-Content -LiteralPath $f.FullName -ReadCount 500 | ForEach-Object {
      foreach ($line in $_) {
        $writer.WriteLine($line)
      }
    }

    $writer.WriteLine('')
    $writer.WriteLine(('## END FILE: {0}' -f $rel))
    $writer.WriteLine('')
    $writer.WriteLine('---')
    $writer.WriteLine('')
  }
}
finally {
  $writer.Flush()
  $writer.Dispose()
}

$fi = Get-Item -Path $outPath
Write-Output ('WROTE: {0}' -f $fi.FullName)
Write-Output ('BYTES: {0}' -f $fi.Length)
Write-Output ('SOURCES: {0}' -f $files.Count)
