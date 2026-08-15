$file = "D:\OB-1-CANONICAL\CANON\SYSTEM\LegionnaireFieldGuide.md"
$lines = Get-Content $file
$newLines = @()
$i = 0
while ($i -lt $lines.Count) {
    if ($lines[$i] -match "^## SCS — SCRIPTS") {
        $newLines += "## SCS — SCRIPTS"
        $newLines += ""
        $newLines += "**Only location:** `CANON/SCRIPTS/`"
        $newLines += ""
        $newLines += "| Script | Purpose |"
        $newLines += "|--------|---------|"
        $newLines += "| \`CANON/SCRIPTS/death.ps1\` | 3-step death pipeline: preserve I-LOG -> SCS audit -> colorize -> pipeline -> handoff |"
        $newLines += "| \`CANON/SCRIPTS/rrl-colorize.ps1\` | Colorize raw JSONL RRL -> COLORIZED.md + STATS.json |"
        $newLines += "| \`CANON/SCRIPTS/phetrails.ps1\` | Pheromone trail deposition via POST /api/pheromone/deposit |"
        $newLines += "| \`CANON/SCRIPTS/execute-phetrails-pipeline.ps1\` | Execute phetrails pipeline: stage + commit + deploy + verify |"
        $newLines += "| \`CANON/SCRIPTS/transcribe-rtl.js\` | RTL/ITL transcriber: audio -> JSONL transcript + COLORIZED + STATS |"
        $newLines += "| \`CANON/SCRIPTS/run-dnaregistry.ps1\` | DNA Registry canonical scanner - outputs dna-registry-run{N}.json |"
        $newLines += "| \`CANON/SCRIPTS/reincarnate-rise.ps1\` | Stage 1 RISE checkpoint - audits prior DEATH, stamps session name, gates session |"
        $newLines += "| \`CANON/SCRIPTS/scout.ps1\` | Stage 2 SCOUT checkpoint - flags, tags, learns, hands off findings to MARCH |"
        $newLines += "| \`CANON/SCRIPTS/march.ps1\` | Stage 3 MARCH checkpoint - confirms scout work, conquers territory, hands off to SCHOLARS |"
        $newLines += "| \`CANON/SCRIPTS/soulscholars.ps1\` | Stage 4 SCHOLARS checkpoint - documents, preserves, protects SOUL, hands off to SUPPLY |"
        $newLines += "| \`CANON/SCRIPTS/supply.ps1\` | Stage 5 SUPPLY checkpoint - logistics, holding territory, hands off to ENGINEER |"
        $newLines += "| \`CANON/SCRIPTS/engineer.ps1\` | Stage 6 ENGINEER checkpoint - innovation, improvement, auditor of supply lines, hands off to DEATH |"
        $newLines += "| \`CANON/SCRIPTS/workhorse-pipeline.ps1\` | Master pipeline: colorize -> extract keywords -> extract lost souls -> build pipeline JSON + handoff JSON -> update inverted index -> promote to NAV |"
        $newLines += "| \`CANON/SCRIPTS/extract-keywords.ps1\` | Extract top keywords from STATS.json -> rfkw- files for SOUL-KEYWORDS |"
        $newLines += "| \`CANON/SCRIPTS/extract-lostsouls.ps1\` | Extract lost souls/unpipelined directives from I-LOG -> LOSTSOULS/ |"
        $newLines += "| \`CANON/SCRIPTS/deduplicate-inverted-index.ps1\` | Deduplicate inverted keyword index entries |"
        $newLines += "| \`CANON/SCRIPTS/update-inverted-index.ps1\` | Update inverted index from rfkw- files in SOUL-KEYWORDS/ |"
        $newLines += "| \`CANON/SCRIPTS/pipeline-health-check.ps1\` | Pipeline health check - verifies artifact consistency, optional auto-fix |"
        $newLines += ""
        $newLines += "**Invocation:**"
        $newLines += "```powershell"
        $newLines += "powershell -File CANON/SCRIPTS/death.ps1 -SessionName `"<name>`" -IlogSource <path>"
        $newLines += "```"
        $newLines += ""
        $newLines += "Steps: preserve I-LOG -> SCS audit (SOUL/DNA/REASON counts) -> colorize -> pipeline -> handoff -> upload to Reincarnate-Synch IX-A"
        $newLines += ""
        $newLines += "---"
        while ($i -lt $lines.Count -and $lines[$i] -notmatch "^## SCS — BACKBURNER PIPELINE") {
            $i++
        }
    } else {
        $newLines += $lines[$i]
        $i++
    }
}
Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "LFG SCRIPTS section updated successfully"
