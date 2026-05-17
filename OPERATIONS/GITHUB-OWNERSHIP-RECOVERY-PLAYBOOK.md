# GitHub Ownership Stabilization — Connection Recovery Playbook
# Pipeline Phase 9 — Run 310 — 2026-04-19

## Stage 81 — Primary Owner: Locked to hobbs0011 ✅

- **Active GitHub account:** `hobbs0011`
- **Active email:** mrmichaelhobbs123@gmail.com
- **Plan:** Free
- **Canonical repo:** `hobbs0011/OB-1` (private, default branch: `canon`)
- **Not archived, not fork** — verified via `gh api repos/hobbs0011/OB-1`
- All CI/CD deploys (Cloudflare, Pages) target `hobbs0011` owner account

## Stage 82 — Legacy Targets Gated ✅

Legacy owners in `.github/workflows/copilot-swarm.yml`:

| Owner | Target | Gate |
|---|---|---|
| `hobbs0011` | `Phoenix-Rising-Protocol-Ultimate` | `enable_legacy_targets=true` input required |
| `mrmichaelhobbs1234-lang` | `phoenix-drift-casestudy` | `enable_legacy_targets=true` input required |
| `hobbs0011` | `NET-Ai-EcoSystem-CommandStation` | Always active (correct) |

Default behavior: `enable_legacy_targets` defaults to `"false"` — legacy prongs SKIP silently.
No other workflows reference legacy owners.

## Stage 83 — Suspended Account Fallback

- `hobbs0011`: SUPERSEDED (labelled in MASTER-SYNC). Not depended on by any critical CI.
- `mrmichaelhobbs1234-lang`: Legacy/archival. `PAT_LANG` secret must be live to use this prong.
- `mrmichaelhobbs1234` (operator email): Historical account login context only, not used in CI.
- **Fallback is automatic:** if suspended accounts are unreachable, all active production deploys continue via `hobbs0011` — no manual intervention required.

## Stage 84 — Repo Transfer Dependencies

| Dependency | Status |
|---|---|
| `hobbs0011/OB-1` | ✅ Canonical — no pending transfers |
| `hobbs0011/Phoenix-Rising-Protocol-Ultimate` | Superseded — NOT a transfer target |
| `hobbs0011/NET-Ai-EcoSystem-CommandStation` | Active secondary (CommandStation) |
| CF Pages `naturalenglishtraining` | Lives in Cloudflare account 3c7b1766 (no transfer needed) |

No repo transfers required or pending.

## Stage 85 — Issue/PR Automations

| Workflow | Target | Owner |
|---|---|---|
| `copilot-swarm.yml` PRONG 2 | `hobbs0011/NET-Ai-EcoSystem-CommandStation` | Active |
| `soul-agent-daily-audit.yml` | `hobbs0011/OB-1` | Active |
| `deploy-net-pet-ai.yml` | Cloudflare (no GitHub targets) | Active |
| `deploy-pages.yml` | Cloudflare Pages (no GitHub targets) | Active |
| `roblox-place-deploy.yml` | External (Roblox API) | Standalone |
| `secret-scan.yml` | Gitleaks (no owner targeting) | Active |

All issue/PR automations are scoped to active owner or are self-contained. ✅

## Stage 86 — Branch Protections

Branch protection rules require **GitHub Pro or Public repo** (HTTP 403 on free private repo).
- Current status: Branch `canon` has NO enforced protection rules (free plan limitation).
- Mitigation: Deploys are gated by workflow conditions (branch: [canon] triggers).
- Risk: Low — this is a single-operator repo; no external contributors.
- **Action when upgrading to Pro or making public**: Enable branch protection requiring PR review + status checks on `canon`.

## Stage 87 — CI Token Scopes

| Secret | Scope | Least Privilege Assessment |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | CF Workers + Pages deploy | ✅ Scoped to deploy operations |
| `CLOUDFLARE_ACCOUNT_ID` | CF account identifier (not secret) | ✅ Non-sensitive |
| `PAT_HOBBS0011` | Full repo scope on hobbs0011 | ⚠️ Broad — acceptable for single-operator |
| `PAT_LANG` | Unknown scope — legacy | ⚠️ Review if lang prong is used |
| `ROBLOX_API_KEY` | Roblox Open Cloud deploy | ⚠️ Not confirmed in secrets list — may not be set |

**Assessment:** Acceptable for single-operator context. PAT_HOBBS0011 broad scope acceptable as there are no external contributors.

## Stage 88 — PAT Inventory and Expiry

| Token | Set Location | Expiry | Review Due |
|---|---|---|---|
| `PAT_HOBBS0011` | Repo secret `hobbs0011/OB-1` | Unknown — GitHub classic PAT (no expiry unless set) | Check GitHub → Settings → Developer settings → PATs |
| `CLOUDFLARE_API_TOKEN` | Repo secret + may have CF expiry | Unknown | Check CF dashboard |
| `PAT_LANG` | Repo secret | Unknown — review if mrmichaelhobbs1234-lang account is accessible | Review before using copilot-swarm PRONG 3 |
| Active session PAT | `gh auth` (GITHUB_TOKEN env) | Session-scoped | Auto-refreshed by gh CLI |

**Action:** Michael to check PAT expiry at https://github.com/settings/tokens — set maximum 1-year expiry on all PATs.

## Stage 89 — Owner Migration Runbook

**IF `hobbs0011` account is ever suspended or lost:**
1. New account created → transfer `hobbs0011/OB-1` to new account using GitHub transfer feature
2. Update `wrangler.toml` account_id if Cloudflare account changes (currently `3c7b1766bd8fdc9e01211d2b390315ea`)
3. Update all repo secrets in new repo
4. Update COLD-START-BOOT.md with new owner
5. Update MASTER-SYNC.md
6. Update any hardcoded `hobbs0011` in workflow files (grep: `owner: 'hobbs0011'`)

**Files containing hardcoded `hobbs0011`:**
- `.github/workflows/copilot-swarm.yml` (PRONG 2)
- `CANON/REINCARNATION/COLD-START-BOOT.md`
- `MASTER-SYNC.md`

**IF CF account is lost:**
1. Redeploy worker with `wrangler deploy` on new account
2. Update `account_id` in `wrangler.toml`
3. Re-set all CF Worker secrets via `wrangler secret put`
4. Update CF Pages project (new CF account)
5. DNS CNAME at Squarespace must point to new `*.pages.dev` or `*.workers.dev` URL

## Stage 90 — Connection Recovery Playbook ✅ THIS DOCUMENT

**Recovery priority order:**
1. GitHub `hobbs0011/OB-1` → canon branch → git push via token URL
2. Cloudflare Worker → `wrangler deploy` via CLOUDFLARE_API_KEY env
3. CF Pages → auto-deploys from `canon` on push (via deploy-pages.yml)
4. Notion → optional mirror; skip if unavailable
5. Deepgram/Deepseek → secrets only; redeploy worker with updated secrets if rotated

**Emergency push command:**
```sh
$token = gh auth token
git -c http.version=HTTP/1.1 push "https://hobbs0011:$token@github.com/hobbs0011/OB-1.git" HEAD:canon
```

**Emergency worker deploy:**
```sh
cd APPS/NET-PET-AI
$Env:CLOUDFLARE_API_KEY = "<cfk_ key from API-SHHHH.txt>"
$Env:CLOUDFLARE_EMAIL = "mrmichaelhobbs123@gmail.com"
npx wrangler deploy
```

**Status: HARDENED** ✅ — 2026-04-19, Run 310
