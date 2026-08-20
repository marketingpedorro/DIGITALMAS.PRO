import assert from "node:assert/strict";
import test from "node:test";

import {
  applyKixikiPublicProjection,
  hydrateKixikiPublicData,
} from "../public/kixiki-public.js";

const createProductElements = (slot, label, price) => {
  const name = { textContent: label };
  const description = { textContent: `Descrição estática de ${label}` };
  const card = {
    hidden: false,
    querySelector(selector) {
      return selector === "p" ? description : null;
    },
  };
  const priceElement = {
    hidden: false,
    textContent: price,
    previousElementSibling: name,
    closest(selector) {
      return selector === ".kx-food-card" ? card : null;
    },
  };
  const button = {
    hidden: false,
    textContent: `Pedir ${label} (${price})`,
    href: "https://wa.me/static",
    parentElement: card,
  };
  return {
    nodes: { [`val-${slot}`]: priceElement, [`btn-${slot}`]: button },
    card,
    name,
    description,
    priceElement,
    button,
  };
};

const createDocument = () => {
  const salad = createProductElements("xis-salada", "X-Salada", "R$ 28");
  const bacon = createProductElements("xis-bacon", "X-Bacon", "R$ 32");
  const nodes = {
    ...salad.nodes,
    ...bacon.nodes,
    "sticky-offer-title": { textContent: "Oferta estática" },
    "kixiki-public-hours-summary": { textContent: "Horário estático" },
    "kixiki-public-hours-faq": { textContent: "FAQ estático" },
    "kixiki-public-operation-summary": { textContent: "Entrega estática" },
    "kixiki-public-delivery-faq": { textContent: "FAQ entrega estática" },
  };
  return {
    documentRef: { getElementById: (id) => nodes[id] || null },
    nodes,
    salad,
    bacon,
  };
};

test("failed public API preserves every static fallback slot", async () => {
  const page = createDocument();
  const before = Object.fromEntries(
    Object.entries(page.nodes).map(([id, node]) => [id, node.textContent]),
  );
  const applied = await hydrateKixikiPublicData({
    fetchImpl: async () => {
      throw new Error("offline");
    },
    documentRef: page.documentRef,
  });

  assert.equal(applied, false);
  assert.deepEqual(
    Object.fromEntries(Object.entries(page.nodes).map(([id, node]) => [id, node.textContent])),
    before,
  );
  assert.equal(page.salad.card.hidden, false);
  assert.equal(page.bacon.card.hidden, false);
});

test("active catalog is authoritative for mapped slots and hides inactive products", () => {
  const page = createDocument();
  applyKixikiPublicProjection(
    {
      hours: [],
      operation: {},
      products: [{ id: "xis-bacon", name: "X-Bacon", active: true, priceCents: 3650 }],
    },
    page.documentRef,
  );

  assert.equal(page.salad.card.hidden, true);
  assert.equal(page.bacon.card.hidden, false);
  assert.equal(page.bacon.priceElement.textContent, "R$ 36,50");
  assert.match(page.bacon.button.href, /^https:\/\/wa\.me\/48988048681\?text=/);
});

test("an explicitly empty saved catalog hides every static product", () => {
  const page = createDocument();
  applyKixikiPublicProjection(
    { hours: [], operation: {}, products: [] },
    page.documentRef,
  );
  assert.equal(page.salad.card.hidden, true);
  assert.equal(page.bacon.card.hidden, true);
});

test("price and hours update again after refresh without changing the layout", () => {
  const page = createDocument();
  const first = {
    products: [{ id: "xis-salada", name: "X-Salada", active: true, priceCents: 3000 }],
    hours: [{ day: "segunda", open: true, opens: "11:00", closes: "20:00" }],
    operation: {},
  };
  const refreshed = {
    products: [{ id: "xis-salada", name: "X-Salada", active: true, priceCents: 3200 }],
    hours: [{ day: "segunda", open: true, opens: "12:00", closes: "21:00" }],
    operation: {},
  };

  applyKixikiPublicProjection(first, page.documentRef);
  applyKixikiPublicProjection(refreshed, page.documentRef);
  assert.equal(page.salad.priceElement.textContent, "R$ 32,00");
  assert.equal(page.nodes["kixiki-public-hours-summary"].textContent, "Seg 12:00–21:00");
  assert.equal(page.nodes["kixiki-public-hours-faq"].textContent, "Seg 12:00–21:00");
});

test("a mapped active product with no price exposes no invented price or CTA", () => {
  const page = createDocument();
  applyKixikiPublicProjection(
    {
      products: [{ id: "xis-salada", name: "X-Salada", active: true }],
      hours: [],
      operation: {},
    },
    page.documentRef,
  );
  assert.equal(page.salad.card.hidden, false);
  assert.equal(page.salad.priceElement.hidden, true);
  assert.equal(page.salad.button.hidden, true);
});

test("confirmed operation updates existing slots without creating an unknown claim", () => {
  const page = createDocument();
  applyKixikiPublicProjection(
    {
      products: [],
      hours: [],
      operation: { delivery: { enabled: true, area: "Sambaqui", hours: "18h às 22h" } },
    },
    page.documentRef,
  );
  assert.equal(
    page.nodes["kixiki-public-delivery-faq"].textContent,
    "Delivery disponível: Sambaqui · 18h às 22h",
  );

  const fallback = createDocument();
  applyKixikiPublicProjection(
    { products: [], hours: [], operation: {} },
    fallback.documentRef,
  );
  assert.equal(fallback.nodes["kixiki-public-delivery-faq"].textContent, "FAQ entrega estática");
});
