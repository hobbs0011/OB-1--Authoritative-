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
        with urllib.request.urlopen(req, timeout=12) as r:
            raw = r.read().decode(errors="replace")
            return r.status, raw[:500]
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors="replace")
        return e.code, raw[:500]
    except Exception as e:
        return type(e).__name__, str(e)[:500]

print("=== Verify SSRF guard blocks on /api/queue POST ===")
urls = [
    "http://localhost:8080/admin",
    "http://127.0.0.1:6379/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.1/",
    "http://192.168.1.1/",
    "http://[::1]:22/",
    "http://evil.com/",          # external — should PASS
]
for u in urls:
    code, body = call("POST", "/api/queue", {"task": "ssrf-test", "targetfile": "x.js", "webhookUrl": u})
    verdict = "BLOCKED" if code == 400 and "not allowed" in body else ("ALLOWED" if code == 200 else f"H{code}")
    print(f"  [{verdict:7}] {u} -> {code} {body[:120]}")

print("\n=== Verify path traversal blocked on /api/brain/remember ===")
code, body = call("POST", "/api/brain/remember", {"tag": "../../etc/passwd", "chunk": "pwn"})
print(f"  [{code}] {body[:200]}")
code, body = call("POST", "/api/brain/remember", {"tag": "normaltag", "chunk": "ok"})
print(f"  [{code}] {body[:200]}")

print("\n=== Verify /api/log limit clamping ===")
code, body = call("GET", "/api/log", {"limit": "999999999999999999999999999", "type": "'; DROP TABLE"})
print(f"  [{code}] count={json.loads(body).get('count','?') if body.startswith('{') else '?N/A'} {body[:120]}")
