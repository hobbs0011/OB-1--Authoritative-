# Docker + Drive Empire Pipeline (Roman Protocol Safe)

Status: ACTIVE
Owner: OB1 + Agent 99
Scope: All OB1 docs and containerized operations
Last Updated: 2026-04-15

## Mission
Use Docker as the execution substrate and Google Drive as the searchable document vault so Gemini can locate and reason across the empire corpus quickly.

## 20 Ways Docker Is a Game Changer
1. Reproducible mission environments: every drone runs the same stack.
2. Zero machine drift: dependencies live in images, not local chaos.
3. Fast onboarding: one command to run NET-PET-AI and support services.
4. Parallel lanes: run core, discord, and future services in profile-based slices.
5. Instant rollback: pin and redeploy known-good images.
6. Portable operations: same behavior on local, CI, and cloud runners.
7. Isolation by default: failures are contained to service boundaries.
8. Repeatable testing: package app + mocks and run deterministic checks.
9. Better observability: unified logs per service and stack-level health probes.
10. Deployment parity: local compose mirrors production contract shape.
11. Dependency governance: version pinning reduces surprise upgrades.
12. Recovery speed: containers restart quickly after faults.
13. Cleaner hosts: fewer global installs, less host contamination.
14. Scripted automation: drive ingest and operational checks can be containerized.
15. Security layering: image scanning and immutable runtime patterns.
16. Team scaling: every Legion operator can run the exact same command set.
17. Resource control: apply CPU/RAM limits by service as needed.
18. Artifact discipline: images become versioned operational artifacts.
19. Polyglot support: Node, Python, and helper tools coexist cleanly.
20. Empire command surface: one orchestration entrypoint for all major lanes.

## Roman Protocol Constraints
1. Execute in phases and report completion output.
2. Avoid planning loops; prefer build-and-verify.
3. Preserve pipeline cursor discipline in updates.
4. Keep drive sync docs-focused and filtered.
5. Do not expose secrets in sync manifests or upload payloads.

## Pipeline (Print This)

### Phase 1: Container Readiness
1. Validate compose file: `docker compose -f docker-compose.ob1.yml config`
2. Build core profile: `docker compose -f docker-compose.ob1.yml --profile core build`
3. Start core profile: `docker compose -f docker-compose.ob1.yml --profile core up -d`
4. Verify health endpoints and logs.

### Phase 2: Document Ingest + Staging
1. Crawl repo for documents and metadata.
2. Exclude secrets and non-doc heavy folders.
3. Copy to staging folder in normalized structure.
4. Emit JSON + CSV manifests for Gemini indexing.

### Phase 3: Drive Sync
1. Validate rclone remote (account: mrmichaelhobbs123).
2. Sync staged docs to configured Drive folder.
3. Emit sync receipt with counts, bytes, and timestamp.

### Phase 4: Operator Broadcast
1. Print command-center summary to terminal.
2. Write printable summary to `OPERATIONS/DRIVE-PIPELINE-SUMMARY.txt`.
3. Keep generated artifacts under `OPERATIONS/DRIVE-PIPELINE/`.

## Execution Commands
1. Dry run inventory and staging:
   `pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/docker-drive-empire-pipeline.ps1 -RepoRoot D:\OB-1 -DryRun`
2. Full run with Drive sync:
   `pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/docker-drive-empire-pipeline.ps1 -RepoRoot D:\OB-1 -EnableDriveSync -RemoteName gdrive -RemoteFolder OB1-Empire-Docs`
3. Core stack start:
   `docker compose -f docker-compose.ob1.yml --profile core up -d`

## Output Artifacts
- `OPERATIONS/DRIVE-PIPELINE/manifest.json`
- `OPERATIONS/DRIVE-PIPELINE/manifest.csv`
- `OPERATIONS/DRIVE-PIPELINE/run-receipt.json`
- `OPERATIONS/DRIVE-PIPELINE-SUMMARY.txt`

## Notes
- This pipeline is intentionally docs-first for Gemini retrieval quality.
- Secret files and key vault text files are excluded by pattern.
