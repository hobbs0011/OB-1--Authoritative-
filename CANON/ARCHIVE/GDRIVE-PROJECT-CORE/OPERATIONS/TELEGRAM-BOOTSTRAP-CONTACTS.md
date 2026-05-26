// OPERATIONS/TELEGRAM-BOOTSTRAP-CONTACTS.md
# Telegram Bootstrap — Contact Configuration

**Status:** AWAITING SOVEREIGN INPUT  
**Date:** 2026-04-19  
**Trigger:** User command: "execute all → bypass zalo: telegram instead"

---

## Required Contacts (for immediate bootstrap execution)

### 1. BlueTech Boss/CEO

**Role:** Enterprise Sponsor (God View ROI Dashboard)  
**Students Under:** Mai Tram, Quy (Nguyễn Thị Thu Quy), Huong Ho  
**Dashboard Access:** Boss-only view of all 3 employees' daily 45/15 compliance

**Required Info:**
- [ ] Telegram Chat ID (numeric, e.g., `-1001234567890`)
- [ ] Primary contact name (for audit log)
- [ ] Backup contact (if primary unavailable)

**To Get Telegram ID:**
1. Message bot: `/start` → Get your chat ID
2. Forward to Michael: "My Telegram ID is: [ID]"

---

### 2. Minh's Mother (Ms. Dung / Michelle Tran)

**Role:** Parent Sponsor (Parent Dashboard + Lesson Assignment)  
**Student:** Minh (Age 5)  
**Dashboard Access:** Parent-only view; can assign 3 pre-approved lesson packs; streak monitoring

**Required Info:**
- [ ] Telegram Chat ID (numeric)
- [ ] Confirmation of Vietnamese phone format (if SMS backup needed)
- [ ] Preferred contact time (morning/evening Ho Chi Minh time)

**To Get Telegram ID:**
Same as BlueTech boss above

---

## Bootstrap Message Templates

### Message 1: BlueTech Boss
**Payload Type:** God View ROI Dashboard  
**Content:** 3 employee profiles + live dashboard link + login token  
**Frequency:** Once (upon activation)  
**Follow-up:** Email with detailed dashboard guide

**Message 2: Minh's Mother**
**Payload Type:** Parent Dashboard + Teaching Proof  
**Content:** Parent dashboard link + raw transcripts proving teaching methodology  
**Frequency:** Once (upon activation)  
**Follow-up:** 7-day check-in call from Michael

---

## Execution Readiness Checklist

- [ ] BlueTech boss Telegram ID acquired
- [ ] Ms. Dung Telegram ID acquired
- [ ] Telegram bot token configured in worker environment (`TELEGRAM_BOT_TOKEN`)
- [ ] Dashboard token generation tested
- [ ] Message templates validated (HTML parse mode)
- [ ] Fallback to simulation mode if token missing
- [ ] Audit log ready to record message send timestamp + delivery status

---

## One-Click Deploy (once contacts provided)

```bash
# Set contact IDs in environment or config
export TELEGRAM_BLUETECH_BOSS_ID="<chat_id>"
export TELEGRAM_MINH_MOTHER_ID="<chat_id>"

# Run bootstrap
node SCRIPTS/telegram-bootstrap-execute.mjs

# Monitor execution log
tail -f OPERATIONS/telegram-bootstrap-log.json
```

---

## Fallback: Simulation Mode

If `TELEGRAM_BOT_TOKEN` is not set, the system runs in simulation mode:
- Messages logged to console (not sent)
- Dashboard tokens still generated
- Marked as "SIMULATED" in audit trail
- Ready to re-execute with real token once provided

---

## Next Steps

**Awaiting Sovereign Authorization:**

1. Provide BlueTech boss Telegram ID
2. Provide Ms. Dung Telegram ID
3. Either: Deploy live (with real token) OR run simulation (audit trail)
4. Activate accountability dashboards upon message delivery

**Status: LOCKED AND READY.**
