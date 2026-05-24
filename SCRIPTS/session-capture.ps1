# session-capture.ps1 — Auto-fires on Claude Stop hook
# Captures SOUL (Michael's verbatim words) + DNA (structured state) to soul-archive D1
# DO NOT DELETE — wired in .claude/settings.json Stop hook

$ts        = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$stamp     = (Get-Date).ToString('yyyyMMdd-HHmmss')
$rrlDir    = "D:\OB-1-CANONICAL\RRL"
$soulUrl   = "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event"

Set-Location "D:\OB-1-CANONICAL"

$head   = git log -1 --oneline 2>$null
$branch = git rev-parse --abbrev-ref HEAD 2>$null

# ── DNA — structured state ─────────────────────────────────────────────────────
$workerStatus = try { (Invoke-RestMethod "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status" -TimeoutSec 6) | ConvertTo-Json -Compress } catch { "UNREACHABLE" }
$pccContext   = try { (Invoke-RestMethod "https://pcc.mrmichaelhobbs123.workers.dev/api/context.json" -TimeoutSec 6) | ConvertTo-Json -Compress } catch { "UNREACHABLE" }

$dna = @"
=== DNA LOG — $ts ===
HEAD   : $head
Branch : $branch

PHOENIX-CODER STATUS:
$workerStatus

PCC CONTEXT:
$pccContext

TIER DISPATCH:
T1 : phoenix-coder tier=1 — Cerebras/Groq/CF-Qwen (FREE)
T2 : phoenix-coder tier=2 — deepseek-v4-flash
T3 : phoenix-coder tier=3 — deepseek-v4-pro
T4 : phoenix-coder tier=4 — gemini-3.5-flash
T5 : phoenix-coder tier=5 — claude-opus-4-20250514
Kilo: emergency fallback only

SECURITY CONSTRAINTS:
- DO NOT REMOVE CLOUDFLARE_API_TOKEN before deploy
- GAP-8 FROZEN: never touch net-pet-ai-production v1.6.2
- NOTION BLACKLISTED
- lam portal BB-07: DO NOT BUILD without explicit direction
- Secrets restore: pwsh SCRIPTS/set-pa-secrets.ps1
- SOULCOUNT: 894320 TITANIUM_ANCHOR
"@

# Write DNA log to disk
if (!(Test-Path $rrlDir)) { New-Item -ItemType Directory -Force -Path $rrlDir | Out-Null }
$dna | Out-File -FilePath "$rrlDir\DNA-LOG-$stamp.txt" -Encoding utf8

# Post DNA to soul-archive
$dnaBody = @{ student_id = "sov100-dna-$stamp"; text = $dna } | ConvertTo-Json
try { Invoke-RestMethod -Method POST -Uri $soulUrl -ContentType "application/json" -Body $dnaBody -TimeoutSec 10 | Out-Null } catch { }

# ── SOUL — Michael's verbatim words from session JSONL ─────────────────────────
$projectDir = "C:\Users\mrmic\.claude\projects\d--OB-1-CANONICAL"
$jsonlFiles = Get-ChildItem $projectDir -Filter "*.jsonl" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($jsonlFiles) {
    $soul = ""
    Get-Content $jsonlFiles.FullName -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $entry = $_ | ConvertFrom-Json
            # Extract human/user messages only — that's Michael's SOUL
            if ($entry.type -eq "user" -or $entry.role -eq "user") {
                $text = if ($entry.message) { $entry.message | ConvertTo-Json } else { $entry.content }
                if ($text -and $text.Length -gt 2) { $soul += "$text`n" }
            }
        } catch { }
    }

    if ($soul.Length -gt 10) {
        $soul | Out-File -FilePath "$rrlDir\SOUL-$stamp.txt" -Encoding utf8

        # Chunk soul into 8KB posts (soul-logger limit)
        $chunkSize = 8000
        $chunks    = [Math]::Ceiling($soul.Length / $chunkSize)
        for ($i = 0; $i -lt $chunks; $i++) {
            $chunk     = $soul.Substring($i * $chunkSize, [Math]::Min($chunkSize, $soul.Length - $i * $chunkSize))
            $soulBody  = @{ student_id = "sov100-soul-$stamp-$i"; text = $chunk } | ConvertTo-Json
            try { Invoke-RestMethod -Method POST -Uri $soulUrl -ContentType "application/json" -Body $soulBody -TimeoutSec 10 | Out-Null } catch { }
        }
        Write-Host "SOUL CAPTURED: $($soul.Length) chars, $chunks chunk(s)"
    }
}

Write-Host "DNA CAPTURED : $rrlDir\DNA-LOG-$stamp.txt"
Write-Host "POSTED TO    : soul-archive D1 (sov100-dna-$stamp)"
