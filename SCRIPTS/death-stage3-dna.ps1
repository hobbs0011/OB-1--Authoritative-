$repo = "D:\OB-1-CANONICAL"
$run = 75
$rrlPath = "$repo\RRL\RRL-75.txt"
$dnaDir = "$repo\CANON\SOUL\EXTRACT"
$rrlText = Get-Content $rrlPath -Raw -Encoding UTF8

$dnaRecords = @()
$turnSeq = 0
$lines = $rrlText -split "`n"
$currentBlock = ""
$currentRole = ""
$inAssistantBlock = $false

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -match '"role"\s*:\s*"([^"]+)"') {
        if ($inAssistantBlock -and $currentBlock.Trim().Length -gt 10) {
            $turnSeq++
            $text = $currentBlock.Trim()
            $isBlueprint = ($text -match '```|`````|fenced code block|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
            $dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if($isBlueprint){"blueprint"}else{"prose"}; chars=$text.Length; text=$text }
        }
        $currentRole = $matches[1]
        $currentBlock = ""
        $inAssistantBlock = ($currentRole -eq "assistant")
    } elseif ($trimmed -match '^(AGENT|OB1|ASSISTANT|Agent 99)\s*[:|>-]') {
        if ($inAssistantBlock -and $currentBlock.Trim().Length -gt 10) {
            $turnSeq++
            $text = $currentBlock.Trim()
            $isBlueprint = ($text -match '```|`````|fenced code block|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
            $dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if($isBlueprint){"blueprint"}else{"prose"}; chars=$text.Length; text=$text }
        }
        $inAssistantBlock = $true
        $currentBlock = $trimmed -replace '^(AGENT|OB1|ASSISTANT|Agent 99)\s*[:|>-]\s*', ''
    } elseif ($inAssistantBlock) {
        $currentBlock += "`n$line"
    }
}

if ($inAssistantBlock -and $currentBlock.Trim().Length -gt 10) {
    $turnSeq++
    $text = $currentBlock.Trim()
    $isBlueprint = ($text -match '```|`````|fenced code block|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
    $dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if($isBlueprint){"blueprint"}else{"prose"}; chars=$text.Length; text=$text }
}

$dnaCount = $dnaRecords.Count
$dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
Write-Host "DNA extracted: $dnaCount records ($dnaBlueprintCount blueprints)"

if ($dnaCount -gt 0) {
    if (-not (Test-Path $dnaDir)) { New-Item -ItemType Directory -Path $dnaDir -Force | Out-Null }
    $dnaPath = "$dnaDir\dna-run$run.json"
    $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
    Write-Host "STAGE 3 OK: $dnaPath"
} else {
    Write-Warning "STAGE 3 GAP: 0 assistant turns"
}
