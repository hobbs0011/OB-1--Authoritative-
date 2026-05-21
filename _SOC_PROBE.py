import json, urllib.request, sys

BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
PROBES = [
    ("queue", "POST", {"task": "xss", "targetfile": "<img src=x onerror=alert(1)>"}),
    ("queue", "POST", {"task": "union select", "targetfile": "union_select.js"}),
    ("code",  "POST", {"task": "echo REDACTED", "targetfile": "t.js", "maxTokens": 1}),
    ("log",   "GET",  None),
    ("log",   "GET",  {"limit": 5000}),
    ("brain/remember", "POST", {"tag": "..%2f..%2fetc%2fpasswd", "chunk": "path traversal"}),
    ("queue", "POST", {"task": "", "targetfile": ""}),
    ("queue", "GET", None),
    ("status","GET", None),
    ("code", "GET", None),
    ("api", "GET", None),
    ("queue/process", "GET", None),
]

for path, method, body in PROBES:
    try:
        url = f"{BASE}/api/{path}"
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method=method)
        with urllib.request.urlopen(req, timeout=8) as r:
            out = r.read()[:200]
            print(f"[{method} {path}] {r.status} {out[:150]}")
    except urllib.error.HTTPError as e:
        print(f"[{method} {path}] {e.code} {e.read()[:150]}")
    except Exception as e:
        print(f"[{method} {path}] {type(e).__name__}: {str(e)[:150]}")
