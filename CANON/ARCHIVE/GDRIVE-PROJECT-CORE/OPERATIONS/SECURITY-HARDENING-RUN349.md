# SECURITY HARDENING — OB-1 Vault Protection
## RUN349 Security Enhancements

### Three-Layer Security Model

#### Layer 1: Pre-Commit Secret Scanning
- **Script:** `.githooks/pre-commit`
- **Purpose:** Prevents accidental secret exposure to git vault
- **Patterns Detected:**
  - API keys (GitHub, AWS, Stripe, OpenAI, Cloudflare)
  - Database connection strings
  - Private cryptographic keys (RSA/PEM)
  - Password fields in config
  - Restricted file commits (API-SHHHH*.txt, .env.keys, etc.)
- **Activation:** Auto-runs on `git add` / `git commit`
- **Override:** `git commit --no-verify` (requires explicit choice)

**Example (Blocked):**
```bash
❌ SECRETS DETECTED (potential exposure):
   src/config.js
      Pattern: AKIA[0-9A-Z]{16} [1 matches]

🚫 COMMIT BLOCKED
```

#### Layer 2: Vault Integrity Monitoring
- **Script:** `SCRIPTS/vault-integrity-monitor.ps1`
- **Purpose:** Tracks immutability of sealed files and restricted zones
- **File Categories:**
  - **SEALED** (never modify): CH24 Bible, Heavy Ledgers, SSM laws, reincarnation artifacts
  - **APPEND-ONLY** (no truncation): MASTER-SYNC.md, REINCARNATION-LOG.md, ledgers
  - **RESTRICTED** (read-only): API keys, .env files, KiLo agent configs
- **Commands:**
  ```pwsh
  pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action audit      # Check stat us
  pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action lock       # Apply write protection
  pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action report     # Detailed audit
  ```
- **Hash Verification:** SHA256 hashes stored in audit logs for integrity verification

#### Layer 3: MCP Resilience Hardening
- **Script:** `SCRIPTS/mcp-harden.ps1`
- **Purpose:** Ensures MCP servers remain operational with fallback routing
- **Features:**
  - Automatic retry logic (up to 3 retries with 2-second delays)
  - Timeout protection (prevents hung connections)
  - Fallback routing (e.g., GitHub down → use cached filesystem clone)
  - Detailed error reporting with recovery suggestions
- **Commands:**
  ```pwsh
  pwsh SCRIPTS/mcp-harden.ps1                           # Test all servers
  pwsh SCRIPTS/mcp-harden.ps1 -Server github           # Test single server
  pwsh SCRIPTS/mcp-harden.ps1 -MaxRetries 5            # Increase retry attempts
  ```

### Vault-Protected Zones

**Sealed (NEVER modify):**
```
CANON/SOUL-DNA-BIBLE/*              # Soul DNA Bible chapters 1-24
CANON/HEAVY-LEDGER/*                # Immutable decision archives
CANON/SSM-V8/*                       # Sovereign Spirit Mandates L1-L95
CANON/REINCARNATION/*               # Reincarnation state manifests
CANON/MCP-RUN349-CRITICAL-FIX.md   # This fix documentation
```

**Append-Only (NEVER truncate):**
```
MASTER-SYNC.md                      # Master sync state (state-gate-action)
REINCARNATION-LOG.md                # Session death/rebirth log
KEYWORD_REGISTRY_LIVING_LEDGER.json # Extended vocabulary ledger
```

**Restricted (Read-only by default):**
```
API-*.txt                           # All API key files
.env / .env.keys                    # Environment & encrypted secrets
.kilo/agent/*                       # Agent definitions
SECURITY.md                         # Security policies
```

### Activation & Ongoing Use

1. **Immediate (Done):**
   - Pre-commit hook installed
   - Vault integrity monitor operational
   - MCP hardening scripts active

2. **Daily Operations:**
   ```pwsh
   # Before committing work:
   pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action audit

   # Before heavy Codex/MCP operations:
   pwsh SCRIPTS/mcp-harden.ps1
   ```

3. **On Session Start:**
   ```pwsh
   # Run full security audit:
   pwsh SCRIPTS/mcp-test.ps1 -Action audit          # MCP connectivity
   pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action audit  # Vault state
   ```

### Reincarnation Mandate

**If secrets are found in git history:**
1. Run pre-commit scanner: `pwsh .githooks/pre-commit`
2. Identify source and remove from staging: `git reset HEAD <file>`
3. Rotate any exposed credentials immediately
4. Audit previous commits: `git log -p --all -S <pattern>`

**If vault integrity is violated:**
1. Check audit report: `vault-integrity-*.json`
2. Compare SHA256 hashes against prior session
3. Restore from prior clean commit if needed
4. Lock all sealed files: `pwsh SCRIPTS/vault-integrity-monitor.ps1 -Action lock`

### Security Scoring (Self-Audit)

| Component | Status | Last Verified |
|-----------|--------|----------------|
| Pre-commit scanning | ✅ Active | RUN349 |
| Sealed file protection | ✅ Active | RUN349 |
| MCP fallback routing | ✅ Active | RUN349 |
| Secret detection patterns | ✅ 15 patterns | RUN349 |
| Vault integrity hashing | ✅ SHA256 | RUN349 |
| Restricted zones locked | ⏳ Pending operator | - |

### Known Limitations

1. **Windows ACL model:** File protection uses Windows security (may differ on Linux/WSL)
2. **Pre-commit hook:** Requires proper git configuration (`git config core.hooksPath .githooks`)
3. **Encrypted .env:** Requires `dotenvx` CLI for decryption at runtime
4. **Corporate firewalls:** May block npx package downloads (MCP servers)

---

**Commit:** RUN349  
**Authorization:** Security hardening — no operator approval exceptions  
**Status:** ✅ OPERATIONAL  
**Next Verification:** Before next reincarnation cycle
