import { Resend } from "resend";

interface Env {
  RESEND_API_KEY?: string;
  resend_key?: string;
}

type ContactPayload = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  honeypot?: string;
  page?: string;
};

const CONTACT_PATH = "/api/contact";
const MAX_CONTENT_LENGTH = 16_384;
const MAX_FIELD_LENGTH = {
  name: 120,
  email: 254,
  topic: 100,
  message: 5_000,
  page: 512,
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_ORIGINS = new Set([
  "https://ozehr.com",
  "https://www.ozehr.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:9000",
  "http://127.0.0.1:9000",
]);

function normalize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getAllowedOrigin(originHeader: string | null): string | null {
  if (!originHeader) return null;
  return ALLOWED_ORIGINS.has(originHeader) ? originHeader : null;
}

function getCorsHeaders(origin: string | null): HeadersInit {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(payload: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders(origin),
    },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function allowIpRequest(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return false;
  }

  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return true;
}

function validatePayload(payload: ContactPayload): { ok: true; value: Required<ContactPayload> } | { ok: false; error: string } {
  const name = normalize(payload.name);
  const email = normalize(payload.email).toLowerCase();
  const topic = normalize(payload.topic);
  const message = normalize(payload.message);
  const honeypot = normalize(payload.honeypot);
  const page = normalize(payload.page);

  if (!name || !email || !topic || !message) {
    return { ok: false, error: "missing_required_fields" };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "invalid_email" };
  }

  if (name.length > MAX_FIELD_LENGTH.name) return { ok: false, error: "name_too_long" };
  if (email.length > MAX_FIELD_LENGTH.email) return { ok: false, error: "email_too_long" };
  if (topic.length > MAX_FIELD_LENGTH.topic) return { ok: false, error: "topic_too_long" };
  if (message.length > MAX_FIELD_LENGTH.message) return { ok: false, error: "message_too_long" };
  if (page.length > MAX_FIELD_LENGTH.page) return { ok: false, error: "page_too_long" };

  return {
    ok: true,
    value: {
      name,
      email,
      topic,
      message,
      honeypot,
      page,
    },
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const originHeader = request.headers.get("Origin");
    const allowedOrigin = getAllowedOrigin(originHeader);
    const url = new URL(request.url);

    if (url.pathname !== CONTACT_PATH) {
      return json({ ok: false, error: "not_found" }, 404, allowedOrigin);
    }

    if (request.method === "OPTIONS") {
      if (originHeader && !allowedOrigin) {
        return json({ ok: false, error: "origin_not_allowed" }, 403, null);
      }
      return new Response(null, { status: 204, headers: getCorsHeaders(allowedOrigin) });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, allowedOrigin);
    }

    if (originHeader && !allowedOrigin) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, null);
    }

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH) {
      return json({ ok: false, error: "payload_too_large" }, 413, allowedOrigin);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return json({ ok: false, error: "unsupported_content_type" }, 415, allowedOrigin);
    }

    const senderIp = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!allowIpRequest(senderIp)) {
      return json({ ok: false, error: "rate_limited" }, 429, allowedOrigin);
    }

    const apiKey = env.RESEND_API_KEY || env.resend_key;
    if (!apiKey) {
      return json({ ok: false, error: "missing_resend_api_key" }, 500, allowedOrigin);
    }

    let rawPayload: ContactPayload;
    try {
      rawPayload = (await request.json()) as ContactPayload;
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400, allowedOrigin);
    }

    const validation = validatePayload(rawPayload);
    if (!validation.ok) {
      return json({ ok: false, error: validation.error }, 400, allowedOrigin);
    }

    const payload = validation.value;

    // Silent success for honeypot hits to reduce spam bot feedback loops.
    if (payload.honeypot) {
      return json({ ok: true, messageId: "ignored-honeypot" }, 200, allowedOrigin);
    }

    const resend = new Resend(apiKey);
    const submittedAt = new Date().toISOString();
    const safe = {
      name: escapeHtml(payload.name),
      email: escapeHtml(payload.email),
      topic: escapeHtml(payload.topic),
      message: escapeHtml(payload.message).replaceAll("\n", "<br/>"),
      page: escapeHtml(payload.page || "unknown"),
      submittedAt: escapeHtml(submittedAt),
      senderIp: escapeHtml(senderIp),
    };

    const html = `
      <h2>New OzEHR Contact Request</h2>
      <p><strong>Name:</strong> ${safe.name}</p>
      <p><strong>Email:</strong> ${safe.email}</p>
      <p><strong>Topic:</strong> ${safe.topic}</p>
      <p><strong>Page:</strong> ${safe.page}</p>
      <p><strong>Submitted At:</strong> ${safe.submittedAt}</p>
      <p><strong>IP:</strong> ${safe.senderIp}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${safe.message}</p>
    `;

    const text =
      `New OzEHR Contact Request\n\n` +
      `Name: ${payload.name}\n` +
      `Email: ${payload.email}\n` +
      `Topic: ${payload.topic}\n` +
      `Page: ${payload.page || "unknown"}\n` +
      `Submitted At: ${submittedAt}\n` +
      `IP: ${senderIp}\n\n` +
      `Message:\n${payload.message}\n`;

    try {
      const { data, error } = await resend.emails.send({
        from: "contact@ozehr.com",
        to: ["contact@ozehr.com"],
        replyTo: payload.email,
        subject: `OzEHR Contact: ${payload.topic}`,
        html,
        text,
      });

      if (error) {
        return json({ ok: false, error: "send_failed" }, 502, allowedOrigin);
      }

      return json({ ok: true, messageId: data?.id || "sent" }, 200, allowedOrigin);
    } catch {
      return json({ ok: false, error: "send_failed" }, 502, allowedOrigin);
    }
  },
};
