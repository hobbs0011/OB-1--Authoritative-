$repoRoot = 'D:\OB-1-CANONICAL'
$cmdDir = Join-Path $repoRoot '.kilo\command'
$obiPath = Join-Path $repoRoot 'SCRIPTS\obi.ps1'

$survivors = Get-ChildItem $cmdDir -Filter '*.md' -File | Select-Object -ExpandProperty BaseName
$obiRaw = Get-Content $obiPath -Raw -ErrorAction SilentlyContinue

$vsM = [regex]::Match($obiRaw, 'ValidateSet\(\"([^\"]+)\"\)')
$implemented = @()
if ($vsM.Success) { $implemented = $vsM.Groups[1].Value -split ',\s*' }

$switchM = [regex]::Match($obiRaw, 'switch\s*\(\s*\$Command\s*\)\s*\{(.*)\}\s*$', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$switchCmds = @()
if ($switchM.Success) {
    $switchBody = $switchM.Groups[1].Value
    $switchCmds = [regex]::Matches($switchBody, '"([^"]+)"\s*\{') | ForEach-Object { $_.Groups[1].Value }
}

$allImplemented = @($implemented + $switchCmds) | Sort-Object -Unique

foreach ($s in $survivors) {
    $status = if ($s -in $allImplemented) { 'IMPLEMENTED' } else { 'DEAD' }
    Write-Output "$s : $status"
}
