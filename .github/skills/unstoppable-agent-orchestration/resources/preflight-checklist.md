# Preflight Checklist

Use before major edits, rebases, or pushes.

## Context and scope

- Confirm active repository and branch
- Confirm intended remote target
- Confirm safe edit zone for requested work

## State integrity

- Check working tree state
- Detect lock files and stale git processes
- Check for reserved-path blockers on Windows (for example nul)

## Safety controls

- Identify destructive operations in plan
- Require explicit user intent for any destructive step
- Confirm backup strategy for high-risk flows

## Validation gates

- Define syntax/lint/test command for touched stack
- Define deploy dry-run command if release path is involved

## Publish readiness

- Confirm upstream branch mapping
- Verify remote reachability
- Verify auth and permissions path

## Recovery readiness

- Prepare fallback branch name
- Prepare bundle artifact path
- Capture known-good base commit for replay
