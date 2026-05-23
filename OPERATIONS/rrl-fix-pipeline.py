"""RRL Stage I-III pipeline fix — Python handles all HTTP + encoding"""
import urllib.request, json, hashlib, sys, time
from datetime import datetime, timezone

D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
REPO = "D:\\OB-1-CANONICAL"

def curl_json(method, path, body=None):
    url = f"{D1}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "RRL-Pipeline/1.0")
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body_out = e.read().decode() if e.fp else ""
        return e.code, {"error": body_out}

# ── STEP 1: SOUL ── RRL-0.txt live SOULCOUNT before
status, soul_before = curl_json("GET", "/api/soul/count")
print(f"[BEFORE] SOULCOUNT: {soul_before.get('soulcount','?')} | {soul_before.get('level','?')} | events={soul_before.get('events','?')}")

# POST RRL-0.txt to D1
rrl_path = f"{REPO}/RRL/RRL-0.txt"
with open(rrl_path, encoding="utf-8") as f:
    rrl_text = f.read()
rrl_chars = len(rrl_text)
rrl_bytes = len(rrl_text.encode("utf-8"))

status, soul_post = curl_json("POST", "/api/soul/event", {
    "student_id": "sov100-michael",
    "session_id": "sov100-run0-pythonpipe",
    "role": "user",
    "text": rrl_text
})
print(f"[SOUL POST] status={status} event_id={soul_post.get('event_id','FAIL: '+soul_post.get('error',''))} bytes={soul_post.get('byte_count','?')}")

# SOULCOUNT after
status, soul_after = curl_json("GET", "/api/soul/count")
print(f"[AFTER]  SOULCOUNT: {soul_after.get('soulcount','?')} | delta=+{soul_after.get('soulcount',0) - soul_before.get('soulcount',0)}")

# ── STEP 2: DNA ── extract
status, dna = curl_json("POST", "/api/soul/extract", {
    "student_id": "sov100-michael",
    "session_id": "sov100-run0-pythonpipe"
})
print(f"[DNA EXTRACT] status={status} count={dna.get('prompt_count','0')}")

print(f"\nDONE. RRL-0={rrl_chars} chars, {rrl_bytes} bytes")
