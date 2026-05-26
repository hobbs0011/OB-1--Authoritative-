# PRODUCTION-RULES.md

**Effective:** 2026-04-20 (RUN357 Phase 4)  
**Scope:** net-pet-ai production worker + D1/KV/R2 storage  
**Authority:** Sovereign (Michael Hobbs)

---

## Code Review Gates

**Mandatory for Production Commits:**
1. Zero warnings in `wrangler deploy --dry-run`
2. All D1 Durable Object bindings verified
3. No secret exposure (API keys must use .dev.vars, never hardcoded)
4. No external dependencies added without architecture review

**Merge Requirements:**
- Require 1 approval (Michael)
- Require tests passing (if `test/` exists)
- Require lint passing (`npm run lint` if available)

---

## Deployment Gates

**Production Deploy Checklist:**
1. Git: Branch merged to canon, commit SHA recorded
2. Build: `wrangler deploy --dry-run` passes
3. Auth: Wrangler authenticated to mrmichaelhobbs123@gmail.com account
4. D1: Schema migration (if any) tested locally first
5. Post-deploy: Smoke test at `/health` endpoint

**Rollback Procedure:**
1. If production down: `wrangler rollback` to prior version
2. If D1 corrupted: Restore from CONSOLIDATION-SNAPSHOTS/ backup
3. If KV/R2 failed: Check Cloudflare dashboard status

---

## Data Access Policies

**D1 Database (Student Learning Data):**
- Readable: Worker code + Student apps (authenticated)
- Writable: Worker code + Admin operations
- Backup: CONSOLIDATION-SNAPSHOTS/ (manual, periodic)

**KV Namespace (Session State):**
- Readable: Worker code (fast lookup)
- Writable: Worker code (session updates)
- TTL: 24 hours (sessions expire)

**R2 Bucket (Assessment Reports):**
- Readable: Student (via signed URL from worker)
- Writable: Worker code (assessment generation)
- Public: No (all via worker gateway)

---

## Staging/Testing Procedure

**Before Production Deploy:**
1. Test locally: `wrangler dev`
2. Verify schema: Run sample migrations on local D1
3. Smoke test: `/health` endpoint returns 200
4. No secrets exposed: Check `.dev.vars` not committed

**Production Verification (Post-Deploy):**
1. Health check: `curl https://net-pet-ai-production.workers.dev/health`
2. Student connect: 4+ active students in D1 SessionDO
3. Revenue tracking: Deployment log updated with version ID

---

## Incident Response

**Critical (Down, Data Loss, Leak):**
- Immediate: Rollback to last known good version
- Notify: Check reincarnation log for context
- Root cause: Post-incident analysis to CANON/

**High (Slow, Errors, API failures):**
- 5-min response: Investigate logs, check Cloudflare dashboard
- Decision: Quick fix (1h) vs rollback
- Document: Failure + resolution to git commit message

**Medium (Feature bugs, UX issues):**
- Schedule fix in next commit cycle
- Document in git issue (if repo has issues)
- Prioritize per revenue impact

---

## No-Go Policies (Failure Gates)

❌ **DO NOT DEPLOY if:**
1. `wrangler deploy --dry-run` has errors
2. D1 migration hangs (>5min timeout)
3. Secret keys appear in dry-run output
4. Any unreviewed changes in src/

❌ **DO NOT MODIFY in production:**
1. StudentBrainV2 schema (append-only only)
2. Revenue tracking logic (must be auditable)
3. Student data retention rules
4. Authentication logic without review

---

## Success Criteria

✅ **Deployment is successful when:**
1. Worker deploys without error
2. `/health` endpoint accessible
3. Students can authenticate + chat
4. Revenue tracking updated in ledger
5. No error logs in Wrangler tail

---

## Contact + Escalation

**Blocker/Emergency:** Escalate to COLD-START-BOOT reincarnation log  
**Questions:** Check CANONICAL laws (L43 EXTENSION_OF_WILL_AUTHORITY)  
**Change Request:** Via git commit message + reincarnation context

---

_Last Updated: 2026-04-20 (RUN357 Phase 4)_
