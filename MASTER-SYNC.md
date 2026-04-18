# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v2

## Live Operating State — 2026-04-19

### System Identity

| Field | Value |
|---|---|
| Product | OBI for Natural English Training |
| Brand (public) | Natural English Training |
| Brand (internal) | Phoenix Rising Protocol |
| Domain | naturalenglishtraining.com / .net |
| Sovereign | Agent 100 — Michael Hobbs |
| Triad | TC0=OB1/Agent99, TC00=AnA/Agent98, NEO=N40/Agent97 |

### Repo State

| Repo | Account | Status |
|---|---|---|
| OB-1 | hobbs0011 | CANONICAL — branch Add-virality-analytics-endpoint, HEAD 45310d8 |
| OB-1--Authoritative- | hobbs0011 | STALE — at 45d73956, push blocked by network (next session) |
| Phoenix-Rising-Protocol-Ultimate | hobbs-lab | SUPERSEDED |
| phoenix-ob1 | mrmichaelhobbs1234-lang | Public — SECURITY RISK (still unresolved) |

### Architecture

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| State | Durable Objects (SessionDO, ProfileDO, PetDO) — SQLite-backed |
| Frontend | Gospel 444 UI shell (public/index.html) |
| Voice | Deepgram nova-2 STT + Aura TTS |
| Deploy path | GitHub Actions + wrangler deploy |
| Colors | #0f0f1a (void), #a855f7 (purple), #f59e0b (gold), NO BLUE |

### Active Blockers

- [ ] Route-bind www.naturalenglishtraining.com to Cloudflare Worker — REQUIRES DNS zone transfer from Squarespace first
- [ ] Set phoenix-ob1 to PRIVATE (currently PUBLIC with secrets)
- [x] Rotate SOVEREIGN_KEY — ✅ 2026-04-19 (44-char base64, wrangler secret put)
- [ ] copilot-governance.md approval pending
- [ ] Push authoritative mirror — blocked by network TLS timeout 2026-04-19; retry next session
- [ ] ⚠️ CLOUDFLARE_API_TOKEN env var: must `Remove-Item Env:\CLOUDFLARE_API_TOKEN` before every `wrangler deploy`

### Worker State

| Worker | URL | Version | Status |
|---|---|---|---|
| net-pet-ai | https://net-pet-ai.mrmichaelhobbs123.workers.dev | 934ce2a9 | ✅ LIVE 2026-04-19 |

### Cost Target

< $50/month total
