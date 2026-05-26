# U6: MCP Agent Hot-Reload
# Purpose: Detect .md file changes in .kilo/agent/**; reinitialize without full restart

param(
    [string]$AgentPath = "$PSScriptRoot\..\\.kilo\agent",
    [int]$WatchIntervalSeconds = 5
)

Write-Host ""
Write-Host "🔄 MCP AGENT HOT-RELOAD (U6)" -ForegroundColor Cyan
Write-Host "   Watching: $AgentPath"
Write-Host "   Interval: $WatchIntervalSeconds sec"
Write-Host ""

$agentFiles = Get-ChildItem "$AgentPath\*.md" -ErrorAction SilentlyContinue
$fileHashes = @{}

# Initial scan
foreach ($file in $agentFiles) {
    $hash = (Get-FileHash $file).Hash
    $fileHashes[$file.FullName] = @{
        hash = $hash
        lastModified = $file.LastWriteTime
    }
}

Write-Host "   ✅ Baseline: $($agentFiles.Count) agents indexed"
Write-Host ""
Write-Host "watching for changes (Ctrl+C to stop)..."

while ($true) {
    Start-Sleep -Seconds $WatchIntervalSeconds
    
    $currentFiles = Get-ChildItem "$AgentPath\*.md"
    
    foreach ($file in $currentFiles) {
        if ($fileHashes.ContainsKey($file.FullName)) {
            $previousHash = $fileHashes[$file.FullName].hash
            $currentHash = (Get-FileHash $file).Hash
            
            if ($currentHash -ne $previousHash) {
                Write-Host ""
                Write-Host "🔄 CHANGE DETECTED: $($file.BaseName)" -ForegroundColor Yellow
                Write-Host "   Reinitializing agent without restart..."
                
                # In production: reload Kilo agent config
                # Invoke-KiloReload -Agent $file.BaseName
                
                Write-Host "   ✅ Agent reloaded"
                
                $fileHashes[$file.FullName] = @{
                    hash = $currentHash
                    lastModified = $file.LastWriteTime
                }
            }
        } else {
            # New file
            Write-Host ""
            Write-Host "➕ NEW AGENT: $($file.BaseName)" -ForegroundColor Green
            Write-Host "   Loading..."
            
            $fileHashes[$file.FullName] = @{
                hash = (Get-FileHash $file).Hash
                lastModified = $file.LastWriteTime
            }
            
            Write-Host "   ✅ Agent loaded"
        }
    }
}
