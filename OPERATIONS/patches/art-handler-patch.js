import { checkAdminKey } from "./security.js";

export async function handleArt(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "POST" && path === "/api/art") {
        try {
            const body = await request.json();
            const { title, artist, style, description, tags, url, notes } = body;

            if (!title) {
                return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
            }

            const id = `ART-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const added_at = new Date().toISOString();

            await env.DB.prepare(`CREATE TABLE IF NOT EXISTS art_registry (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT,
                style TEXT,
                description TEXT,
                tags TEXT,
                url TEXT,
                notes TEXT,
                added_at TEXT
            )`).run();

            await env.DB.prepare(`INSERT INTO art_registry (id, title, artist, style, description, tags, url, notes, added_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, title, artist, style, description, tags, url, notes, added_at).run();

            return new Response(JSON.stringify({ id, title, added_at }), { status: 201 });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
    }

    if (method === "GET" && path === "/api/art") {
        try {
            const q = url.searchParams.get("q");
            let stmt;

            if (q) {
                stmt = env.DB.prepare(`SELECT * FROM art_registry WHERE title LIKE ? OR description LIKE ? OR tags LIKE ? ORDER BY added_at DESC`)
                    .bind(`%${q}%`, `%${q}%`, `%${q}%`);
            } else {
                stmt = env.DB.prepare(`SELECT * FROM art_registry ORDER BY added_at DESC`);
            }

            const rows = await stmt.all();
            return new Response(JSON.stringify({ count: rows.results.length, pieces: rows.results }));

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
    }

    if (method === "GET" && path.startsWith("/api/art/")) {
        try {
            const id = path.split("/").pop();
            const row = await env.DB.prepare(`SELECT * FROM art_registry WHERE id=?`).bind(id).all();

            if (row.results.length === 0) {
                return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
            }

            return new Response(JSON.stringify(row.results[0]));

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
    }

    if (method === "DELETE" && path.startsWith("/api/art/")) {
        try {
            const id = path.split("/").pop();
            const isAdmin = await checkAdminKey(request, env);

            if (!isAdmin) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
            }

            await env.DB.prepare(`DELETE FROM art_registry WHERE id=?`).bind(id).run();
            return new Response(JSON.stringify({ deleted: id }));

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
}
