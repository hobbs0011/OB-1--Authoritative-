/**
 * GATE 8 — Accessibility (axe-core, real WCAG scan on the live page)
 *
 * Students are real users on real devices, some with screen readers. This runs the
 * industry-standard axe-core ruleset against the LIVE magic-chat page and fails on
 * any critical/serious WCAG 2.1 A/AA violation. Real signal — actual violations with
 * selectors, not "does an aria-label string appear in source."
 *
 * Run: npx playwright test test/voice-agent-a11y.test.mjs --config=playwright.config.mjs
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PROD_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const TEST_ID = "sov100-test-magic";

test("magic-chat has no critical/serious WCAG violations", async ({ page }) => {
  await page.goto(`${PROD_URL}/magic-chat.html?studentId=${TEST_ID}`, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );

  if (blocking.length > 0) {
    const report = blocking
      .map((v) => `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.nodes.map((n) => n.target.join(" ")).join("\n    ")}`)
      .join("\n");
    console.error(`GATE 8 — ${blocking.length} blocking a11y violation(s):\n${report}`);
  } else {
    console.log("GATE 8 GREEN — no critical/serious WCAG violations");
  }

  expect(blocking, `Blocking a11y violations: ${blocking.map((v) => v.id).join(", ")}`).toHaveLength(0);
});
