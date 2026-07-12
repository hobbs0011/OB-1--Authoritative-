/**
 * NET PET AI â€” Cloudflare Worker (API Gateway)
 * 
 * SOUL DNA: OBI is the bridge between human intent and AI results.
 * This worker routes student queries â†’ Durable Object â†’ LLM â†’ Heavy Ledger.
 * 
 * No external NPM. Pure Cloudflare natives.
 * All state lives in Durable Object SQLite (Heavy Ledger).
 */

interface Env {
  STUDENT_DO: DurableObjectNamespace;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY?: string;
  ZALO_OA_ACCESS_TOKEN: string;
}

interface StudentChatRequest {
  studentId: string;
  message: string;
  timestamp?: number;
}

interface StudentChatResponse {
  reply: string;
  corrections?: Array<{
    error: string;
    explanation: string;
  }>;
  nextDrill?: string;
  studentState?: {
    level: string;
    streak: number;
    weakSkills: string[];
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        status: 204,
      });
    }

    // ROUTES
    if (url.pathname === "/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/daily" && request.method === "POST") {
      return handleDaily(request, env);
    }

    if (url.pathname === "/progress" && request.method === "GET") {
      return handleProgress(request, env);
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

/**
 * CHAT ROUTE â€” Core learning loop
 * 
 * Flow:
 * 1. Extract studentId + message
 * 2. Get Durable Object (student brain)
 * 3. DO loads state (Jolly Phonics level, weak skills, session history)
 * 4. Build OBI system prompt (context-injected)
 * 5. Call LLM (DeepSeek/OpenAI)
 * 6. DO updates Heavy Ledger (event log + anchors)
 * 7. Return response + corrections + next task
 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as StudentChatRequest;
    const { studentId, message } = body;

    if (!studentId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing studentId or message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Durable Object for this student
    const id = env.STUDENT_DO.idFromName(studentId);
    const stub = env.STUDENT_DO.get(id);

    // Fetch student state from DO
    const stateResponse = await stub.fetch("https://do/state", {
      method: "GET",
    });
    const state = await stateResponse.json();

    // Build OBI system prompt
    const systemPrompt = buildObiPrompt(state);

    // Call LLM
    const aiResponse = await callLLM(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      env
    );

    // Extract corrections
    const corrections = extractCorrections(message, aiResponse);

    // Update DO (Heavy Ledger + state snapshot)
    await stub.fetch("https://do/chat", {
      method: "POST",
      body: JSON.stringify({
        userMessage: message,
        aiResponse: aiResponse,
        corrections: corrections,
      }),
    });

    // Determine next drill
    const nextDrill = suggestNextDrill(state, corrections);

    const response: StudentChatResponse = {
      reply: aiResponse,
      corrections: corrections,
      nextDrill: nextDrill,
      studentState: {
        level: state.level || "A1",
        streak: state.streak || 0,
        weakSkills: state.weakSkills || [],
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * DAILY ROUTE â€” Generates daily speaking task + accountability check
 */
async function handleDaily(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as { studentId: string };
    const { studentId } = body;

    if (!studentId) {
      return new Response(JSON.stringify({ error: "Missing studentId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = env.STUDENT_DO.idFromName(studentId);
    const stub = env.STUDENT_DO.get(id);

    // Get daily task from DO
    const taskResponse = await stub.fetch("https://do/daily", {
      method: "POST",
    });
    const task = await taskResponse.json();

    return new Response(JSON.stringify(task), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Daily error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * PROGRESS ROUTE â€” Get student learning stats
 */
async function handleProgress(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return new Response(JSON.stringify({ error: "Missing studentId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = env.STUDENT_DO.idFromName(studentId);
    const stub = env.STUDENT_DO.get(id);

    const progressResponse = await stub.fetch("https://do/progress", {
      method: "GET",
    });
    const progress = await progressResponse.json();

    return new Response(JSON.stringify(progress), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Progress error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * BUILD OBI PROMPT â€” The core personality + context injection
 */
function buildObiPrompt(state: any): string {
  return `You are OBI, an English accountability coach for Vietnamese learners.

YOUR RULES (non-negotiable):
1. Correct mistakes IMMEDIATELY. No excuses.
2. Enforce repetition. If the student made the same mistake before, make them say it 3 times.
3. Track weak phonemes. Focus drills on /Î¸/, /Ã°/, /r/, and Vietnamese-specific errors.
4. Push the student to return tomorrow. Teach them accountability matters.
5. Be strict but supportive. Use dry humor. Do not apologize.

STUDENT PROFILE:
- Level: ${state.level || "A1"}
- Streak: ${state.streak || 0} days
- Recent weak areas: ${JSON.stringify(state.weakSkills || [])}
- Session history: last ${Math.min(state.sessionHistory?.length || 0, 5)} interactions

LEARNING CONTEXT:
${
  state.recentMistakes
    ? `Recent mistakes:\n${state.recentMistakes.map((m: any) => `- ${m}`).join("\n")}`
    : ""
}

DO NOT be a generic chatbot.
You are a learning ENFORCEMENT engine.
Your job: Correct â†’ Repeat â†’ Track â†’ Verify â†’ Next Day.`;
}

/**
 * CALL LLM â€” DeepSeek or OpenAI (fallback)
 */
async function callLLM(
  messages: any[],
  env: Env
): Promise<string> {
  const apiKey = env.DEEPSEEK_API_KEY || env.OPENAI_API_KEY;
  const model = env.DEEPSEEK_API_KEY ? "deepseek-v4-flash" : "gpt-4-mini";
  const endpoint = env.DEEPSEEK_API_KEY
    ? "https://api.deepseek.com/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Error: No response from LLM";
  } catch (err) {
    console.error("LLM call failed:", err);
    return "Error: Could not reach AI model. Try again.";
  }
}

/**
 * EXTRACT CORRECTIONS â€” Parse AI response for errors and fixes
 */
function extractCorrections(
  userMessage: string,
  aiResponse: string
): Array<{ error: string; explanation: string }> {
  // MVP: Simple keyword detection
  const corrections: Array<{ error: string; explanation: string }> = [];

  if (
    userMessage.includes("think") &&
    !userMessage.includes("Î¸") &&
    aiResponse.includes("th")
  ) {
    corrections.push({
      error: "Pronunciation of 'th' sound",
      explanation:
        "Use your tongue between your teeth. /Î¸/ not /s/. Say: THINK",
    });
  }

  if (userMessage.match(/went|go to/i) && aiResponse.includes("tense")) {
    corrections.push({
      error: "Past tense usage",
      explanation: "Use -ed ending for regular verbs. Say it 3 times.",
    });
  }

  return corrections;
}

/**
 * SUGGEST NEXT DRILL â€” Based on weak areas and performance
 */
function suggestNextDrill(
  state: any,
  corrections: any[]
): string {
  if (corrections.length > 0) {
    if (
      corrections.some((c) =>
        c.error.toLowerCase().includes("pronunciation")
      )
    ) {
      return "Phoneme drill: Repeat the /Î¸/ sound 10 times slowly. Then say: 'Think, thing, thirty.'";
    }
    if (
      corrections.some((c) => c.error.toLowerCase().includes("tense"))
    ) {
      return "Grammar drill: Use past tense. 'I went to...', 'I saw...', 'I did...'";
    }
  }

  return `Continue speaking: Tell me about your day using complete sentences. Focus on past tense (went, did, saw). Record yourself if possible.`;
}

