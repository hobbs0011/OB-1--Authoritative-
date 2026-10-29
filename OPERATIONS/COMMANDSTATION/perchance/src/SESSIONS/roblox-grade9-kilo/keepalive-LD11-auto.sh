#!/bin/bash
# keepalive-LD11-auto — SELF-SEEDING keeper (cap 20, unattended completion).
# Between runs (driver NOT running) it promotes staged drivers from /root/agent/stage/:
# drop NEXT-LD11*.mjs there anytime; node --check gates promotion (bad files rejected, current kept).
cd /root/agent
LIVE=lesson-driver-LD11.mjs
STAGE=/root/agent/stage
RUNS=0
mkdir -p "$STAGE"
while true; do
  [ -f /root/mission/STOP ] && exit 0
  RUNS=$((RUNS+1))
  if [ "$RUNS" -gt 20 ]; then echo "$(date -u +%FT%TZ) KEEPER-CAP 20 runs, still incomplete — exiting 2" >> /root/mission/roblox-launch.log; exit 2; fi
  for nxt in "$STAGE"/NEXT-LD11*.mjs; do
    [ -e "$nxt" ] || continue
    bn=$(basename "$nxt")
    if node --check "$nxt" 2>/dev/null; then
      cp "$LIVE" "$LIVE.bak-auto-$(date -u +%Y%m%dT%H%M%S)"
      cp "$nxt" "$LIVE"
      echo "$(date -u +%FT%TZ) AUTO-SEED $bn promoted to $LIVE" >> /root/mission/roblox-launch.log
      rm -f "$nxt"
    else
      echo "$(date -u +%FT%TZ) AUTO-SEED $bn FAILED check, ignored" >> /root/mission/roblox-launch.log
      mv "$nxt" "$nxt.rejected-$(date -u +%Y%m%dT%H%M%S)"
    fi
  done
  node ${DRIVER:-$LIVE} >> /root/mission/roblox-launch.log 2>&1
  LEFT=$(node -e "try{const s=require('/root/mission/ROBLOX-STATE.json');const d=s.done||{};const v=Object.values(d);console.log(v.length?v.filter(function(x){return x!=='pass';}).length:99)}catch(e){console.log(99)}")
  if [ "$LEFT" = "0" ]; then exit 0; fi
  echo "$(date -u +%FT%TZ) KEEPER run $RUNS done, $LEFT sections still open \u2014 retrying" >> /root/mission/roblox-launch.log
  sleep 300
done
