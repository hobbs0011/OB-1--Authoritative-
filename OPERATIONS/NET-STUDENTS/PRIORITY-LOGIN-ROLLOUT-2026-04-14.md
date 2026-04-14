# Priority Login Rollout — 2026-04-14

## Priority Queue (as requested)
1. Minh (parent login for mother)
2. Hieu
3. Hana
4. Lam

---

## Ground Truth Snapshot

| Student | Profile Status | Login Identity Status | Source of Truth |
|---|---|---|---|
| Minh | Confirmed complete | Confirmed in enrollment script: `minh-private` + parent id `minh-mom` | `APPS/EducationSystemsDevelopment/students/MINH-PRIVATE.md`, `APPS/NET-PET-AI-merge/SCRIPTS/enroll-students.mjs` |
| Hieu | Confirmed complete | Not yet wired in enrollment script | `APPS/EducationSystemsDevelopment/students/HIEU-PRIVATE.md` |
| Hana | Confirmed complete | Not yet wired in enrollment script | `APPS/EducationSystemsDevelopment/students/HANA-PRIVATE.md` |
| Lam | Name exists in multiple class vault records; no single active private profile in student folder | Not yet wired in enrollment script | `APPS/NET-PET-AI-merge/CANON/VAULT-L-LIVE-CLASSES-CONSOLIDATED-1.md` |

---

## Confirmed Technical References

- Production enrollment currently tracks 6 students including Minh:
  - `APPS/NET-PET-AI-merge/OPERATIONS/SYNCH-STATE.md`
- Minh enrollment object includes:
  - `studentId: minh-private`
  - `parentId: minh-mom`
  - File: `APPS/NET-PET-AI-merge/SCRIPTS/enroll-students.mjs`
- Hieu/Hana currently appear in classroom roster UI (assessment app), not enrollment script:
  - `APPS/NET-PET-AI-merge/APPS/net-tiger-assessment/classroom.html`

---

## Immediate Send-Out Pack (No Delay)

### 1) Minh — send now (parent-facing)
Message template:

"Hi Dung (Michelle),
Minh's NET profile is ready and active.
We will use the parent-linked login flow for progress visibility.
I will send your login link and first-week checklist in the next message.
- Michael"

Operational note:
- Use Minh as first live deployment because profile and IDs are already confirmed.

### 2) Hieu — send profile confirmation now, login pending ID wiring
Message template:

"Hi Hieu,
Your NET profile is ready and prioritized.
I am finishing your login ID wiring now and will send your login credentials right after.
- Michael"

Operational note:
- Profile file is complete, but no confirmed `studentId` in enrollment script yet.

### 3) Hana — send profile confirmation now, login pending ID wiring
Message template:

"Hi Hana,
4. Lam (17-year-old, new potential student)
I am finishing your login ID wiring now and will send your login credentials right after.
- Michael"

| Lam | Prospect only (17-year-old, new potential student). No active student profile yet. | Not enrolled and no login should be issued yet. | Founder clarification on 2026-04-14 |
- Profile file is complete, but no confirmed `studentId` in enrollment script yet.

### 4) Lam — new prospect intake first (no login yet)
Message template:

"Hi [Lam],
You are in priority onboarding.
We will run a short intake and level check first, then create your NET login.
I will send your credentials right after onboarding is complete.
- Michael"

Operational note:
- Lam is a new potential student, age 17. Treat as prospect intake, not existing roster reconciliation.

2. Create + enroll final studentId records for Hieu and Hana in the enrollment pipeline.
2. Create Lam prospect profile, run intake, then assign new studentId before login issuance.
## Blocking Items (Only 2)

1. Create + enroll final `studentId` records for Hieu and Hana in the enrollment pipeline.
2. Identity lock for Lam (full legal/student record match) before login issuance.

---

## Recommended Execution Order (same day)

1. Send Minh parent login packet first.
2. Wire Hieu and Hana IDs in enrollment script and enroll.
3. Lock Lam identity, then enroll and send.
4. Publish a one-page student login table once all four are live.

---

## Profile File Locations

- `APPS/EducationSystemsDevelopment/students/MINH-PRIVATE.md`
- `APPS/EducationSystemsDevelopment/students/HIEU-PRIVATE.md`
- `APPS/EducationSystemsDevelopment/students/HANA-PRIVATE.md`
- `APPS/NET-PET-AI-merge/CANON/VAULT-L-LIVE-CLASSES-CONSOLIDATED-1.md`
