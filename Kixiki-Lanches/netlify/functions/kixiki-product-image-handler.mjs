import {
  OWNER_ROLE,
  OWNER_STORE_KEY,
  OWNER_STORE_NAME,
} from "./kixiki-owner-handler.mjs";
import {
  createDefaultOwnerData,
  upgradeLegacyOwnerData,
  validateOwnerData,
} from "./kixiki-owner-model.mjs";

export const PRODUCT_ASSET_STORE_NAME = "digitalmas-c001-kixiki-product-assets";
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PRODUCT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const ASSET_VERSION_PATTERN = /^[a-z0-9-]{1,80}$/;

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

const sameOrigin = (request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
};

const assetKeyFor = (productId, version) => `products/${productId}/${version}`;

const validProductId = (value) =>
  typeof value === "string" && PRODUCT_ID_PATTERN.test(value);

const validAssetVersion = (value) =>
  typeof value === "string" && ASSET_VERSION_PATTERN.test(value);

const isJpeg = (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
const isPng = (bytes) =>
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47 &&
  bytes[4] === 0x0d &&
  bytes[5] === 0x0a &&
  bytes[6] === 0x1a &&
  bytes[7] === 0x0a;
const isWebp = (bytes) =>
  bytes[0] === 0x52 &&
  bytes[1] === 0x49 &&
  bytes[2] === 0x46 &&
  bytes[3] === 0x46 &&
  bytes[8] === 0x57 &&
  bytes[9] === 0x45 &&
  bytes[10] === 0x42 &&
  bytes[11] === 0x50;

const matchesDeclaredType = (bytes, type) => {
  if (type === "image/jpeg") return isJpeg(bytes);
  if (type === "image/png") return isPng(bytes);
  if (type === "image/webp") return isWebp(bytes);
  return false;
};

const loadOwnerData = async (getStore) => {
  const ownerStore = getStore(OWNER_STORE_NAME);
  const entry = await ownerStore.getWithMetadata(OWNER_STORE_KEY, { consistency: "strong" });
  if (!entry) return createDefaultOwnerData();
  try {
    const parsed = JSON.parse(String(entry.data));
    const upgraded = upgradeLegacyOwnerData(parsed);
    const validated = validateOwnerData(upgraded.data);
    return validated.ok ? validated.data : null;
  } catch {
    return null;
  }
};

const productExists = async (getStore, productId) => {
  const ownerData = await loadOwnerData(getStore);
  return ownerData?.catalog?.some((item) => item.id === productId) === true;
};

const publicPhotoUrl = (productId, version) =>
  `/api/kixiki-product-image?product=${encodeURIComponent(productId)}&v=${encodeURIComponent(version)}`;

export const createKixikiProductImageHandler = ({
  getUser,
  getStore,
  now = () => new Date(),
  createVersion = () => crypto.randomUUID(),
}) => {
  if (typeof getUser !== "function" || typeof getStore !== "function") {
    throw new TypeError("getUser e getStore são obrigatórios.");
  }

  return async (request) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("product") || "";
    const requestedVersion = url.searchParams.get("v") || "";

    if (request.method === "GET") {
      if (!validProductId(productId) || !validAssetVersion(requestedVersion)) {
        return json({ error: "Foto não encontrada" }, 404);
      }
      try {
        const store = getStore(PRODUCT_ASSET_STORE_NAME);
        const entry = await store.getWithMetadata(assetKeyFor(productId, requestedVersion), {
          consistency: "strong",
          type: "arrayBuffer",
        });
        if (!entry) return json({ error: "Foto não encontrada" }, 404);
        const contentType = PRODUCT_IMAGE_TYPES.includes(entry.metadata?.contentType)
          ? entry.metadata.contentType
          : "application/octet-stream";
        return new Response(entry.data, {
          status: 200,
          headers: {
            "cache-control": "public, max-age=31536000, immutable",
            "content-type": contentType,
            "x-content-type-options": "nosniff",
          },
        });
      } catch {
        return json({ error: "Foto temporariamente indisponível" }, 503);
      }
    }

    if (request.method !== "POST" && request.method !== "DELETE") {
      return json({ error: "Método não permitido" }, 405, {
        allow: "GET, POST, DELETE",
      });
    }

    const user = await getUser();
    if (!user) return json({ error: "Não autorizado" }, 401);
    if (!rolesFor(user).includes(OWNER_ROLE)) {
      return json({ error: "Esta conta não possui o perfil kixiki-owner." }, 403);
    }
    if (!sameOrigin(request)) return json({ error: "Origem inválida" }, 403);
    if (!validProductId(productId)) return json({ error: "Produto inválido" }, 400);

    let exists;
    try {
      exists = await productExists(getStore, productId);
    } catch {
      return json({ error: "Não foi possível validar o produto" }, 503);
    }
    if (!exists) return json({ error: "Produto não encontrado" }, 404);

    const store = getStore(PRODUCT_ASSET_STORE_NAME);

    if (request.method === "DELETE") {
      if (!validAssetVersion(requestedVersion)) {
        return json({ error: "Versão da foto inválida" }, 400);
      }
      try {
        await store.delete(assetKeyFor(productId, requestedVersion));
        return json({ ok: true, productId });
      } catch {
        return json({ error: "Não foi possível remover a foto" }, 500);
      }
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > PRODUCT_IMAGE_MAX_BYTES + 256_000) {
      return json({ error: "A foto deve ter no máximo 5 MB" }, 413);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ error: "Envio de foto inválido" }, 400);
    }
    const file = form.get("photo");
    if (!(file instanceof Blob)) return json({ error: "Selecione uma foto" }, 400);
    if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
      return json({ error: "Use uma foto JPEG, PNG ou WEBP" }, 415);
    }
    if (file.size <= 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) {
      return json({ error: "A foto deve ter no máximo 5 MB" }, 413);
    }

    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data.slice(0, 16));
    if (!matchesDeclaredType(bytes, file.type)) {
      return json({ error: "O conteúdo do arquivo não corresponde ao formato da foto" }, 415);
    }

    const versionSeed = String(createVersion())
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 12);
    const version = `${now().getTime().toString(36)}-${versionSeed || "asset"}`;
    try {
      await store.set(assetKeyFor(productId, version), data, {
        metadata: {
          contentType: file.type,
          productId,
          projectId: "C001",
          uploadedAt: now().toISOString(),
          uploadedBy: user.id,
          version,
        },
      });
      return json({
        ok: true,
        productId,
        version,
        photoUrl: publicPhotoUrl(productId, version),
      });
    } catch {
      return json({ error: "Não foi possível enviar a foto" }, 500);
    }
  };
};
