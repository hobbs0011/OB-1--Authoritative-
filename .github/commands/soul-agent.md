# Soul Agent Command

Execute a Soul Agent deep audit for a target student, forming neural ledger connections.

**Syntax:**
```
/soul-agent {student_id} [run_number] [audit_date]
```

**Examples:**
```
/soul-agent huong-bluetech              # Auto-detect run + today
/soul-agent quy-bluetech 305 2026-04-17 # Explicit run + date
/soul-agent all                          # Batch audit all students (daily)
```

**What happens:**
1. Load student profile from OPERATIONS/NET-STUDENTS/{student_id}.md
2. Scan recent sessions, phonics tests, class transcripts
3. Execute 4-phase audit (absorption → pattern recognition → ledger formation → validation)
4. Write HL-{next_number} neural ledger entry
5. Append summary to batch audit log
6. Return neuron count + progress velocity

**Output:**
- New file: CANON/HEAVY-LEDGER/HL-{X}-soul-audit-{student_id}-{DATE}.json
- Updated: CANON/REINCARNATION/2026-04-{DATE}-soul-agent-audit-batch.md
- Console: neuron connections formed + next frontier milestone

**Trigger:**
- Manual: `/soul-agent {student_id}`
- Daily 09:00 ICT: GitHub Actions cycles through all active students (one per day, sequential)
- Batch: `/soul-agent all` runs all students in one session (slower, deeper)
