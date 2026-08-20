import assert from "node:assert/strict";
import test from "node:test";

import {
  OWNER_STORE_KEY,
  OWNER_STORE_NAME,
  createKixikiOwnerHandler,
} from "../netlify/functions/kixiki-owner-handler.mjs";
import { createDefaultOwnerData } from "../netlify/functions/kixiki-owner-model.mjs";

const fixedNow = () => new Date("2026-08-20T12:00:00.000Z");

const createMemoryStore = () => {
  let entry = null;
  let revision = 0;
  return {
    async getWithMetadata(key) {
      assert.equal(key, OWNER_STORE_KEY);
      return entry ? structuredClone(entry) : null;
    },
    async getMetadata(key) {
      assert.equal(key, OWNER_STORE_KEY);
      return entry ? { etag: entry.etag, metadata: structuredClone(entry.metadata) } : null;
    },
    async set(key, data, options) {
      assert.equal(key, OWNER_STORE_KEY);
      if (options.onlyIfNew && entry) return { modified: false, etag: entry.etag };
      if (options.onlyIfMatch && options.onlyIfMatch !== entry?.etag) {
        return { modified: false, etag: entry?.etag || null };
      }
      revision += 1;
      entry = {
        data,
        etag: `etag-${revision}`,
        metadata: structuredClone(options.metadata),
      };
      return { modified: true, etag: entry.etag };
    },
  };
};

const request = (method = "GET", body, origin = "https://preview.example.test") =>
  new Request(`${origin}/api/kixiki-owner`, {
    method,
    headers: method === "PUT" ? { "content-type": "application/json", origin } : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const authorizedUser = {
  id: "user-carlos",
  email: "owner@example.test",
  roles: ["kixiki-owner"],
};

const handlerFor = ({ user = authorizedUser, store = createMemoryStore() } = {}) => {
  const getStore = (name) => {
    assert.equal(name, OWNER_STORE_NAME);
    return store;
  };
  return { handler: createKixikiOwnerHandler({ getUser: async () => user, getStore, now: fixedNow }), store };
};

test("requires a signed-in user", async () => {
  const { handler } = handlerFor({ user: null });
  const response = await handler(request());
  assert.equal(response.status, 401);
});

test("requires the kixiki-owner server-side role", async () => {
  const { handler } = handlerFor({ user: { id: "director", roles: ["director"] } });
  const response = await handler(request());
  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /kixiki-owner/);
});

test("returns a clean default without writing when no canonical record exists", async () => {
  const { handler } = handlerFor();
  const response = await handler(request());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.etag, null);
  assert.equal(body.updatedAt, null);
  assert.equal(body.data.projectId, "C001");
  assert.equal(body.data.seo.tasks.length, 3);
  assert.equal(body.reference.reviewBaseline.reviewCount, 19);
});

test("rejects cross-origin writes", async () => {
  const { handler } = handlerFor();
  const req = new Request("https://preview.example.test/api/kixiki-owner", {
    method: "PUT",
    headers: { "content-type": "application/json", origin: "https://attacker.example.test" },
    body: JSON.stringify({ data: createDefaultOwnerData(), etag: null }),
  });
  const response = await handler(req);
  assert.equal(response.status, 403);
});

test("persists authorized fields and returns them across requests", async () => {
  const { handler } = handlerFor();
  const data = createDefaultOwnerData();
  data.service.deliveryStatus = "no";
  data.service.pickupStatus = "yes";
  data.service.pickupHours = "19h às 23h";

  const saved = await handler(request("PUT", { data, etag: null }));
  const savedBody = await saved.json();
  assert.equal(saved.status, 200);
  assert.equal(savedBody.etag, "etag-1");
  assert.equal(savedBody.updatedAt, "2026-08-20T12:00:00.000Z");

  const loaded = await handler(request());
  const loadedBody = await loaded.json();
  assert.equal(loaded.status, 200);
  assert.equal(loadedBody.data.service.pickupHours, "19h às 23h");
  assert.equal(loadedBody.etag, "etag-1");
});

test("rejects injected strategy fields before storage", async () => {
  const { handler } = handlerFor();
  const data = createDefaultOwnerData();
  data.css = "body { display:none }";

  const response = await handler(request("PUT", { data, etag: null }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /campo não permitido/i);
});

test("prevents stale devices from overwriting a newer version", async () => {
  const { handler } = handlerFor();
  const data = createDefaultOwnerData();
  const first = await handler(request("PUT", { data, etag: null }));
  assert.equal(first.status, 200);

  data.service.notes = "Alteração em aparelho com versão antiga";
  const stale = await handler(request("PUT", { data, etag: null }));
  const body = await stale.json();
  assert.equal(stale.status, 409);
  assert.equal(body.etag, "etag-1");
});
