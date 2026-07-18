$idxPath = "D:\OB-1-CANONICAL\CANON\SOUL-KEYWORDS\inverted-index.json"
$idx = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable
Write-Host "Count=$($idx.Count)"
Write-Host "Type=$($idx.GetType().FullName)"
if ($idx.Count -gt 0) {
    Write-Host ("FirstKey=" + ($idx.Keys | Select-Object -First 1))
} else {
    Write-Host "EmptyOrZero"
}

$r = "D:\OB-1-CANONICAL\RRL\RRL-164.txt"
Write-Host ("RRLSize=" + (Get-Item $r).Length)
