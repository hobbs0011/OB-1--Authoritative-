# phone drop — box-task-check-cron

@2026-11-17T18-56-05Z via pais-mcp-cloud phone_drop

Check if cron is running and box-loop.sh exists:
crontab -l | grep box-loop
ls -la /root/agent/box-loop.sh
cat /root/agent/box-loop.log

# Also check if OPENROUTER_KEY is set
echo "OPENROUTER_KEY: ${OPENROUTER_KEY:-NOT_SET}"
source /root/.runner_env
echo "After source: ${OPENROUTER_KEY:-NOT_SET}"
