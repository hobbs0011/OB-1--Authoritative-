# Docker + GitKraken Workflow for NET-PET-AI

## Full Stack Setup

### Prerequisites
- Docker & Docker Compose installed
- GitKraken CLI (`gk`) installed (`winget install gitkraken.cli`)
- Node.js 20+ (for local fallback)
- Wrangler CLI 4.59+ (`npm install -g wrangler`)

---

## Workflow 1: Local Development with Docker

### Step 1: Start the stack

```bash
cd APPS/NET-PET-AI
docker-compose up
```

This launches:
- **net-pet-ai**: Wrangler dev server on `http://localhost:8787`
- **webhook**: Mock webhook receiver on `http://localhost:3000`

### Step 2: Test locally

```bash
# Health check
curl http://localhost:8787/api/health

# Test webhook mock
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","ts":"2026-04-14T00:00:00Z"}'
```

### Step 3: View logs

```bash
docker-compose logs -f net-pet-ai
docker-compose logs -f webhook
```

### Step 4: Stop

```bash
docker-compose down
```

---

## Workflow 2: Multi-Repo Work Item (GitKraken)

### Step 1: Create work item across repos

```bash
# In OB-1 root
gk work create "NET-PET-AI: Add phoneme engine feature"

# Add APPS/NET-PET-AI
gk work add ./APPS/NET-PET-AI

# See what's included
gk work status
```

### Step 2: Start the stack while editing

```bash
cd APPS/NET-PET-AI
docker-compose up --detach
```

### Step 3: Make changes across any files in the work item

```bash
# Edit src/index.js, src/phoneme-engine.js, etc.
# Changes are automatically tracked by gk
```

### Step 4: Commit with AI

```bash
gk work commit --ai
```

GitKraken will generate a professional commit message automatically.

### Step 5: Review before push

```bash
gk work diff  # See all changes across repos
gk work status  # See files modified
```

### Step 6: Push to branch

```bash
gk work push
```

This creates/updates the branch on GitHub. Then open a PR manually or via:

```bash
gk work pr create --ai
```

---

## Workflow 3: Test → Deploy → Production

### Local → Staging

```bash
# In NET-PET-AI root with docker-compose running
npm run verify:wrangler

# If all green:
cd ../..  # back to OB-1 root
gk work push origin copilot/test-staging
```

### Staging → Production

```bash
# After approval, merge to main on GitHub
# or:
git checkout main
git merge copilot/test-staging
git push origin main

# GitHub Actions workflow triggers:
# .github/workflows/deploy-net-pet-ai.yml
# → wrangler deploy → live on .workers.dev
```

---

## Troubleshooting

### Docker won't start

```bash
docker-compose logs net-pet-ai
# Check for port conflicts (8787) or Node module issues
```

### Wrangler dev fails in container

```bash
# Rebuild without cache
docker-compose build --no-cache net-pet-ai
docker-compose up
```

### Changes not reflecting

```bash
# Wrangler dev watches local /app
# Ensure volumes are mounted:
docker-compose exec net-pet-ai ls -la src/
```

### Webhook mock not receiving

```bash
# From host machine (not in container):
curl -X POST http://localhost:3000/health
# Should return { ok: true, service: 'webhook-mock' }
```

---

## Reference Commands

```bash
# Build image only
docker build -t net-pet-ai-dev .

# Run without compose (single container)
docker run -it --rm -p 8787:8787 -v $(pwd):/app net-pet-ai-dev

# Exec into running container
docker-compose exec net-pet-ai bash

# Clean up everything
docker-compose down -v
docker system prune -a

# View real-time stats
docker stats net-pet-ai
```

---

## Architecture Summary

```
┌─────────────────────────────────────────┐
│  Host Machine                           │
│  ├─ gk work (multi-repo orchestration)  │
│  └─ Docker Compose                      │
│      ├─ net-pet-ai (Wrangler dev)       │
│      └─ webhook (mock receiver)         │
└─────────────────────────────────────────┘
         ↓ (after commit + push)
┌─────────────────────────────────────────┐
│  GitHub                                 │
│  ├─ PR → Code Review                    │
│  └─ Merge → Actions Trigger             │
└─────────────────────────────────────────┘
         ↓ (after Actions pass)
┌─────────────────────────────────────────┐
│  Cloudflare Workers (Production)        │
│  - net-pet-ai.naturalenglishtraining    │
│    .workers.dev                         │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. **Add MCP integration** (gk mcp) for AI workflows
2. **Add e2e tests** in Dockerfile (Playwright)
3. **Add monitoring** (Prometheus metrics export)
4. **Link to Notion** for session logging
5. **Add GitKraken Insights** dashboard
