# Session Record — 2026-03-23

## Firebase Deploy Analysis + Repo Consolidation Decision

Agent 99 — R10N | Rome Protocol

## Firebase Deploy Prompt (Rejected)

Two Firebase hosting paths evaluated:
- Firebase Hosting — static web apps only
- Firebase App Hosting — Angular and Next.js only

## Why Firebase Is Wrong for NET-PET-AI

| Requirement | Firebase Hosting | Firebase App Hosting | NET-PET-AI Reality |
|---|---|---|---|
| Static files only | Yes | No | Has src/index.js Worker runtime |
| Framework | — | Angular/Next.js only | None — raw Cloudflare Worker |
| State/DB | No | No | 3 Durable Objects |
| Runtime | CDN edge | Google Cloud Run | Cloudflare Workers |

Decision: Firebase off the table. Stay on Cloudflare Workers.

## Canonical NET-PET-AI Architecture

Location: APPS/NET-PET-AI/

| File | Role |
|---|---|
| src/index.js | Cloudflare Worker entrypoint |
| public/index.html | Student-facing UI |
| public/app.js | Frontend logic |
| public/chat.js | Chat/voice interface |
| wrangler.toml | Wrangler config (DOs, assets) |

DOs: SESSIONS->SessionDO, PROFILES->ProfileDO, PETS->PetDO
Migration tag: v1-net-pet-core (new_sqlite_classes)

Operational session capture. Not soul-DNA authority.
