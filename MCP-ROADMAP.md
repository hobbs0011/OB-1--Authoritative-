# MCP Roadmap & Customer Integration Plan
# Model Context Protocol implementations for NET (Natural English Training)

## Current MCPs (Active)

### 1. Cloudflare Workers ✅
**Status**: Production
**Purpose**: Runtime environment for OBI
**Contact Points**:
- Wrangler CLI
- Durable Objects (LEDGER, SESSIONS, PROFILES, PETS, COMMANDS, MEMORY)
- R2 (asset storage)
- KV (student cache, session data)
- AI Gateway (DeepSeek v3.2 routing)

**Files**:
- `APPS/NET-PET-AI/wrangler.toml`
- `APPS/NET-PET-AI/src/index.js`

---

### 2. GitHub ✅
**Status**: Active
**Purpose**: Version control, PR automation, commit tracking
**Features**:
- Branch protection on main
- Auto-merge for verified PRs
- Copilot integration

**Files**:
- `.github/workflows/`
- `.github/copilot-instructions.md`

---

### 3. Notion ✅
**Status**: Active
**Purpose**: Student progress tracking, lesson metadata, class roster
**Endpoints**:
- Student database
- Lesson library
- Class sections
- Progress tracking

**Files**:
- `APPS/NET-PET-AI/src/notion.js`

---

## Planned MCPs (High Priority)

### 1. NotebookLM 🚀 TOP PRIORITY
**Purpose**: Auto-generate lessons, create study materials, synthesize audio

**Implementation Plan**:
```
Timeline: 2-3 weeks
Complexity: High (API + workflow integration)

Dependencies:
- NotebookLM API key (from customer)
- Lesson template system
- Audio pipeline

Files to Create:
- src/notebooklm-integration.js
- PIPELINE/notebooklm-lesson-generator.md
- OPERATIONS/notebooklm-checkpoint.json (state tracking)

Entry Point:
pwsh -File SCRIPTS/obi.ps1 notebooklm --action generate-lesson --lesson-id <ID>

Workflow:
1. Teacher writes lesson spec → DOCS/lessons/DRAFT/lesson-123.md
2. Trigger: MCP calls NotebookLM API
3. Output: Audio file to R2; metadata to Notion
4. UI: Student unlocks auto-generated content in dashboard
```

**Business Value**:
- 80% reduction in lesson creation time
- Professional audio for every lesson
- Content consistency across regions
- Scaling to 100+ lessons/month

**API Requirements**:
```
POST /api/generate-lesson
{
  "lessonSpec": "string (markdown)",
  "audioLanguage": "en|vi",
  "outputFormat": "mp3|wav",
  "notionPublish": true
}
→ Returns: {audioUrl, notionPageId, metadata}
```

---

### 2. Deepgram 🎤
**Purpose**: Voice STT input, real-time pronunciation feedback, TTS output

**Implementation Plan**:
```
Timeline: 2 weeks
Complexity: Medium (WebSocket + real-time)

Dependencies:
- Deepgram API key
- WebRTC for browser
- Audio buffer management

Files:
- src/voice-engine.js (upgrade existing)
- public/voice-lab.html (upgrade UI)

Entry Points:
- Student speaks → real-time transcription
- OBI responds with TTS + pronunciation feedback
```

---

### 3. Stripe 💳
**Purpose**: Subscription tiers, payment tracking, usage-based billing

**Implementation Plan**:
```
Timeline: 3 weeks
Complexity: High (PCI compliance, webhooks)

Models:
- Tier 1: Free (5 lessons/month)
- Tier 2: Pro ($9.99/month, 50 lessons)
- Tier 3: Premium ($19.99/month, unlimited + 1-on-1)

Webhook Handlers:
- payment_intent.succeeded
- customer.subscription.updated
- customer.subscription.deleted
```

---

### 4. Twilio 📱
**Purpose**: SMS notifications, 2FA, emergency alerts

