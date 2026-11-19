# phone drop — box-task-model-check-01

@2026-11-19T17-10-09Z via pais-mcp-cloud phone_drop

MODEL CHECK. Stdout only. 1) Print opencode default model + provider: cat ~/.config/opencode/opencode.json 2>/dev/null || cat /root/.config/opencode/opencode.json 2>/dev/null || echo NO-CONFIG; env | grep -i -o 'KILO[A-Z_]*\|OPENROUTER[A-Z_]*\|DEEPSEEK[A-Z_]*' | sort -u. 2) Which model executed your last 3 tasks (kilo vs deepseek vs openrouter)? Check box-loop.log/inbox-poll.log tails for model strings. Facts only, no values.
