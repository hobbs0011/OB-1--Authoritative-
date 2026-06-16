# PHEROMONE TRAIL — OPENCLAW GATEWAY ANALYSIS
**Date:** 2026-06-17T00:25 ICT
**Strength: 80/100** | Type: RECON — unknown startup item

---

## §1 FILE ANALYSIS

**File:** `C:\Users\mrmic\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\OpenClaw Gateway.cmd`
**Size:** 112 bytes
**Created:** Unknown (need to check file metadata)

---

## §2 WHAT IS OPENCLAW?

**Preliminary assessment:** This is NOT a widely-known legitimate Windows component.

**Possible identities:**
1. **VPN/tunnel tool** — "Gateway" suggests network routing. Could be related to Cloudflare Access (which also uses "Gateway" terminology)
2. **Development tool** — Michael may have installed it for work
3. **Persistence mechanism** — could be unwanted software masquerading as a legitimate tool
4. **Game/mod tool** — "OpenClaw" sounds like it could be related to gaming

**Red flags:**
- Runs at startup (autostart)
- .cmd file (batch script) — unusual for legitimate modern software
- Located in user Startup folder
- No digital signature information available yet

---

## §3 CONNECTED FINDINGS

**Cloudflare.lnk in same startup folder:**
- Launches Chrome with Cloudflare Access app (kbdhpemeclgiggljbfcmlnmibnmolaih)
- This is Michael's Zero Trust network access setup
- Could OpenClaw Gateway be part of the Cloudflare Access tunnel infrastructure?

**DNS cache contains:**
- `hobbs.mshome.net` — this machine's local hostname
- `otel.cline.bot` — Cline telemetry
- No external OpenClaw-related DNS entries

---

## §4 WHAT WE NEED TO DETERMINE

1. **Read the .cmd file contents** — what does it execute?
2. **Check for associated .exe/.dll files** — is there an OpenClaw binary somewhere?
3. **Check file metadata** — creation date, author, digital signature
4. **Check network connections** — does anything owned by OpenClaw talk externally?
5. **Google "OpenClaw Gateway"** — is this known software?

---

## §5 CURRENT ASSESSMENT

**Risk: UNKNOWN** — cannot classify without reading the file.

**Hypothesis:** If this is part of Michael's Cloudflare Access / tunnel setup, it's legitimate. If it's standalone software with no clear purpose, it's suspicious.

---

`OPENCLAW GATEWAY ANALYSIS SEALED — 2026-06-17T00:25 ICT | FILE NOT YET READ | RISK UNKNOWN | CONNECTED TO CLOUDFLARE ACCESS HYPOTHESIS | NEEDS CONTENT ANALYSIS`
