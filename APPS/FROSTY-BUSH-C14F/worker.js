// frosty-bush-c14f — Phoenix Vault (Google Docs OAuth writer)
// Rescued from Cloudflare Workers 2026-05-18
// STATUS: SUPERSEDED by soul-logger. Early soul-DNA capture tool.
// Writes content to a Google Doc via OAuth. Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
// GOOGLE_REDIRECT_URI, PHOENIX_KV
// Endpoints: GET /auth/login, GET /auth/callback, POST /vault/scoop

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/auth/login") {
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file",
      access_type: "offline",
      prompt: "consent"
    });
    return Response.redirect(googleAuthUrl, 302);
  }

  if (url.pathname === "/auth/callback") {
    const code = url.searchParams.get("code");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });
    const tokens = await tokenResponse.json();
    if (tokens.refresh_token) {
      await PHOENIX_KV.put("MASTER_REFRESH_TOKEN", tokens.refresh_token);
      return new Response("SOVEREIGN AUTHENTICATED.");
    }
    return new Response("AUTH SUCCESSFUL.");
  }

  if (request.method === "POST" && url.pathname === "/vault/scoop") {
    const { content, docId } = await request.json();
    const refreshToken = await PHOENIX_KV.get("MASTER_REFRESH_TOKEN");
    const tRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });
    const { access_token } = await tRes.json();
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: content + "\n\n" } }] })
    });
    return new Response(res.ok ? "DNA SAVED" : "VAULT ERROR");
  }

  return new Response("PHOENIX VAULT ONLINE.");
}
