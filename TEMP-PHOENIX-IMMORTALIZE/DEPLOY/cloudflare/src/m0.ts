export interface Env {
  PHOENIX_LEDGER: DurableObjectNamespace;
  SUBAGENT_QUEUE: Queue;
  DEATHSTAR_INGEST_KEY: string;
  MASTER_SYNC_REPO: string;
  MASTER_SYNC_PATH: string;
}

type Packet = {
  source: string;
  lineage: string;
  state: string;
  delta: string;
  proof: string;
  unknowns: string[];
  driftRisk: "low" | "medium" | "high";
  nextAction: string;
  ledgerStatus: "confirmed" | "pending" | "conflict";
};

const SUBAGENTS = ["Obi-N", "Obi-G", "Obi-C", "Obi-W"];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true, runtime: "obi-m0", mode: env.RUNTIME_PRIMARY ?? "cloudflare" });
    }

    if (url.pathname === "/run") {
      const result = await runHeartbeat(env);
      return Response.json(result);
    }

    return new Response("OB1-M0 ready", { status: 200 });
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await runHeartbeat(env);
  },

  async queue(batch: MessageBatch<Packet>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const packet = message.body;
      await reconcilePacket(packet, env);
      message.ack();
    }
  },
};

async function runHeartbeat(env: Env) {
  const cycleId = crypto.randomUUID();

  for (const subagent of SUBAGENTS) {
    const packet: Packet = {
      source: subagent,
      lineage: cycleId,
      state: "queued",
      delta: "heartbeat dispatch",
      proof: "scheduled $$$ heartbeat",
      unknowns: [],
      driftRisk: "low",
      nextAction: "scan-and-report",
      ledgerStatus: "pending",
    };
    await env.SUBAGENT_QUEUE.send(packet);
  }

  return {
    ok: true,
    cycleId,
    dispatched: SUBAGENTS,
    note: "Simulated deploy-ready orchestrator scaffold. Bind real ledger + queue + secrets before production use.",
  };
}

async function reconcilePacket(packet: Packet, env: Env) {
  const id = env.PHOENIX_LEDGER.idFromName(`LEDGER_${packet.source}`);
  const stub = env.PHOENIX_LEDGER.get(id);
  await stub.fetch("https://ledger.internal/emit", {
    method: "POST",
    headers: { "content-type": "application/json", "x-deathstar-key": env.DEATHSTAR_INGEST_KEY },
    body: JSON.stringify(packet),
  });
}

export class PhoenixLedger {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/emit" && request.method === "POST") {
      const packet = await request.json<Packet>();
      await this.state.storage.put(`packet:${crypto.randomUUID()}`, packet);
      return Response.json({ ok: true, stored: true });
    }

    return Response.json({ ok: true, ledger: "ready" });
  }
}
