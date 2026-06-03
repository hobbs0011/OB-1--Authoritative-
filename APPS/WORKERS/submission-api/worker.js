export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const origin = req.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin':
        origin && (origin.endsWith('.pages.dev') || origin.includes('localhost'))
          ? origin
          : '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (method === 'POST' && url.pathname === '/api/submit') {
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Support both field names
      const ref = body.submissionReference || body.ref || '';
      const refPattern = /^NET-(TIG|PRO)-\d{8}-[A-Z0-9]{6}$/;
      if (!refPattern.test(ref)) {
        return new Response(JSON.stringify({ error: 'Invalid reference format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const studentName =
        body.rooms?.room1?.name ||
        body.rooms?.room1?.fullName ||
        body.rooms?.room1?.studentName ||
        'Unknown';

      const assessment  = body.assessment  || '';
      const ageGroup    = body.ageGroup    || body.age_group || '';
      const submittedAt = body.submittedAt || new Date().toISOString();
      const payload     = JSON.stringify(body);

      // D1 — ensure table exists then insert
      try {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS submissions (
            ref TEXT PRIMARY KEY,
            assessment TEXT,
            age_group TEXT,
            student_name TEXT,
            submitted_at TEXT,
            payload TEXT,
            created_at TEXT DEFAULT (datetime('now'))
          )`
        ).run();
        await env.DB.prepare(
          `INSERT OR REPLACE INTO submissions
           (ref, assessment, age_group, student_name, submitted_at, payload)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(ref, assessment, ageGroup, studentName, submittedAt, payload).run();
      } catch (e) {
        console.error('D1 insert failed:', e);
      }

      // Resend email
      if (env.RESEND_API_KEY) {
        const magicLink = `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/magic-chat.html?studentId=prospect-${studentName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${ref.slice(-6).toLowerCase()}&taster=1`;
        const emailBody = {
          from: 'OBI <noreply@naturalenglishtraining.com>',
          to: ['mrmichaelhobbs123@gmail.com'],
          subject: `New ${assessment} Assessment — ${studentName} (${ref})`,
          html: `
            <h2>New Assessment Submission</h2>
            <table style="border-collapse:collapse;font-family:sans-serif">
              <tr><td style="padding:4px 12px;color:#888">Student</td><td style="padding:4px 12px"><strong>${studentName}</strong></td></tr>
              <tr><td style="padding:4px 12px;color:#888">Assessment</td><td style="padding:4px 12px">${assessment}</td></tr>
              <tr><td style="padding:4px 12px;color:#888">Age Group</td><td style="padding:4px 12px">${ageGroup}</td></tr>
              <tr><td style="padding:4px 12px;color:#888">Reference</td><td style="padding:4px 12px"><code>${ref}</code></td></tr>
              <tr><td style="padding:4px 12px;color:#888">Submitted</td><td style="padding:4px 12px">${submittedAt}</td></tr>
            </table>
            <p style="margin-top:20px">
              <a href="${magicLink}" style="background:#a855f7;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
                Open OBI Taster →
              </a>
            </p>
          `,
        };
        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailBody),
          });
          if (!r.ok) console.error('Resend error:', r.status, await r.text());
        } catch (e) {
          console.error('Resend fetch failed:', e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, reference: ref, message: 'Submission received. Michael will contact you within 24 hours.' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (method === 'GET' && url.pathname === '/api/submissions') {
      try {
        const result = await env.DB.prepare('SELECT COUNT(*) as cnt FROM submissions').first();
        return new Response(JSON.stringify({ count: result?.cnt || 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ count: 0, error: String(e) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
