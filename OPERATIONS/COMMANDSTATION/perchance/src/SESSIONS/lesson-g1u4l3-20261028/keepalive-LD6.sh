#!/bin/bash
# keepalive-LD6 — rerun driver until fresh DONE, max 5 runs (failure-escape per D10).
# Stops on fresh DONE, STOP file, or run cap (exit 2 = needs sovereign eyes, no silent loop).
cd /root/agent
RUNS=0
while true; do
  [ -f /root/mission/STOP ] && exit 0
  RUNS=$((RUNS+1))
  if [ "$RUNS" -gt 5 ]; then echo "$(date -u +%FT%TZ) KEEPER-CAP 5 runs, no fresh DONE — exiting 2" >> /root/mission/solo-launch.log; exit 2; fi
  SZ=$(stat -c %s /root/mission/solo-launch.log 2>/dev/null || echo 0)
  node ${DRIVER:-lesson-driver-LD6.mjs} >> /root/mission/solo-launch.log 2>&1
  if tail -c +$((SZ+1)) /root/mission/solo-launch.log | grep -q "DONE"; then exit 0; fi
  sleep 300
done
