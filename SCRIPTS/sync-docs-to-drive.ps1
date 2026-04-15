param(
  [string]$RepoRoot = "C:\Users\mrmic\Desktop\OB-1",
  [string]$RemoteName = "gdrive",
  [string]$RemoteFolder = "OB-1-Docs"
)

$ErrorActionPreference = "Stop"

$rclone = "rclone"
$target = "$RemoteName`:$RemoteFolder"

# Verify remote exists
$remoteList = & $rclone listremotes
if (-not ($remoteList -match "^$RemoteName:`$")) {
  Write-Error "Remote '$RemoteName' is not configured. Run: rclone config"
}

& $rclone sync "$RepoRoot" "$target" \
  --include "*.md" \
  --include "*.txt" \
  --include "*.json" \
  --exclude ".git/**" \
  --exclude "node_modules/**" \
  --exclude ".venv/**" \
  --exclude "OB-1.worktrees/**" \
  --exclude "RAW-CHAT-LOGS/**" \
  --checksum \
  --progress

Write-Host "Drive sync complete: $target"