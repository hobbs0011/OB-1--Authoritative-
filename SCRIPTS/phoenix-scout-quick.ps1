$ErrorActionPreference = 'Stop'
$repoRoot = 'D:\OB-1-CANONICAL'
$timestamp = Get-Date -Format 'yyyy-MM-ddTHHmmss'
$reportPath = Join-Path $repoRoot ('OPERATIONS\phoenix-scout-' + $timestamp + '.jsonl')

$zones = @(
    'CANON/SYSTEM'
    '.kilo/command'
    '.kilo/skills'
    'SCRIPTS'
    'OPERATIONS'
)

$tags = @()
$filesScanned = 0

function New-Tag {
    param([string]$Path,[int]$Line,[string]$Excerpt,[string]$Priority,[string]$Type,[string]$Status,[string]$Reason,[string]$Learned,[string]$Next)
    [pscustomobject]@{
        scout_id = ('SC-{0}-{1}' -f $timestamp, [guid]::NewGuid().ToString('N').Substring(0,8))
        priority = $Priority
        type = $Type
        status = $Status
        file = $Path
        line = $Line
        excerpt = $Excerpt
        bytes = (Get-Item -LiteralPath $Path -ErrorAction SilentlyContinue).Length
        reason = $Reason
        learned = $Learned
        next = $Next
    }
}

$head = git -C $repoRoot rev-parse --short HEAD

foreach ($zone in $zones) {
    $zonePath = Join-Path $repoRoot $zone
    if (-not (Test-Path $zonePath)) { continue }
    $files = Get-ChildItem -LiteralPath $zonePath -File -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(md|json|ps1|js|ts|toml|yaml|yml)$' -and $_.Length -lt 1MB }
    $filesScanned += $files.Count

    foreach ($f in $files) {
        $rel = $f.FullName.Substring($repoRoot.Length + 1)

        # SOUL: raw Michael verbatim blockquotes
        $soulMatches = Select-String -LiteralPath $f.FullName -Pattern '^>\s*"' -ErrorAction SilentlyContinue
        foreach ($m in $soulMatches) {
            $excerpt = $m.Line.Trim()
            if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0,120) }
            $tags += New-Tag -Path $rel -Line $m.LineNumber -Excerpt $excerpt -Priority P2 -Type SOUL -Status UNMINED -Reason 'Raw Michael verbatim quote block — never ingested into D1' -Learned 'Scout learned this zone must be indexed by source_sha256, not filename alone.' -Next 'Route through /api/soul/extract'
        }

        # DRIFT: HEAD mismatch
        $headMatches = Select-String -LiteralPath $f.FullName -Pattern '\bHEAD\b.*[a-f0-9]{7,40}' -ErrorAction SilentlyContinue
        foreach ($m in $headMatches) {
            if ($m.Line -notmatch [regex]::Escape($head)) {
                $excerpt = $m.Line.Trim()
                if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0,120) }
                $tags += New-Tag -Path $rel -Line $m.LineNumber -Excerpt $excerpt -Priority P2 -Type DRIFT -Status STALE -Reason 'HEAD reference does not match git log -1' -Learned 'Drift shape: boot/docs reference stale SHA; source of truth is git log -1' -Next 'Update HEAD reference to current git SHA'
            }
        }

        # CONFIG: missing tier definitions
        $tierMatches = Select-String -LiteralPath $f.FullName -Pattern 'T[1-5].*tier' -ErrorAction SilentlyContinue
        foreach ($m in $tierMatches) {
            if ($m.Line -notmatch 'deepseek|claude|gemini|groq|cerebras|kilo-auto') {
                $excerpt = $m.Line.Trim()
                if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0,120) }
                $tags += New-Tag -Path $rel -Line $m.LineNumber -Excerpt $excerpt -Priority P3 -Type CONFIG -Status STALE -Reason 'Tier definition missing canonical provider mapping' -Learned 'Tier configs require 5-tier canon per DISPATCH.md' -Next 'Cross-check against .kilo/DISPATCH.md tier table'
            }
        }

        # GAP: broken cross-repo paths
        $pathMatches = Select-String -LiteralPath $f.FullName -Pattern '(?:D:|C:)\\Users\\[A-Za-z0-9_\-\.]+' -ErrorAction SilentlyContinue
        foreach ($m in $pathMatches) {
            $pathMatch = [regex]::Match($m.Line, '(?<path>(?:D:|C:)\\Users\\[A-Za-z0-9_\-\\\.]+)')
            if ($pathMatch.Success) {
                $candidate = $pathMatch.Groups['path'].Value
                if (-not (Test-Path $candidate)) {
                    $excerpt = $m.Line.Trim()
                    if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0,120) }
                    $tags += New-Tag -Path $rel -Line $m.LineNumber -Excerpt $excerpt -Priority P3 -Type GAP -Status ORPHAN -Reason 'Referenced path does not exist on disk' -Learned 'Dead cross-repo path detected; may be historical or moved' -Next 'Verify path or mark as ORPHAN in registry'
                }
            }
        }

        # DRIFT: legacy domain references
        $legacyMatches = Select-String -LiteralPath $f.FullName -Pattern 'mrmichaelhobbs1234' -ErrorAction SilentlyContinue
        foreach ($m in $legacyMatches) {
            $excerpt = $m.Line.Trim()
            if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0,120) }
            $tags += New-Tag -Path $rel -Line $m.LineNumber -Excerpt $excerpt -Priority P2 -Type DRIFT -Status STALE -Reason 'Legacy domain reference detected' -Learned 'Legacy domains indicate archival references that may need migration' -Next 'Replace with canonical operator email mrmichaelhobbs123@gmail.com'
        }
    }
}

if ($tags.Count -gt 500) { $tags = $tags | Select-Object -First 500 }

$tags | ConvertTo-Json -Compress | Out-File -Append -Encoding UTF8 $reportPath

$p1 = ($tags | Where-Object { $_.priority -eq 'P1' }).Count
$p2 = ($tags | Where-Object { $_.priority -eq 'P2' }).Count
$p3 = ($tags | Where-Object { $_.priority -eq 'P3' }).Count
$soul = ($tags | Where-Object { $_.type -eq 'SOUL' }).Count
$drift = ($tags | Where-Object { $_.type -eq 'DRIFT' }).Count
$config = ($tags | Where-Object { $_.type -eq 'CONFIG' }).Count
$gap = ($tags | Where-Object { $_.type -eq 'GAP' }).Count
$vault = ($tags | Where-Object { $_.type -eq 'VAULT' }).Count

Write-Host ''
Write-Host '========================================'
Write-Host ('PHOENIX SCOUT — ' + ($zones -join ', '))
Write-Host '========================================'
Write-Host ('ZONE:          ' + ($zones -join ', '))
Write-Host ('FILES:         ' + $filesScanned)
Write-Host ('FINDS:         ' + $tags.Count)
Write-Host ('  P1 CRITICAL: ' + $p1)
Write-Host ('  P2 HIGH:     ' + $p2)
Write-Host ('  P3 MEDIUM:   ' + $p3)
Write-Host 'BREAKDOWN:'
Write-Host ('  SOUL:    ' + $soul)
Write-Host ('  DRIFT:   ' + $drift)
Write-Host ('  CONFIG:  ' + $config)
Write-Host ('  GAP:     ' + $gap)
Write-Host ('  VAULT:   ' + $vault)
Write-Host ('REPORT:        ' + $reportPath)
Write-Host '========================================'
Write-Host 'SCOUT COMPLETE. Flagged items ready for tier dispatch.'
