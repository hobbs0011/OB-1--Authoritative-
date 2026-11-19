# phone drop — box-task-ccc0purge-keyscan

@2026-11-19T16-08-05Z via pais-mcp-cloud phone_drop

READ-ONLY + LOCAL SETUP. No pushes, no history changes, no credentials printed ever. Stdout only (never instruct any phone_drop yourself). End with EXIT:0.
1. Cleanup: rm -rf /tmp/purge-probe /tmp/purge-scan (frees ~2.8G). Report 'df:' + (df -h /root | tail -1).
2. Keygen (private stays on box): if [ ! -s /root/.purge_key ]; then ssh-keygen -t ed25519 -f /root/.purge_key -N '' -C 'purge-2026-11-19'; chmod 600 /root/.purge_key; fi. Report 'PUBKEY: ' + the full contents of /root/.purge_key.pub (PUBLIC half ONLY -- NEVER print /root/.purge_key itself, never cat it, never env-dump, never base64 it). Report 'FP: ' + (ssh-keygen -lf /root/.purge_key.pub).
3. Install gitleaks: curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.24.2/gitleaks_8.24.2_linux_x64.tar.gz -o /tmp/g.tgz && tar -xzf /tmp/g.tgz -C /usr/local/bin gitleaks && chmod +x /usr/local/bin/gitleaks. Report 'gitleaks:' + (gitleaks version 2>&1 | head -1) or 'INSTALL-FAIL' + short curl error.
4. Clone: git clone --quiet https://github.com/hobbs0011/OB-1--Authoritative-.git /tmp/purge-scan. Report 'clone:' + exit code + (du -sh /tmp/purge-scan | cut -f1).
5. Scan: gitleaks detect --source /tmp/purge-scan --redact. Report 'findings:' + count + for EACH finding one line 'F: <file path> | <rule name>' (paths and rule names ONLY -- never values, never line contents). If zero findings report 'SCAN-CLEAN'.
Keep output under 8000 chars. EXIT:0.
