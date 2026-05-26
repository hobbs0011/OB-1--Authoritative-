# EXPERIMENTAL-RULES.md

**Effective:** 2026-04-20 (RUN357 Phase 4)  
**Scope:** Sandbox/R&D worker branches (NOT production)  
**Authority:** Agent (autonomous experimentation allowed)

---

## Code Review Gates (RELAXED)

**Optional for Experimental Commits:**
- Warnings allowed (wrangler deploy can have warnings)
- External dependencies: Add freely, document in comment
- Breaking schema changes: Allowed on experimental branches
- API key testing: Use test keys from .dev.vars (never production keys)

**Merge Requirements:**
- No approval required (experimental is self-contained)
- Tests optional
- Lint optional

---

## Deployment Gates (RELAXED)

**Experimental Deploy Checklist:**
1. Git: Experimental branch created
2. Build: `wrangler deploy --dry-run` (warnings ok)
3. Auth: Use non-production Cloudflare account (if available) or separate namespace
4. D1: Can destructively test / reset schema
5. Post-deploy: Self-verify, document findings

**Rollback Procedure:**
- For experimental: Can delete entire deployment and start over
- No rollback needed (isolated sandbox)

---

## Data Access Policies (RELAXED)

**D1 Database (Experimental):**
- Readable: Test code + debugging
- Writable: Full schema modification allowed
- Backup: Not required (can reset anytime)

**KV Namespace (Experimental):**
- Readable: Full
- Writable: Full, can clear all
- TTL: Ignored, testing only

**R2 Bucket (Experimental):**
- Readable: Full
- Writable: Full, can delete objects
- Public: Can make public for testing

---

## Staging/Testing Procedure (RELAXED)

**Before Experimental Deploy:**
1. Test locally: `wrangler dev`
2. Schema: Can be destructive (no backup needed)
3. Smoke test: Best-effort (failures ok for learning)
4. Secrets: Can use test keys, never production

**Experimental Verification (Post-Deploy):**
- Self-verify: Run exploratory tests
- Document findings: Commit exploratory notes + results
- Breaking changes ok: This is sandbox

---

## Experimentation Boundaries

✅ **ALLOWED in Experimental:**
- New algorithm testing
- Performance benchmarks
- Schema redesigns (destructive)
- External API integrations
- Student data simulation (synthetic test data only)

❌ **NOT ALLOWED in Experimental:**
- Use of production API keys
- Modification of production D1
- Use of real student data
- Public deployment (all experimental stays sandboxed)

---

## Incident Response (MINIMAL)

**Experimental Errors:**
- Self-contained failures ok (sandbox isolated)
- Document what broke + why (learning value)
- Can delete entire worker and start over

**Nothing escalates:** Experimental failures don't impact production

---

## Success Criteria

✅ **Experimental work is successful when:**
1. You learn something
2. Findings documented for future reference
3. No production systems affected
4. Exploratory notes committed to git

---

## Contact + Escalation

**Blocker:** None (sandbox, can always reset)  
**Questions:** Reference EXPERIMENTAL-RULES (this file)  
**Publishing:** When experimental proves viable, promote to production via formal code review

---

_Last Updated: 2026-04-20 (RUN357 Phase 4)_
