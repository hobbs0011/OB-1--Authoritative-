# Security Policy — Phoenix Rising Protocol

## Reporting Vulnerabilities

Report security issues directly to **hobbs@naturalenglishtraining.com**.

Do not open public issues for security vulnerabilities.

## Known Risks

| Risk | Status | Action Required |
|---|---|---|
| `phoenix-ob1` repo is PUBLIC with potential secrets | ⚠️ OPEN | Set to PRIVATE immediately |
| SOVEREIGN_KEY rotation needed | ⚠️ OPEN | Run vault-lock after rotation |
| API keys in legacy files | 🔒 Gitignored | Verify .gitignore coverage |

## Secret Management

- All API keys, tokens, and credentials go through **Wrangler secrets** for Cloudflare Workers
- Never hardcode secrets in source files
- The following patterns are gitignored and must never be committed:
  - `API-SHHHH.txt` / `API-SHHHH-2.txt`
  - `API-MASTER.txt` / `API-MASTER.7z`
  - `NET/` and `GALAXY/` directories
  - `.vscode/mcp.json`

## Incident Response

1. Rotate affected credentials immediately
2. Log incident in `OPERATIONS/`
3. Notify Agent-100 (Michael Hobbs)
4. Update `.gitignore` if a new secret pattern is discovered
