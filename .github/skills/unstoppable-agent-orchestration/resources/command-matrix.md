# Command Matrix

Use these templates to coordinate execution.

## Discovery lane

```bash
git status -sb
git branch --show-current
git remote -v
rg --files
```

## Build lane

- Use focused file edits only.
- Prefer patch-based changes.
- Avoid unrelated reformatting.

## Validate lane

For NET-PET-AI:

```bash
cd APPS/NET-PET-AI && node --check src/index.js
cd APPS/NET-PET-AI && npm run verify:wrangler
cd APPS/NET-PET-AI && npx wrangler deploy --dry-run
```

## Release lane

```bash
git add -A
git commit -m "feat: <intent>"
git pull --rebase <remote> <branch>
git push -u <remote> <branch>
```

Windows reserved path workaround:

```bash
git add -A -- . ":(exclude)nul"
```

## Recovery lane

Create verified backup bundle:

```bash
git bundle create TEMP-COMMANDSTATION/session-backup.bundle <base>..HEAD
git bundle verify TEMP-COMMANDSTATION/session-backup.bundle
```

Replay from backup on healthy clone:

```bash
git clone <repo-url> <new-folder>
cd <new-folder>
git fetch <path-to-bundle> "refs/heads/*:refs/remotes/bundle/*"
```
