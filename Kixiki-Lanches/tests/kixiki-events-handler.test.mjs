import assert from "node:assert/strict";
import test from "node:test";

import {
  EVENT_STORE_NAME,
  PUBLIC_EVENT_NAMES,
  createKixikiEventsHandler,
  eventPrefixFor,
} from "../netlify/functions/kixiki-events-handler.mjs";

const createMemoryStore = () => {
  const entries = new Map();
  return {
    entries,
    async setJSON(key, value) {
      entries.set(key, structuredClone(value));
    },
  };
};

const createHandler = (store = createMemoryStore()) => ({
  store,
  handler: createKixikiEventsHandler({
    getStore(options) {
      assert.deepEqual(options, { name: EVENT_STORE_NAME, consistency: "strong" });
      return store;
    },
    now: () => new Date("2026-08-20T23:00:00.000Z"),
    randomId: () => "event-001",
  }),
});

const request = (body, { method = "POST", origin = "https://preview.example.test" } = {}) =>
  new Request(`${origin}/api/kixiki-events`, {
    method,
    headers: method === "POST" ? { "content-type": "application/json", origin } : undefined,
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });

test("public event endpoint records the four allowlisted events without a session", async () => {
  for (const event of PUBLIC_EVENT_NAMES) {
    const { handler } = createHandler();
    const response = await handler(
      request({
        event,
        path: "/",
        utm_source: "kixiki",
        utm_medium: "referral",
        utm_campaign: "referral_mvp_01",
        referrer: "https://instagram.com/profile?private=drop-this",
      }),
      { deployContext: "deploy-preview" },
    );
    assert.equal(response.status, 202);
  }
});

test("stored event is C001-only, sanitized and contains no identity or owner data", async () => {
  const { handler, store } = createHandler();
  const response = await handler(
    request({
      event: "gift_cta_click",
      path: "/",
      utm_source: "kixiki",
      utm_medium: "referral",
      utm_campaign: "referral_mvp_01",
      referrer: "https://example.test/start?email=private@example.test#secret",
    }),
    { deployContext: "deploy-preview" },
  );
  assert.equal(response.status, 202);
  assert.equal(store.entries.size, 1);
  const [[key, record]] = store.entries;
  assert.ok(key.startsWith(eventPrefixFor({ deployContext: "deploy-preview" })));
  assert.deepEqual(Object.keys(record).sort(), [
    "event",
    "occurredAt",
    "path",
    "projectId",
    "referrer",
    "schema",
    "utm_campaign",
    "utm_medium",
    "utm_source",
  ]);
  assert.equal(record.projectId, "C001");
  assert.equal(record.referrer, "https://example.test/start");
  assert.doesNotMatch(JSON.stringify(record), /email|roles|evidence|seo|checkpoint|audit|workspace/i);
});

test("event endpoint accepts only POST, same-origin and allowlisted fields", async () => {
  const { handler } = createHandler();
  assert.equal((await handler(request({}, { method: "GET" }))).status, 405);

  const crossOrigin = new Request("https://preview.example.test/api/kixiki-events", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://attacker.example.test" },
    body: JSON.stringify({ event: "page_view", path: "/" }),
  });
  assert.equal((await handler(crossOrigin)).status, 403);
  assert.equal((await handler(request({ event: "lead_created", path: "/" }))).status, 400);
  assert.equal(
    (await handler(request({ event: "page_view", path: "/", email: "owner@example.test" }))).status,
    400,
  );
});

test("preview and production event prefixes cannot contaminate each other", () => {
  assert.match(eventPrefixFor({ deployContext: "deploy-preview" }), /\/preview\/events\/$/);
  assert.match(eventPrefixFor({ deployContext: "production" }), /\/production\/events\/$/);
  assert.notEqual(
    eventPrefixFor({ deployContext: "deploy-preview" }),
    eventPrefixFor({ deployContext: "production" }),
  );
});
