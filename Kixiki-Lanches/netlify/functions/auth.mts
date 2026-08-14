import {
  acceptInvite,
  getUser,
  login,
  logout,
  recoverPassword,
  requestPasswordRecovery,
  verifyRequestOrigin,
} from "@netlify/identity";
import type { Config } from "@netlify/functions";

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  },
});

export default async (request: Request) => {
  if (request.method === "GET") {
    const user = await getUser();
    return json({
      user: user ? { id: user.id, email: user.email, roles: user.roles } : null,
    });
  }

  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    verifyRequestOrigin(request);
    const body = await request.json() as { action?: string; email?: string; password?: string; token?: string };

    if (body.action === "login") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password || password.length > 256) return json({ error: "Credenciales inválidas" }, 401);
      const user = await login(email, password);
      return json({ user: { id: user.id, email: user.email, roles: user.roles } });
    }

    if (body.action === "logout") {
      await logout();
      return json({ ok: true });
    }

    if (body.action === "request-recovery") {
      const email = String(body.email || "").trim().toLowerCase();
      if (email) await requestPasswordRecovery(email);
      return json({ ok: true });
    }

    if (body.action === "accept-invite" || body.action === "recover") {
      const token = String(body.token || "");
      const password = String(body.password || "");
      if (!token || password.length < 12 || password.length > 256) return json({ error: "Solicitud inválida" }, 400);
      const user = body.action === "accept-invite"
        ? await acceptInvite(token, password)
        : await recoverPassword(token, password);
      return json({ user: { id: user.id, email: user.email, roles: user.roles } });
    }

    return json({ error: "Acción inválida" }, 400);
  } catch {
    return json({ error: "Credenciales inválidas" }, 401);
  }
};

export const config: Config = { path: "/api/auth" };
