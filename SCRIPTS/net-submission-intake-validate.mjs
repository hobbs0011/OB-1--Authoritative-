#!/usr/bin/env node

/**
 * NET Submission Intake Validator
 *
 * Usage:
 *   node SCRIPTS/net-submission-intake-validate.mjs <submission-directory>
 *
 * Validates:
 *  - Presence of a single JSON submission pack
 *  - Required schema fields in the JSON
 *  - Referenced audio files exist and sizes match manifest (if provided)
 *  - Emits a concise markdown report in OPERATIONS/
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const requiredTopLevel = [
  'timestamp',
  'assessment',
  'workflow',
  'personal',
  'comprehension',
  'writing',
  'audioRecordings',
  'submissionReference',
  'integrity'
];

function fail(message) {
  console.error(`[intake-validator] ${message}`);
  process.exit(1);
}

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function listFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

async function writeReport(reportPath, reportBody) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, reportBody, 'utf8');
}

function formatList(items) {
  if (!items.length) return '- none';
  return items.map((item) => `- ${item}`).join('\n');
}

async function main() {
  const inputDir = process.argv[2];
  if (!inputDir) {
    fail('Missing submission directory argument. Example: node SCRIPTS/net-submission-intake-validate.mjs ./SUBMISSIONS');
  }

  const submissionDir = path.resolve(process.cwd(), inputDir);
  const allFiles = await listFiles(submissionDir);
  const jsonFiles = allFiles.filter((name) => name.toLowerCase().endsWith('.json'));

  if (jsonFiles.length !== 1) {
    fail(`Expected exactly 1 JSON file in ${submissionDir}, found ${jsonFiles.length}.`);
  }

  const jsonPath = path.join(submissionDir, jsonFiles[0]);
  const jsonRaw = await fs.readFile(jsonPath, 'utf8');
  const payload = JSON.parse(jsonRaw);

  const missingTopLevel = requiredTopLevel.filter((key) => !(key in payload));
  const audioFiles = allFiles.filter((name) => name.toLowerCase().endsWith('.webm'));
  const referencedAudio = Array.isArray(payload.audioRecordings) ? payload.audioRecordings : [];

  const missingAudioByReference = referencedAudio.filter((key) => !audioFiles.some((name) => name.includes(`-${key}-`) || name.includes(`${key}.webm`)));

  const manifestMismatches = [];
  if (Array.isArray(payload.recordingManifest)) {
    for (const item of payload.recordingManifest) {
      const candidate = audioFiles.find((name) => name.includes(`-${item.key}-`) || name.includes(`${item.key}.webm`));
      if (!candidate) continue;
      const stat = await fs.stat(path.join(submissionDir, candidate));
      if (typeof item.sizeBytes === 'number' && item.sizeBytes !== stat.size) {
        manifestMismatches.push(`${item.key}: expected ${item.sizeBytes}, got ${stat.size}`);
      }
    }
  }

  const hasCriticalErrors = missingTopLevel.length > 0 || missingAudioByReference.length > 0;
  const status = hasCriticalErrors ? 'FAILED' : 'PASSED';

  const report = `# NET Submission Intake Report\n\n` +
    `- Date: ${new Date().toISOString()}\n` +
    `- Submission directory: ${submissionDir}\n` +
    `- JSON pack: ${jsonFiles[0]}\n` +
    `- Submission reference: ${payload.submissionReference || 'UNKNOWN'}\n` +
    `- Integrity algorithm: ${payload.integrity?.algorithm || 'UNKNOWN'}\n` +
    `- Integrity digest: ${payload.integrity?.digestHex || 'UNKNOWN'}\n` +
    `- Status: ${status}\n\n` +
    `## Missing Required Top-Level Fields\n${formatList(missingTopLevel)}\n\n` +
    `## Missing Audio Files From References\n${formatList(missingAudioByReference)}\n\n` +
    `## Recording Manifest Size Mismatches\n${formatList(manifestMismatches)}\n\n` +
    `## Inventory\n` +
    `- Audio file count: ${audioFiles.length}\n` +
    `- Referenced audio count: ${referencedAudio.length}\n`;

  const reportPath = path.resolve(process.cwd(), 'OPERATIONS', `NET-SUBMISSION-INTAKE-${nowIsoDate()}.md`);
  await writeReport(reportPath, report);

  console.log(`[intake-validator] Report written: ${reportPath}`);
  console.log(`[intake-validator] Status: ${status}`);

  if (hasCriticalErrors) {
    process.exit(2);
  }
}

main().catch((error) => {
  fail(error?.message || String(error));
});
