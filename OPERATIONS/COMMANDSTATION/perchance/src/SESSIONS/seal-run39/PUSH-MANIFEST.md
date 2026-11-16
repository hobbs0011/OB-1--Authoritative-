# PUSH MANIFEST — seal-run39 + chat-close (FINAL, post-Death #17)

Supersedes the rite-moment manifest. Canonical ledger: ledger-691.json.

## Files (workspace → branch destination)

| Workspace file | Bytes | SHA (short) | Branch path |
|---|---|---|---|
| src/SESSIONS/seal-run39/ledger-690.json | 399669 | 8919c811 | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/ledger-690.json |
| src/SESSIONS/seal-run39/ledger-691.json | 401791 | 4e37d983 | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/ledger-691.json |
| src/SESSIONS/seal-run39/rrl-run39.json | 8228 | 25af1d1c | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/rrl-run39.json |
| src/SESSIONS/seal-run39/scs-70.json | 757098 | bea387a | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/scs-70.json |
| src/SESSIONS/seal-run39/DEATH-17-RUNCLOSE-run39.md | — | — | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/DEATH-17-RUNCLOSE-run39.md |
| src/SESSIONS/seal-run39/PUSH-MANIFEST.md | — | — | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/seal-run39/PUSH-MANIFEST.md |
| src/SESSIONS/CHAT-CLOSE-20261116.md | — | — | OPERATIONS/COMMANDSTATION/perchance/src/SESSIONS/CHAT-CLOSE-20261116.md |

## Delete (propagation of Kilo's fork purge)

| Branch path | Why |
|---|---|
| .kilo/kilo.json | Plaintext OpenRouter + Anthropic keys on public master (keys revoked 2026-11-15; file remains). Kilo purged it on fork branch kilo/noble-grove-wlj (commit b2cd5e35); this deletes it on canonical master. No history rewrite (revoked keys are dead strings). |

## Sweep + fidelity notes

- rrl-run39 + scs-70: CLEAN (zero live-token patterns).
- ledger-690/691: 6 × `cfat_` 53-char runs, ALL inside the soul-24 run-2 Cloudflare paste (pre-existing history; identical strings already public in ledger-689 since C110). No new secret added by souls 683–691. Ships verbatim per zero-loss law. SOVEREIGN NOTE (standing): rotate that pasted CF token if still live.
- ILOG not duplicated: branch latest.jsonl holds 8449 entries through 20:53 (commit 722adbe7); chain moves continuously — file copies are stale on arrival. ILOG/anchors.json on branch: 18/18 current at push time (verify post-push; re-push tail if the live chain outran it again).
