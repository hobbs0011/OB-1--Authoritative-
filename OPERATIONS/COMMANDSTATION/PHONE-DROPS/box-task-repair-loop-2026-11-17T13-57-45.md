# phone drop — box-task-repair-loop

@2026-11-17T13-57-45Z via pais-mcp-cloud phone_drop

BOX REPAIR — box-loop.sh line-15 syntax error + drop.py double-write (2026-11-17).

SCOPE: box files ONLY (/root/agent/box-loop.sh, /root/agent/drop.py). No repo writes except your normal result post. No key exfil: NEVER print /root/.runner_env contents or env values. Only perms/size checks (stat, ls) and lengths.

CONTEXT: live /root/agent/box-loop.sh fails `bash -n` with `line 15: syntax error near unexpected token )` — the log() function is truncated to `u +'%Y...`. Cause was `source /root/.runner_env<<'EOF'` swallowing the script + duplicated header. Old drop.py writes /root/agent/out.json directly AND caller redirects stdout there. Both fixed below.

DO:
1. Backup: cp /root/agent/box-loop.sh /root/agent/box-loop.sh.bak-$(date -u +%FT%TZ); cp /root/agent/drop.py /root/agent/drop.py.bak-$(date -u +%FT%TZ); ls -la /root/agent/box-loop.sh* /root/agent/drop.py*
2. Rewrite /root/agent/box-loop.sh with EXACT content in section A below (Unix LF, single header). Use: cat > /root/agent/box-loop.sh <<'BOXEOF' ... BOXEOF
3. Rewrite /root/agent/drop.py with EXACT content in section B below. Use: cat > /root/agent/drop.py <<'DROPEOF' ... DROPEOF
4. chmod +x /root/agent/box-loop.sh /root/agent/drop.py; bash -n /root/agent/box-loop.sh && echo SYNTAX-OK; python3 -m py_compile /root/agent/drop.py && echo PY-OK. Both MUST pass. If not, fix line endings (sed -i 's/\r$//') and retry.
5. Evidence (no secrets): stat -c '%a %n' /root/.runner_env; ls -l /root/.runner_env | awk '{print $1, $5, $9}'; test -x /root/.opencode/bin/opencode && /root/.opencode/bin/opencode --version; crontab -l | grep -E 'box-loop|inbox-poll'; echo ---LOG---; tail -n 20 /root/agent/box-loop.log 2>/dev/null || tail -n 20 /var/log/box-loop.log 2>/dev/null || echo no-log-yet; echo ---HEAD---; sed -n '1,25p' /root/agent/box-loop.sh
6. Prevent reprocessing: fetch GitHub tree, list any PHONE-DROPS names starting box-task-repair-loop, append exact names to /root/agent/box-loop.done if not already present (grep -qxF check). Show: grep -c . /root/agent/box-loop.done; tail -n 5 /root/agent/box-loop.done
7. DO NOT run the full box-loop.sh manually (it would reprocess tasks). Syntax check + evidence is enough. Report leaves via your normal result lane.

===== SECTION A: /root/agent/box-loop.sh (exact) =====
#!/usr/bin/env bash
# /root/agent/box-loop.sh — Polls PHONE-DROPS for box-task-*, runs via opencode, returns via phone_drop
# Fixed version 2026-11-17: clean Unix line endings, single header, safe env load.
set -euo pipefail

D=/root/agent
LOG_FILE="$D/box-loop.log"
DONE_FILE="$D/box-loop.done"

mkdir -p "$D"
touch "$DONE_FILE"

if [ -f /root/.runner_env ]; then
  set -a
  . /root/.runner_env
  set +a
fi

log() {
  local status="$1"
  local message="$2"
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') [$status] $message" >> "$LOG_FILE"
}

log "INFO" "Starting box-loop service"

AUTH=()
if [ -n "${GH_TOKEN:-}" ]; then
  AUTH=(-H "Authorization: Bearer $GH_TOKEN")
fi

