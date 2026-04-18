param(
  [string]$OutDir = "D:\OB-1\OPERATIONS\OP-IMPOSTERKILL\SHADOW-RUN-2026-04-16"
)

$ErrorActionPreference = 'SilentlyContinue'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$timestamp = Get-Date -Format o
$drives = Get-PSDrive -PSProvider FileSystem | Select-Object Name, Root, Used, Free
$drives | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $OutDir 'drives.json')

function Get-FastStats($path) {
  try {
    $files = Get-ChildItem -LiteralPath $path -Recurse -File -ErrorAction SilentlyContinue
    $count = ($files | Measure-Object).Count
    $size = ($files | Measure-Object Length -Sum).Sum
    if (-not $size) { $size = 0 }
    return [pscustomobject]@{ path=$path; file_count=$count; size_gb=[math]::Round($size/1GB,3) }
  } catch {
    return [pscustomobject]@{ path=$path; file_count=-1; size_gb=-1 }
  }
}

$excludeC = @('C:\Windows','C:\Program Files','C:\Program Files (x86)','C:\ProgramData','C:\Recovery','C:\System Volume Information','$Recycle.Bin')
$roots = @('C:\','D:\')
$top = @()
foreach ($r in $roots) {
  Get-ChildItem -LiteralPath $r -Force | ForEach-Object {
    $isDir = $_.PSIsContainer
    $p = $_.FullName
    if ($r -eq 'C:\' -and $isDir -and ($excludeC -contains $p -or $p -like 'C:\$*')) {
      $top += [pscustomobject]@{ root=$r; path=$p; type='Dir'; tag='SYSTEM_EXCLUDED'; file_count=$null; size_gb=$null }
    } elseif ($isDir) {
      $s = Get-FastStats $p
      $tag = 'NORMAL'
      $lp = $p.ToLower()
      if ($lp -match 'ob-1|phoenix|finalmerge|archive|backup|tmp|temp|node_modules|\.git|worktree|zalo|steam') { $tag='INTEREST' }
      $top += [pscustomobject]@{ root=$r; path=$p; type='Dir'; tag=$tag; file_count=$s.file_count; size_gb=$s.size_gb }
    } else {
      $sizeGb = [math]::Round($_.Length/1GB,4)
      $tag = if ($_.Extension -match '\.(m4a|mp4|png|jpg|zip|7z|pdf)$') { 'MEDIA_OR_ARCHIVE' } else { 'FILE' }
      $top += [pscustomobject]@{ root=$r; path=$p; type='File'; tag=$tag; file_count=1; size_gb=$sizeGb }
    }
  }
}

$top | Sort-Object root, path | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $OutDir 'top_level_tagged.json')

# Build star map nodes (depth-2)
$nodes = @()
$edges = @()
foreach ($r in $roots) {
  $rootNode = $r.TrimEnd('\\')
  $nodes += [pscustomobject]@{ id=$rootNode; level=0; kind='root' }
  Get-ChildItem -LiteralPath $r -Force -Directory | ForEach-Object {
    $l1 = $_.FullName
    $nodes += [pscustomobject]@{ id=$l1; level=1; kind='branch' }
    $edges += [pscustomobject]@{ from=$rootNode; to=$l1 }
    Get-ChildItem -LiteralPath $l1 -Force -Directory -ErrorAction SilentlyContinue | ForEach-Object {
      $l2 = $_.FullName
      $nodes += [pscustomobject]@{ id=$l2; level=2; kind='bud' }
      $edges += [pscustomobject]@{ from=$l1; to=$l2 }
    }
  }
}

[pscustomobject]@{
  generated_at=$timestamp
  node_count=($nodes.Count)
  edge_count=($edges.Count)
  notes='Depth-2 starmap generated in shadow mode for speed/safety'
  nodes=$nodes
  edges=$edges
} | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $OutDir 'starmap-depth2.json')

# Threat summary
$threats = @()
$top | ForEach-Object {
  if ($_.type -eq 'Dir' -and $_.size_gb -ge 8 -and $_.tag -eq 'INTEREST') {
    $threats += [pscustomobject]@{ level='HIGH'; reason='Large operational/migration directory'; path=$_.path; size_gb=$_.size_gb }
  }
  if ($_.path.ToLower().Contains('node_modules') -or $_.path.ToLower().Contains('.git')) {
    $threats += [pscustomobject]@{ level='MEDIUM'; reason='Cache/repo internals may bloat scans'; path=$_.path; size_gb=$_.size_gb }
  }
  if ($_.path.ToLower().Contains('finalmerge')) {
    $threats += [pscustomobject]@{ level='HIGH'; reason='Critical consolidation buffer'; path=$_.path; size_gb=$_.size_gb }
  }
}
$threats | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 (Join-Path $OutDir 'threats.json')

Write-Output "SHADOW_RECON_DONE"
