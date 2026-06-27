$path='D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json'
if (Test-Path $path) {
    $s=(Get-Item $path).Length
    Write-Host "Size=$s"
} else {
    Write-Host 'Missing'
}
