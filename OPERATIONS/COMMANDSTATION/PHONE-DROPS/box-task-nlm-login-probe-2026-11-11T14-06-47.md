# phone drop — box-task-nlm-login-probe

@2026-11-11T14-06-47Z via pais-mcp-cloud phone_drop

# BOX TASK — NLM login-state probe (secret-free)

Sovereign order 2026-11-11. NO credentials are in this task and none will follow through this lane — do NOT ask for any, do NOT print any.

Run and report VERBATIM output (stdout+stderr, exit codes) for:
1. `notebooklm list 2>&1 | head -20` — if it lists notebooks, a Google session is ALREADY live: say so and stop.
2. If it demands login, run `notebooklm login --help 2>&1 | head -20` and report exactly what auth mechanism it wants (browser URL? device code? other?).
3. `ls -la ~/.notebooklm 2>&1; echo ---; ls ~/.config 2>&1 | head` — report whether any prior session/token files exist.

Do NOT attempt any login. Do NOT modify auth state. End with exactly one line: NLM-LOGINSTATE-OK plus one short state word (LIVE or NEEDS-LOGIN).
