param(
    [string]$ILogFile,
    [string]$OutputFile,
    [string]$SessionName
)

$lines = Get-Content $ILogFile
$directives = @()
$lineNumber = 0
$nl = [Environment]::NewLine

foreach ($line in $lines) {
    $lineNumber++
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $obj = $line | ConvertFrom-Json
    } catch {
        continue
    }
    
    if ($obj.role -ne 'user') { continue }
    
    $textBlocks = $obj.content | Where-Object { $_.type -eq 'text' }
    foreach ($block in $textBlocks) {
        $text = $block.text
        if ([string]::IsNullOrWhiteSpace($text)) { continue }
        if ($text.Length -lt 20) { continue }
        
        $hasDirective = $false
        $directiveType = ""
        
        if ($text -match '(?i)(please|can you|could you|would you|i want you to|i need you to|make sure|ensure|verify|check|create|build|fix|update|delete|remove|add|generate|write|read|run|execute|deploy|commit|push|merge|nuke|purge|clean|sever|delete|kill|stop|start|restart|reboot|install|configure|set up|setup|organize|sort|categorize|classify|extract|parse|scan|audit|review|analyze|summarize|report|output|return|give me|show me|tell me|list|find|search|look for|locate|fetch|get|retrieve|download|upload|save|store|write|append|prepend|insert|replace|modify|change|edit|refactor|optimize|improve|harden|secure|lock|seal|sign|verify|validate|test|run|execute|invoke|call|dispatch|route|send|deliver|handoff|transfer|migrate|convert|transform|translate|encode|decode|compress|decompress|encrypt|decrypt|hash|sign|verify|authenticate|authorize)') {
            $hasDirective = $true
            $directiveType = "imperative"
        }
        
        if ($text -match '(?i)(how do i|how to|what is the way to|can you show me|can you help me|i need help with|help me|assist me|guide me|teach me|show me how|tell me how|explain how|walk me through|step by step|instructions for|guide for|tutorial for|how do you|what do you|where do you|when do you|why do you|who do you|which do you|is there a way|is it possible|can this|could this|would this|should this|must this|need to|have to|ought to|supposed to|expected to|required to|must|should|need|have|ought|expected|required)') {
            $hasDirective = $true
            $directiveType = "interrogative"
        }
        
        if ($hasDirective) {
            $snippet = $text.Substring(0, [Math]::Min(500, $text.Length))
            $snippet = $snippet -replace '\|', '\\|'
            $directives += "$lineNumber | $directiveType | $snippet"
        }
    }
}

$md = "@(#)LostSouls - $SessionName" + $nl
$md += "Extracted from: $ILogFile" + $nl
$md += "Total directives found: $($directives.Count)" + $nl + $nl
$md += "| Line | Type | Directive |" + $nl
$md += "|------|------|-----------|" + $nl

foreach ($d in $directives) {
    $md += "| $d |" + $nl
}

Set-Content -Path $OutputFile -Value $md -Encoding UTF8
Write-Host "Written: $OutputFile ($($directives.Count) directives)"
