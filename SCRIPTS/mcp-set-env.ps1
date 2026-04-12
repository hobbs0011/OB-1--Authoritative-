param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Value,
    [switch]$AlsoSession
)

[Environment]::SetEnvironmentVariable($Name, $Value, "User")
if ($AlsoSession) {
    Set-Item -Path ("Env:" + $Name) -Value $Value
}

$stored = [Environment]::GetEnvironmentVariable($Name, "User")
if ($stored) {
    Write-Host ("SET {0} ({1} chars)" -f $Name, $stored.Length)
    if (-not $AlsoSession) {
        Write-Host "Note: restart/reload tools to pick up new User env vars in existing processes."
    }
}
else {
    Write-Host ("FAILED to set {0}" -f $Name)
    exit 1
}
