$ErrorActionPreference = 'Stop'

$dateTag = '2026-04-05'
$outDir = "CANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-$dateTag"
$indexPath = Join-Path $outDir 'INDEX.md'
$errorPath = Join-Path $outDir 'ERRORS.log'

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

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

if (Test-Path $errorPath) { Remove-Item -LiteralPath $errorPath -Force }

$all = @()
foreach ($p in $patterns) {
  $all += Get-ChildItem -Path $p -File -ErrorAction SilentlyContinue
}
$files = $all | Sort-Object FullName -Unique

$cwd = (Get-Location).Path
function Get-Rel([string]$fullPath) {
  if ($fullPath.StartsWith($cwd, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullPath.Substring($cwd.Length).TrimStart('\\')
  }
  return $fullPath
}

$index = New-Object System.Collections.Generic.List[string]
$index.Add('# SOUL DNA BIBLE RECAPTURE - RAW VERBATIM UNFILTERED (CHUNKED)')
$index.Add('')
$index.Add("Generated: $dateTag")
$index.Add('Method: Deterministic chunked copy. No paraphrase. No rewrite.')
$index.Add(('{0}: {1}' -f 'Total sources detected', $files.Count))
$index.Add('')
$index.Add('## Chunks')

$success = 0
$failed = 0

for ($i = 0; $i -lt $files.Count; $i++) {
  $f = $files[$i]
  $n = $i + 1
  $rel = Get-Rel -fullPath $f.FullName

  try {
    $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
    $chunkName = ('{0:D4}-{1}.md' -f $n, $f.BaseName.Replace(' ', '_'))
    $chunkPath = Join-Path $outDir $chunkName

    $header = @(
      '# BEGIN SOURCE',
      "Source: $rel",
      "SHA256: $hash",
      ''
    )
    Set-Content -Path $chunkPath -Value $header -Encoding UTF8

    Get-Content -LiteralPath $f.FullName -ReadCount 500 | Add-Content -Path $chunkPath -Encoding UTF8

    Add-Content -Path $chunkPath -Value @('', '# END SOURCE') -Encoding UTF8

    $size = (Get-Item -LiteralPath $f.FullName).Length
    $index.Add(('{0}. [{1}]({2}) | bytes={3} | sha256={4}' -f $n, $rel, $chunkName, $size, $hash))
    $success++
  }
  catch {
    $failed++
    $msg = ('[{0}] {1} :: {2}' -f (Get-Date -Format s), $rel, $_.Exception.Message)
    Add-Content -Path $errorPath -Value $msg -Encoding UTF8
    $index.Add(('{0}. {1} | FAILED (see ERRORS.log)' -f $n, $rel))
  }
}

$index.Add('')
$index.Add('## Summary')
$index.Add(('{0}: {1}' -f 'Successful chunks', $success))
$index.Add(('{0}: {1}' -f 'Failed chunks', $failed))
$index.Add('')
$index.Add('This directory is the canonical unfiltered recapture set for this run.')

Set-Content -Path $indexPath -Value $index -Encoding UTF8

Write-Output ("OUT_DIR=$outDir")
Write-Output ("INDEX=$indexPath")
Write-Output ("SUCCESS=$success")
Write-Output ("FAILED=$failed")
