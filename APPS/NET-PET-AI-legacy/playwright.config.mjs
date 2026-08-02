import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: ["**/voice-agent-browser.test.mjs"],
  timeout: 30000,
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "test/playwright-report" }]],

  projects: [
    // ── Desktop ──────────────────────────────────────────────────────────────
    {
      name: "Chrome (Windows/Mac)",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Firefox (Windows/Mac)",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Edge (Windows)",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "Safari (Mac) — WebKit",
      use: { ...devices["Desktop Safari"] },
    },

    // ── Mobile ───────────────────────────────────────────────────────────────
    {
      name: "Chrome Android",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Safari iOS (iPhone 14)",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "Safari iOS (iPhone 14 Pro Max)",
      use: { ...devices["iPhone 14 Pro Max"] },
    },
  ],
});