TREE_JSON="$D/tree.json"
TREE_URL="https://api.github.com/repos/hobbs0011/OB-1--Authoritative-/git/trees/master?recursive=1"
if [ "${#AUTH[@]}" -gt 0 ]; then
  TREE_OK=$(curl -s -m 20 "${AUTH[@]}" "$TREE_URL" -o "$TREE_JSON" && echo ok || echo fail)
else
  TREE_OK=$(curl -s -m 20 "$TREE_URL" -o "$TREE_JSON" && echo ok || echo fail)
fi
if [ "$TREE_OK" != "ok" ]; then
  log "WARN" "GitHub tree fetch failed (network). Exiting 0, will retry next cron tick."
  exit 0
fi

if grep -q "API rate limit exceeded" "$TREE_JSON"; then
  log "WARN" "GitHub API rate limited. Exiting 0, will retry next tick. Set GH_TOKEN in /root/.runner_env to raise limits."
  exit 0
fi

NAMES=$(python3 -c '
import json
with open("/root/agent/tree.json") as f:
    data = json.load(f)
for t in data.get("tree", []):
    path = t.get("path", "")
    prefix = "OPERATIONS/COMMANDSTATION/PHONE-DROPS/box-task-"
    if path.startswith(prefix):
        name = path.split("/")[-1]
        if name.startswith("box-task-"):
            print(name)
' | sort || true)

if [ -z "$NAMES" ]; then
  log "INFO" "No box-task-* files found. Cycle complete."
  exit 0
fi

for N in $NAMES; do
  if grep -qxF "$N" "$DONE_FILE"; then
    continue
  fi
  log "INFO" "Processing $N"
  if ! curl -s -m 20 -o "$D/task.txt" "https://raw.githubusercontent.com/hobbs0011/OB-1--Authoritative-/master/OPERATIONS/COMMANDSTATION/PHONE-DROPS/$N"; then
    log "WARN" "Download failed for $N, skipping (will retry next tick)."
    continue
  fi
  SUF="${N#box-task-}"
  SUF="${SUF%.md}"
  if [ ! -x /root/.opencode/bin/opencode ]; then
    log "ERROR" "opencode binary missing at /root/.opencode/bin/opencode, skipping $N."
    continue
  fi
  if [ -z "${OPENROUTER_KEY:-}" ]; then
    log "ERROR" "OPENROUTER_KEY not set in env/runner_env, skipping $N."
    continue
  fi
  set +e
  timeout 300 /root/.opencode/bin/opencode run "$(cat "$D/task.txt")" --format json --model "openrouter/deepseek/deepseek-chat" > "$D/result.txt" 2>&1
  RC=$?
  set -e
  if [ $RC -eq 124 ]; then
    log "WARN" "$N timed out after 300s."
    echo "TIMEOUT after 300s" > "$D/result.txt"
  fi
  if ! python3 "$D/drop.py" "box-result-$SUF" "$D/result.txt" > "$D/out.json"; then
    log "ERROR" "drop.py failed for $N, skipping post."
    continue
  fi
  if curl -s -m 20 -X POST "https://pais-mcp-cloud.mrmichaelhobbs1234.workers.dev/mcp" -H "Content-Type: application/json" --data @"$D/out.json" -o /dev/null; then
    echo "$N" >> "$DONE_FILE"
    log "INFO" "Completed $N -> box-result-$SUF (rc=$RC)"
  else
    log "WARN" "POST failed for $N, NOT marking done (will retry)."
  fi
done
log "INFO" "box-loop cycle complete"
===== END SECTION A =====

===== SECTION B: /root/agent/drop.py (exact) =====
#!/usr/bin/env python3
"""Build a phone_drop JSON-RPC payload on stdout. Usage: drop.py <tag> <result_file>"""
import sys
import json
def main():
    if len(sys.argv) != 3:
        print("usage: drop.py <tag> <result_file>", file=sys.stderr)
        return 2
    tag = sys.argv[1]
    result_file = sys.argv[2]
    try:
        with open(result_file, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
    except FileNotFoundError:
        text = "(result file missing: %s)" % result_file
    if len(text) > 50000:
        text = text[:50000] + "\n...[truncated]"
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": "phone_drop", "arguments": {"tag": tag, "text": text}},
    }
    print(json.dumps(payload))
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
===== END SECTION B =====
