import json, urllib.request

BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
def call(ep, method, body=None):
    url = f"{BASE}/api/{ep}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "User-Agent": "curl/7.88.1"},
        method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, r.read()[:300].decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:300].decode(errors="replace")
    except Exception as e:
        return type(e).__name__, str(e)[:300]

print("=== P20-A: verify SSRF guard blocks on write ===")
for probe_url in [
    "http://localhost:8080/admin",
    "http://127.0.0.1:6379/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.1/",
    "http://192.168.1.1/",
]:
    r = call("queue", "POST", {"task": "ssrf", "targetfile": "x.js", "webhookUrl": probe_url})
    print(f"webhook={probe_url!r} -> {r}")

print("\n=== P20-B: verify current queue has no private webhookUrl ===")
q = call("queue", "GET")
if q[0] == 200:
    tasks = json.loads(q[1])
    found_private = False
    for t in tasks.get("tasks", []):
        wf = t.get("webhookUrl", "") or ""
        private = any(p in wf for p in ["localhost", "127.0.0.1", "169.254", "10.", "192.168."])
        if private:
            print(f"  !! PRIVATE SLIPPED THROUGH: {wf!r}")
            found_private = True
    if not found_private:
        print("  OK: no private IPs in stored queue tasks")
    print(f"  queue count: {tasks.get('count',0)}")
else:
    print(q)

print("\n=== P21: verify batch null fields returns meaningful error ===")
for b in [
    {"tasks": [{"task": None, "targetfile": "x.js"}]},
    {"tasks": [{"task": "ok", "targetfile": None}]},
    {"tasks": [{}]},
]:
    print(call("code", "POST", b))

print("\n=== P22: path traversal now produces meaningful error for /api/log ===")
print(call("log", "GET", {"limit": "9999999999999999999999"}))
print(call("log", "GET", {"limit": "-100"}))

print("\n=== P23: brain remember path traversal now produces meaningful error ===")
print(call("brain/remember", "POST", {"tag": "../../etc/passwd", "chunk": "root"}))
