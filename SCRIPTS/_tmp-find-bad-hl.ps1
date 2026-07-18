param()
$paths = Get-ChildItem "CANON/HEAVY-LEDGER/*.json" -File
foreach ($p in $paths) {
    $raw = Get-Content $p.FullName -Raw
    try {
        $null = $raw | ConvertFrom-Json
    } catch {
        Write-Output "FILE: $($p.FullName)"
        Write-Output "ERROR: $($_.Exception.Message)"
        Write-Output "RAW_END:"
        Write-Output ($raw | Select-Object -Last 5)
        Write-Output "---"
        exit 1
    }
}
Write-Output "ALL_VALID"
