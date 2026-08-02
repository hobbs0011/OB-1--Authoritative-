#!/usr/bin/env node
// test/integration/voice-token.test.js
// Phase 0.8 — vitest-pool-workers first behavioral harness
// Asserts: GET /api/deepgram-token?studentId=keep-warm-ping&mode=free
//   => 200 with settings containing nova-3 + aura-2-zeus-en + ws_url
import { describe, it, expect } from "vitest";

describe("voice-token behavioral", () => {
  it("returns token with nova-3 listen + aura-2-zeus-en speak + ws_url for keep-warm-ping free", async () => {
    const res = await fetch(
      "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=keep-warm-ping&mode=free"
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.settings).toBeDefined();
    expect(data.settings.listen.model).toBe("nova-3");
    expect(data.settings.speak.model).toBe("aura-2-zeus-en");
    expect(data.settings.think.provider.model).toBe("gpt-4o-mini");
    expect(data.ws_url).toBeDefined();
  });
});
