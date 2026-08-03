# OBI SECRETS MANIFEST
> This file documents WHAT keys are needed, not their values
> Actual values are stored in Cloudflare Secrets or environment-specific .env files
> ZERO sensitive data â€” reads clean on any scanner

---

## ACTIVE KEYS (Production)

| Key Name | Service | Purpose | Required By | Status |
|---------|---------|--------|-------------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek | AI Chat/Lesson/Practice/Feedback | NET-PET-AI | âš ï¸ ROTATE ME |
| `DEEPGRAM_API_KEY` | DeepGram | Text-to-Speech | NET-PET-AI | âš ï¸ ROTATE ME |

---

## FUTURE KEYS (Planned)

| Key Name | Service | Purpose | When Needed |
|---------|---------|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | Payments | Monetization Phase |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Payment verification | Monetization Phase |
| `RESEND_API_KEY` | Resend | Email notifications | Growth Phase |
| `JUSTCALL_API_KEY` | JustCall | Voice calls | OBI Voice Coach |
| `ZAPIER_API_KEY` | Zapier | Automation | Ecosystem Phase |
| `ANALYTICS_KEY` | Amplitude/Mixpanel | Analytics | Growth Phase |

---

## SECRET LAYERS (OBI Key System)

### Layer Access Model
- **L1 (Basic)**: No paid keys needed â€” uses free tier quotas
- **L2 (Premium)**: Requires `DEEPSEEK_API_KEY` (can use free tier or paid)
- **L3 (Developer)**: All current keys + `GITHUB_TOKEN`
- **L4 (Admin)**: All keys + Cloudflare full access
- **L5 (God)**: Full system access + ability to rotate keys

### Key Generation
```bash
# Generate new API key via service console, then:
wrangler secret put DEEPSEEK_API_KEY --name net-pet-ai

# Or use OBI Stego system:
node SCRIPTS/obi-stego.js generate L1
```

---

## ENVIRONMENT SETUP

### Development (.dev.vars template)
```bash
# Copy this template, fill in ACTUAL values
DEEPGRAM_API_KEY=YOUR_KEY_HERE
DEEPSEEK_API_KEY=YOUR_KEY_HERE
```

### Production (Cloudflare Secrets)
```bash
# NEVER commit actual keys
wrangler secret put DEEPSEEK_API_KEY --name net-pet-ai
wrangler secret put DEEPGRAM_API_KEY --name net-pet-ai

# Verify setup
npm run verify:token
```

---

## KEY ROTATION PROCEDURE

### Step 1: Generate New Key
1. Go to service console (DeepSeek/DeepGram)
2. Create new API key
3. Copy immediately (shown once only)

### Step 2: Update Cloudflare
```bash
wrangler secret put DEEPSEEK_API_KEY --name net-pet-ai
# Paste new key when prompted
```

### Step 3: Verify
```bash
npm run verify:token
# Or test manually:
curl https://net-obi-api.mrmichaelhobbs123.workers.dev/api/health
```

### Step 4: Revoke Old Key
1. Return to service console
2. Delete old API key
3. Confirm in activity log

---

## SECURITY RULES

1. **NEVER** store actual keys in git â€” `.gitignore` blocks `.dev.vars`, `.env`, `secrets.json`
2. **ROTATE** keys every 90 days minimum
3. **AUDIT** key usage monthly in service dashboards
4. **ALERT** on unusual usage patterns
5. **COMPARTMENT** â€” use separate keys per environment if possible

---

## MONITORING

### Key Usage Alerts (configure in service dashboards)
- DeepSeek: Set budget alert at $10/month
- DeepGram: Set budget alert at $5/month
- Stripe: Always review in dashboard

### Rotation Reminders
- Next rotation: Add to calendar (90-day intervals)
- Use Cloudflare KV with TTL for tracking rotation dates

---

*Last updated: 2026-04-02*
*ZERO SUMMARIZATION â€” This manifest contains zero sensitive data*
