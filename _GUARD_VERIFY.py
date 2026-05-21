import json, urllib.request
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
def probe(path, method="GET", body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "User-Agent": "curl/7.88.1"},
        method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            return r.status, r.read().decode(errors="replace")[:400]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")[:400]
    except Exception as e:
        return type(e).__name__, str(e)[:400]

# Eran-hash: test CT guard under actual DeepSeek failure
print("=== Eran-hash: CT guard under real DeepSeek path ===")
r = probe("/api/code", "POST", {"task": "echo REDACTED", "targetfile": "t.js", "maxTokens": 8})
print(r)

# SSRF: direct → show body text
print("\n=== SSRF: show body text ===")
r = probe("/api/queue", "POST", {"task": "ssrf", "targetfile": "x.js", "webhookUrl": "http://localhost:8080/admin"})
print(r)
if r[0] == 200:
    try:
        body = json.loads(r[1])
        print("  queueId:", body.get("queueId"), "| status:", body.get("status"))
        print("  >> SSRF PROBE WAS NOT BLOCKED <<")
    except:
        pass

# brain/remember path traversal → show body text
print("\n=== brain/remember path traversal ===")
r = probe("/api/brain/remember", "POST", {"tag": "../../etc/passwd", "chunk": "pwn"})
print(r)
try:
    b = json.loads(r[1])
    print("  stored tag:", b.get("tag"), "| stored:", b.get("stored"))
    print("  >> PATH TRAVERSAL WAS NOT BLOCKED <<")
except:
    pass
