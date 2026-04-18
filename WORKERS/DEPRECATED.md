# WORKERS/ — DEPRECATED

> **Status:** Superseded by `APPS/NET-PET-AI/`
> **Date deprecated:** 2026-04-10 (Run 274 / Phase 3)

## What was here

Early Cloudflare Worker experiments and the `net-core/` subdirectory — the original NET API Worker prototype.

## Why deprecated

`APPS/NET-PET-AI/` is the canonical, production Worker. It includes:
- Full Durable Objects architecture (SessionDO, ProfileDO, PetDO)
- 22 routes across 3 route groups
- Deepgram TTS/STT integration
- DeepSeek V3.2 via Cloudflare AI Gateway
- v1.4.0 LIVE at https://net-pet-ai.mrmichaelhobbs1234.workers.dev

## Archive value

`WORKERS/api.js` and `WORKERS/net-core/` contain early routing patterns that informed the current architecture. Do NOT delete without sovereign instruction.

## Reference

- Active app: `APPS/NET-PET-AI/`
- Wing: Education
- Canon: `CANON/CLOUDFLARE-ECOSYSTEM-MAP-2026.md`
