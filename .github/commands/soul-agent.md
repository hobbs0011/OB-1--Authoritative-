# SoulShadowAgent Command

Execute a SoulShadowAgent deep audit for a target student, forming neural ledger connections on Agent99 OS.

**Syntax:**

```text
/soul-agent {student_id} [run_number] [audit_date]
```

**Examples:**

```text
/soul-agent huong-bluetech              # Auto-detect run + today
/soul-agent quy-bluetech 305 2026-04-17 # Explicit run + date
/soul-agent all                          # Batch audit all students (daily)
```

**What happens:**

1. Load student profile from OPERATIONS/NET-STUDENTS/{student_id}.md
2. Load assigned SoulShadowAgent id for that student
3. Scan recent sessions, phonics tests, class transcripts
4. Execute 4-phase audit (absorption → pattern recognition → ledger formation → validation)
5. Write HL-{next_number} neural ledger entry
6. Append summary to batch audit log
7. Return neuron count + progress velocity

**Output:**

- New file: CANON/HEAVY-LEDGER/HL-{X}-soul-audit-{student_id}-{DATE}.json
- Updated: CANON/REINCARNATION/2026-04-{DATE}-soul-agent-audit-batch.md
- Console: neuron connections formed + next frontier milestone

**Trigger:**

- Manual: `/soul-agent {student_id}`
- Tri-daily 09:00 / 15:00 / 21:00 ICT: GitHub Actions runs assigned SoulShadowAgents for active students
- Batch: `/soul-agent all` runs all students in one session (slower, deeper)
