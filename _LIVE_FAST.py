import json, urllib.request, os
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
def call(method, path, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type":"application/json"}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            return r.status, r.read()[:300].decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:300].decode()
    except Exception as e:
        return type(e).__name__, str(e)[:300]

results = {}
for ep in ["/api/status","/api/log","/api/brain/recall","/api/queue"]:
    m = "GET" if ep!="/api/queue" else "GET"
    code, body = call(m, ep, {"limit":3} if "/log" in ep else None)
    results[ep] = (code, body[:80])

print(json.dumps(results, indent=2))
