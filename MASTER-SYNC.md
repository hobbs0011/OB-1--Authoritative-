# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v3

## Live Operating State — 2026-04-08

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
| Phoenix-Rising-Protocol-Ultimate | hobbs-lab | ACTIVE — canonical consolidation target |
| Phoenix-Rise-Immortalize- | hobbs-lab | Previous origin — to be superseded |
| PhoenixRising | hobbs-lab | EMPTY |
| NET-Ai-EcoSystem-CommandStation | hobbs0011 | Public, legacy |
| phoenix-ob1 | mrmichaelhobbs1234-lang | DELETED — src preserved in ARCHIVE/phoenix-ob1/ |

### Architecture

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| State | Durable Objects (SessionDO, ProfileDO, PetDO, LedgerDO) — SQLite-backed |
| Frontend | Gospel 444 UI shell (public/index.html) |
| Voice | Deepgram nova-2 STT + Aura TTS |
| Deploy path | GitHub Actions + wrangler deploy |
| Colors | #0f0f1a (void), #a855f7 (purple), #f59e0b (gold), NO BLUE |

### Consolidation Status (2026-04-08)

| Item | Status |
|------|--------|
| CHROME-EXT/ (v0.1.0) | ✅ Archived → ARCHIVE/chrome-ext-v0.1/ |
| APPS/obi-chrome-extension/ (v0.3.0) | ✅ CANONICAL chrome extension |
| WEBSITE/ (2 files) | ✅ gallery.html moved to SITE/; WEBSITE/ removed |
| SITE/ | ✅ CANONICAL website source |
| APPS/phoenix-ob1/ | ✅ Removed from APPS; unique src/ preserved in ARCHIVE/phoenix-ob1/ |
| WORKERS/net-core/ | ✅ Marked DEPRECATED — superseded by NET-PET-AI |
| ARCHIVE/NET-CommandStation/ HarvestedChats | ✅ 96 files (~20.5MB) pulled from hobbs0011/NET-Ai-EcoSystem-CommandStation |
| NET-PET-AI v1.4 security hardening | ✅ CORS origin-reflection, input sanitization, error scrubbing |

### Active Blockers

- [~] Route-bind www.naturalenglishtraining.com — wrangler.toml configured; pending NS delegation (millie.ns.cloudflare.com / phil.ns.cloudflare.com) + DNS record cleanup in CF dashboard
- [x] phoenix-ob1 (mrmichaelhobbs1234-lang) — RESOLVED: repo deleted; unique src preserved in ARCHIVE/phoenix-ob1/
- [ ] Rotate SOVEREIGN_KEY + run vault-lock
- [ ] copilot-governance.md approval pending
- [x] Incident freeze — LIFTED 2026-04-08
- [x] Pull HarvestedChats — DONE: 96 files (~20.5MB) archived to ARCHIVE/NET-CommandStation/HarvestedChats/

### Cost Target

< $50/month total
