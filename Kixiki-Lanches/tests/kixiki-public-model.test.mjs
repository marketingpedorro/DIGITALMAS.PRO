import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultOwnerData } from "../netlify/functions/kixiki-owner-model.mjs";
import {
  createEmptyPublicProjection,
  createKixikiPublicProjection,
} from "../netlify/functions/kixiki-public-model.mjs";

const FORBIDDEN_KEYS = new Set([
  "evidence",
  "seo",
  "checkpoints",
  "user",
  "email",
  "roles",
  "audit",
  "workspace",
  "confirmedAt",
  "notes",
  "etag",
  "store",
  "namespace",
  "photoAssetVersion",
  "photoAssetKey",
]);

const findForbiddenKeys = (value, found = []) => {
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) found.push(key);
    findForbiddenKeys(child, found);
  }
  return found;
};

test("empty projection omits an absent catalog so the landing keeps its fallback", () => {
  assert.deepEqual(createEmptyPublicProjection(), {
    hours: [],
    operation: {},
  });
});

test("projection exposes only validated C001 public fields", () => {
  const owner = createDefaultOwnerData();
  owner.service.deliveryStatus = "yes";
  owner.service.serviceArea = "Santo Antônio e Sambaqui";
  owner.service.deliveryHours = "18h às 22h";
  owner.service.pickupStatus = "no";
  owner.service.confirmedAt = "2026-08-20T12:00:00.000Z";
  owner.service.notes = "Nunca publicar esta nota";
  owner.service.evidence = "evidência privada";
  owner.hours[0] = { id: "segunda", closed: false, opens: "11:00", closes: "22:00" };
  owner.hours[1] = { id: "terca", closed: true, opens: "", closes: "" };
  owner.catalog = [
    {
      id: "xis-salada",
      name: "X-Salada",
      priceCents: 3150,
      description: "Descrição pública",
      ingredients: "Ingredientes públicos",
      photoUrl: "https://images.example.test/xis.jpg",
      active: true,
    },
    {
      id: "xis-bacon",
      name: "X-Bacon",
      priceCents: 3500,
      description: "Não deve sair",
      ingredients: "Não deve sair",
      photoUrl: "",
      active: false,
    },
  ];

  const result = createKixikiPublicProjection(owner);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.hours.slice(0, 2), [
    { day: "segunda", open: true, opens: "11:00", closes: "22:00" },
    { day: "terca", open: false },
  ]);
  assert.deepEqual(result.data.products, [
    {
      id: "xis-salada",
      name: "X-Salada",
      active: true,
      priceCents: 3150,
      description: "Descrição pública",
      ingredients: "Ingredientes públicos",
      photoUrl: "https://images.example.test/xis.jpg",
    },
  ]);
  assert.deepEqual(result.data.operation, {
    delivery: { enabled: true, area: "Santo Antônio e Sambaqui", hours: "18h às 22h" },
    pickup: { enabled: false },
  });
  assert.deepEqual(findForbiddenKeys(result.data), []);
});

test("unknown or unconfirmed operation never becomes a public promise", () => {
  const unknown = createDefaultOwnerData();
  assert.deepEqual(createKixikiPublicProjection(unknown).data.operation, {});

  const unconfirmed = createDefaultOwnerData();
  unconfirmed.service.deliveryStatus = "yes";
  unconfirmed.service.serviceArea = "Toda a ilha";
  unconfirmed.service.deliveryHours = "24 horas";
  assert.deepEqual(createKixikiPublicProjection(unconfirmed).data.operation, {});
});

test("incomplete hours and null product prices are omitted without invention", () => {
  const owner = createDefaultOwnerData();
  owner.catalog[0].name = "X-Salada";
  owner.catalog[0].priceCents = null;
  const result = createKixikiPublicProjection(owner);

  assert.equal(result.ok, true);
  assert.deepEqual(result.data.hours, []);
  assert.equal("priceCents" in result.data.products[0], false);
});

test("internal photo version becomes a public same-origin URL without exposing the asset key", () => {
  const owner = createDefaultOwnerData();
  owner.catalog = [{
    ...owner.catalog.find((item) => item.id === "xis-bacon"),
    photoUrl: "",
    photoAssetVersion: "m0d3l-asset123",
  }];
  const result = createKixikiPublicProjection(owner);
  assert.equal(result.ok, true);
  assert.equal(
    result.data.products[0].photoUrl,
    "/api/kixiki-product-image?product=xis-bacon&v=m0d3l-asset123",
  );
  assert.equal("photoAssetVersion" in result.data.products[0], false);
  assert.equal("photoAssetKey" in result.data.products[0], false);
  assert.deepEqual(findForbiddenKeys(result.data), []);
});
