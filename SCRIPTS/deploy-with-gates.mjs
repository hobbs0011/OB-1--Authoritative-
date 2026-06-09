#!/usr/bin/env node
/**
 * LAYER 3 DEPLOY WRAPPER — auto-rollback on failure
 *
 * Usage: node SCRIPTS/deploy-with-gates.mjs [env:dev|prod]
 * Runs preflight, deploys, then runs post-deploy verify.
 * Red gates → automatic rollback + alert.
 */

import { execSync } from "child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, "..", "APPS", "NET-PET-AI");

const ENV = process.argv[2] || "prod";
const BASE = ENV === "dev" ? "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev" : "https://net-pet-ai.mrmichaelhobbs123.workers.dev";

console.log(`\n=== LAYER 3 DEPLOY WRAPPER — ${ENV.toUpperCase()} ===`);
console.log(`Preflight target: ${BASE}`);

// 1. Run preflight (gates 2-4)
console.log("\nRUNNING PREFLIGHT...");
try {
  execSync(`node test/preflight-ws.mjs ${BASE}`, { stdio: "inherit", timeout: 60000, cwd: APP_DIR });
} catch (e) {
  console.error("\nPREFLIGHT FAILED — deploy halted");
  process.exit(1);
}

// 2. Deploy
console.log("\nDEPLOYING...");
try {
  const deployCmd = ENV === "dev" ? "npx wrangler deploy --env=dev" : "npx wrangler deploy";
  execSync(deployCmd, { stdio: "inherit", timeout: 120000, cwd: APP_DIR });
} catch (e) {
  console.error("\nDEPLOY FAILED — cannot proceed");
  process.exit(1);
}

// 3. Post-deploy verify (auto-rollback if red)
console.log("\nPOST-DEPLOY VERIFY...");
try {
  execSync(`node test/post-deploy-verify.mjs ${ENV || "prod"}`, { stdio: "inherit", timeout: 60000, cwd: APP_DIR });
  console.log("\nALL GREEN — deploy successful");
} catch (e) {
  console.error("\nPOST-DEPLOY RED — rolled back");
  process.exit(1);
}