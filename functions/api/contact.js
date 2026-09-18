const SERVICE_LABELS = {
  "web-design": "Web design",
  "automation": "Automation",
  "smart-home": "Smart home",
  "infrastructure": "Web / IT infrastructure",
  "consulting": "Technical consulting",
  "other": "Other"
};

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extra
  }
});

const clean = (value) => String(value ?? "").trim();
const escapeHtml = (value) => clean(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function rateLimited(request) {
  try {
    if (!globalThis.caches?.default) return false;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const key = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const cacheKey = new Request(`https://rate.local/contact/${key}`);
    const hit = await caches.default.match(cacheKey);
    if (hit) return true;
    await caches.default.put(cacheKey, new Response("1", { headers: { "Cache-Control": "max-age=20" } }));
    return false;
  } catch {
    return false;
  }
}

export async function onRequestGet({ env }) {
  if (!env.TURNSTILE_SITE_KEY) return json({ enabled: false, error: "contact_not_configured" }, 503);
  return json({ enabled: true, siteKey: env.TURNSTILE_SITE_KEY });
}

export async function onRequestPost({ request, env }) {
  try {
    const origin = request.headers.get("Origin");
    if (origin && origin !== "https://shtogryn.com") return json({ error: "invalid_origin" }, 403);

    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 16000) return json({ error: "payload_too_large" }, 413);
    if (await rateLimited(request)) return json({ error: "rate_limited" }, 429, { "Retry-After": "20" });

    if (!env.TURNSTILE_SECRET_KEY || !env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
      return json({ error: "contact_not_configured" }, 503);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "invalid_request" }, 400);

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const message = clean(body.message);
    const service = clean(body.service);
    const honeypot = clean(body.website);
    const turnstileToken = clean(body.turnstileToken);

    if (honeypot) return json({ ok: true, delivered: false });
    if (name.length < 2 || name.length > 80) return json({ error: "invalid_name" }, 400);
    if (email.length > 160 || !validEmail(email)) return json({ error: "invalid_email" }, 400);
    if (message.length < 10 || message.length > 3000) return json({ error: "invalid_message" }, 400);
    if (!Object.hasOwn(SERVICE_LABELS, service)) return json({ error: "invalid_service" }, 400);
    if (!turnstileToken) return json({ error: "turnstile_required" }, 400);

    const turnstilePayload = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: turnstileToken
    });
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) turnstilePayload.set("remoteip", ip);

    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: turnstilePayload
    });
    const verdict = await verify.json().catch(() => ({}));
    if (!verify.ok || verdict.success !== true) return json({ error: "turnstile_failed" }, 403);

    const recipient = env.CONTACT_TO_EMAIL || "alex.shtogryn@gmail.com";
    const serviceLabel = SERVICE_LABELS[service];
    const subject = `SHTOGRYN contact — ${serviceLabel}`;

    const brevo = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "SHTOGRYN Website", email: env.BREVO_SENDER_EMAIL },
        to: [{ email: recipient, name: "Oleksandr Shtohryn" }],
        replyTo: { email, name },
        subject,
        textContent: `Name: ${name}\nEmail: ${email}\nService: ${serviceLabel}\n\n${message}`,
        htmlContent: `<h2>New SHTOGRYN contact</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Service:</strong> ${escapeHtml(serviceLabel)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
        tags: ["shtogryn-contact"]
      })
    });

    if (!brevo.ok) {
      console.error("Brevo delivery failed", brevo.status);
      return json({ error: "delivery_failed" }, 502);
    }

    return json({ ok: true, delivered: true, message: "Thank you. Your message has been sent." });
  } catch {
    return json({ error: "request_failed" }, 500);
  }
}
