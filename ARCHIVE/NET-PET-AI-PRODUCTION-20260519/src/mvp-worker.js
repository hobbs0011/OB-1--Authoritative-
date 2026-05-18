/**
 * NET PET AI — MVP Worker (Cloudflare)
 * Clean, stateless API gateway
 * 
 * Architecture:
 * Chrome Extension → Worker (stateless routing)
 *   ↓
 * Durable Object (1 per student, persistent state)
 *   ↓
 * AI Model (OpenAI/DeepSeek) with OBI prompt
 */

import { StudentDO } from './student-do-v2.js';

const ALLOWED_ORIGINS = [
  "https://naturalenglishtraining.pages.dev",
  "https://naturalenglishtraining.com",
  "chrome-extension://",
  "http://localhost:",
  "http://127.0.0.1:"
];

function corsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.some(a => origin?.startsWith(a));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    try {
      // ROUTES
      if (url.pathname === "/chat") {
        return handleChat(request, env, origin);
      }

      if (url.pathname === "/daily") {
        return handleDaily(request, env, origin);
      }

      if (url.pathname === "/progress") {
        return handleProgress(request, env, origin);
      }

      // NEW: Accountability Network routes
      if (url.pathname.startsWith("/accountability/")) {
        return handleAccountability(request, env, origin);
      }

      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ status: "ok", version: "1.0" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });

    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });
    }
  }
};

/**
 * POST /chat
 * Student sends message → Durable Object processes → AI response
 */
async function handleChat(request, env, origin) {
  const body = await request.json();
  const { studentId, message } = body;

  if (!studentId || !message) {
    return new Response(JSON.stringify({ error: "Missing studentId or message" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }

  // Get Durable Object stub for this student
  const id = env.STUDENT_DO.idFromName(studentId);
  const stub = env.STUDENT_DO.get(id);

  // Forward to DO
  const res = await stub.fetch("https://do.internal/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}

/**
 * POST /daily
 * Get daily task for student
 */
async function handleDaily(request, env, origin) {
  const body = await request.json();
  const { studentId } = body;

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing studentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }

  const id = env.STUDENT_DO.idFromName(studentId);
  const stub = env.STUDENT_DO.get(id);

  const res = await stub.fetch("https://do.internal/daily", {
    method: "POST"
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}

/**
 * GET /progress?studentId=X
 * Get student progress summary
 */
async function handleProgress(request, env, origin) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing studentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }

  const id = env.STUDENT_DO.idFromName(studentId);
  const stub = env.STUDENT_DO.get(id);

  const res = await stub.fetch("https://do.internal/progress", {
    method: "GET"
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}

/**
 * NEW: ACCOUNTABILITY NETWORK ROUTES
 */
async function handleAccountability(request, env, origin) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing studentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }

  const id = env.STUDENT_DO.idFromName(studentId);
  const stub = env.STUDENT_DO.get(id);

  if (url.pathname === "/accountability/register-node" && request.method === "POST") {
    const body = await request.json();
    return stub.fetch(new Request("https://do.internal/accountability/register", {
      method: "POST",
      body: JSON.stringify(body)
    }));
  }

  if (url.pathname === "/accountability/nodes" && request.method === "GET") {
    return stub.fetch(new Request("https://do.internal/accountability/list"));
  }

  if (url.pathname === "/accountability/dashboard" && request.method === "GET") {
    const nodeType = url.searchParams.get("nodeType");
    return stub.fetch(
      new Request(`https://do.internal/accountability/dashboard?nodeType=${nodeType}`)
    );
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}

// Export Durable Object for Cloudflare binding
export { StudentDO };
