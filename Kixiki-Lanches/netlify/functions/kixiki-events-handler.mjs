export const EVENT_STORE_NAME = "digitalmas-c001-events";
export const EVENT_STORE_PREFIX = "c001/kixiki/referral-mvp-v1";
export const EVENT_MAX_BODY_BYTES = 4_096;
export const PUBLIC_EVENT_NAMES = Object.freeze([
  "page_view",
  "whatsapp_click",
  "gift_view",
  "gift_cta_click",
]);

const INPUT_KEYS = Object.freeze([
  "event",
  "path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer",
]);

const json = (body, status = 200, extraHeaders = {}) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });

const sameOrigin = (request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
};

const cleanToken = (value) => {
  if (typeof value !== "string") return null;
  const token = value.trim().slice(0, 80);
  return token && /^[a-zA-Z0-9._-]+$/.test(token) ? token : null;
};

const cleanPath = (value) => {
  if (typeof value !== "string") return "/";
  const path = value.trim().slice(0, 180);
  return path.startsWith("/") && !/[?#]/.test(path) ? path : "/";
};

const cleanReferrer = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 240);
  } catch {
    return null;
  }
};

export const eventPrefixFor = (runtime = {}) =>
  `${EVENT_STORE_PREFIX}/${runtime.deployContext === "production" ? "production" : "preview"}/events/`;

const validateBody = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Formato inválido" };
  }
  const unknownKey = Object.keys(body).find((key) => !INPUT_KEYS.includes(key));
  if (unknownKey) return { ok: false, error: `Campo não permitido: ${unknownKey}` };
  if (!PUBLIC_EVENT_NAMES.includes(body.event)) {
    return { ok: false, error: "Evento não permitido" };
  }
  return {
    ok: true,
    data: {
      event: body.event,
      path: cleanPath(body.path),
      utm_source: cleanToken(body.utm_source),
      utm_medium: cleanToken(body.utm_medium),
      utm_campaign: cleanToken(body.utm_campaign),
      referrer: cleanReferrer(body.referrer),
    },
  };
};

export const createKixikiEventsHandler = ({
  getStore,
  now = () => new Date(),
  randomId = () => crypto.randomUUID(),
}) => {
  if (typeof getStore !== "function") throw new TypeError("getStore é obrigatório.");

  return async (request, runtime = {}) => {
    if (request.method !== "POST") {
      return json({ error: "Método não permitido" }, 405, { allow: "POST" });
    }
    if (!sameOrigin(request)) return json({ error: "Origem inválida" }, 403);

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > EVENT_MAX_BODY_BYTES) {
      return json({ error: "Evento muito grande" }, 413);
    }

    let rawBody;
    try {
      rawBody = await request.text();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    if (new TextEncoder().encode(rawBody).byteLength > EVENT_MAX_BODY_BYTES) {
      return json({ error: "Evento muito grande" }, 413);
    }
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    const validated = validateBody(body);
    if (!validated.ok) return json({ error: validated.error }, 400);

    const occurredAt = now().toISOString();
    const date = occurredAt.slice(0, 10);
    const key = `${eventPrefixFor(runtime)}${date}/${occurredAt}-${randomId()}.json`;
    const record = {
      schema: "digitalmas-c001-event-v1",
      projectId: "C001",
      occurredAt,
      ...validated.data,
    };

    try {
      const store = getStore({ name: EVENT_STORE_NAME, consistency: "strong" });
      await store.setJSON(key, record);
      return json({ ok: true }, 202);
    } catch {
      return json({ error: "Medição temporariamente indisponível" }, 503);
    }
  };
};
