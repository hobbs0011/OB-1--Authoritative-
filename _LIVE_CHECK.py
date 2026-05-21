import json, urllib.request
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
def call(method, path, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "User-Agent": "curl/7.88.1"},
        method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read()[:300].decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:300].decode()
    except Exception as e:
        return type(e).__name__, str(e)[:300]

# A1 — /api/status: are we still v5.0.0 / which SHA
print({call("GET", "/api/status")})

# A2 — /api/log: does curr.log? show the handleCode crash or CT guard path
r = call("GET", "/api/log", {"limit": 5})
print(f"\nlog sample: {r}")

# A3 — webhookCallbackX-authorization: Test webhookUrl fetch-block
print("\n=== Queue SSRF WEBHOOK CALL — verify D1 BEFORE deploy ===")
r = call("GET", "/api/queue")
if r[0] == 200:
    tasks = json.loads(r[1]).get("tasks", [])
    print(f"  queue count: {len(tasks)}")
    phish = [t for t in tasks if "localhost" in (t.get("webhookUrl") or "") or "secret" in (t.get("webhookUrl") or "")]
    if phish:
        print(f"  !! PHISHED PRIVATE IPS IN QUEUE: {len(phish)}")
        for t in phish[:3]:
            print(f"     id={t.get('id')} url={t.get('webhookUrl')}")
    else:
        print("  OK: no private stored")
else:
    print(r)