// tokens.js — shared token budget + routing utilities for all PA handlers
// Three jobs: infer output ceiling, detect code tasks for smart routing, cache keys.

const CODE_PATTERNS = /\b(function|const|let|var|import|export|class|def|async|await|implement|refactor|add\s+\w+|write\s+\w+|fix\s+\w+|create\s+\w+|update\s+\w+)\b/i;

export function isCodeTask(task) {
  return CODE_PATTERNS.test(task);
}

export function inferMaxTokens(task, context = '') {
  const combined = task.length + Math.min((context || '').length, 5000);
  if (combined < 1000) return 1024;
  if (combined < 5000) return 2048;
  if (combined < 20000) return 4096;
  return 8192;
}

export function compressContext(ctx) {
  if (!ctx) return '';
  return ctx.replace(/(\n\s*){3,}/g, '\n\n').trim();
}

export async function cacheKey(task, context) {
  const input = task + '|' + (context || '').slice(0, 1000);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
