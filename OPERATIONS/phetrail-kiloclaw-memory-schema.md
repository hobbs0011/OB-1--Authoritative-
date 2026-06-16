# PHEROMONE TRAIL — KILOCLAW MEMORY SQLITE SCHEMA
**Date:** 2026-06-17T00:42 ICT
**Strength: 80/100** | Type: RECON — agent memory database schema

---

## §1 MEMORY DATABASE SCHEMA

**Path:** `C:\Users\mrmic\.openclaw\memory\main.sqlite`

### Tables:
1. **meta** — metadata key-value store
   - Columns: key (PK), value

2. **files** — memory file registry
   - Columns: path (PK), source, hash, mtime, size

3. **chunks** — embedded text chunks for semantic search
   - Columns: id (PK), path, source, start_line, end_line, hash, model, text, embedding, updated_at
   - Indexes: path, source

4. **embedding_cache** — cached embeddings
   - Columns: provider, model, provider_key, hash, embedding, dims, updated_at
   - PK: (provider, model, provider_key, hash)

5. **chunks_fts** — FTS5 full-text search virtual table
   - Columns: text, id, path, source, model, start_line, end_line

**Assessment:** KiloClaw uses semantic memory with vector embeddings + FTS5 search. Memory is chunked, embedded, and searchable. This is the agent's long-term memory system.

**Key insight:** The memory system uses embeddings for semantic search — this is how KiloClaw "remembers" and retrieves relevant context.

---

## §2 FLAGS

1. **KILOCLAW_MEMORY_SCHEMA_MAPPED** — full schema captured
2. **KILOCLAW_SEMANTIC_MEMORY** — FTS5 + embeddings for search
3. **KILOCLAW_MEMORY_CHUNKING** — text split into chunks with line tracking

---

`KILOCLAW MEMORY SCHEMA SEALED — 2026-06-17T00:42 ICT | 5 TABLES | SEMANTIC SEARCH | EMBEDDING CACHE | FTS5 FULL-TEXT`
