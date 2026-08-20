import {
  OWNER_PROJECT_ID,
  OWNER_REFERENCE,
  OWNER_SCHEMA,
  createDefaultOwnerData,
  validateOwnerData,
} from "./kixiki-owner-model.mjs";

export const OWNER_STORE_NAME = "digitalmas-c001-owner";
export const OWNER_STORE_KEY = "c001/kixiki/owner/panel-v1.json";
export const OWNER_ROLE = "kixiki-owner";
export const OWNER_MAX_BODY_BYTES = 220_000;

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });

const sameOrigin = (request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
};

const rolesFor = (user) => {
  if (Array.isArray(user?.roles)) return user.roles;
  if (Array.isArray(user?.appMetadata?.roles)) return user.appMetadata.roles;
  if (Array.isArray(user?.app_metadata?.roles)) return user.app_metadata.roles;
  return [];
};

const authorizedOwner = (user) => rolesFor(user).includes(OWNER_ROLE);

const parseStoredData = (entry) => {
  try {
    const parsed = JSON.parse(String(entry.data));
    return validateOwnerData(parsed);
  } catch {
    return { ok: false, error: "O estado salvo do painel está corrompido." };
  }
};

const getLatestEtag = async (store) => {
  try {
    return (await store.getMetadata(OWNER_STORE_KEY, { consistency: "strong" }))?.etag || null;
  } catch {
    return null;
  }
};

export const createKixikiOwnerHandler = ({ getUser, getStore, now = () => new Date() }) => {
  if (typeof getUser !== "function" || typeof getStore !== "function") {
    throw new TypeError("getUser e getStore são obrigatórios.");
  }

  return async (request) => {
    const user = await getUser();
    if (!user) return json({ error: "Não autorizado" }, 401);
    if (!authorizedOwner(user)) {
      return json({ error: "Esta conta não possui o perfil kixiki-owner." }, 403);
    }

    if (request.method !== "GET" && request.method !== "PUT") {
      return json({ error: "Método não permitido" }, 405);
    }

    const store = getStore(OWNER_STORE_NAME);

    if (request.method === "GET") {
      const entry = await store.getWithMetadata(OWNER_STORE_KEY, { consistency: "strong" });
      if (!entry) {
        return json({
          data: createDefaultOwnerData(),
          etag: null,
          updatedAt: null,
          reference: OWNER_REFERENCE,
        });
      }
      const validated = parseStoredData(entry);
      if (!validated.ok) return json({ error: validated.error }, 500);
      return json({
        data: validated.data,
        etag: entry.etag || null,
        updatedAt: entry.metadata?.updatedAt || null,
        reference: OWNER_REFERENCE,
      });
    }

    if (!sameOrigin(request)) return json({ error: "Origem inválida" }, 403);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > OWNER_MAX_BODY_BYTES) return json({ error: "Arquivo muito grande" }, 413);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Formato inválido" }, 400);
    }
    const unknownBodyKey = Object.keys(body).find((key) => !["data", "etag"].includes(key));
    if (unknownBodyKey) return json({ error: `Campo não permitido: ${unknownBodyKey}` }, 400);
    if (!(body.etag === null || typeof body.etag === "string")) {
      return json({ error: "ETag inválido" }, 400);
    }

    const validated = validateOwnerData(body.data);
    if (!validated.ok) return json({ error: validated.error }, 400);
    const serialized = JSON.stringify(validated.data);
    if (Buffer.byteLength(serialized, "utf8") > OWNER_MAX_BODY_BYTES) {
      return json({ error: "Arquivo muito grande" }, 413);
    }

    const current = await store.getMetadata(OWNER_STORE_KEY, { consistency: "strong" });
    const currentEtag = current?.etag || null;
    if (body.etag !== currentEtag) {
      return json({ error: "Conflito de versão", etag: currentEtag }, 409);
    }

    const updatedAt = now().toISOString();
    try {
      const result = await store.set(OWNER_STORE_KEY, serialized, {
        metadata: {
          updatedAt,
          updatedBy: user.id,
          projectId: OWNER_PROJECT_ID,
          schema: OWNER_SCHEMA,
        },
        ...(currentEtag ? { onlyIfMatch: currentEtag } : { onlyIfNew: true }),
      });
      if (result?.modified === false) {
        return json({ error: "Conflito de versão", etag: await getLatestEtag(store) }, 409);
      }
      return json({ ok: true, etag: result?.etag || null, updatedAt });
    } catch {
      const latestEtag = await getLatestEtag(store);
      if (latestEtag !== currentEtag) {
        return json({ error: "Conflito de versão", etag: latestEtag }, 409);
      }
      return json({ error: "Não foi possível salvar" }, 500);
    }
  };
};
