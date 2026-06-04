import { checkAdminKey } from "./security.js";

export async function handleBlueprint(request, env) {
  // Admin key check
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) {
    return adminResponse;
  }

  // Ensure ANTHROPIC API key is present
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "blueprint requires ANTHROPIC_API_KEY" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { goal, context } = payload;
  if (typeof goal !== "string" || goal.trim() === "") {
    return new Response(JSON.stringify({ error: "goal must be a non‑empty string" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userMessage = context ? `${goal}\n\n${context}` : goal;

  // Prepare Anthropic API request
  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      system:
        "You are Phoenix-Architecti ARCHITECT. Decompose goal into ordered JSON array of marching orders. Each: {id,task,depends_on,verify,on_fail,max_retries}. Output raw JSON array only. No markdown. No explanation.",
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!anthropicResponse.ok) {
    const errorBody = await anthropicResponse.text();
    return new Response(
      JSON.stringify({ error: "Anthropic API error", details: errorBody }),
      {
        status: anthropicResponse.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Extract and parse the content from Anthropic response
  let responseJson;
  try {
    responseJson = await anthropicResponse.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to parse Anthropic response as JSON" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // The response structure may contain multiple messages; locate the assistant's content
  let rawContent = "";
  if (Array.isArray(responseJson.content)) {
    // For newer Claude API format
    for (const part of responseJson.content) {
      if (part.type === "text") {
        rawContent += part.text;
      }
    }
  } else if (responseJson.content) {
    rawContent = responseJson.content;
  }

  let blueprint;
  try {
    blueprint = JSON.parse(rawContent);
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to parse blueprint JSON from Anthropic response" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = {
    blueprint,
    goal,
    mission_id: "BP-" + Date.now(),
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
