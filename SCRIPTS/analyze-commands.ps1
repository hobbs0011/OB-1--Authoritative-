$obiRaw = Get-Content 'D:\OB-1-CANONICAL\SCRIPTS\obi.ps1' -Raw
$cmdDir = 'D:\OB-1-CANONICAL\.kilo\command'

$implemented = [regex]::Matches($obiRaw, '\[ValidateSet\(\"([^\"]+)\"\)\]') | ForEach-Object { $_.Groups[1].Value -split ',\s*' }

$switchM = [regex]::Match($obiRaw, 'switch\s*\(\s*\$Command\s*\)\s*\{(.*)\}\s*$', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$switchCmds = @()
if ($switchM.Success) {
    $switchBody = $switchM.Groups[1].Value
    $switchCmds = [regex]::Matches($switchBody, '"([^"]+)"\s*\{') | ForEach-Object { $_.Groups[1].Value }
}

$allImplemented = $implemented + $switchCmds | Sort-Object -Unique
$declared = Get-ChildItem $cmdDir -Filter '*.md' -File | Select-Object -ExpandProperty BaseName
$declared = $declared | Sort-Object -Unique

$onlyDeclared = $declared | Where-Object { $_ -notin $allImplemented }
$onlyImplemented = $allImplemented | Where-Object { $_ -notin $declared }

Write-Output "IMPLEMENTED ($($allImplemented.Count)):"
$allImplemented | ForEach-Object { Write-Output "  $_" }
Write-Output "DECLARED BUT NOT IMPLEMENTED ($($onlyDeclared.Count)):"
$onlyDeclared | ForEach-Object { Write-Output "  $_" }
Write-Output "IMPLEMENTED BUT NOT DECLARED ($($onlyImplemented.Count)):"
$onlyImplemented | ForEach-Object { Write-Output "  $_" }
