// art-arsenal.html is served via --assets ./static in wrangler deploy
// This file re-exports the fetch handler for the route binding in index.js
// The static HTML is picked up by wrangler's assets middleware

export async function handleArtArsenal(request, env) {
  const url = new URL(request.url);
  // If the request is /art-arsenal, serve static/art-arsenal.html
  // Wrangler's --assets flag handles this automatically when the route matches
  // But since our router intercepts it in index.js, we forward to the static file
  const staticReq = new Request(url.origin + '/static/art-arsenal.html', request);
  return env.ASSETS.fetch(staticReq);
}
