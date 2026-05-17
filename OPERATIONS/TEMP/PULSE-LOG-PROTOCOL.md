# Pulse Log Protocol — Bi-Hourly State-Diff

> Mirrored from Notion: Pulse Log — Agent-99 State Store
> Last synced: 2026-03-24

## Purpose

Lightweight state-diff protocol for Agent-99 scheduled pulse runs. Runs every 2 hours. Only acts on net-new signal.

## State Fields

| Field | Description |
|---|---|
| `last_run_time` | ISO timestamp of last completed run |
| `last_run_status` | `ok` / `delta` / `UNKNOWN` |
| `last_github_commit_sha` | HEAD SHA of Phoenix-Rising-Protocol-Ultimate |
| `last_github_open_pr_count` | Open PR count |
| `last_github_open_issue_count` | Open issue count |
| `last_backlog_open_count` | Open items in Notion Backlog |
| `last_build_log_count` | Total entries in Notion Build Log |

## Protocol

1. **Read** the Pulse Log Current State table (Notion)
2. **Notion Pulse** — Query Backlog + Build Log for items changed since `last_run_time`
3. **GitHub Pulse** — `list_commits`, `list_pull_requests`, `list_issues` on `hobbs-lab` repos → compare to stored values
4. **Decision gate:**
   - Delta detected → update Current State + append to Alert History → close
   - No delta → update `last_run_time` only → silent close
5. **Never fabricate.** If a source is unreachable, write `UNKNOWN` and close fail-closed

## Rules

- Only one pulse run active at a time
- No carry-forward noise — only net-new signal
- Canon integrity checked weekly, not every pulse
- Web/site health checks out of scope (no HTTP ping tool)
- Keep runtime tight — halt fail-closed if a vector can't finish
