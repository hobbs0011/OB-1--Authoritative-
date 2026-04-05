# The Death Star / Cortex Architecture

**Source**: Multi-Agent Session + Gemini Architect
**Status**: Reference Architecture — Production Target

---

## The Cortex: Triad System

The winning path to total system supremacy on the Cloudflare stack.

### 1. THE INTERFACE (Front-End)
- **What**: Lightweight chat UI hosted on Cloudflare Pages
- **Purpose**: Where the Sovereign talks
- **Tech**: React app sending JSON to Worker
- **Example**: `{ "message": "Analyze the sector and deploy drones." }`

### 2. THE ARCHIVE (Knowledge)
- **What**: Cloudflare Vectorize
- **Purpose**: 6 months of documents turned into searchable "brain"
- **Embedding Model**: `@cf/baai/bge-base-en-v1.5`
- **Vector DB**: `phoenix-archive` (768 dimensions, cosine metric)
- **Creation**: `npx wrangler vectorize create phoenix-archive --dimensions=768 --metric=cosine`

### 3. THE NEXUS (Command)
- **What**: Worker running Llama-3 via Workers AI
- **Purpose**: The router/brain
- **Logic**:
  - Question → Queries The Archive (RAG)
  - Command → Signals Bot Durable Objects
- **Config**: `[ai] binding = "AI"` in wrangler.toml
- **Function Calling**: Llama-3 has tools: `deploy_bot`, `search_archive`

---

## Data Ingestion Pipeline

The "Librarian" worker (`src/ingest.ts`):
1. Takes text documents
2. Converts to vectors using `@cf/baai/bge-base-en-v1.5`
3. Stores in `phoenix-archive` (Vectorize)

**Document Formats Supported**:
- Text/PDF files from local folders
- Google Docs/Drive exports
- JSON exports

---

## Production Stack (Current)

| Component | Service | Purpose |
|-----------|---------|--------|
| Runtime | Cloudflare Workers (`net-pet-ai`) | Edge compute |
| State | Durable Objects | Real-time session state |
| Database | D1 (SQLite) | Student profiles, ledger |
| Cache | KV | Rate limiting |
| Storage | R2 | Audio assets, evidence manifests |
| AI Brain | DeepSeek (`/api/chat`) | Primary AI inference |
| Voice | Deepgram Aura 2 TTS (`aura-2-orion-en`) | Text-to-speech |
| Vectors | Vectorize | Document search (planned) |
| AI Alt | Workers AI (Llama-3) | Secondary AI / routing |

---

## Infrastructure-First Directive

> "Don't put the cart before the horse."

No data mining until the infrastructure exists to hold it. Sequence:
1. Set up Codex + Magic Chat in GitHub Codespaces
2. Connect to production Cloudflare stack
3. THEN begin data ingestion and mining

---

## New Tool: NotebookLM

- Superior to Google Spaces for project mapping and document consolidation
- Supports audio podcast generation
- Added to tech stack as consolidation/mapping tool
- Used to generate the 95-source OPERATION PHOENIX RISE IMMORTALIZE compilation

---

## AI Blindness Failure Analysis

**Issue**: 5 different AIs auditing over 20+ hours failed to identify that Codex could write directly to GitHub.
**Impact**: Michael had to discover the capability independently.
**Correction**: Future protocols must aggressively audit for direct integration paths rather than assuming limitations.
**Rule**: NEVER say "you can't" without triple-checking. The Kenneth Filter applies to assumptions too.
