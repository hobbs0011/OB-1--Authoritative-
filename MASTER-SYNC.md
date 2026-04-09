# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v3

## Live Operating State — 2026-04-09 (Updated Run 267)

### System Identity

| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| Product          | OBI for Natural English Training                   |
| Brand (public)   | Natural English Training                           |
| Brand (internal) | Phoenix Rising Protocol                            |
| Domain           | naturalenglishtraining.com / .net                  |
| Sovereign        | Agent 100 — Michael Hobbs                          |
| Triad            | TC0=OB1/Agent99, TC00=AnA/Agent98, NEO=N40/Agent97 |

### Repo State

| Repo                             | Account                 | Status                                          |
| -------------------------------- | ----------------------- | ----------------------------------------------- |
| Phoenix-Rising-Ultimate (→ rename to Phoenix-Rising-Technologies) | hobbs0011 | ACTIVE — canonical consolidation target; rename pending Phase 8 |
| Phoenix-Rising-Protocol-Ultimate | hobbs-lab               | Superseded — legacy reference                   |
| OB-1                             | hobbs0011               | Active secondary remote (ob1 alias)             |
| net-tiger-assessment             | hobbs0011               | Active; to be archived after Phase 8            |
| phoenix-pheromone-trails         | hobbs0011               | PLANNED — 1100+ raw chat logs (D: drive)         |
| NET-Ai-EcoSystem-CommandStation  | hobbs0011               | Public, legacy                                  |
| phoenix-ob1                      | mrmichaelhobbs1234-lang | DELETED — src preserved in ARCHIVE/phoenix-ob1/ |

### Architecture

| Component   | Technology                                                              |
| ----------- | ----------------------------------------------------------------------- |
| Runtime     | Cloudflare Workers                                                      |
| State       | Durable Objects (SessionDO, ProfileDO, PetDO, LedgerDO, CommandDO) — SQLite-backed |
| Frontend    | Gospel 444 UI shell (public/index.html)                                 |
| Voice       | Deepgram nova-2 STT + Aura TTS                                          |
| Deploy path | GitHub Actions + wrangler deploy                                        |
| Colors      | #0f0f1a (void), #a855f7 (purple), #f59e0b (gold), NO BLUE               |

### Consolidation Status (2026-04-09)

| Item                                       | Status                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| CHROME-EXT/ (v0.1.0)                       | ✅ Archived → ARCHIVE/chrome-ext-v0.1/                                      |
| APPS/obi-chrome-extension/ (v0.3.0)        | ✅ CANONICAL chrome extension                                               |
| WEBSITE/ (2 files)                         | ✅ gallery.html moved to SITE/; WEBSITE/ removed                            |
| SITE/                                      | ✅ CANONICAL website source                                                 |
| APPS/phoenix-ob1/                          | ✅ Removed from APPS; unique src/ preserved in ARCHIVE/phoenix-ob1/         |
| WORKERS/net-core/                          | ✅ Marked DEPRECATED — superseded by NET-PET-AI                             |
| ARCHIVE/NET-CommandStation/ HarvestedChats | ✅ 96 files (~20.5MB) pulled from hobbs0011/NET-Ai-EcoSystem-CommandStation |
| NET-PET-AI v1.4 security hardening         | ✅ CORS origin-reflection, input sanitization, error scrubbing              |
| Command Station tunnel (Run 267)           | ✅ CommandDO (5th DO), Agent99 layer, 6 routes, VS Code ext, Chrome CMD tab |
| Commit f3b1107 pushed 2026-04-09           | ✅ Magic Chat → CommandDO → Agent99 → VS Code — 9 files, 1038 insertions   |

### Active Blockers

- [~] Route-bind www.naturalenglishtraining.com — Worker LIVE on workers.dev; custom domain needs existing DNS records deleted in CF dashboard before binding
- [x] phoenix-ob1 (mrmichaelhobbs1234-lang) — RESOLVED: repo deleted; unique src preserved in ARCHIVE/phoenix-ob1/
- [ ] Rotate SOVEREIGN_KEY + run vault-lock
- [ ] copilot-governance.md approval pending
- [x] Incident freeze — LIFTED 2026-04-08
- [x] Pull HarvestedChats — DONE: 96 files (~20.5MB) archived to ARCHIVE/NET-CommandStation/HarvestedChats/
- [x] NET-PET-AI deployment verification — LIVE: https://net-pet-ai.mrmichaelhobbs1234.workers.dev — API 200 OK, v1.4.0, 28 routes, Command Station active (f3b1107)
- [x] Git push to origin — RESOLVED: corrupted object e554ec1 eliminated (hobbs-lab remote removed); c2557fb pushed to origin
- [ ] Set wrangler secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY
- [ ] Execute Phase 2-9 of Phoenix-Rising-Technologies consolidation plan (CANON/SYSTEM/CONSOLIDATION-PLAN-PHOENIX-RISING-TECHNOLOGIES.md)
- [ ] Create hobbs0011/phoenix-pheromone-trails repo — ingest D:\phoenix-chat-logs\ (600+ files) + D:\HARD-BACKUPS\ (8 zips, 500+ more)
- [ ] Rename GitHub repo: Phoenix-Rising-Ultimate → Phoenix-Rising-Technologies
- [ ] Set up Google Drive MCP server (mrmichaelhobbs123@gmail.com)
- [ ] Absorb C:\Desktop\NET-MARKETING\ git repo
- [ ] Rescue C:\Desktop\SOUL-LOG-VERBATIM-KEY-SOUL10-2026-04-05.NOTES.md → CANON/
- [ ] Rescue C:\Desktop\HighSchoolLesson-3.html → APPS/ or GALAXY-LESSONS/

### D: Drive Map (First Complete Scan — 2026-04-09)

| Location | Contents | Volume | Status |
|----------|----------|--------|--------|
| D:\phoenix-chat-logs\CHAT-LOGS-ONLY | Raw .txt chat logs | 600+ files | ⏳ pending phoenix-pheromone-trails |
| D:\HARD-BACKUPS | Google Drive export zips | 8 zips (500+ more logs) | ⏳ pending inspection |
| D:\FINAL-PHASE | Phoenix session materials | Unknown | ⏳ pending inspection |
| D:\AGENT99-OVERFLOW | Agent99 overflow | Unknown | ⏳ pending inspection |
| D:\AGENT99-STAGE-OUT | Agent99 staged outputs | Unknown | ⏳ pending inspection |
| D:\phoenix-ob1-system | OB1 system files | Unknown | ⏳ pending inspection |
| D:\OB1_ARCHIVE | OB1 archive | Unknown | ⏳ pending inspection |
| D:\AGENT99-TOOLS | Agent99 tools | Unknown | ⏳ pending inspection |

### Cost Target

< $50/month total (Cloudflare Workers Paid $5/mo recommended tier)
