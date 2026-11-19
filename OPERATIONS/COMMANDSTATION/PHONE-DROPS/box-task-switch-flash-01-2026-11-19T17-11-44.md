# phone drop — box-task-switch-flash-01

@2026-11-19T17-11-44Z via pais-mcp-cloud phone_drop

ENGINE SWITCH (sovereign order: sub-agents on deepseek flash). Stdout only, no values printed. 1) Test OpenRouter key live: curl -s -o /dev/null -w '%{http_code}' https://openrouter.ai/api/v1/models -H "Authorization: Bearer $OPENROUTER_KEY" (key from /root/.runner_env or service.json env; print HTTP CODE ONLY, never the key). 2) If 200: set opencode default model to openrouter/deepseek-chat (flash, cheap) in opencode config, keep kilo/kilo-auto/free as fallback; backup config first (*.bak-flash). If not 200: change NOTHING, report key dead. 3) Report: before/after default model lines, key HTTP code, fallback present Y/N. Facts only.
