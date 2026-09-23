# Perchance PhoenixRising — push this to your own Git repo
# Run on YOUR machine (not in the perchance sandbox — no git here):
#   git init
#   git add .
#   git commit -m "PhoenixRising — initial"
#   git branch -M main
#   git remote add origin <your-repo-url>
#   git push -u origin main

# Everything in src/ ships with the generator and is yours. main.pjs + index.html too.

# SECRETS — where they actually live (AUDIT 2026-09-21):
#   L1    this browser only ... localStorage `obi_keys` — never in this repo, never in a URL, never logged
#   L2    sealed on the canon . OPERATIONS/VAULT/prais-vault.sealed.txt — the values are sealed with the
#                               vault's PUBLIC key (ML-KEM / FIPS 203) BEFORE they touch git, so the
#                               repository can hold them in the open; only the private key opens them
#   L2.5  the escrow .......... OPERATIONS/VAULT/prais-vault.key.escrow.json — the PRIVATE key wrapped in
#                               a passphrase (PBKDF2-SHA256 × 310 000 → AES-256-GCM) + a public mirror,
#                               so losing one browser is not losing the vault
#   L3    live tests .......... `/vault test` — every row is proven with a real call to the service
#
# The rule, and it is not negotiable: no plaintext secret ever enters this tree, the chat, the soul ledger or
# the I-LOG. `/vault` is the command; src/vault.js is the implementation; the canon copy is the durable one.
