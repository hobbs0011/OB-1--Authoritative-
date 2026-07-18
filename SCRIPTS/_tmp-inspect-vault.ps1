param()
$path = "CANON/HEAVY-LEDGER/VAULT-MM-MASTERMIND-CONSOLIDATED-2.json"
$bytes = [System.IO.File]::ReadAllBytes($path)
$text = [System.IO.File]::ReadAllText($path)
Write-Output ("Size=" + $bytes.Length)
Write-Output ("Last120=|" + $text.Substring([math]::Max(0,$text.Length-120)) + "|")
Write-Output ("TrailingNonJson=" + ($bytes.Length - 8675))
