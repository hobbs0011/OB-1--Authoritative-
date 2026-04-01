/**
 * net-core Worker
 *
 * Minimal, safe-by-default HTTP surface.
 *
 * Endpoints:
 * - GET /health
 * - POST /api/command  (stub: rejects by default until schema + auth wired)
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)

		if (request.method === "GET" && url.pathname === "/health") {
			return new Response(
				JSON.stringify({
					ok: true,
					service: "net-core",
					ts: new Date().toISOString(),
					env: env?.ENV ?? "unknown"
				}),
				{
					status: 200,
					headers: {
						"content-type": "application/json; charset=utf-8",
						// Fingerprint header for proof-of-life
						"x-net-core": "alive"
					}
				}
			)
		}

		if (request.method === "POST" && url.pathname === "/api/command") {
			// Fail-closed until auth + schema validation is implemented.
			return new Response(
				JSON.stringify({
					ok: false,
					error: "LOCKED",
					message: "Command endpoint is disabled until confirmation gates are wired."
				}),
				{ status: 423, headers: { "content-type": "application/json; charset=utf-8" } }
			)
		}

		return new Response("Not Found", { status: 404 })
	}
}
