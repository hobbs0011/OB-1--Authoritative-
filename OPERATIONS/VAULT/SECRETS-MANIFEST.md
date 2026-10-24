# PrAIS VAULT — SECRETS MANIFEST
> WHAT is needed, never the values. Committed by the station (/vault push). Values live:
> L1 this browser (localStorage `obi_keys`) · L2 sealed on the canon (`OPERATIONS/VAULT/prais-vault.sealed.txt`) · L3 the live service.

## ACTIVE
| Key | Service | Purpose | Held by |
|-----|---------|---------|---------|
| `DEEPGRAM_API_KEY` | Deepgram | the ear — video/audio → verbatim transcript, any length, split at pauses and stitched back | net-pet-ai worker secret · /api/stt/key |
| `GITHUB_TOKEN` | GitHub | the canon — doctrine, sessions, the I-LOG chain, and this vault | this browser only |
| `CLOUDFLARE_API_TOKEN` | Cloudflare | the fleet — workers, deploys, secret rotation, Pages, and the R2 store; proven by /accounts/<id>/tokens/verify (an account-owned token is rejected by /user/tokens/verify even when valid) and then by listing the account's worker scripts, with R2 reported as its own separate fact | this browser only · the `nameless-feather-3545` token (full permissions) · /vault set cf <token> |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | every fleet call is addressed through the account id — fleet status, deploys, and the R2 endpoint https://<account>.r2.cloudflarestorage.com | this browser only · the account the token is scoped to (it is the S3 endpoint's subdomain) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 | the empire's own object store (R2 speaks the S3 API) — half of the signing pair; useless without the secret below. ⚠ AUDIT 2026-09-21, RE-MEASURED: as stored, this value EQUALS the Cloudflare API token's id (122c79ce…) — i.e. it was pasted from the wrong place; an R2 S3 key is a separate credential created at R2 → Manage R2 API Tokens. R2's own state is UNPROVEN from here: through the station's proxy the buckets endpoint answers 400 code 9106 (the Authorization header does not reach it), so R2 cannot be called enabled OR disabled — it has to be checked in the Cloudflare dashboard | this browser only · S3-compatible access key id — created at R2 → Manage R2 API Tokens (NOT the API token's own id) |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 | signs every R2 S3 request (AWS SigV4). Proven by a real presigned ListBuckets through the station's proxy — header-signing cannot work here because the proxy strips x-amz-content-sha256 | this browser only · shown once, at R2 API token creation |
| `DEEPSEEK_API_KEY` | DeepSeek | the brain fallback (chat / lesson / practice / feedback) | net-pet-ai worker secret |
| `SOVEREIGN_KEY` | net-pet-ai | the worker's admin routes (X-Admin-Key) | net-pet-ai worker secret |
| `SOV100_VAULT_KEY` | sov100-vault-v0 | the vault itself — every route answers 401 until this is armed; the scheme is in APPS/SOV100-VAULT/README.md | the vault worker's own gate |
| `KILO_GATEWAY_JWT` | Kilo Gateway | the tool lane — gateway_chat + gateway_models from this browser (free lane first, usage metered). AUDIT 2026-10-24: this was the only working key with no vault slot, no seal and no escrow — a rename wiped it like the rest | this browser only · set with /vault set kilo <JWT> or /tool key <JWT> (same slot, obi_keys.kilo) |

## PLANNED (named so nothing is invented twice)
| Key | Service | For |
|-----|---------|-----|
| `STRIPE_SECRET_KEY` | Stripe | payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe | payment verification |
| `RESEND_API_KEY` | Resend | email notifications |
| `JUSTCALL_API_KEY` | JustCall | OBI voice coach |
| `ZAPIER_API_KEY` | Zapier | automation |
| `ANALYTICS_KEY` | Amplitude / Mixpanel | analytics |

## Layers
- **L1 local** — `localStorage.obi_keys`. Never shipped, never logged; a secret-typed command is masked before it can reach the soul ledger or the I-LOG.
- **L2 canon** — sealed with the vault public key (secret-plugin, ML-KEM FIPS 203). Ciphertext only, so the repo can hold it in the open; the private key never leaves the sovereign.
- **L2.5 ESCROW** — the *private* key (the crown jewel) wrapped in the sovereign's passphrase (PBKDF2-SHA256 x 310000 -> AES-256-GCM) at `OPERATIONS/VAULT/prais-vault.key.escrow.json`, with mirrors on the upload host. Every copy is useless without the passphrase, so losing one browser can no longer destroy the vault. Recovery: `/vault recover <passphrase>`.
- **L2.6 RECOVERY BUNDLE** — ONE public file (`kind: "prais-vault-recovery"`) holding the wrapped private key AND the sealed secrets together, so a single URL plus the passphrase rebuilds every key on a machine that has never seen this station and has NO GitHub token. Published by `/vault escrow`, refreshed by `/vault push`, because it must always carry the current ciphertext. Ciphertext only, so publishing it gives nothing away.
- **L3 live** — the service itself. `/vault test` calls it for real. A key that only looks stored is worth nothing.

## RECOVERY (if this browser is ever lost)
1. With a GitHub token: open the station anywhere, arm the token (`/gh token <PAT>`), then `/vault recover <passphrase>` — it reads the escrow from the canon.
2. With NOTHING but the passphrase and one link: `/vault recover <passphrase> <recoveryBundleUrl>` — the bundle carries the key *and* the sealed secrets, so the whole vault comes back with no token, no storage and no canon.
3. The passphrase is the ONLY secret in the chain and it is stored nowhere: not here, not on the canon, not in this file, not in the bundle. If it is lost, the escrow cannot be opened by anyone, including the sovereign.
4. What is published, and where:
   - recovery bundle (key + secrets, one URL): not published yet — `/vault escrow <passphrase>` publishes it
   - escrow mirror (key only): not published yet
   - sealed mirror (secrets only): `https://user.uploads.dev/file/e7cb241f644a86f22b38f14d70b37bcf.txt`

Generated by the PrAis Command Station — 2026-10-24T18:58:03.073Z