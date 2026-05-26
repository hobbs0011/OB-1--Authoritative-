// Main Cloudflare Worker API Gateway
// Routes requests to appropriate endpoints

declare global {
  interface Env {
    STUDENT_DO: DurableObjectNamespace;
    OPENAI_API_KEY: string;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // ROUTE: /chat (main learning loop)
      if (pathname === "/chat" && request.method === "POST") {
        return await handleChat(request, env);
      }

      // ROUTE: /daily (task generator)
      if (pathname === "/daily" && request.method === "POST") {
        return await handleDaily(request, env);
      }

      // ROUTE: /progress (performance tracking)
      if (pathname === "/progress" && request.method === "GET") {
        return await handleProgress(request, env);
      }

      // ROUTE: /init (student initialization)
      if (pathname === "/init" && request.method === "POST") {
        return await handleInit(request, env);
      }

      // ROUTE: /health (heartbeat)
      if (pathname === "/health" && request.method === "GET") {
        return new Response(
          JSON.stringify({ status: "ok", timestamp: Date.now() }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Default 404
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};

// =========== ROUTE HANDLERS ===========

async function handleChat(request: Request, env: Env): Promise<Response> {
  const { student_id, message } = await request.json();

  if (!student_id || !message) {
    return new Response(
      JSON.stringify({ error: "Missing student_id or message" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get Durable Object for this student
  const id = env.STUDENT_DO.idFromName(student_id);
  const stub = env.STUDENT_DO.get(id);

  // Proxy to DO
  const response = await stub.fetch("http://local/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handleDaily(request: Request, env: Env): Promise<Response> {
  const { student_id } = await request.json();

  if (!student_id) {
    return new Response(
      JSON.stringify({ error: "Missing student_id" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = env.STUDENT_DO.idFromName(student_id);
  const stub = env.STUDENT_DO.get(id);

  const response = await stub.fetch("http://local/daily", {
    method: "POST",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handleProgress(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const student_id = url.searchParams.get("student_id");

  if (!student_id) {
    return new Response(
      JSON.stringify({ error: "Missing student_id query param" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = env.STUDENT_DO.idFromName(student_id);
  const stub = env.STUDENT_DO.get(id);

  const response = await stub.fetch("http://local/progress", {
    method: "GET",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handleInit(request: Request, env: Env): Promise<Response> {
  const { student_id, level, name } = await request.json();

  if (!student_id) {
    return new Response(
      JSON.stringify({ error: "Missing student_id" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = env.STUDENT_DO.idFromName(student_id);
  const stub = env.STUDENT_DO.get(id);

  const response = await stub.fetch("http://local/init", {
    method: "POST",
    body: JSON.stringify({ student_id, level: level || "A1", name }),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
