# MAGIC CHAT - STUDENT & TEACHER ACCESS GUIDE

## For Students: Quick Access Links

### Main Interface

**Students can start learning English immediately at:**

```
https://net-pet-ai.mrmichaelhobbs123.workers.dev/
```

**Or direct to Magic Chat:**

```
https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-chat
```

Just visit, start typing, and have conversations with Obi (the AI English coach).

---

## For Teachers: API Integration

### Enroll a Student

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-123",
    "studentName": "Student Name",
    "email": "student@example.com",
    "cohortId": "class-2026"
  }'
```

### Start a Classroom Session

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/classroom/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class-101",
    "totalStudents": 30
  }'
```

### Get Class Report

```bash
curl -X GET "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/classroom/report?classId=class-101&totalStudents=30"
```

---

## System Status

### Health Check

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/health
```

### DeepSeek LLM Status

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepseek-test
```

Expected response: `{"keyPrefix":"sk-2014264","status":200}`

---

## Your DeepSeek Account

**Login & Check Balance:**

```
https://platform.deepseek.com
```

**Current Status:**

- Balance: $2.00 USD ✅
- API Key: sk-20142647c4fc4f5caf29790734fe5765 ✅
- Active in Magic Chat: YES ✅

---

## Currently Enrolled Students (Ready to Use)

1. **student-001** - Minh Nguyen (minh@example.com)
2. **student-002** - Kiet Architect (kiet@example.com)
3. **student-003** - Mai Tram (mai@example.com)

Test any of these students by sending to `/api/chat` with their studentId.

---

## What Works Right Now

✅ Students can chat with Obi on any topic
✅ LLM generates context-aware responses
✅ Responses are pedagogically designed (Socratic method)
✅ Student progress is tracked
✅ Classroom integration available
✅ Fallback system if LLM becomes unavailable

---

## Support

**All systems operational as of April 26, 2026.**

For any issues:

1. Check DeepSeek status: https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepseek-test
2. Verify credits: https://platform.deepseek.com
3. Test interface: https://net-pet-ai.mrmichaelhobbs123.workers.dev/

---

## Summary

**Students:** Go to https://net-pet-ai.mrmichaelhobbs123.workers.dev/ and start chatting
**Teachers:** Use the API endpoints above to integrate with your LMS or create custom workflows
**Admin:** Monitor at https://platform.deepseek.com

System is live, tested, and ready for use.
