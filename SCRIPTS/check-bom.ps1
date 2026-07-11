$path = 'D:\OB-1-CANONICAL\SCRIPTS\soul-extract.ps1'
$bytes = [System.IO.File]::ReadAllBytes($path)
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Output 'UTF8_BOM'
} else {
    Write-Output 'NO_BOM'
}
