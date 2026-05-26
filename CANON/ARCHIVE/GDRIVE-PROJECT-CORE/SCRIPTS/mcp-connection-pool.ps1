# U3: MCP Connection Pooling
# Purpose: Cache MCP client instances, reuse across session; timeout stale after 5m

class MCPConnectionPool {
    [hashtable]$Pool = @{}
    [int]$MaxConnections = 10
    [int]$IdleTimeoutSeconds = 300  # 5 min
    
    [object]GetConnection([string]$Agent) {
        $now = [datetime]::UtcNow
        
        if ($this.Pool.ContainsKey($Agent)) {
            $conn = $this.Pool[$Agent]
            $age = ($now - $conn.created_at).TotalSeconds
            
            if ($age -lt $this.IdleTimeoutSeconds) {
                # Reuse
                Write-Host "   ♻️  Reusing $Agent connection (age: ${age}s)" -ForegroundColor Gray
                $conn.last_used = $now
                return $conn.client
            } else {
                # Stale, remove
                Write-Host "   🗑️  Closing stale $Agent connection (age: ${age}s)" -ForegroundColor Gray
                $this.Pool.Remove($Agent)
            }
        }
        
        # Create new
        Write-Host "   🆕 Creating new $Agent connection" -ForegroundColor Gray
        $newConn = @{
            agent = $Agent
            client = [object]::new()  # In production: actual MCP client init
            created_at = $now
            last_used = $now
        }
        
        if ($this.Pool.Count -ge $this.MaxConnections) {
            # Evict least-recently-used
            $lru = $this.Pool.GetEnumerator() | Sort-Object { $_.Value.last_used } | Select-Object -First 1
            Write-Host "   ⚠️  Pool full, evicting $($lru.Key)" -ForegroundColor Yellow
            $this.Pool.Remove($lru.Key)
        }
        
        $this.Pool[$Agent] = $newConn
        return $newConn.client
    }
    
    [void]Close([string]$Agent) {
        if ($this.Pool.ContainsKey($Agent)) {
            $this.Pool.Remove($Agent)
        }
    }
    
    [void]CloseAll() {
        $this.Pool.Clear()
    }
    
    [int]GetPoolSize() {
        return $this.Pool.Count
    }
}

# Global instance
$Global:MCPPool = [MCPConnectionPool]::new()

Write-Host ""
Write-Host "🔌 MCP CONNECTION POOLING (U3)" -ForegroundColor Cyan
Write-Host "   Instance: \$Global:MCPPool"
Write-Host "   Capacity: $($Global:MCPPool.MaxConnections)"
Write-Host "   Idle timeout: $($Global:MCPPool.IdleTimeoutSeconds)s"
Write-Host ""

# Example: Get connection with pooling
# $client = $Global:MCPPool.GetConnection("RISE")
