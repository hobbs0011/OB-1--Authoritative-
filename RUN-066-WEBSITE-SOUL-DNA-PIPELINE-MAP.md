# RUN 066 — Website + SOUL DNA Pipeline Map

## 0) Scope Lock
- Trigger: "check it out, our website prototype so far, include that in your pipeline of mapping. And don't forget the SOUL DNA."
- Website target reviewed: https://hobbs0011.github.io/net-tiger-assessment/index.html
- Local prototype root: `net-tiger-assessment/`
- Canon source for doctrine mapping: `CANON/SOUL-DNA-CANON.md`

---

## 1) What Is Already Done (Mapped)

### Run 065 shipped assets (already committed)
1. `CANON/TRAIN-67/CODE/QuestionChunks/Mouse_A.lua`
2. `CANON/TRAIN-67/STUDIO-INTEGRATION-CHECKLIST.md`
3. Correction captured: `CombatSystem.lua` is ZERO ESL and should not be patched for QuestionBank.
4. Commit SHA: `90ed506eac80296870a50b7d7229e808db9afe30`

### Local operational log (already materialized)
1. `PULSE-HANDOFFS/run-065-handoff.md`

---

## 2) Website Prototype Ground Truth (Current)

### Surface and narrative
- Product surface is coherent and premium: Tiger Assessment with explicit human-review promise and 24h follow-up.
- Positioning is clear: no fake instant score, real review + free class invitation.
- Embedded strategic narrative is present (Dossier + Listening Lounge) and supports trust-building before submission.

### Functional sections confirmed
1. About You
2. Jolly Phonics (42 sounds / 7 groups)
3. Reading (3 passages + comprehension)
4. Writing (5 prompts)
5. Free Speaking (30-60s recording)
6. Submission pack export

### Technical behavior confirmed
- Local audio capture via MediaRecorder.
- Audio files kept local until user download/export.
- Submission pack exports JSON + per-recording .webm files.
- OBI floating widget is present and functional with local response knowledge base.
- Media assets are path-bound and loaded from local project root assets.

---

## 3) SOUL DNA Alignment Matrix (Website)

### A) Strong alignment
1. Intent fidelity:
   - Human-reviewed promise is explicit and repeated.
   - No instant-score theater language is explicit.
2. Voice and pedagogy:
   - Confidence-over-perfection messaging is visible throughout.
   - Vietnamese support is first-class across prompts and helper text.
3. Drift resistance:
   - The page states the product purpose clearly (capture diagnostic signal, then follow-up), reducing ambiguity.

### B) Gaps / risks to watch
1. Submission chain-of-custody gap:
   - Export is local, but no deterministic receipt hash is shown to user.
2. Follow-up workflow integrity gap:
   - Promise is 24h human follow-up, but no visible receipt ID or queue reference generated client-side.
3. Widget trust boundary gap:
   - OBI widget is useful, but not yet wired to authoritative backend audit trail in this static prototype.

### C) SOUL DNA law fit (direct)
- "Raw prompts/real signal over polished fiction": PASS
- "No fake authority / no simulated certainty": PASS
- "Process-trace and correction moments preserved": PARTIAL (needs receipt hash + audit checkpoint)
- "Operator intent continuity over cosmetic output": PASS

---

## 4) Pipeline Mapping (Updated)

### Stream A — Messaging + conversion surface (website)
- Stage A1: Hero + trust framing (DONE)
- Stage A2: Dossier + media authority layer (DONE)
- Stage A3: Form + recording flow (DONE)
- Stage A4: Submission export (DONE)
- Stage A5: Human follow-up promise + CTA (DONE)

### Stream B — Evidence + audit spine (next)
- Stage B1: Add receipt hash generation for exported package (PENDING)
- Stage B2: Add visible submission reference code in UI (PENDING)
- Stage B3: Add optional secure upload endpoint binding (PENDING)
- Stage B4: Add operator-facing intake parser for package files (PENDING)

### Stream C — OBI integration maturity
- Stage C1: Static helper widget (DONE)
- Stage C2: Intent-aware section guidance and completion checks (PARTIAL)
- Stage C3: Backend-sealed tutoring/audit bridge (PENDING)

---

## 5) Recommended Next Build (Hands-off sequence)
1. Implement deterministic package hash in `net-tiger-assessment/assets/js/assessment.js` after export generation.
2. Render a visible `Submission Reference` value on-screen before download.
3. Add a companion `operator intake` script under `SCRIPTS/` to validate pack schema and audio presence.
4. Log validation summary into `OPERATIONS/` as a daily intake ledger file.

---

## 6) Canon-safe Constraints
- Keep branding public-facing as Natural English Training.
- Keep bilingual VI/EN support mandatory.
- Keep local-first recording behavior clear and explicit.
- Do not claim AI grading where human review is the real process.

---

## 7) Status
- Mapping objective: COMPLETE
- Website prototype included in pipeline map: COMPLETE
- SOUL DNA alignment pass: COMPLETE
- Ready for next execution chunk: YES
