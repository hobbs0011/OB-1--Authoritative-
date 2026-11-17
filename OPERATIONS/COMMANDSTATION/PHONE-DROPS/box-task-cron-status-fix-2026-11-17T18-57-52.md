# phone drop — box-task-cron-status-fix

@2026-11-17T18-57-52Z via pais-mcp-cloud phone_drop

Run this NOW in Termius on long-reality:

# 1. Check cron is running
crontab -l | grep box-loop

# 2. Check script exists and has env source
ls -la /root/agent/box-loop.sh
head -20 /root/agent/box-loop.sh

# 3. Check logs
cat /root/agent/box-loop.log

# 4. Source env and test manual run (THIS IS THE FIX)
source /root/.runner_env
echo "OPENROUTER_KEY: ${OPENROUTER_KEY:-NOT_SET}"
flock -n /root/agent/box-loop.lock /root/agent/box-loop.sh

# 5. Verify cron now has env - if not, fix it:
# sed -i '2a source /root/.runner_env' /root/agent/box-loop.sh

# 6. Check if tasks processed
tail -f /root/agent/box-loop.log
