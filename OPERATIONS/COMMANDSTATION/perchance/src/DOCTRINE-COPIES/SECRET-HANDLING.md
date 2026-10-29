# PROPOSED — SECRET-HANDLING (P7, PARTIAL — NEEDS-SOVEREIGN)

> **Status:** PROPOSED — not canon. Takes effect only on SOV100 merge. MECHANISM OPEN — founder decides.
> **Source:** DeepSeek Pro Phase-1 audit 2026-10-29 (receipt Tmvtm43ov), defect #7.
> **Target:** new paragraph after GOSPEL-999 §OMEGA.005–.006.

## PROPOSED TEXT

```markdown
OMEGA.005b. The perchance station's `/omega` gate secures writes initiated from the browser. The Cloudflare runner's secrets (API keys, tokens) SHALL be stored via Cloudflare Secrets or environment bindings, never in source files. No station command SHALL transmit secrets to the runner; it SHALL use the runner's existing secret bindings. GATE: secret audit verifies no plaintext secret in shipped source or pushed copies. ALARM: a secret found in pushed source = SEV1 incident.
```

## NEEDS-SOVEREIGN (not decided by station or model)

1. Confirm the actual runner secret mechanism (wrangler secret vs env binding) — station cannot see it.
2. Confirm whether the browser-side `/omega` hash store is acceptable to keep or must move.
3. Add the audit command (`/audit secrets`) — build order, not doctrine.
