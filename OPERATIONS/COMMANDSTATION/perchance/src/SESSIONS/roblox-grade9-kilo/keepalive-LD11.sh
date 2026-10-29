#!/bin/bash
# keepalive-LD11 — rerun Roblox driver until STATE shows zero open sections, max 5 runs.
# Exit 0 = all pass. Exit 2 = still incomplete after cap (needs sovereign eyes, no silent loop).
cd /root/agent
RUNS=0
while true; do
  [ -f /root/mission/STOP ] && exit 0
  RUNS=$((RUNS+1))
  if [ "$RUNS" -gt 5 ]; then echo "$(date -u +%FT%TZ) KEEPER-CAP 5 runs, still incomplete — exiting 2" >> /root/mission/roblox-launch.log; exit 2; fi
  node ${DRIVER:-lesson-driver-LD11.mjs} >> /root/mission/roblox-launch.log 2>&1
  LEFT=$(node -e "try{const s=require('/root/mission/ROBLOX-STATE.json');const d=s.done||{};const v=Object.values(d);console.log(v.length?v.filter(function(x){return x!=='pass';}).length:99)}catch(e){console.log(99)}")
  if [ "$LEFT" = "0" ]; then exit 0; fi
  echo "$(date -u +%FT%TZ) KEEPER run $RUNS done, $LEFT sections still open — retrying" >> /root/mission/roblox-launch.log
  sleep 300
done
