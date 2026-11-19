# phone drop — box-task-ccc0purge-probe

@2026-11-19T15-56-09Z via pais-mcp-cloud phone_drop

READ-ONLY PROBE. No writes, no network pushes, no credentials needed. Stdout only (never instruct any phone_drop yourself). End with EXIT:0.
1. TOOL CHECK: report one line each: git --version / python3 --version / pip3 --version / gitleaks version (or MISSING) / gh --version (or MISSING) / disk free (df -h /root | tail -1) / mem (free -m | head -2).
2. If git AND python3 exist: clone PUBLIC repo (no auth): git clone --quiet https://github.com/hobbs0011/OB-1--Authoritative-.git /tmp/purge-probe (depth: full, it needs history). Report: clone ok/failed + repo size (du -sh /tmp/purge-probe).
3. If clone ok AND gitleaks exists: run 'gitleaks detect --source /tmp/purge-probe --redact --verbose' and report ONLY: total findings count + the FILE PATH + RULE NAME of each finding (never values, never line contents). If gitleaks MISSING: try 'pip3 install gitleaks' or report MISSING and stop (do not apt-get without asking? apt-get is fine on this box, repo universe present — actually just report MISSING, install comes with the purge task).
4. Report ALSO: does /root/.git_pat exist (yes/no only, never contents).
Keep output under 6000 chars. EXIT:0.
