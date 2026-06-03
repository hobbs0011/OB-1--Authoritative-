// Email service — Resend API via ctx.waitUntil (non-blocking)
// Guard: if RESEND_API_KEY is unset, all calls silently skip

const RESEND_URL = 'https://api.resend.com/emails';
const FROM_ADDR = 'OBI <noreply@naturalenglishtraining.com>';

async function _sendViaResend(apiKey, { to, subject, html }) {
  return fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDR,
      to: Array.isArray(to) ? to : [to],
      subject: String(subject).slice(0, 200),
      html: String(html).slice(0, 10240),
    }),
  });
}

// sendNotification: fire-and-forget via ctx.waitUntil — never blocks response
export function sendNotification(env, ctx, { to, subject, html }) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  ctx.waitUntil(_sendViaResend(env.RESEND_API_KEY, { to, subject, html }).catch(() => {}));
  return { queued: true };
}

// queueEmail: enqueue to CF Queue for async consumer processing
export async function queueEmail(env, { to, subject, html }) {
  if (!env.net_pet_notifications) return { skipped: true };
  await env.net_pet_notifications.send({ type: 'email', to, subject, html });
  return { queued: true };
}
