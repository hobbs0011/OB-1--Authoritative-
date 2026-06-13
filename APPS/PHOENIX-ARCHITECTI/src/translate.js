import { checkAdminKey } from './security.js';

export async function handleTranslate(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;

  if (request.method !== 'POST') return new Response(null, { status: 405 });

  const { text, source_lang = 'en', target_lang = 'vi' } = await request.json().catch(() => ({ text: null }));
  if (!text) return Response.json({ error: 'text required' }, { status: 400 });

  try {
    const result = await env.AI.run('@cf/meta/m2m100-1.2b', { text, source_lang, target_lang });
    return Response.json({ ok: true, original: text, translated: result.translated_text, source_lang, target_lang });
  } catch {
    return Response.json({ error: 'AI failure' }, { status: 500 });
  }
}
