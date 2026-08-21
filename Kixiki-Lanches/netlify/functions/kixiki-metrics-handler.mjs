import {
  EVENT_STORE_NAME,
  PUBLIC_EVENT_NAMES,
  eventPrefixFor,
} from "./kixiki-events-handler.mjs";

export const METRICS_ROLE = "kixiki-owner";
export const METRICS_MAX_EVENTS = 1_000;

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

const rolesFor = (user) => {
  if (Array.isArray(user?.roles)) return user.roles;
  if (Array.isArray(user?.appMetadata?.roles)) return user.appMetadata.roles;
  if (Array.isArray(user?.app_metadata?.roles)) return user.app_metadata.roles;
  return [];
};

const sourceFor = (record) => {
  if (record.utm_source) return record.utm_source;
  if (record.referrer) {
    try {
      return new URL(record.referrer).hostname;
    } catch {}
  }
  return "direto/sem-utm";
};

export const createKixikiMetricsHandler = ({ getUser, getStore }) => {
  if (typeof getUser !== "function" || typeof getStore !== "function") {
    throw new TypeError("getUser e getStore são obrigatórios.");
  }

  return async (request, runtime = {}) => {
    if (request.method !== "GET") {
      return json({ error: "Método não permitido" }, 405, { allow: "GET" });
    }

    const user = await getUser();
    if (!user) return json({ error: "Não autorizado" }, 401);
    if (!rolesFor(user).includes(METRICS_ROLE)) {
      return json({ error: "Esta conta não possui o perfil kixiki-owner." }, 403);
    }

    try {
      const store = getStore({ name: EVENT_STORE_NAME, consistency: "strong" });
      const prefix = eventPrefixFor(runtime);
      const listing = await store.list({ prefix });
      const allBlobs = [...(listing.blobs || [])].sort((a, b) => a.key.localeCompare(b.key));
      const selected = allBlobs.slice(-METRICS_MAX_EVENTS);
      const records = await Promise.all(
        selected.map(async ({ key }) => {
          try {
            return await store.get(key, { type: "json" });
          } catch {
            return null;
          }
        }),
      );

      const counts = Object.fromEntries(PUBLIC_EVENT_NAMES.map((event) => [event, 0]));
      const sourceCounts = new Map();
      let lastUpdated = null;
      for (const record of records) {
        if (!record || record.projectId !== "C001" || !PUBLIC_EVENT_NAMES.includes(record.event)) {
          continue;
        }
        counts[record.event] += 1;
        const source = sourceFor(record);
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
        if (!lastUpdated || record.occurredAt > lastUpdated) lastUpdated = record.occurredAt;
      }

      const sources = [...sourceCounts.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source))
        .slice(0, 5);

      return json({
        projectId: "C001",
        environment: runtime.deployContext === "production" ? "production" : "preview",
        events: counts,
        sources,
        lastUpdated,
        sampled: allBlobs.length > METRICS_MAX_EVENTS,
      });
    } catch {
      return json({ error: "Métricas temporariamente indisponíveis" }, 503);
    }
  };
};
