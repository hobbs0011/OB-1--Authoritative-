# Risks

## Hardcoded Secrets
- None found in tracked files. Authentication uses env var `PHOENIX_MASTER_KEY` and does not embed secrets in code.

## TODOs / FIXMEs
- None found (no `TODO`, `FIXME`, `HACK`, or `XXX` markers detected).

## Notes
- `x-deathstar-key` is accepted as an auth header alias; ensure clients treat it as sensitive and avoid logging it.
