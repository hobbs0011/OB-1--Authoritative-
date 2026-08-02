param(
    [string]$StatsFile,
    [string]$OutputFile,
    [string]$SessionName
)

$stats = Get-Content $StatsFile | ConvertFrom-Json
$keywords = @()
foreach ($topic in $stats.top_topics) {
    $keywords += "$($topic.count) | $($topic.word)"
}
$content = "# SOUL-KEYWORDS for $SessionName`n"
$content += "# Extracted from: $StatsFile`n"
$content += "# SOULcount=$($stats.SOULcount) DNAcount=$($stats.DNAcount) REASONcount=$($stats.REASONcount)`n"
$content += "`n"
$content += $keywords -join "`n"
Set-Content -Path $OutputFile -Value $content -Encoding UTF8
Write-Host "Written: $OutputFile ($($keywords.Count) keywords)"
