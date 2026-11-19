# phone drop — box-task-ccc0purge-authscan

@2026-11-19T16-18-21Z via pais-mcp-cloud phone_drop

SETUP+VERIFY. No history changes, no pushes yet. Stdout only (never instruct any phone_drop yourself). Secrets discipline: the ONLY secret-adjacent file is /root/.purge_key -- NEVER print it, never cat it, never env-dump; verify by exit codes and fingerprints only. End with EXIT:0.
1. SSH auth test (proves the deploy key works): ssh -i /root/.purge_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -T git@github.com 2>&1 | head -2; echo AUTH_EXIT:$? . Then: GIT_SSH_COMMAND="ssh -i /root/.purge_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" git ls-remote git@github.com:hobbs0011/OB-1--Authoritative-.git HEAD 2>&1 | head -2; echo LS_EXIT:$?. If port 22 fails, retry with: ssh -i /root/.purge_key -o IdentitiesOnly=yes -p 443 git@ssh.github.com -T 2>&1 | head -1 (report which port worked).
2. Background full scan (beats the 240s window): rm -f /tmp/scan.out; cd /tmp/purge-scan && nohup gitleaks detect --source . --redact -v > /tmp/scan.out 2>&1 & echo SCAN_PID:$! . Sleep 200, then report: 'scan_running:' + (ps -p $! > /dev/null && echo yes || echo no) + ' lines:' + (wc -l < /tmp/scan.out). Print the last 30 lines of /tmp/scan.out that match FINDING|SUMMARY|leaks|error (paths+rule names only -- gitleaks ran --redact so values are masked; if any unmasked value appears, DO NOT print it, report VALUE-LEAK-RISK instead).
3. Report disk: df -h /root | tail -1.
Keep output under 8000 chars. EXIT:0.
