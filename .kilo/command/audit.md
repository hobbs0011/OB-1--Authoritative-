---
description: Run system audit — verify integrity, find drift, flag issues
agent: RISE
---
Execute system audit:

**Full Audit**:
1. **Repo integrity**: git status, uncommitted changes
2. **Canon verification**: Check all referenced files exist
3. **Ledger sync**: Compare ledger state vs filesystem
4. **SSM compliance**: Verify all 36 laws are loaded
5. **Notion sync**: Verify Notion state matches GitHub
6. **Worker health**: curl /health endpoint

**Drift Detection**:
- Files that exist but aren't in ledger
- Files in ledger but don't exist
- Modified since last commit
- Untracked files in key directories

**Output**:
```
AUDIT COMPLETE
├── INTEGRITY: ✅/🔴
├── CANON: ✅/🔴 (X missing)
├── LEDGER: ✅/🔴 (Y drift)
├── SSM: ✅/🔴 (36 laws loaded)
├── NOTION: ✅/🔴 (Z sync issues)
└── WORKER: ✅/🔴
```

Use $ARGUMENTS for specific area: "canon", "ledger", "worker", "full"