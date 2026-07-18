import { checkAdminKey } from './security.js';

export async function handleBlueprint(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  return Response.json({
    error: 'Claude decommissioned 2026-07-18',
    detail: '/api/blueprint used Claude Opus 4.8 — removed. Use /api/code with tier=3 (DeepSeek Pro) for equivalent capability.',
    migration: 'POST to /api/code with { task, context, tier: 3 }'
  }, { status: 410 });
}
