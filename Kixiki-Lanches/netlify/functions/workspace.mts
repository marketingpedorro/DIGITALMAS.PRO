import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";

const STORE_NAME = "digitalmas-agency-os";
const MAX_BODY_BYTES = 750_000;

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  },
});

const sameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
};

const isWorkspace = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;
  const workspace = value as { projects?: unknown; activeProjectId?: unknown };
  if (!workspace.projects || typeof workspace.projects !== "object") return false;
  const entries = Object.entries(workspace.projects as Record<string, unknown>);
  if (!entries.length || entries.length > 250) return false;
  return entries.every(([id, project]) => {
    if (!id || id.length > 120 || !project || typeof project !== "object") return false;
    const item = project as { project?: unknown; stages?: unknown };
    return typeof item.project === "string" && item.project.length <= 80 && Boolean(item.stages && typeof item.stages === "object");
  });
};

export default async (request: Request) => {
  const user = await getUser();
  if (!user) return json({ error: "No autorizado" }, 401);

  const store = getStore(STORE_NAME);
  const key = `director/${user.id}/workspace.json`;

  if (request.method === "GET") {
    const entry = await store.getWithMetadata(key, { consistency: "strong" });
    if (!entry) return json({ workspace: null, etag: null });
    try {
      const workspace = JSON.parse(String(entry.data));
      return json({ workspace, etag: entry.etag, updatedAt: entry.metadata?.updatedAt || null });
    } catch {
      return json({ error: "Estado central inválido" }, 500);
    }
  }

  if (request.method !== "PUT") return json({ error: "Método no permitido" }, 405);
  if (!sameOrigin(request)) return json({ error: "Origen inválido" }, 403);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "Archivo demasiado grande" }, 413);

  try {
    const body = await request.json() as { workspace?: unknown; etag?: string | null };
    if (!isWorkspace(body.workspace)) return json({ error: "Formato inválido" }, 400);

    const current = await store.getMetadata(key, { consistency: "strong" });
    if (current?.etag && body.etag !== current.etag) {
      return json({ error: "Conflicto de versión", etag: current.etag }, 409);
    }

    const updatedAt = new Date().toISOString();
    const value = JSON.stringify({ ...body.workspace, updatedAt });
    if (value.length > MAX_BODY_BYTES) return json({ error: "Archivo demasiado grande" }, 413);

    const result = await store.set(key, value, {
      metadata: { updatedAt, userId: user.id, schema: "digitalmas-agency-os-workspace-v0.2" },
      ...(current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true }),
    });
    return json({ ok: true, etag: result.etag || null, updatedAt });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "JSON inválido" }, 400);
    return json({ error: "No se pudo guardar" }, 500);
  }
};

export const config: Config = { path: "/api/workspace" };
