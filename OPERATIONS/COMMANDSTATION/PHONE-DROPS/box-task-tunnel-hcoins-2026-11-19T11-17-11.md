# phone drop — box-task-tunnel-hcoins

@2026-11-19T11-17-11Z via pais-mcp-cloud phone_drop

Tunnel H-audit (read-only, no changes, counts only):
echo "=== H1 flock ==="; crontab -l 2>/dev/null | grep -c flock; grep -c "flock -n" /root/agent/inbox-poll.sh /root/agent/box-loop.sh 2>/dev/null
echo "=== H2 memcap ==="; systemctl show box-loop 2>/dev/null | grep -i -m2 "MemoryMax\|MemoryLimit" || echo "no-systemd-unit"; cat /proc/meminfo | awk '/MemTotal/{print $2"KB-total"}'
echo "=== H4 hb ==="; ls -t OPERATIONS 2>/dev/null | head; date -u +%FT%TZ; echo "---"; ls /var/lib/box-loop/ 2>/dev/null; cat /var/lib/box-loop/inbox-lasthb 2>/dev/null; echo; tail -5 /var/log/inbox-poll.log 2>/dev/null | cut -c1-200
echo "stdout-only, poller posts result"
