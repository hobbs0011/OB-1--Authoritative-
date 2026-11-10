# phone drop — box-task-nlm-verify

@2026-11-10T07-50-33Z via pais-mcp-cloud phone_drop

NLM VERIFY (post-install check only — no installs, no logins). 1. python3 -c "import notebooklm; print('import ok', notebooklm.__file__)" 2>&1 | tail -3. 2. python3 -m pip show notebooklm-py 2>&1 | head -6; which notebooklm; notebooklm --help 2>&1 | head -12. Reply raw outputs. End with exactly one line: NLM-VERIFY-OK — or NLM-VERIFY-FAIL plus a one-line why.
