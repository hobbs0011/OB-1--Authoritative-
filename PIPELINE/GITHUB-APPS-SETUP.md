# GitHub Apps & OAuth Registration — Pipeline Log

**Project:** Phoenix Rising / Natural English Training
**Owner:** hobbs0011
**Logged:** 2026-04-14
**Status:** PENDING REGISTRATION

---

## 1. GitHub App — NET-PET-AI

**Purpose:** Webhook-driven automation for OB-1 repo — deploy triggers, issue tracking, CI/CD integration with Cloudflare Workers.

| Field | Value |
|-------|-------|
| App Name | `NET-PET-AI` |
| Homepage URL | `https://naturalenglishtraining.net` |
| Callback URL | `https://net-pet-ai.<account>.workers.dev/api/github/callback` |
| Webhook URL | `https://net-pet-ai.<account>.workers.dev/api/github/webhook` |
| Expire user tokens | Yes |
| Request OAuth during install | No |
| Enable Device Flow | No |
| Installation target | Only @hobbs0011 |

### Permissions Needed

| Scope | Permission | Why |
|-------|-----------|-----|
| Repository: Contents | Read | Pull lesson content, read configs |
| Repository: Issues | Read & Write | Auto-create issues from OBI diagnostics |
| Repository: Pull Requests | Read & Write | Auto-PR from Codex/agent runs |
| Repository: Actions | Read | Monitor deploy status |
| Repository: Webhooks | Read & Write | Receive push/deploy events |

### Webhook Events to Subscribe

- `push` — trigger deploy pipeline
- `pull_request` — track agent PRs
- `issues` — sync with Command Station
- `workflow_run` — deploy status updates

---

## 2. OAuth App — NET Student Login

**Purpose:** GitHub OAuth for teacher/admin login to NET dashboard. Students use separate auth (Zalo/phone-based).

| Field | Value |
|-------|-------|
| Application Name | `Natural English Training` |
| Homepage URL | `https://naturalenglishtraining.net` |
| Description | `Admin & teacher dashboard for Natural English Training` |
| Callback URL | `https://net-pet-ai.<account>.workers.dev/api/auth/github/callback` |
| Enable Device Flow | No |

### Auth Flow

1. Teacher clicks "Login with GitHub" on admin dashboard
2. Redirects to GitHub OAuth authorize
3. GitHub redirects back with code
4. Worker exchanges code for token
5. Validates user is in `hobbs0011` org or allowlist
6. Sets session cookie, grants teacher dashboard access

---

## Next Steps

- [ ] Register GitHub App at github.com/settings/apps/new
- [ ] Register OAuth App at github.com/settings/applications/new
- [ ] Store Client ID + Secret via `wrangler secret put`
- [ ] Add webhook secret via `wrangler secret put GITHUB_WEBHOOK_SECRET`
- [ ] Build `/api/github/webhook` handler in index.js
- [ ] Build `/api/auth/github/callback` handler in index.js
- [ ] Test webhook delivery with ping event
- [ ] Wire deploy trigger: push → webhook → wrangler deploy
