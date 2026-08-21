import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultOwnerData } from "../netlify/functions/kixiki-owner-model.mjs";
import {
  PRODUCT_ASSET_STORE_NAME,
  createKixikiProductImageHandler,
} from "../netlify/functions/kixiki-product-image-handler.mjs";
import {
  OWNER_STORE_KEY,
  OWNER_STORE_NAME,
} from "../netlify/functions/kixiki-owner-handler.mjs";

const webpBytes = () =>
  new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 1, 2, 3]);

const createStores = () => {
  const assets = new Map();
  const owner = {
    data: JSON.stringify(createDefaultOwnerData()),
    metadata: {},
    etag: "owner-v1",
  };
  const assetStore = {
    async getWithMetadata(key) {
      return assets.get(key) || null;
    },
    async set(key, data, options = {}) {
      assets.set(key, {
        data,
        metadata: options.metadata || {},
        etag: `asset-${assets.size + 1}`,
      });
      return { etag: `asset-${assets.size}` };
    },
    async delete(key) {
      assets.delete(key);
    },
  };
  const ownerStore = {
    async getWithMetadata(key) {
      return key === OWNER_STORE_KEY ? owner : null;
    },
  };
  return {
    assets,
    getStore(name) {
      if (name === PRODUCT_ASSET_STORE_NAME) return assetStore;
      if (name === OWNER_STORE_NAME) return ownerStore;
      throw new Error(`unexpected store ${name}`);
    },
  };
};

const authorized = { id: "owner-1", roles: ["kixiki-owner"] };

const uploadRequest = ({ product = "xis-bacon", blob, origin = "https://preview.test" } = {}) => {
  const form = new FormData();
  if (blob) form.set("photo", blob, "foto.webp");
  return new Request(`https://preview.test/api/kixiki-product-image?product=${product}`, {
    method: "POST",
    headers: { origin },
    body: form,
  });
};

test("public image GET works without a session and never exposes Blob metadata", async () => {
  const stores = createStores();
  stores.assets.set("products/xis-bacon/v1", {
    data: webpBytes().buffer,
    metadata: {
      contentType: "image/webp",
      uploadedBy: "private-user-id",
      version: "private-version",
    },
  });
  const handler = createKixikiProductImageHandler({
    getUser: async () => null,
    getStore: stores.getStore,
  });

  const response = await handler(
    new Request("https://preview.test/api/kixiki-product-image?product=xis-bacon&v=v1"),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.match(response.headers.get("cache-control"), /immutable/);
  assert.equal(response.headers.has("etag"), false);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), webpBytes());
});

test("public image lookup requires the explicit canonical asset version", async () => {
  const stores = createStores();
  stores.assets.set("products/xis-bacon/v1", {
    data: webpBytes().buffer,
    metadata: { contentType: "image/webp" },
  });
  const handler = createKixikiProductImageHandler({
    getUser: async () => null,
    getStore: stores.getStore,
  });

  const response = await handler(
    new Request("https://preview.test/api/kixiki-product-image?product=xis-bacon"),
  );
  assert.equal(response.status, 404);
});

test("upload requires a signed-in kixiki-owner", async () => {
  const stores = createStores();
  const photo = new Blob([webpBytes()], { type: "image/webp" });
  const anonymous = createKixikiProductImageHandler({
    getUser: async () => null,
    getStore: stores.getStore,
  });
  assert.equal((await anonymous(uploadRequest({ blob: photo }))).status, 401);

  const wrongRole = createKixikiProductImageHandler({
    getUser: async () => ({ id: "viewer", roles: ["viewer"] }),
    getStore: stores.getStore,
  });
  assert.equal((await wrongRole(uploadRequest({ blob: photo }))).status, 403);
});

test("upload rejects cross-origin, unknown products and arbitrary files", async () => {
  const stores = createStores();
  const handler = createKixikiProductImageHandler({
    getUser: async () => authorized,
    getStore: stores.getStore,
  });
  const photo = new Blob([webpBytes()], { type: "image/webp" });
  assert.equal(
    (await handler(uploadRequest({ blob: photo, origin: "https://evil.test" }))).status,
    403,
  );
  assert.equal(
    (await handler(uploadRequest({ product: "produto-inexistente", blob: photo }))).status,
    404,
  );
  const arbitrary = new Blob(["not an image"], { type: "text/plain" });
  assert.equal((await handler(uploadRequest({ blob: arbitrary }))).status, 415);
  const fakeWebp = new Blob(["not really webp"], { type: "image/webp" });
  assert.equal((await handler(uploadRequest({ blob: fakeWebp }))).status, 415);
});

test("upload rejects files larger than the 5 MB owner limit", async () => {
  const stores = createStores();
  const handler = createKixikiProductImageHandler({
    getUser: async () => authorized,
    getStore: stores.getStore,
  });
  const oversizedBytes = new Uint8Array(5 * 1024 * 1024 + 1);
  oversizedBytes.set(webpBytes());
  const oversized = new Blob([oversizedBytes], { type: "image/webp" });
  const response = await handler(uploadRequest({ blob: oversized }));

  assert.equal(response.status, 413);
  assert.equal(stores.assets.size, 0);
});

test("valid optimized photo is persisted in the isolated C001 asset store", async () => {
  const stores = createStores();
  const handler = createKixikiProductImageHandler({
    getUser: async () => authorized,
    getStore: stores.getStore,
    now: () => new Date("2026-08-21T12:00:00.000Z"),
    createVersion: () => "fixed-version",
  });
  const response = await handler(
    uploadRequest({ blob: new Blob([webpBytes()], { type: "image/webp" }) }),
  );
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.productId, "xis-bacon");
  assert.match(result.version, /^[a-z0-9]+-fixed-versio$/);
  assert.equal(
    result.photoUrl,
    `/api/kixiki-product-image?product=xis-bacon&v=${encodeURIComponent(result.version)}`,
  );
  const stored = stores.assets.get(`products/xis-bacon/${result.version}`);
  assert.equal(stored.metadata.contentType, "image/webp");
  assert.equal(stored.metadata.projectId, "C001");
  assert.equal(stored.metadata.uploadedBy, "owner-1");
});

test("photo removal is authenticated and restores the fallback path", async () => {
  const stores = createStores();
  stores.assets.set("products/xis-bacon/v1", {
    data: webpBytes().buffer,
    metadata: { contentType: "image/webp" },
  });
  const handler = createKixikiProductImageHandler({
    getUser: async () => authorized,
    getStore: stores.getStore,
  });
  const response = await handler(
    new Request("https://preview.test/api/kixiki-product-image?product=xis-bacon&v=v1", {
      method: "DELETE",
      headers: { origin: "https://preview.test" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(stores.assets.has("products/xis-bacon/v1"), false);
});

test("unsupported methods are rejected without touching storage", async () => {
  const stores = createStores();
  const handler = createKixikiProductImageHandler({
    getUser: async () => authorized,
    getStore: stores.getStore,
  });
  const response = await handler(
    new Request("https://preview.test/api/kixiki-product-image?product=xis-bacon", {
      method: "PUT",
    }),
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, POST, DELETE");
});
