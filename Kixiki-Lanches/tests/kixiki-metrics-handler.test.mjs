import assert from "node:assert/strict";
import test from "node:test";

import { EVENT_STORE_NAME, eventPrefixFor } from "../netlify/functions/kixiki-events-handler.mjs";
import { createKixikiMetricsHandler } from "../netlify/functions/kixiki-metrics-handler.mjs";

const records = [
  { projectId: "C001", event: "page_view", occurredAt: "2026-08-20T20:00:00.000Z", utm_source: "kixiki", referrer: null },
  { projectId: "C001", event: "page_view", occurredAt: "2026-08-20T20:01:00.000Z", utm_source: null, referrer: "https://instagram.com/profile" },
  { projectId: "C001", event: "whatsapp_click", occurredAt: "2026-08-20T20:02:00.000Z", utm_source: "kixiki", referrer: null },
  { projectId: "C001", event: "gift_view", occurredAt: "2026-08-20T20:03:00.000Z", utm_source: "kixiki", referrer: null },
  { projectId: "C001", event: "gift_cta_click", occurredAt: "2026-08-20T20:04:00.000Z", utm_source: "kixiki", referrer: null },
];

const store = {
  async list({ prefix }) {
    assert.equal(prefix, eventPrefixFor({ deployContext: "deploy-preview" }));
    return { blobs: records.map((_, index) => ({ key: `${prefix}${index}.json`, etag: `${index}` })) };
  },
  async get(key) {
    return structuredClone(records[Number(key.match(/(\d+)\.json$/)[1])]);
  },
};

const request = (method = "GET") =>
  new Request("https://preview.example.test/api/kixiki-metrics", { method });

const handlerFor = (user) =>
  createKixikiMetricsHandler({
    getUser: async () => user,
    getStore(options) {
      assert.deepEqual(options, { name: EVENT_STORE_NAME, consistency: "strong" });
      return store;
    },
  });

test("metrics endpoint requires a real kixiki-owner session", async () => {
  assert.equal((await handlerFor(null)(request(), { deployContext: "deploy-preview" })).status, 401);
  assert.equal(
    (await handlerFor({ id: "director", roles: ["director"] })(request(), { deployContext: "deploy-preview" })).status,
    403,
  );
});

test("owner metrics expose only aggregate C001 counts and origins", async () => {
  const handler = handlerFor({ id: "owner", roles: ["kixiki-owner"] });
  const response = await handler(request(), { deployContext: "deploy-preview" });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.events, {
    page_view: 2,
    whatsapp_click: 1,
    gift_view: 1,
    gift_cta_click: 1,
  });
  assert.equal(body.sources[0].source, "kixiki");
  assert.equal(body.sources[0].count, 4);
  assert.equal(body.environment, "preview");
  assert.equal(body.lastUpdated, "2026-08-20T20:04:00.000Z");
  assert.doesNotMatch(JSON.stringify(body), /email|roles|evidence|seo|checkpoint|audit|workspace/i);
});

test("metrics endpoint is read-only", async () => {
  const handler = handlerFor({ id: "owner", roles: ["kixiki-owner"] });
  const response = await handler(request("POST"), { deployContext: "deploy-preview" });
  assert.equal(response.status, 405);
});
