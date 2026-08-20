import assert from "node:assert/strict";
import test from "node:test";

import {
  OWNER_REFERENCE,
  createDefaultOwnerData,
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
