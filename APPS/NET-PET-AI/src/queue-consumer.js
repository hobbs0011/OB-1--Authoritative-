// CF Queue consumer for net-pet-notifications
// Handles background jobs dequeued from net-pet-notifications

const RESEND_URL = 'https://api.resend.com/emails';
const FROM_ADDR = 'OBI <noreply@naturalenglishtraining.com>';

async function processMessage(msg, env) {
  const body = msg.body;
  switch (body?.type) {
    case 'email': {
      if (!env.RESEND_API_KEY) { msg.ack(); return; }
      try {
        const res = await fetch(RESEND_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_ADDR,
            to: Array.isArray(body.to) ? body.to : [body.to],
            subject: String(body.subject || '').slice(0, 200),
            html: String(body.html || '').slice(0, 10240),
          }),
        });
        if (!res.ok) console.warn('email send failed', res.status);
      } catch (e) {
        console.warn('email send error', e?.message);
      }
      msg.ack();
      break;
    }
    case 'log':
      console.log(JSON.stringify(body));
      msg.ack();
      break;
    default:
      console.warn('unknown queue message type', body?.type);
      msg.ack();
  }
}

export async function handleQueue(batch, env) {
  for (const msg of batch.messages) {
    await processMessage(msg, env);
  }
}
