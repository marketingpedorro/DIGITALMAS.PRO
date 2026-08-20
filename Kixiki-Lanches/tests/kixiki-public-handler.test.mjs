import assert from "node:assert/strict";
import test from "node:test";

import {
  OWNER_STORE_KEY,
  OWNER_STORE_NAME,
} from "../netlify/functions/kixiki-owner-handler.mjs";
import { createDefaultOwnerData } from "../netlify/functions/kixiki-owner-model.mjs";
import { createKixikiPublicHandler } from "../netlify/functions/kixiki-public-handler.mjs";

const makeHandler = (entry) => {
  const store = {
    async getWithMetadata(key, options) {
      assert.equal(key, OWNER_STORE_KEY);
      assert.deepEqual(options, { consistency: "strong" });
      if (entry instanceof Error) throw entry;
      return entry;
    },
  };
  return createKixikiPublicHandler({
    getStore(name) {
      assert.equal(name, OWNER_STORE_NAME);
      return store;
    },
  });
};

const request = (method = "GET") =>
  new Request("https://preview.example.test/api/kixiki-public", { method });

test("public endpoint responds to GET without a user session", async () => {
  const owner = createDefaultOwnerData();
  owner.catalog[0].name = "X-Salada";
  owner.catalog[0].priceCents = 3000;
  const handler = makeHandler({ data: JSON.stringify(owner), etag: "private-etag" });

  const response = await handler(request());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.products[0].name, "X-Salada");
  assert.equal("etag" in body, false);
});

test("public endpoint accepts GET only", async () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "HEAD"]) {
    const response = await makeHandler(null)(request(method));
    assert.equal(response.status, 405, method);
    assert.equal(response.headers.get("allow"), "GET");
  }
});

test("missing canonical data returns an empty safe projection", async () => {
  const response = await makeHandler(null)(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { hours: [], operation: {} });
});

test("Blob failure or corrupt owner data returns a controlled 503", async () => {
  const failed = await makeHandler(new Error("blob offline"))(request());
  assert.equal(failed.status, 503);

  const corrupt = await makeHandler({ data: "not-json" })(request());
  assert.equal(corrupt.status, 503);
});
