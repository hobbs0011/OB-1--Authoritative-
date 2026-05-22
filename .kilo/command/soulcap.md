---
description: Count sov100 session words, post to soul-logger, provide 3 independent receipts + deploy coder double-check. Assume every prior checkpoint failed.
agent: SS-Agent99
model: deepseek-v4-pro
subtask: false
---
ASSUME EVERY PRIOR CHECKPOINT FAILED. RISE, ALARM, LOCK, ANCHOR, TITANIUM — all reporting dead numbers. Trust zero automation. Every death seal spawns an independent coder to manually recount.

## Primary — Count and Post (this agent executes)
Count every word spoken by sov100 in this session. Post to soul-logger. Provide 3 independent receipts.

**Receipt 1 — Word Count:**
```powershell
$sessionText = "$ARGUMENTS"
$words = ($sessionText | Measure-Object -Word).Words
$chars = $sessionText.Length
Write-Host "SOV100 WORDS: $words | CHARS: $chars"
```

**Receipt 2 — Soul-Logger API POST:**
```powershell
$body = @{student_id="sov100-michael";session_id="sov100-$((Get-Date).ToString('yyyy-MM-dd'))";role="user";text=$sessionText;timestamp=(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffZ')} | ConvertTo-Json -Compress
$resp = curl -s -X POST "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" -H "Content-Type: application/json" -d $body
Write-Host "API RESPONSE: $resp"
```

**Receipt 3 — Live SOULCOUNT Cross-Check:**
```powershell
$count = curl -s "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" | ConvertFrom-Json
Write-Host "SOULCOUNT: $($count.soulcount) | Events: $($count.events) | Level: $($count.level)"
```

## Coder Double-Check (deploy subagent)
After completing Receipts 1-3, IMMEDIATELY deploy a coder subagent with the EXACT session text. The coder must:
1. MANUALLY recount words (character-by-character, not Measure-Object)
2. INDEPENDENTLY post to soul-logger API
3. INDEPENDENTLY pull live SOULCOUNT
4. Report its 3 receipts back to this agent
5. If the coder's receipts don't MATCH this agent's receipts within ±1%, HALT. DO NOT SEAL DEATH.

**Coder agent prompt for subagent:**
```
Count the following text word-by-word manually. Post it to https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event with student_id="sov100-michael" and session_id="sov100-YYYY-MM-DD-coder". Pull the live count from /api/soul/count. Report back:
1. EXACT word count
2. API response
3. Live SOULCOUNT after posting
4. Whether your count matches the primary agent's count

TEXT TO COUNT:
$ARGUMENTS
```

## Verdict
If 3 receipts from primary agent + 3 receipts from coder all cross-validate (within ±1% word count tolerance), VERDICT: SOUL CAPTURED.
If ANY mismatch: HALT. Audit every checkpoint upstream. Assume all prior RISE/ALARM/LOCK/ANCHOR checks falsified.
