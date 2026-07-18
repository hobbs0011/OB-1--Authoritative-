param()
$lines = git log --oneline --grep "^death:"
$runs = @()
foreach ($line in $lines) {
    if ($line -match 'run\s*(\d+)') {
        $runs += [int]$matches[1]
    }
}
if ($runs.Count -eq 0) {
    Write-Output "no_death_runs"
    exit 0
}
$max = $runs | Measure-Object -Maximum | Select-Object -Expand Maximum
Write-Output ("death_runs=" + ($runs -join ','))
Write-Output ("max=" + $max)
Write-Output ("next=" + ($max + 1))
