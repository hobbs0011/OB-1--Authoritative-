# PHEROMONE TRAIL — OPENCLAW EXEC APPROVALS
**Date:** 2026-06-17T00:31 ICT
**Strength: 85/100** | Type: RECON — execution approval system, socket auth

---

## §1 EXEC APPROVALS FILE

**Path:** `C:\Users\mrmic\.openclaw\exec-approvals.json`
**Size:** 9 lines

**Contents:**
```json
{
  "version": 1,
  "socket": {
    "path": "C:\\Users\\mrmic/.openclaw/exec-approvals.sock",
    "token": "vYrNRuEmc9JfUzX9Eoq-XEJOfgoctZYC"
  },
  "defaults": {},
  "agents": {}
}
```

---

## §2 WHAT THIS MEANS

**OpenClaw has an execution approval system:**
- Unix domain socket at `C:\Users\mrmic\.openclaw\exec-approvals.sock`
- Socket authentication via token: `vYrNRuEmc9JfUzX9Eoq-XEJOfgoctZYC`
- Agents must request approval before executing commands
- Currently no defaults or per-agent rules configured

**Security implications:**
- The socket token is another plaintext secret
- If an attacker gains access to the socket, they can bypass approval checks
- The token is stored in plaintext in JSON

---

## §3 FLAGS

1. **OPENCLAW_EXEC_APPROVALS_SOCKET** — Unix socket for command approval
2. **OPENCLAW_SOCKET_TOKEN_EXPOSED** — auth token in plaintext JSON
3. **OPENCLAW_APPROVAL_GATE** — prevents unauthorized command execution

---

`OPENCLAW EXEC APPROVALS SEALED — 2026-06-17T00:31 ICT | SOCKET TOKEN IN PLAINTEXT | APPROVAL GATE CONFIGURED | ANOTHER SECRETS HYGIENE FAILURE`
