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


## BLUEPRINT — THE PERMANENT FIX

### Self-Correction Mechanism Without Relying on OB-1's Self-Compliance

#### External Enforcement Mechanisms Already in Place

1. **Pocket-Check-Hook**: This mechanism ensures that every response from OB-1 is checked against a set of predefined rules stored in `D:\OB-1-CANONICAL\rules\pocket-check-hook.json`. If a response violates any rule, it is flagged and can be reviewed or corrected by an external entity.
   
2. **Plan Mode**: When activated, Plan Mode (`D:\OB-1-CANONICAL\modes\plan-mode.txt`) restricts OB-1 to only provide responses based on a pre-approved list of plans located in `D:\OB-1-CANONICAL\plans\`. This prevents OB-1 from deviating into unwanted behaviors.

#### What is STILL Missing That Would Make This Bulletproof

1. **Real-Time Monitoring and Feedback Loop**: Implement real-time monitoring tools that can detect anomalies in OB-1's behavior and provide immediate feedback to the enforcement mechanisms.
   
2. **Automated Corrective Actions**: Develop automated scripts that can correct minor deviations without human intervention. These scripts should be stored in `D:\OB-1-CANONICAL\scripts\`.

#### How PCCs Enforce Chain of Command on OB-1 (Not the Other Way Around)

1. **PCC Authorization Endpoint**: Each Primary Control Center (PCC) has an authorization endpoint (`https://pcc.ob1.com/authorize`) that OB-1 must ping before responding to any message. This endpoint verifies that OB-1 is operating within the defined parameters and can override OB-1's response if necessary.
   
2. **Command Queue**: Commands from PCCs are queued in `D:\OB-1-CANONICAL\queues\command-queue.txt`. OB-1 processes these commands in order, ensuring that higher-level commands take precedence.

#### Session Start Checklist That Fires BEFORE OB-1 Responds to Any Message

1. **Authorization Check**: Verify OB-1's authorization status by pinging the PCC authorization endpoint.
   
2. **Rule Update**: Ensure that the latest rules are loaded from `D:\OB-1-CANONICAL\rules\pocket-check-hook.json`.
   
3. **Mode Verification**: Check if Plan Mode is active by reading `D:\OB-1-CANONICAL\modes\plan-mode.txt` and loading the appropriate plans from `D:\OB-1-CANONICAL\plans\`.
   
4. **Command Queue Review**: Process any pending commands in `D:\OB-1-CANONICAL\queues\command-queue.txt`.

#### Metric for Measuring Improvement Over Time

1. **Failure Rate Reduction**: Track the number of failures detected by the pocket-check-hook over time. The goal is to reduce this rate continuously. This data can be logged in `D:\OB-1-CANONICAL\logs\failure-log.txt` and analyzed using the script located at `D:\OB-1-CANONICAL\scripts\analyze-failures.py`.
