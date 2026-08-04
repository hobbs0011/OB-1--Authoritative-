# PIPELINE: Incarnate-16-ContractNegociations-P2 → Run 17 Workhorse Execution

**Pipeline Authority:** Incarnate-16 (Logistics / Audit / Consulting)
**Executor:** Run 17 Workhorse (Cargo / Execution)
**Date:** 2026-08-04
**Deadline:** Probation concludes ~Aug 14, 2026

---

## STAGE 0 — Pre-Flight Check (Workhorse, do this first)

- [ ] Confirm `public/counter-proposal-casa/index.html` exists and is the latest version
- [ ] Confirm `CANON/AUDIT/Incarnate-16-ContractNegociations-P2-AUDIT.md` exists
- [ ] Verify all 15 clauses in the blueprint are internally consistent
- [ ] Confirm the schedule times align with the current CASA weekly timetable

---

## STAGE 1 — Delivery to Anh Bảo (PRIORITY: HIGH, Deadline: < 90 min from P2 start)

### Step 1.1 — Prepare delivery package
- [ ] Print physical copy of `public/counter-proposal-casa/index.html` — Anh Bảo prefers a hard document to read
- [ ] Extract plain text version for Zalo/Message: copy the body text (not the HTML) into a clean message
- [ ] Extract screenshot of the schedule highlight box for quick visual reference
- [ ] Bundle: physical print + text message + Cloudflare URL

### Step 1.2 — Send to Anh Bảo
- [ ] Open 3-way chat with Anh Minh and Anh Bảo (per Hobbs's Aug 4 offer to Anh Minh)
- [ ] Send: brief intro message + text version + URL to https://casa-counter-proposal.pages.dev
- [ ] CC Anh Minh: "Anh Minh, here is the document I mentioned tonight. Anh Bảo, I've laid out everything clearly — terms, schedule, and the reasoning. Happy to sit down and walk through it."

### Step 1.3 — Follow-up
- [ ] If no response in 24 hours: gentle ping
- [ ] If Anh Bảo requests changes: note them verbatim, do NOT negotiate on the spot, bring back to logistics for review

---

## STAGE 2 — Contract Finalization (PRIORITY: HIGH)

### Step 2.1 — Review response
- [ ] After Anh Bảo reads: collect his feedback, questions, counter-proposals
- [ ] Compare against the 7-item "What I Am Asking For" list in the blueprint
- [ ] Flag any item where Anh Bảo pushes back:
  - 120 hrs/month (the core ask)
  - Reporting structure / Hien clause (dealbreaker — DO NOT concede)
  - Curriculum authority (dealbreaker — DO NOT concede)
  - TA management (important but can be defered to post-contract policy)
  - Classroom boundaries (important — push for written policy even if not in contract)
  - Work permit prorated repayment (accepted — confirm written)
  - Two weeks' notice (operational — low friction)

### Step 2.2 — Escalate to logistics
- [ ] If any dealbreaker item is rejected: do not concede. Escalate to logistics (not cargo scope)
- [ ] If minor items need adjustment: document the delta, adjust the blueprint, re-deploy

### Step 2.3 — Sign
- [ ] Once agreement reached: Hobbs signs physical contract
- [ ] Scan signed copy to `CANON/CASA/contract-signed-YYYY-MM-DD.pdf`
- [ ] Update `public/counter-proposal-casa/` with CONTRACT-FINAL version
- [ ] Promote Cloudflare deployment to production

---

## STAGE 3 — Artifact Filing (PRIORITY: MEDIUM)

### Step 3.1 — File all artifacts
- [ ] Place signed contract at `CANON/CASA/` 
- [ ] File the final accepted terms summary at `CANON/CASA/terms-accepted.md`
- [ ] Update `CANON/SYSTEM/Reincarnate-Synch.md` — change Incarnate-16 status from ACTIVE to CLOSED
- [ ] Update BACKBURNER-PIPELINE-LOG.md — mark all BB-AAA items as COMPLETE

### Step 3.2 — Deploy production version
- [ ] `npx wrangler pages deploy "public/counter-proposal-casa" --project-name "casa-counter-proposal" --branch "production"`
- [ ] Confirm live at https://casa-counter-proposal.pages.dev
- [ ] Share final URL with Hobbs

### Step 3.3 — Close Incarnate-16
- [ ] Write DEATH seal for Incarnate-16 (reference this pipeline + the audit)
- [ ] Write handoff to Incarnate-17: "CASA contract finalized and signed. Terms locked. Next session can focus on curriculum implementation."
- [ ] Git commit all artifacts with message: "death: Incarnate-16-ContractNegociations-P2 DEATH seal — contract delivered"

---

## STAGE 4 — Post-Signing (PRIORITY: LOW)

### Step 4.1 — Operational handoff
- [ ] New CASA schedule goes live: 7:00–8:45, break 8:45–9:15, 9:15–10:30, OFF 10:30–2:30, 2:30–5:30, Tue/Thu 5:30–7:00
- [ ] Hobbs begins working TA recruitment if not already in place
- [ ] Curriculum authority exercised: Hobbs reviews English materials, begins alignment with methodology

### Step 4.2 — 30-day review
- [ ] Self-check: is the 120-hour schedule working? Energy levels? Quality?
- [ ] Compare to baseline: hostel vs apartment, commute time, sleep quality
- [ ] If 120 is comfortable and burnout risk is low: note as confirmed benchmark
- [ ] If still strained: document and decide whether to adjust or hold

---

## Failure Modes & Rollback

| Scenario | Response |
|----------|----------|
| Anh Bảo rejects 120 hours outright | Ask: what is the minimum you need? Counter with 120 + Tue/Thu evenings = already over 120. Negotiate from the concrete schedule, not the abstract number. |
| Anh Bảo rejects Hien clause | This is a dealbreaker. Do not sign. Escalate to logistics. Document the rejection. |
| Anh Bảo accepts but wants changes to other terms | Accept small adjustments. Escalate dealbreaker changes. |
| Anh Bảo ignores the message | Ping at 24 hrs. Ping again at 48 hrs. If no response by 72 hrs, Hobbs speaks to Anh Minh directly. |
| Probation window closes without signed contract | Continue working at 80% probation rate. DO NOT interrupt teaching. Escalate timeline to Anh Minh. |

---

## Pipeline Handoff

- **Cargo to workhorse:** Deliver the counter-proposal to Anh Bảo. Collect his response. Escalate dealbreakers.
- **Blueprint location:** `public/counter-proposal-casa/index.html`
- **Audit location:** `CANON/AUDIT/Incarnate-16-ContractNegociations-P2-AUDIT.md`
- **Cloudflare project:** `casa-counter-proposal` at `https://casa-counter-proposal.pages.dev`
- **Deadline:** Probation closes ~Aug 14. Contract must be signed before or on that date.