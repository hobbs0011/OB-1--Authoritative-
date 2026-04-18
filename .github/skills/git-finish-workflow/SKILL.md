---
name: git-finish-workflow
description: Safely consolidate local changes, sync with remote, and recover from push blockers using a bundle backup. Use for end-of-session cleanup, branch sync, and publishing pending work.
argument-hint: [branch] [remote]
---

# Git Finish Workflow

Use this skill when a session ends and you need to bring local Git state home cleanly.

## Goals

- Preserve all work safely
- Create a clear commit history
- Sync branch with remote when possible
- Avoid destructive commands

## Procedure

1. Inspect current state.

- Run status and branch checks.
- Identify upstream and remotes.

2. Stage and commit safely.

- Stage changes intentionally.
- If Windows reserved path blockers appear (for example nul), exclude only that path.
- Commit with a clear summary message.

3. Pull before push.

- Pull with rebase from the intended remote branch when remote is reachable.
- Resolve conflicts without resetting unrelated user changes.

4. Push and set upstream.

- Push branch to the correct remote.
- Set upstream if missing.

5. If push fails due to remote/object issues.

- Run repository integrity checks locally.
- Attempt alternate reachable remote if appropriate.
- Create a bundle backup from known good base to HEAD.

## Recovery commands

Use these command patterns as needed:

```bash
git status -sb
git branch --show-current
git remote -v
git add -A
git commit -m "chore: consolidate workspace changes"
git pull --rebase <remote> <branch>
git push -u <remote> <branch>
```

If a reserved path blocks add on Windows:

```bash
git add -A -- . ":(exclude)nul"
```

Bundle backup (replace base commit and file path):

```bash
git bundle create TEMP-COMMANDSTATION/session-backup.bundle <base>..HEAD
git bundle verify TEMP-COMMANDSTATION/session-backup.bundle
```

## Output checklist

At completion, report:

- Branch name
- Commit hash(es) created
- Push result per remote
- Any blockers
- Backup artifact path if created

## Safety notes

- Never use destructive reset commands unless explicitly requested.
- Never discard unrelated user changes.
- Prefer explicit remotes over assumptions about origin.
