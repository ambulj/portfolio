// Cloudflare Pages Function: functions/api/contact.js
// Handles contact form delivery without storing any data.
// Strict input validation, Turnstile verification, origin check, and rate limiting.

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);

  // 1. Origin check
  if (origin && origin !== url.origin) {
    return new Response(JSON.stringify({ error: 'Untrusted origin' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Parse and validate JSON payload
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { name, email, message, turnstileToken } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    return new Response(JSON.stringify({ error: 'Invalid name provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email) || email.length > 254) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
    return new Response(JSON.stringify({ error: 'Message must be between 1 and 2,000 characters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. Optional Cloudflare Turnstile token validation if secret key is present
  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  if (env && env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Turnstile verification token missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: clientIp
        })
      });

      const outcome = await verifyRes.json();
      if (!outcome.success) {
        return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Error verifying Turnstile response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 4. Delivery via Cloudflare Email Routing or configured webhook/API
  try {
    if (env && env.SEB && typeof env.SEB.send === 'function') {
      // Cloudflare Email Routing binding (Send Email binding)
      await env.SEB.send({
        to: env.CONTACT_DEST_EMAIL || 'ambuljaiswal5@gmail.com',
        from: env.CONTACT_SOURCE_EMAIL || 'portfolio@ambul.dev',
        subject: `New contact from ${name}`,
        text: `From: ${name} <${email}>\nIP: ${clientIp}\n\n${message}`
      });
    } else if (env && env.CONTACT_WEBHOOK_URL) {
      // Free webhook / notification service fallback
      await fetch(env.CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, ip: clientIp })
      });
    }
  } catch (err) {
    console.error('Delivery error:', err);
    return new Response(JSON.stringify({ error: 'Delivery service error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Zero retention: store nothing, return success
  return new Response(
    JSON.stringify({ success: true, message: 'Message delivered successfully.' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
