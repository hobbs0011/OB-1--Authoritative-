<#
  SoulScholars — RRL extraction script
  Scans RRL/ for genuine Michael verbatim segments.
#>
param(
    [string]$RrlDir = "D:\OB-1-CANONICAL\RRL",
    [string]$OutFile = "D:\OB-1-CANONICAL\OPERATIONS\scholar-extraction-2026-07-18T041200.jsonl",
    [int]$MinChars = 30
)

$results = @()
$id = 0
$files = Get-ChildItem $RrlDir -File | Where-Object { $_.Length -gt 5KB } | Sort-Object Length -Descending

Write-Host "Scanning $($files.Count) RRL files..."

foreach ($f in $files) {
    $segments = 0
    $chars = 0
    Get-Content $f.FullName | ForEach-Object {
        $line = $_
        if ($line -match '"type"\s*:\s*"user"' -and $line -match '"role"\s*:\s*"user"' -and $line -notmatch '"isMeta"\s*:\s*true') {
            if ($line -match '"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"') {
                $text = $matches[1] -replace '\\"','"' -replace '\\n',' ' -replace '\\r','' -replace '\\t',' '
                if ($text.Length -gt $MinChars -and $text -notmatch '<command' -and $text -notmatch '^\d+`:' -and $text -notmatch '^(DIR|Volume|Exit code|PowerShell|Tagged pieces|File created|===|Request ID|dequeue|enqueue|queue-operation)') {
                    $id++
                    $segments++
                    $chars += $text.Length
                    $sha = [BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($text))).Replace('-','')
                    $obj = [PSCustomObject]@{
                        id = "SCHOLAR-$id"
                        source = $f.Name
                        chars = $text.Length
                        text = $text.Substring(0, [Math]::Min(200, $text.Length))
                        sha256 = $sha.Substring(0, 24)
                    }
                    $results += $obj
                }
            }
        }
    }
    if ($segments -gt 0) {
        Write-Host "  $($f.Name): +$segments segments (+$chars chars)"
    }
}

$totalChars = ($results | Measure-Object chars -Sum | Select-Object -ExpandProperty Sum)
Write-Host "`nFINAL: $id total Michael verbatim segments, $totalChars total chars"

# Write JSONL
$results | ForEach-Object {
    $line = @{id=$_.id;source=$_.source;chars=$_.chars;text=$_.text;sha256=$_.sha256} | ConvertTo-Json -Compress
    Add-Content -Path $OutFile -Value $line -Encoding UTF8
}

Write-Host "PRESERVED: $OutFile"

# Top 10 by length
Write-Host "`nTop 10 segments by character count:"
$results | Sort-Object chars -Descending | Select-Object -First 10 | ForEach-Object {
    $preview = $_.text.Substring(0, [Math]::Min(60, $_.text.Length))
    Write-Host "  [$($_.id)] $($_.source): $($_.chars) chars -- $preview..."
}
