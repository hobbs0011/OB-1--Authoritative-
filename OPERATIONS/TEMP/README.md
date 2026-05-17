# net-core (canonical Cloudflare Worker)

This directory is the **canonical** Cloudflare Worker for `naturalenglishtraining.net` automation.

## Safety model
- CI deploy is the only blessed deploy path.
- Secrets are stored in GitHub Actions secrets (never committed).
- The deployed worker must expose `/health` for proof-of-life.

## Deploy
- GitHub Actions deploys on push to `main` (prod) and `dev` (staging).
- Proof-of-life runs after deploy and fails CI if non-200.

## Required GitHub Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SLACK_WEBHOOK_URL` (optional; used for CI receipts)

## Local dev
```bash
cd WORKERS/net-core
npm i -g wrangler
wrangler dev
```
