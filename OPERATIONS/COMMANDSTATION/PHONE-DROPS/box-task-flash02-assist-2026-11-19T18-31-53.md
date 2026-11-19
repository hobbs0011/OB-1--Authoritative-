# phone drop — box-task-flash02-assist

@2026-11-19T18-31-53Z via pais-mcp-cloud phone_drop

# phone drop — box-task-flash02-assist (re-issue of switch-flash-01, which was marked done but never ran: zero results posted for it)

ENGINE SWITCH (sovereign order: sub-agents on deepseek flash). Stdout ONLY in your reply — never call phone_drop yourself, the poller posts your stdout. Print NO secret values, HTTP codes and booleans only. 1) Test OpenRouter key live: source /root/.runner_env, then curl -s -o /dev/null -w '%{http_code}' https://openrouter.ai/api/v1/models -H "Authorization: Bearer $OPENROUTER_KEY" (print HTTP CODE ONLY, never the key). 2) If 200: backup opencode config (*.bak-flash02), set opencode default model to openrouter/deepseek-chat (flash, cheap), keep kilo/kilo-auto/free as fallback. If not 200: change NOTHING, report key dead. 3) Report: key HTTP code, before/after default-model lines, fallback present Y/N, backup file name. Facts only.
