# PROOF - ALPHA-OMEGA-PH-GEM-13(KEY) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\ALPHA-OMEGA-PH-GEM-13(KEY).txt


$b1Resp = Invoke-JsonPost "$workerUrl/ledger/append" $SOVEREIGN_KEY $b1 (Join-Path $proofDir "b1_response.json")

if ($b1Resp.prev_hash -ne $b0Resp.hash) { throw "B1 FAIL: prev_hash does not match B0 hash" }
if ($b1Resp.parent_block_id -ne "B0")   { throw "B1 FAIL: parent_block_id must be B0" }
if (-not $b1Resp.hash -or $b1Resp.hash.Length -ne 64) { throw "B1 FAIL: missing/invalid hash" }

Write-Host "B1_HASH=$($b1Resp.hash)"
"B1_HASH=$($b1Resp.hash)" | Out-File -FilePath (Join-Path $proofDir "b1_hash.txt") -Encoding UTF8

