import { OWNER_STORE_KEY, OWNER_STORE_NAME } from "./kixiki-owner-handler.mjs";
import {
  createEmptyPublicProjection,
  createKixikiPublicProjection,
} from "./kixiki-public-model.mjs";

const json = (body, status = 200, extraHeaders = {}) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": status === 200 ? "public, max-age=60, stale-while-revalidate=300" : "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });

const unavailable = () =>
  json({ error: "Dados públicos temporariamente indisponíveis." }, 503);

export const createKixikiPublicHandler = ({ getStore }) => {
  if (typeof getStore !== "function") throw new TypeError("getStore é obrigatório.");

  return async (request) => {
    if (request.method !== "GET") {
      return json({ error: "Método não permitido" }, 405, { allow: "GET" });
    }

    try {
      const store = getStore(OWNER_STORE_NAME);
      const entry = await store.getWithMetadata(OWNER_STORE_KEY, { consistency: "strong" });
      if (!entry) return json(createEmptyPublicProjection());

      let ownerData;
      try {
        ownerData = JSON.parse(String(entry.data));
      } catch {
        return unavailable();
      }

      const projection = createKixikiPublicProjection(ownerData);
      if (!projection.ok) return unavailable();
      return json(projection.data);
    } catch {
      return unavailable();
    }
  };
};
