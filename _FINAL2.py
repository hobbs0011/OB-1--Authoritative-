import json, urllib.request, time
BASE = "https://phoenix-coder.mrmichaelhobbs123.workers.dev"
H = {"Content-Type": "application/json", "User-Agent": "curl/7.88.1"}

def req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(f"{BASE}{path}", data=data, headers=H, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as res:
            return res.status, res.read()[:400].decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:400].decode()
    except Exception as e:
        return type(e).__name__, str(e)[:400]

# CT guard definitive timeout check
t0 = time.time()
code, body = req("POST", "/api/code", {"task":"echo REDACTED","targetfile":"t.js","maxTokens":8})
dt = time.time()-t0
result = f"[CT guard] {dt:.1f}s code={code} | {body[:180]}"
print(result)

# SSRF definitive localhost check
code, body = req("POST", "/api/queue", {"task":"ssrf","targetfile":"x.js","webhookUrl":"http://localhost:8080/admin"})
print(f"\n[SSRF localhost] code={code} | {body[:180]}")

# Brain path traversal definitive check
code, body = req("POST", "/api/brain/remember", {"tag":"../../etc/passwd","chunk":"pwn"})
print(f"\n[brain PT] code={code} | {body[:180]}")

# Log limit
code, body = req("GET", "/api/log", {"limit":"99999999999"})
print(f"\n[log limit] code={code} | {body[:180]}")

# /api/status summary
code, body = req("GET", "/api/status")
try:
    s = json.loads(body)
    print(f"\n[PHOENIX] v={s.get('version')} status={s.get('status')} qDepth={s.get('queueDepth')} gh={s.get('githubAutoCommit')} soul={s.get('soulIntegration')}")
except:
    print(f"\n[PHOENIX] {body[:200]}")
