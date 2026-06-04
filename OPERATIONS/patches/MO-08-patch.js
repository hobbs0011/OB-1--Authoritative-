import { checkAdminKey, sanitizeInput } from "./security.js";
import verify from "./verify.js";
import { logToD1 } from "./logger.js";

const SYSTEM_PROMPT = "Phoenix-Architecti 5 laws";

export async function handleExecute(request, env) {
  // Admin key check
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) {
    return adminResponse;
  }

  // Parse JSON body
  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    task: rawTask,
    context: rawContext,
    target,
    model,
  } = payload;

  // Sanitize inputs
  const task = sanitizeInput(rawTask, 10000);
  const context = rawContext ? sanitizeInput(rawContext, 50000) : "";

  if (!task) {
    return new Response("Task is required", { status: 400 });
  }

  // Build message parts
  const parts = [
    context ? `CONTEXT:\n${context}` : "",
    target ? `TARGET FILE: ${target}` : "",
    `TASK:\n${task}`,
  ].filter(Boolean);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: parts.join("\n\n") },
  ];

  // Call AI model
  const aiResult = await env.AI.run(
    model || "@cf/qwen/qwen2.5-coder-32b-instruct",
    {
      messages,
      max_tokens: 8192,
    }
  );

  // Strip markdown fences
  const rawResponse = aiResult?.response || "";
  const patch = rawResponse.replace(/^```[\s\S]*?\n/, "").replace(/```$/g, "").trim();

  // Verify patch
  const verifyResult = await verify(patch);

  // Log to D1
  const logResult = await logToD1(env, {
    action: "execute",
    task,
    result: patch,
    tier: 1,
    ip: request.headers.get("CF-Connecting-IP") || "",
  });

  const d1_id = logResult?.id || null;

  // Return JSON response
  return Response.json({
    patch,
    verified: verifyResult.ok,
    verify_error: verifyResult.error || null,
    model: model || "@cf/qwen/qwen2.5-coder-32b-instruct",
    d1_id,
    version: "1.0.0",
  });
}
