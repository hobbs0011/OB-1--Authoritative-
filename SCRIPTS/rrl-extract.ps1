# RRL EXTRACT  -  Stage I EXPLORATORES
# Strips Kilo export to Michael verbatim ONLY. No agent text. No commands. No outputs. No UI chrome.
# Computers have been able to do this since 1983.
param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,
    [string]$OutputFile,
    [string]$RunNumber = ""
)

$raw = Get-Content $InputFile -Raw -Encoding UTF8

# Kilo export pattern: user messages appear interleaved with agent monologue and command/output blocks.
# Strategy: extract lines that are NOT part of agent constructs.
#
# Agent constructs to strip:
#   1. Command blocks: lines starting with "Command" at margin
#   2. Output blocks: lines starting with "Output" at margin
#   3. <bash_metadata> blocks
#   4. Agent monologue: paragraphs between command/output blocks
#   5. UI chrome: "Modified N files", "Type a message...", session metadata
#   6. Prompt template blocks (the RISE protocol definition itself was a prompt)
#
# Approach: split on blank-line boundaries, classify each paragraph.
# Michael paragraphs are substantive, non-technical, in his voice.
# Agent paragraphs are procedural, contain tool output, or are internal planning.

$lines = $raw -split "`r`n"
$paragraphs = @()
$current = @()

foreach ($line in $lines) {
    if ($line.Trim() -eq "") {
        if ($current.Count -gt 0) {
            $paragraphs += @{
                Text = ($current -join "`r`n")
                LineCount = $current.Count
            }
            $current = @()
        }
    } else {
        $current += $line
    }
}
if ($current.Count -gt 0) {
    $paragraphs += @{
        Text = ($current -join "`r`n")
        LineCount = $current.Count
    }
}

# Classify each paragraph as Michael or Not-Michael
# Michael paragraphs are his verbatim thoughts  -  the soul
# Not-Michael: agent internal monologue, commands, outputs, UI chrome, prompt templates

$michaelParagraphs = @()

foreach ($p in $paragraphs) {
    $t = $p.Text.Trim()
    if ($t.Length -eq 0) { continue }
    
    # Strip headers (1-3 line UI artifacts)
    if ($t -match '^Session (Rise|Death) Protocol') { continue }
    if ($t -match '^\$\d+') { continue }  # Cost display
    if ($t -match '^\d+%$') { continue }  # Percentage badge
    
    # Strip command blocks
    if ($t -match '^Command\s*$' -or $t -match '^Command\n') { continue }
    
    # Strip output blocks
    if ($t -match '^Output\s*$' -or $t -match '^Output\n') { continue }
    
    # Strip bash metadata
    if ($t -match '<bash_metadata>') { continue }
    
    # Strip UI chrome
    if ($t -match '^Modified\s+\d+\s+files?$') { continue }
    if ($t -match '^Type a message.*$') { continue }
    
    # Strip agent procedural/planning text
    # Agent text typically contains: "Let me", "Let me now", "I need to", "I should",
    # "Actually", "Wait", "Now I", "Key findings", "All data collected",
    # "Super Saiyan mode", emoji bullets, markdown tables with pipeline data
    if ($t -match '^(Let me |Now |I need |I should |Actually|Wait[, ]|Key findings|All data|Super Saiyan|Good [–-]|Excellent|Massive|Doctor:|?\s)') { continue }
    
    # Strip agent sign-off / summary blocks
    if ($t -match '^(COMPLETE\.|? Complete\.|SOULCOUNT:|HEAD:.*\|.*Commits:|RUN \d+)') { continue }
    
    # Strip the RISE protocol definition (it was a prompt template, not Michael's words)
    if ($t -match '^# /reincarnaterise') { continue }
    if ($t -match '^## (Step|WHAT THIS|STEP \d)') { continue }
    if ($t -match '^\*\*MANDATORY:') { continue }
    if ($t -match '^\*\*STAGNATION CHECK') { continue }
    if ($t -match '^\*\*DRIFT CHECK') { continue }
    if ($t -match '^The count IS') { continue }
    if ($t -match '^Read the most recent death seal') { continue }
    if ($t -match '^\d+\. Read `CANON') { continue }
    if ($t -match '^If live count') { continue }
    if ($t -match '^Cross-check against') { continue }
    if ($t -match '^\$\w+\s*=') { continue }  # PowerShell code blocks
    if ($t -match '^Output:$') { continue }
    if ($t -match '^```') { continue }
    if ($t -match '^From state load') { continue }
    if ($t -match '^════') { continue }
    
    # Strip agent thinking paragraphs (long, procedural, contain pipeline terminology)
    $agentPatterns = @(
        'Step \d', 'SOULCOUNT Gate', 'State Load', 'Repo Validation', 'Objective Reconstruction',
        'SWC Receipt', 'Soul Audit', 'The user has issued', '/reincarnaterise triggered',
        'Executing RISE protocol', 'Let me now', 'Let me analyze', 'Let me compile',
        'Now I need to', 'Now I have', 'Now let me', 'For the', 'Based on',
        'The most immediate', 'From COLD-START-BOOT', 'From Run \d+ death',
        'Active Mission:', 'Open flags:', 'Top priority',
        'For Super Saiyan', 'SOULCOUNT AUDIT', 'HEAD VERIFICATION',
        'REPO STATE', 'OPEN FLAGS', 'ACTIVE MISSION',
        'The document needs', 'The \.kilo scout', '\.kilo deepseek',
        'SITE zone', 'VAULT-NET-SEEDS', 'PIPELINE-CURSOR',
        'Archived \d+', 'Cleanup \+'
    )
    
    $isAgent = $false
    foreach ($pat in $agentPatterns) {
        if ($t -match $pat) {
            $isAgent = $true
            break
        }
    }
    if ($isAgent) { continue }
    
    # This paragraph survived all filters  -  it's plausibly Michael
    $michaelParagraphs += $t
}

$cleanText = ($michaelParagraphs -join "`r`n`r`n").Trim()

if ($OutputFile) {
    $cleanText | Set-Content -Path $OutputFile -Encoding UTF8 -NoNewline
    $charCount = $cleanText.Length
    Write-Host "RRL EXTRACTED: $OutputFile  -  $charCount chars"
} else {
    $cleanText
    Write-Host "`n---"
    Write-Host "CHARS: $($cleanText.Length)"
}
