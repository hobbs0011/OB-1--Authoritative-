# Scout Learned — 2026-07-05T024348
## Trigger
Retired model aliases and stale telemetry found in active agent/dispatch docs.
## Rule
Retired aliases remain routable while embedded in frontmatter/model fields. Prose notices alone do not block dispatch.
## Action
Add alias allowlist enforcement to pre-commit or pre-dispatch validation. Strip hard-coded runtime telemetry from static dispatch docs.
## Routing
DRIFT findings with live model fields → route to /Centurion-Code for canonical update.
