/**
 * GATE 9 — Lighthouse (real audit of the live page: perf, a11y, best-practices, SEO)
 *
 * Runs Google Lighthouse against the LIVE magic-chat page and asserts category scores
 * above thresholds. Real signal — actual measured scores from a real headless render,
 * not a checklist. Uses Playwright's bundled Chromium (no separate Chrome install).
 *
 * Usage: node test/preflight-lighthouse.mjs [baseUrl]
 * Thresholds overridable via env: LH_PERF, LH_A11Y, LH_BP, LH_SEO (0-1).
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { chromium } from "playwright";

const BASE = process.argv[2] || "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const URL = `${BASE}/magic-chat.html?studentId=sov100-test-magic`;

const T = {
  performance: Number(process.env.LH_PERF ?? 0.5),
  accessibility: Number(process.env.LH_A11Y ?? 0.9),
  "best-practices": Number(process.env.LH_BP ?? 0.8),
  seo: Number(process.env.LH_SEO ?? 0.8),
};

const chromePath = chromium.executablePath();
const chrome = await chromeLauncher.launch({
  chromePath,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

try {
  const runnerResult = await lighthouse(URL, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    formFactor: "mobile",
    screenEmulation: { mobile: true, width: 412, height: 915, deviceScaleFactor: 2.625, disabled: false },
  });

  const cats = runnerResult.lhr.categories;
  let red = false;
  console.log(`GATE 9 — Lighthouse (mobile) against ${URL}`);
  for (const key of Object.keys(T)) {
    const score = cats[key]?.score ?? 0;
    const pass = score >= T[key];
    console.log(`  ${pass ? "GREEN" : "RED  "} ${key}: ${(score * 100).toFixed(0)} (min ${(T[key] * 100).toFixed(0)})`);
    if (!pass) red = true;
  }
  if (red) process.exit(1);
  console.log("GATE 9 GREEN — all Lighthouse categories above threshold");
} finally {
  await chrome.kill();
}
process.exit(0);
