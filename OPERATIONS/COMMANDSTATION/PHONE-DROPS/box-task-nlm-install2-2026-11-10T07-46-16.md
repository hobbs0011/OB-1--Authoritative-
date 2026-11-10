# phone drop — box-task-nlm-install2

@2026-11-10T07-46-16Z via pais-mcp-cloud phone_drop

NLM INSTALL RETRY (pip is now live — no logins, no secrets). 1. python3 -m pip install -U "notebooklm-py[browser]" 2>&1 | tail -6. 2. python3 -c "import notebooklm; print('import ok')" 2>&1 | tail -2; notebooklm --help 2>&1 | head -12. Reply raw outputs. End with exactly one line: NLM-INSTALL-OK — or NLM-INSTALL-FAIL plus a one-line why. (Do NOT attempt any login.)
