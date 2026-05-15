# Agent99 Pipeline — 100 Stages (Connection Hardening First)

Date: 2026-04-16
Scope: Chat audit + repo audit + index audit + audit-of-audit + hardened connections

## Phase 1 — Freeze and Snapshot (1-10)
1. Halt all active background jobs.
2. Halt all OB-1 scoped dev servers.
3. Capture current git branch.
4. Capture current git status.
5. Capture full remote map.
6. Capture MCP environment variable status.
7. Capture Cloudflare live auth check.
8. Capture GitHub live auth check.
9. Capture Notion live auth check.
10. Save freeze snapshot artifact.

## Phase 2 — Account and Remote Integrity (11-20)
11. Classify remotes as active, legacy, unknown.
12. Validate active-owner remotes are reachable.
13. Validate legacy-owner remotes are reachable.
14. Flag suspended/404 owner dependencies.
15. Identify duplicate remotes pointing to same target.
16. Identify stale remotes no longer needed.
17. Confirm canonical owner lane is stable.
18. Confirm canonical repo naming is stable.
19. Generate remote migration recommendations.
20. Record remote integrity score.

## Phase 3 — MCP Integrity and Token Health (21-30)
21. Audit root MCP config servers list.
22. Audit VS Code MCP config servers list.
23. Diff root vs VS Code MCP configs.
24. Validate Cloudflare token set.
25. Validate GitHub token set.
26. Validate all Notion token slots.
27. Classify Notion tokens: valid/invalid/missing.
28. Validate optional comms/search tokens.
29. Record MCP readiness coverage.
30. Produce token hardening action list.

## Phase 4 — Workflow and Automation Hardening (31-40)
31. Audit GitHub workflow triggers.
32. Audit workflows referencing legacy owners.
33. Add legacy-owner guard switch.
34. Ensure default behavior avoids legacy calls.
35. Verify active-owner workflow still works.
36. Audit PAT secret dependencies.
37. Remove silent failure paths in workflows.
38. Add explicit comments for legacy gating.
39. Record workflow hardening decisions.
40. Publish workflow hardening checklist.

## Phase 5 — Runtime and App Integration Audit (41-50)
41. Verify runtime app canonical path.
42. Verify worker config references active ownership.
43. Verify Notion integration path references.
44. Verify non-blocking Notion mirror behavior.
45. Verify ledger source-of-truth behavior.
46. Verify route health endpoints.
47. Verify deployment dry-run path.
48. Verify operational scripts entrypoint.
49. Verify command station integration assumptions.
50. Record runtime integrity score.

## Phase 6 — Index Audit (Repo/Canon/Ops) (51-60)
51. Audit root README canonical lane accuracy.
52. Audit root MASTER-SYNC freshness.
53. Audit _SORTED MASTER-SYNC freshness.
54. Audit OPERATIONS/SYNCH-STATE freshness.
55. Identify conflicting canonical owner statements.
56. Identify outdated worker domain statements.
57. Identify outdated account references.
58. Build index discrepancy ledger.
59. Prioritize index corrections by risk.
60. Publish index remediation queue.

## Phase 7 — Audit-of-Audit Validation (61-70)
61. Verify every prior audit produced artifacts.
62. Verify artifact timestamps are current.
63. Verify findings have owner/action/deadline.
64. Verify no orphan finding without action.
65. Verify high-risk items are top-ranked.
66. Verify repeated false positives are removed.
67. Verify evidence links for each finding.
68. Verify scoring methodology consistency.
69. Verify cross-file contradiction detection.
70. Publish audit quality grade.

## Phase 8 — Notion Vault Hardening (71-80)
71. Confirm Notion role as control-plane mirror.
72. Confirm Ledger remains canonical source.
73. Apply summary-plus-pointer mirror policy.
74. Disable full transcript mirror by default.
75. Batch writes for high-volume events.
76. Add retry and dead-letter policy.
77. Add token rotation calendar entries.
78. Archive invalid/legacy Notion tokens.
79. Create Notion workspace ownership matrix.
80. Publish Notion hardening SOP.

## Phase 9 — GitHub Ownership Stabilization (81-90)
81. Lock primary owner to active account.
82. Gate legacy targets behind explicit switch.
83. Document suspended account fallback path.
84. Map repo transfer dependencies.
85. Map issue/PR automations to active owner.
86. Verify branch protections on active repos.
87. Verify CI tokens scoped least-privilege.
88. Verify PAT inventory and expiry.
89. Build owner migration runbook.
90. Publish connection recovery playbook.

## Phase 10 — Pipeline Execution Readiness (91-100)
91. Run connection-hardening audit script.
92. Run MCP god-mode audit script.
93. Run doctor verification.
94. Run build verification.
95. Run workflow syntax lint check.
96. Generate final consolidated risk register.
97. Generate stage completion report.
98. Confirm go/no-go criteria.
99. Declare hardened baseline version.
100. Open next sprint queue with top 10 priorities.

## Immediate Next 10 (execute now)
1. Run `pwsh -File SCRIPTS/connection-hardening-audit.ps1`
2. Run `pwsh -File SCRIPTS/mcp-godmode-audit.ps1 -Json`
3. Confirm legacy lanes in workflow are disabled by default
4. Enumerate invalid Notion tokens for rotation
5. Decide keep/remove legacy remotes
6. Produce index discrepancy list
7. Patch top 3 index mismatches
8. Re-run audits
9. Publish consolidated report
10. Commit hardening baseline
