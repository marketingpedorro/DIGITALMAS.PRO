import assert from "node:assert/strict";
import test from "node:test";

import {
  KIXIKI_BASE_CATALOG,
  OWNER_REFERENCE,
  createDefaultOwnerData,
  upgradeLegacyOwnerData,
  validateOwnerData,
} from "../netlify/functions/kixiki-owner-model.mjs";

const cloneDefault = () => structuredClone(createDefaultOwnerData());

test("creates an isolated C001 model with exactly three priorities and five checkpoints", () => {
  const data = createDefaultOwnerData();
  const result = validateOwnerData(data);

  assert.equal(result.ok, true);
  assert.equal(data.projectId, "C001");
  assert.deepEqual(
    data.seo.tasks.map((task) => task.id),
    ["service-truth", "operational-data", "google-reputation"],
  );
  assert.deepEqual(
    data.seo.checkpoints.map((checkpoint) => checkpoint.day),
    [0, 14, 30, 60, 90],
  );
  assert.equal(OWNER_REFERENCE.reviewBaseline.rating, 4.7);
  assert.equal(OWNER_REFERENCE.reviewBaseline.reviewCount, 19);
  assert.equal(OWNER_REFERENCE.reviewBaseline.observedResponseCount, 0);
});

test("seeds the 18 public menu slots with their real names and prices", () => {
  const data = createDefaultOwnerData();

  assert.equal(KIXIKI_BASE_CATALOG.length, 18);
  assert.equal(data.catalog.length, 18);
  assert.deepEqual(
    data.catalog.map(({ id, priceCents }) => [id, priceCents]),
    [
      ["marmita-p", 2500],
      ["marmita-m", 2500],
      ["marmita-gg", 3000],
      ["xis-salada", 2800],
      ["xis-bacon", 3200],
      ["xis-calabresa", 3000],
      ["xis-frango", 3000],
      ["xis-strogonoff", 3000],
      ["xis-coracao", 3600],
      ["xis-egg", 2800],
      ["xis-tudo", 3800],
      ["pas-carne", 1200],
      ["pas-queijo", 1500],
      ["pas-pizza", 1500],
      ["pas-calabresa", 1600],
      ["por-batata", 2500],
      ["por-bacon", 3500],
      ["por-morro", 5400],
    ],
  );
  assert.equal(validateOwnerData(data).ok, true);
});

test("upgrades only the legacy starter catalog and preserves edited legacy data", () => {
  const data = createDefaultOwnerData();
  data.catalog = [
    {
      id: "xis-gaucho",
      name: "Xis Gaúcho especial do Carlos",
      priceCents: 3300,
      description: "Receita antiga preservada.",
      ingredients: "",
      photoUrl: "",
      active: true,
    },
    {
      id: "marmita-caseira",
      name: "Marmita caseira",
      priceCents: null,
      description: "",
      ingredients: "",
      photoUrl: "",
      active: true,
    },
  ];

  const upgraded = upgradeLegacyOwnerData(data);
  assert.equal(upgraded.migrated, true);
  assert.equal(upgraded.data.catalog.length, 19);
  assert.equal(upgraded.data.catalog.at(-1).name, "Xis Gaúcho especial do Carlos");
  assert.equal(upgradeLegacyOwnerData(createDefaultOwnerData()).migrated, false);
});

test("rejects fields outside the owner allowlist", () => {
  const data = cloneDefault();
  data.h1 = "Texto que o dono não pode alterar";

  const result = validateOwnerData(data);
  assert.equal(result.ok, false);
  assert.match(result.error, /campo não permitido/i);
});

test("rejects project or SEO priority replacement", () => {
  const wrongProject = cloneDefault();
  wrongProject.projectId = "C002";
  assert.equal(validateOwnerData(wrongProject).ok, false);

  const wrongTask = cloneDefault();
  wrongTask.seo.tasks[0].id = "edit-public-copy";
  const result = validateOwnerData(wrongTask);
  assert.equal(result.ok, false);
  assert.match(result.error, /não podem ser alteradas/i);
});

test("does not accept a completed task without date and evidence", () => {
  const data = cloneDefault();
  data.seo.tasks[2].status = "done";

  const result = validateOwnerData(data);
  assert.equal(result.ok, false);
  assert.match(result.error, /data e evidência/i);
});

test("rejects calendar dates that do not exist", () => {
  const data = cloneDefault();
  data.seo.tasks[2].date = "2026-02-31";

  const result = validateOwnerData(data);
  assert.equal(result.ok, false);
  assert.match(result.error, /data válida/i);
});

test("requires delivery truth before priority A can be completed", () => {
  const data = cloneDefault();
  data.seo.tasks[0] = {
    id: "service-truth",
    status: "done",
    date: "2026-08-20",
    evidence: "Confirmado por Carlos no painel.",
  };

  assert.match(validateOwnerData(data).error, /dados operacionais/i);

  data.service.confirmedAt = "2026-08-20T12:00:00.000Z";
  assert.match(validateOwnerData(data).error, /delivery e retirada/i);
  data.service.deliveryStatus = "yes";
  data.service.serviceArea = "Santo Antônio de Lisboa e bairros confirmados";
  data.service.deliveryHours = "Terça a sábado, 19h às 23h";
  data.service.pickupStatus = "no";
  assert.equal(validateOwnerData(data).ok, true);
});

test("requires complete real operational data before priority B can be completed", () => {
  const data = cloneDefault();
  data.seo.tasks[1] = {
    id: "operational-data",
    status: "done",
    date: "2026-08-20",
    evidence: "Cardápio e horários conferidos pelo dono.",
  };

  assert.match(validateOwnerData(data).error, /sete dias/i);

  data.hours = data.hours.map((entry) => ({ ...entry, closed: true }));
  data.catalog[0] = {
    ...data.catalog[0],
    priceCents: 2990,
    description: "Xis preparado na hora.",
    photoUrl: "https://images.example.test/xis-real.jpg",
  };
  assert.equal(validateOwnerData(data).ok, true);
});

test("accepts only HTTPS photo references", () => {
  const data = cloneDefault();
  data.catalog[0].photoUrl = "http://example.test/foto.jpg";

  const result = validateOwnerData(data);
  assert.equal(result.ok, false);
  assert.match(result.error, /HTTPS/i);
});