**Implementation Plan**:
```
Timeline: 1 week
Complexity: Low

Use Cases:
- Lesson reminder: "Your Vietnamese lesson is ready!"
- Progress milestone: "You've completed 10 lessons 🎉"
- Teacher assignment: "New homework from Mr. Quang"
```

---

## Future MCPs (Low Priority)

### 5. Google Sheets API
- Student data export
- Class roster sync
- Attendance tracking

### 6. Slack
- Team notifications
- Teacher alerts
- Support channel integration

### 7. Discord
- Student community chat
- Bot tutoring commands
- Study group coordination

---

## MCP Testing Checklist

For **each new MCP**:
- [ ] API authentication verified
- [ ] Rate limits documented
- [ ] Error handling tested
- [ ] Retry logic implemented
- [ ] Logging/monitoring set up
- [ ] Fallback behavior (what if MCP is down?)
- [ ] Cost estimation (API calls per month)
- [ ] Security audit (API keys, data handling)
- [ ] Documentation written
- [ ] Customer approval

---

## NotebookLM Quick Start

### Setup
```bash
# 1. Get API key from NotebookLM dashboard
echo "NOTEBOOKLM_API_KEY=sk-..." >> .env

# 2. Install client
npm install --save notebooklm-api

# 3. Initialize integration
node scripts/init-notebooklm.js
```

### Example Usage
```javascript
// src/notebooklm-integration.js
import NotebookLM from 'notebooklm-api';

const nlm = new NotebookLM(process.env.NOTEBOOKLM_API_KEY);

async function generateLesson(lessonSpec) {
  const response = await nlm.generateLesson({
    source: lessonSpec,
    audioLanguage: 'vi',
    outputFormat: 'mp3',
  });
  
  // Upload to R2
  await r2.uploadFile(`lessons/${response.id}.mp3`, response.audioBuffer);
  
  // Publish to Notion
  await notion.createLessonPage({
    title: response.title,
    audioUrl: response.publicUrl,
    metadata: response.metadata,
  });
  
  return response;
}
```

---

## MCP Monitoring & Alerts

**Dashboard**: See `OPERATIONS/mcp-health-dashboard.html` (to create)

**Metrics to Track**:
- API response time
- Error rate
- Cost per request
- Rate limit usage
- Uptime %

**Alerting**:
- Slack notification if any MCP down 2+ minutes
- Daily cost report to ops channel
- Monthly usage summary

---

## Cost Estimation

| MCP | Tier | Cost | Notes |
|-----|------|------|-------|
| Cloudflare | Starter | $20/mo | Workers + storage included |
| Notion | Free | $0 | Free plan sufficient |
| GitHub | Pro | $21/mo | Team plan |
| NotebookLM | Enterprise | $500/mo | Estimate (negotiate) |
| Deepgram | Pay-as-you-go | ~$100/mo | 100K minutes/mo |
| Stripe | 2.9% + $0.30/tx | Variable | Payment processing |
| Twilio | Pay-as-you-go | ~$50/mo | SMS only |
| **TOTAL** | | ~$700-900/mo | For full stack |

---

## Priority Matrix

```
HIGH IMPACT, QUICK WIN → NotebookLM (greatest user value)
HIGH IMPACT, COMPLEX  → Stripe (revenue enabler)
MEDIUM IMPACT         → Deepgram (engagement)
LOW IMPACT, EASY      → Twilio (retention)
```

---

## Next Steps

1. **Immediate**: Notify customer about NotebookLM integration possibility
2. **Week 1**: Get NotebookLM API access + documentation
3. **Week 2-3**: Implement & test integration
4. **Week 4**: Deploy to staging, get user feedback
5. **Week 5**: Production rollout with monitoring

---

**Maintained by**: Phoenix Rising Protocol Team  
**Last Updated**: April 16, 2026  
**Status**: ✓ APPROVED FOR IMPLEMENTATION
