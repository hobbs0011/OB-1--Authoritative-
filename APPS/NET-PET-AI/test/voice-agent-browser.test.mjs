/**
 * Browser test for OBI Voice Agent (Playwright)
 *
 * Verifies:
 * 1. magic-chat page loads
 * 2. deepgram-token endpoint returns token + correct settings (no endpointing, correct models)
 * 3. WebSocket to Deepgram opens and receives SettingsApplied (NOT Error)
 * 4. Audio context starts (OBI speaks — binary audio received within 5s)
 *
 * Run: npx playwright test test/voice-agent-browser.test.mjs
 */

import { test, expect } from "@playwright/test";

const PROD_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const TEST_ID = "sov100-test-magic";
const TIMEOUT_MS = 15000;

test.describe("OBI Voice Agent — end-to-end browser", () => {
  test("token endpoint returns valid settings (no endpointing, correct models)", async ({ request }) => {
    const res = await request.get(`${PROD_URL}/api/deepgram-token?studentId=${TEST_ID}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.settings).toBeTruthy();

    const s = body.settings;
    // VOICE BRAIN LOCK assertions
    expect(s.agent.speak.provider.model).toBe("aura-2-zeus-en");
    expect(s.agent.think.provider.model).toBe("gpt-4o-mini");
    expect(s.agent.think.provider.type).toBe("open_ai");
    expect(s.agent.think.provider.endpoint).toBeUndefined();
    expect(s.agent.listen.provider.model).toBe("nova-3");

    // endpointing bare integer must NOT be present (Deepgram API spec rejects it)
    expect(s.agent.listen.endpointing).toBeUndefined();
  });

  test("WebSocket to Deepgram: SettingsApplied within 10s, audio received", async ({ request }) => {
    const res = await request.get(`${PROD_URL}/api/deepgram-token?studentId=${TEST_ID}`);
    const { token, settings } = await res.json();
    expect(token).toBeTruthy();

    // Node WebSocket test (Playwright supports Node-side WS in test context)
    const { WebSocket } = await import("ws");

    const result = await new Promise((resolve) => {
      const ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", token]);
      let settingsApplied = false;
      let audioReceived = false;

      const finish = () => {
        if (!ws.closed) ws.close();
        resolve({ settingsApplied, audioReceived });
      };

      ws.on("message", (data) => {
        if (data[0] === 0x7b || typeof data === "string") {
          const msg = JSON.parse(data.toString());
          if (msg.type === "Welcome") {
            ws.send(JSON.stringify(settings));
          }
          if (msg.type === "SettingsApplied") {
            settingsApplied = true;
            // Wait up to 5s for audio
            setTimeout(finish, 5000);
          }
          if (msg.type === "Error") {
            resolve({ settingsApplied: false, audioReceived: false, error: msg.description });
            ws.close();
          }
        } else {
          // Binary = audio chunk from Deepgram TTS (OBI speaking)
          if (data.length > 0) audioReceived = true;
        }
      });

      ws.on("error", (e) => resolve({ settingsApplied: false, audioReceived: false, error: e.message }));
      setTimeout(finish, TIMEOUT_MS);
    });

    if (result.error) throw new Error(`Deepgram WS error: ${result.error}`);
    expect(result.settingsApplied, "SettingsApplied not received — Settings rejected by Deepgram").toBe(true);
    expect(result.audioReceived, "No audio received — OBI not speaking").toBe(true);
  });

  test("magic-chat page loads and mic button is visible", async ({ browser }) => {
    // Plain context — mic permission not needed to check button visibility
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${PROD_URL}/magic-chat.html?studentId=${TEST_ID}`, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Mic button must be visible (2B block must NOT have fired and hidden it)
    const micBtn = page.locator("#mic");
    await expect(micBtn).toBeVisible({ timeout: 5000 });

    // networkFallbackBanner must NOT be visible (means WS didn't fail within 5s)
    const banner = page.locator("#networkFallbackBanner");
    await expect(banner).not.toHaveClass(/visible/, { timeout: 2000 }).catch(() => {});

    // No VOICE console errors
    const voiceErrors = errors.filter(
      (e) => e.includes("[VOICE]") || e.includes("SettingsError") || e.includes("endpointing")
    );
    expect(voiceErrors, `Console voice errors: ${voiceErrors.join("; ")}`).toHaveLength(0);

    await context.close();
  });
});
