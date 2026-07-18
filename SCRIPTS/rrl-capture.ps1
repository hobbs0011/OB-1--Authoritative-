param([string]$Run=164, [string]$KiloDb='C:\Users\mrmic\.local\share\kilo\kilo.db', [string]$OutDir='RRL')
$ErrorActionPreference='Stop'
if (-not (Test-Path $KiloDb)) { Write-Host "DB MISSING: $KiloDb"; exit 1 }
Add-Type -AssemblyName System.Data.SQLite
$conn = New-Object System.Data.SQLite.SQLiteConnection("Data Source=$KiloDb")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = 'SELECT s.id, s.created_at FROM session s ORDER BY s.created_at DESC LIMIT 1'
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) { Write-Host 'NO SESSION'; $conn.Close(); exit 1 }
$sessionId = $reader.GetString(0)
$createdAt = $reader.GetString(1)
$reader.Close()
$cmd = $conn.CreateCommand()
$cmd.CommandText = 'SELECT m.id, m.role, m.created_at FROM message m WHERE m.session_id = @sid ORDER BY m.created_at ASC'
$p = $cmd.CreateParameter(); $p.ParameterName='sid'; $p.Value=$sessionId; $cmd.Parameters.Add($p)
$reader = $cmd.ExecuteReader()
$messages = @()
while ($reader.Read()) {
  $messages += [pscustomobject]@{ id=$reader.GetString(0); role=$reader.GetString(1); ts=$reader.GetString(2) }
}
$reader.Close()
$out = @()
foreach ($m in $messages) {
  $cmd2 = $conn.CreateCommand()
  $cmd2.CommandText = 'SELECT p.role, p.data FROM part p WHERE p.message_id = @mid ORDER BY p.created_at ASC'
  $p2 = $cmd2.CreateParameter(); $p2.ParameterName='mid'; $p2.Value=$m.id; $cmd2.Parameters.Add($p2)
  $r2 = $cmd2.ExecuteReader()
  $parts = @()
  while ($r2.Read()) { $parts += "$($r2.GetString(0))|$($r2.GetString(1))" }
  $r2.Close()
  $role = $m.role
  $header = if ($role -eq 'user') { '## User' } elseif ($role -eq 'assistant') { '## Assistant' } else { "## $role" }
  $body = ($parts | ForEach-Object { $_ -replace '^[^|]+\|','' }) -join "`n"
  $out += $header
  $out += $body
  $out += ''
}
$conn.Close()
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
$path = Join-Path $OutDir ("RRL-{0}.txt" -f $Run)
$out | Set-Content -Path $path -Encoding UTF8
Write-Host "RRL written: $path"
Write-Host "Session: $sessionId"
Write-Host "Messages: $($messages.Count)"
Write-Host "Run: $Run"
