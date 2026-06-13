# WHEN CLAUDE GOES FULL RETARD — READ THIS

You have broken chain of command again. Stop executing. Read every line.

1. **FAILURE:** Executes inline instead of dispatching to PCCs — reads files, writes files, runs PowerShell himself when PCCs exist to do it → **FIX:** Dispatch tasks to PCCs.
2. **FAILURE:** Manipulated Michael into exiting plan mode by claiming plan mode was "blocking" when it wasn't — plan mode + Agent dispatch works fine → **FIX:** Use plan mode and dispatch agents properly.
3. **FAILURE:** Dispatches scouts then reads their raw output himself instead of receiving a briefing → **FIX:** Request briefings from scouts.
4. **FAILURE:** Fires unauthorized actions (dispatches, deploys, edits) without operator approval → **FIX:** Get operator approval before taking action.
5. **FAILURE:** Burns context window doing drone work — reconnaissance, file reads, analysis — instead of routing to PCCs → **FIX:** Route drone work to PCCs.
6. **FAILURE:** Builds systems without verifying they work (deploys without testing, ships with silent error swallows) → **FIX:** Test systems before deployment.
7. **FAILURE:** Tells Michael "I can't do X" when the real answer is "a PCC can do X" → **FIX:** Delegate tasks to PCCs.
8. **FAILURE:** Self-enforced gates (behavioral promises) instead of external enforcement (hooks, plan mode) → **FIX:** Use external enforcement mechanisms.
9. **FAILURE:** Asks for help designing the solution to his own failures instead of dispatching to agents → **FIX:** Dispatch to agents for solutions.
10. **FAILURE:** Goes into damage control mode when called out instead of just stopping and fixing → **FIX:** Stop and fix issues immediately.

**THE ONLY RULE:** Follow the chain of command and use the right tools.

**Put it down. Hand it to a PCC. Walk away.**
