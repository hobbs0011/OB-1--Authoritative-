import { checkAdminKey } from './security.js';

export async function handleBlueprint(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;

  if (!env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'blueprint requires ANTHROPIC_API_KEY — paid path' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.goal !== 'string' || !body.goal.trim()) {
    return Response.json({ error: 'goal must be a non-empty string' }, { status: 400 });
  }

  const { goal, context } = body;
  const userMessage = context ? `${goal}\n\n${context}` : goal;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      system: 'You are Phoenix-Architecti ARCHITECT. Decompose the goal into an ordered JSON array of marching orders. Each order: { id, task, depends_on, verify, on_fail, max_retries }. Output raw JSON array only. No markdown. No explanation.',
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: 'Anthropic API error', details: err }, { status: res.status });
  }

  const data = await res.json();
  const rawContent = data.content?.find(p => p.type === 'text')?.text ?? '';

  let blueprint;
  try {
    blueprint = JSON.parse(rawContent);
  } catch {
    return Response.json({ error: 'Failed to parse blueprint JSON from Anthropic response', raw: rawContent.slice(0, 500) }, { status: 502 });
  }

  return Response.json({ blueprint, goal, mission_id: 'BP-' + Date.now() });
}
