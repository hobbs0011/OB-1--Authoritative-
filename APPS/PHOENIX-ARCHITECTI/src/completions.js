import { checkAdminKey } from './security.js';
import { isCodeTask, inferMaxTokens, compressContext } from './tokens.js';

const MODEL_MAP = {
  'kilo-auto/free':    null,  // auto-route
  'kilo-haiku':        '@cf/qwen/qwen2.5-coder-32b-instruct',
  'kilo-sonnet':       '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  'qwen-coder':        '@cf/qwen/qwen2.5-coder-32b-instruct',
  'llama-70b':         '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  'r1-distill':        '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
};

function resolveModel(modelId, messages) {
  if (modelId && MODEL_MAP[modelId] !== undefined) {
    if (MODEL_MAP[modelId] !== null) return MODEL_MAP[modelId];
  }
  // kilo-auto/free or unknown: detect from last user message
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  return isCodeTask(lastUser)
    ? '@cf/qwen/qwen2.5-coder-32b-instruct'
    : '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
}

function stripThinkTags(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

export async function handleCompletions(request, env) {
  const authResp = await checkAdminKey(request, env);
  if (authResp !== null) return authResp;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'messages array required' }, { status: 400 });
  }

  const cfModel = resolveModel(body.model, body.messages);
  const lastUser = [...body.messages].reverse().find(m => m.role === 'user')?.content || '';
  const maxToks = body.max_tokens || inferMaxTokens(lastUser, '');

  // Compress context in message content to cut tokens
  const messages = body.messages.map(m => ({
    role: m.role,
    content: typeof m.content === 'string' ? compressContext(m.content) : m.content,
  }));

  let text = '';
  let usedModel = cfModel;

  try {
    const res = await env.AI.run(cfModel, { messages, max_tokens: maxToks });
    text = res?.response ?? '';
    if (cfModel === '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b') {
      text = stripThinkTags(text);
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }

  // OpenAI-compatible response shape
  return Response.json({
    id: 'chatcmpl-' + Date.now(),
    object: 'chat.completion',
    model: usedModel,
    choices: [{
      index: 0,
      message: { role: 'assistant', content: text },
      finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });
}
