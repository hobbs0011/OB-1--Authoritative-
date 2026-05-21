#!/usr/bin/env python3
# Phoenix-Coder Final Verdict Probe - direct socket to bypass cert issues
import socket, json, time

BASE_HOST = "phoenix-coder.mrmichaelhobbs123.workers.dev"
BASE_PORT = 443

def https_post(path, body_obj, timeout=20):
    raw = json.dumps(body_obj)
    req = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: {BASE_HOST}\r\n"
        f"Content-Type: application/json\r\n"
        f"User-Agent: curl/7.88.1\r\n"
        f"Content-Length: {len(raw.encode())}\r\n"
        f"Connection: close\r\n"
        f"\r\n"
        f"{raw}"
    )
    t0 = time.time()
    try:
        ctx = __import__("ssl").create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = __import__("ssl").CERT_NONE
        s = ctx.wrap_socket(socket.create_connection((BASE_HOST, BASE_PORT), timeout=timeout), server_hostname=BASE_HOST)
        s.sendall(req.encode())
        resp = b""
        while True:
            chunk = s.recv(4096)
            if not chunk: break
            resp += chunk
            if b"\r\n\r\n" in resp:
                # got headers, read rest
                header_end = resp.index(b"\r\n\r\n") + 4
                body_start = header_end
                # content-length or chunked
                header = resp[:header_end].decode(errors="replace")
                if "Content-Length:" in header:
                    import re
                    m = re.search(r"Content-Length:\s*(\d+)", header)
                    if m:
                        needed = int(m.group(1))
                        while len(resp) - body_start < needed:
                            chunk = s.recv(4096)
                            if not chunk: break
                            resp += chunk
                break
        s.close()
        dt = time.time()-t0
        # split headers/body
        parts = resp.split(b"\r\n\r\n",1)
        body_raw = parts[1].decode(errors="replace") if len(parts)>1 else resp.decode()
        # status from first line
        first_line = parts[0].split(b"\r\n")[0].decode()
        status = int(first_line.split()[1]) if " " in first_line else 0
        return dt, status, body_raw[:400]
    except Exception as e:
        return time.time()-t0, -1, str(e)[:200]

# --- PROBES ---
res = []

# CT guard: thin payload
dt, code, body = https_post("/api/code", {"task":"echo SC2","targetfile":"c.js","maxTokens":32})
res.append(f"[CT guard POST code] {code} {dt:.2f}s | {body[:120]}")

# SSRF localhost
dt, code, body = https_post("/api/queue", {"task":"ssrf-lock","targetfile":"x.js","webhookUrl":"http://localhost:8080/admin"})
res.append(f"[SSRF localhost POST queue] {code} {dt:.2f}s | {body[:120]}")

# Brain PT
dt, code, body = https_post("/api/brain/remember", {"tag":"../../etc/passwd","chunk":"pwn"})
res.append(f"[brain PT] {code} {dt:.2f}s | {body[:120]}")

# /api/status summary line
dt, code, body = https_post("/api/status", {})
if code==200:
    try:
        s = json.loads(body)
        res.append(f"[STATUS] v={s.get('version')} qDepth={s.get('queueDepth')} soul={s.get('soulIntegration')} gh={s.get('githubAutoCommit')}")
    except: res.append(f"[STATUS] {body[:150]}")
else:
    res.append(f"[STATUS] {code} {body[:150]}")

for r in res: print(r)
