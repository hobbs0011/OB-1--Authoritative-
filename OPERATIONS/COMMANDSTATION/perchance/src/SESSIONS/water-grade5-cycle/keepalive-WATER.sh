#!/bin/bash
# keepalive-WATER — rerun water driver until STATE all-pass, max 20 runs (unattended completion).
cd /root/agent
RUNS=0
while true; do
  [ -f /root/mission/STOP-WATER ] && exit 0
  RUNS=$((RUNS+1))
  if [ "$RUNS" -gt 20 ]; then echo "$(date -u +%FT%TZ) WATER-KEEPER-CAP 20 runs, still incomplete — exiting 2" >> /root/mission/water-launch.log; exit 2; fi
  node ${DRIVER:-lesson-driver-LD12-water.mjs} >> /root/mission/water-launch.log 2>&1
  LEFT=$(node -e "try{const s=require('/root/mission/WATER-STATE.json');const d=s.done||{};const v=Object.values(d);console.log(v.length?v.filter(function(x){return x!=='pass';}).length:99)}catch(e){console.log(99)}")
  if [ "$LEFT" = "0" ]; then exit 0; fi
  echo "$(date -u +%FT%TZ) WATER-KEEPER run $RUNS done, $LEFT sections still open — retrying" >> /root/mission/water-launch.log
  sleep 300
done
