# phone drop — box-task-nlm-install

@2026-11-10T07-36-07Z via pais-mcp-cloud phone_drop

NLM INSTALL (no logins, no secrets — pip install only). On this box:
1. python3 -m pip install -U "notebooklm-py[browser]" 2>&1 | tail -5
2. python3 -c "import notebooklm; print('import ok')" 2>&1 | tail -2
3. notebooklm --help 2>&1 | head -20
Reply with the raw outputs. End with exactly one line: NLM-INSTALL-OK — or NLM-INSTALL-FAIL plus a one-line why. (The `notebooklm login` step stays a sovereign Termius act — do NOT attempt any login.)
