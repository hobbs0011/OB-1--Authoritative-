# MASTER-SYNC Deployment Pack

This pack turns the simulated MASTER-SYNC design into a deploy-ready handoff.

**Truth:** physical cloud deployment is not possible from the current thread because cloud control tools are not attached here.

**What is provided instead:**
- deploy-ready Cloudflare scaffold
- deploy-ready Google scaffold
- locked subagent topology
- heartbeat cadence
- secrets map
- turn-on checklist

---

## 1. Runtime decision

- **Primary:** Cloudflare-first
- **Backup:** Google-first
- **Sync artifact:** `MASTER-SYNC.md`
- **Heartbeat:** every 5 minutes
- **Master orchestrator:** `OB1-M0`

---

## 2. Subagent topology

| Agent | Role | Primary runtime | Trigger |
|---|---|---|---|
| OB1-M0 | intake, route, correct, merge, silent close | Cloudflare Worker + DO | cron + fetch |
| Obi-N | Notion workspace lane | queue consumer | queued by M0 |
| Obi-G | GitHub lane | queue consumer | queued by M0 |
| Obi-C | canon lane | queue consumer | queued by M0 |
| Obi-W | web lane | queue consumer | queued by M0 |
| Obi-Prime | merge authority | inside M0 | end-of-cycle merge |

---

## 3. Required secrets

### Cloudflare-first
- `DEATHSTAR_INGEST_KEY`
- `NOTION_TOKEN` or equivalent runtime credential
- `GITHUB_TOKEN` or MCP-equivalent runtime credential
- provider secrets for any external web or AI surfaces

### Google-first
- Secret Manager entries mirroring the above
- Firestore / service account permissions
- scheduler invoker permissions

---

## 4. Cloudflare-first turn-on checklist

1. Create or select the Cloudflare Worker project for `obi-m0`.
2. Add the Durable Object ledger class.
3. Add the 5-minute cron trigger.
4. Create or bind the queue used for subagent fan-out.
5. Insert secrets.
6. Deploy the worker.
7. Run a dry cycle.
8. Confirm that `MASTER-SYNC.md` remains the single shared artifact.

---

## 5. Google-first turn-on checklist

1. Create or select the Cloud Run service for `obi-m0`.
2. Create Firestore collections for packets, queue, drift map, and merge state.
3. Create the 5-minute Cloud Scheduler job.
4. Deploy the workflow definition.
5. Bind Pub/Sub topics for subagent fan-out.
6. Insert secrets into Secret Manager.
7. Dry run the orchestrator.
8. Confirm that `MASTER-SYNC.md` remains the single shared artifact.

---

## 6. Operational law

- no blind continuation
- no dirty handoff
- no drift inheritance
- no promotion of guessed state into truth
- escalate only on net-new signal
- silent close when nothing materially changed

---

## 7. Final note

This pack is the deployment bridge between simulation and physical activation.
Use it with `MASTER-SYNC.md` when turning on the next phase.
