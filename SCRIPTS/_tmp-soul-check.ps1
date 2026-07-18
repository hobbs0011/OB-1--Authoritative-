param()
try {
    $r = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 10
    Write-Host "SOULCOUNT: $($r.soulcount) | LEVEL: $($r.level)"
} catch {
    Write-Host "SOUL API UNREACHABLE: $($_.Exception.Message)"
}
