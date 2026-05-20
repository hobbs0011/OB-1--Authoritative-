# RAW VERBATIM — comet-bootstrap.txt
## Corpus Metadata
- chunk_seq   : 0293
- chunk_id    : 0293-RAW-comet-bootstrap_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\comet-bootstrap.txt
- sha256      : 1711749C29BEE9E38E54B0708645214D57233D7D196526619F7DAABE9EC38070
- size_bytes  : 1154
- lines       : 35
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX, LEDGER

---
COMET BOOTSTRAP — Phoenix Empire Deployment

Goal: Create GitHub repo, configure Cloudflare secrets, trigger CI deploy.

1) GitHub
- Go to https://github.com/new
- Repository name: phoenix-empire
- Visibility: Private (recommended)
- Create repository

2) Add GitHub Actions secrets
Repo → Settings → Secrets and variables → Actions → New repository secret
- CLOUDFLARE_ACCOUNT_ID
  Source: Cloudflare dashboard → Workers → Account ID (sidebar)
- CLOUDFLARE_API_TOKEN
  Create in Cloudflare: Profile → API Tokens
  Minimum perms:
    - Account:Read
    - Workers Scripts:Edit
    - D1:Edit (recommended for managing D1 in CI, optional)
  Restrict to your account (and optionally to this Worker)

3) Cloudflare Worker secret for header auth (NOT in GitHub)
Run locally (recommended; avoids CI handling your sovereign key):
- wrangler secret put SOVEREIGNKEY --env staging
- wrangler secret put SOVEREIGNKEY --env production

4) Trigger deployment
- Push to branch 'staging' to deploy staging
- Push to branch 'main' to deploy production

5) Verification
- GET /health
- POST /ledger/append with x-sovereign-key header and valid JSON body.

