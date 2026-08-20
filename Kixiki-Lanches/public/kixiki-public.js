export const KIXIKI_PUBLIC_ENDPOINT = "/api/kixiki-public";

const WHATSAPP_NUMBER = "48988048681";

const PRODUCT_SLOTS = Object.freeze([
  { slot: "marmita-p", ids: ["marmita-p"], names: ["Marmita P (Executiva)"] },
  { slot: "marmita-g", ids: ["marmita-m", "marmita-g"], names: ["Marmita M (Tradicional)"] },
  { slot: "marmita-gg", ids: ["marmita-gg"], names: ["Marmita G / Especial Kixiki"] },
  { slot: "xis-salada", ids: ["xis-salada"], names: ["X-Salada"] },
  { slot: "xis-bacon", ids: ["xis-bacon"], names: ["X-Bacon"] },
  { slot: "xis-calabresa", ids: ["xis-calabresa"], names: ["X-Calabresa"] },
  { slot: "xis-frango", ids: ["xis-frango"], names: ["X-Frango"] },
  { slot: "xis-strogonoff", ids: ["xis-strogonoff"], names: ["X-Strogonoff"] },
  { slot: "xis-coracao", ids: ["xis-coracao"], names: ["X-Coração"] },
  { slot: "xis-egg", ids: ["xis-egg"], names: ["X-Egg"] },
  { slot: "xis-tudo", ids: ["xis-tudo"], names: ["Kixiki Especial (X-Tudo)"] },
  { slot: "pas-carne", ids: ["pas-carne"], names: ["Pastel Frango / Carne"] },
  { slot: "pas-queijo", ids: ["pas-queijo"], names: ["Pastel de Queijo"] },
  { slot: "pas-pizza", ids: ["pas-pizza"], names: ["Pastel Pizza"] },
  { slot: "pas-calabresa", ids: ["pas-calabresa"], names: ["Pastel Calabresa com Queijo"] },
  { slot: "por-batata", ids: ["por-batata"], names: ["Batata Frita Porção"] },
  { slot: "por-bacon", ids: ["por-bacon"], names: ["Batata Frita c/ Queijo e Bacon"] },
  { slot: "por-morro", ids: ["por-morro"], names: ["Morro de Batata"] },
]);

const DAY_LABELS = Object.freeze({
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
});

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const slotForProduct = (product) => {
  const id = normalize(product?.id);
  const name = normalize(product?.name);
  return PRODUCT_SLOTS.find(
    (entry) =>
      entry.ids.some((candidate) => normalize(candidate) === id) ||
      entry.names.some((candidate) => normalize(candidate) === name),
  );
};

const money = (priceCents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);

const cardFor = (priceElement, button) =>
  priceElement?.closest?.(".kx-food-card") || button?.parentElement || null;

const elementsForSlot = (documentRef, slot) => {
  const price = documentRef.getElementById(`val-${slot}`);
  const button = documentRef.getElementById(`btn-${slot}`);
  const card = cardFor(price, button);
  return {
    price,
    button,
    card,
    name: price?.previousElementSibling || null,
    description: card?.querySelector?.("p") || null,
  };
};

const formatHours = (hours) =>
  hours
    .map((entry) => {
      const day = DAY_LABELS[entry.day];
      if (!day) return null;
      return entry.open ? `${day} ${entry.opens}–${entry.closes}` : `${day} fechado`;
    })
    .filter(Boolean)
    .join(" · ");

const formatOperation = (operation) => {
  const parts = [];
  if (operation?.delivery?.enabled === false) {
    parts.push("Delivery indisponível");
  } else if (operation?.delivery?.enabled === true) {
    const details = [operation.delivery.area, operation.delivery.hours].filter(Boolean).join(" · ");
    parts.push(`Delivery disponível${details ? `: ${details}` : ""}`);
  }

  if (operation?.pickup?.enabled === false) {
    parts.push("Retirada indisponível");
  } else if (operation?.pickup?.enabled === true) {
    parts.push(`Retirada disponível${operation.pickup.hours ? `: ${operation.pickup.hours}` : ""}`);
  }
  return parts.join(" · ");
};

const updateProduct = (elements, product) => {
  if (elements.card) elements.card.hidden = false;
  if (elements.name) elements.name.textContent = product.name;
  if (elements.description && product.description) {
    elements.description.textContent = product.description;
  }

  if (Number.isInteger(product.priceCents)) {
    const price = money(product.priceCents);
    if (elements.price) {
      elements.price.hidden = false;
      elements.price.textContent = price;
    }
    if (elements.button) {
      elements.button.hidden = false;
      elements.button.textContent = `Pedir ${product.name} (${price})`;
      const message = `Olá! Gostaria de pedir 1x ${product.name} (${price}).`;
      elements.button.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
  } else {
    if (elements.price) elements.price.hidden = true;
    if (elements.button) elements.button.hidden = true;
  }
};

export const applyKixikiPublicProjection = (payload, documentRef = document) => {
  if (!payload || typeof payload !== "object") return false;

  const mappedProducts = Array.isArray(payload.products)
    ? payload.products
        .map((product) => ({ product, slot: slotForProduct(product) }))
        .filter(({ slot }) => slot)
    : [];

  if (Array.isArray(payload.products) && (mappedProducts.length > 0 || payload.products.length === 0)) {
    PRODUCT_SLOTS.forEach(({ slot }) => {
      const { card } = elementsForSlot(documentRef, slot);
      if (card) card.hidden = true;
    });
    mappedProducts.forEach(({ product, slot }) =>
      updateProduct(elementsForSlot(documentRef, slot.slot), product),
    );

    const featured = mappedProducts.slice(0, 2).map(({ product }) =>
      Number.isInteger(product.priceCents)
        ? `${product.name} (${money(product.priceCents)})`
        : product.name,
    );
    const stickyTitle = documentRef.getElementById("sticky-offer-title");
    if (stickyTitle && featured.length) stickyTitle.textContent = featured.join(" • ");
  }

  if (Array.isArray(payload.hours) && payload.hours.length > 0) {
    const summary = formatHours(payload.hours);
    if (summary) {
      const logistics = documentRef.getElementById("kixiki-public-hours-summary");
      const faq = documentRef.getElementById("kixiki-public-hours-faq");
      if (logistics) logistics.textContent = summary;
      if (faq) faq.textContent = summary;
    }
  }

  const operation = formatOperation(payload.operation);
  if (operation) {
    const logistics = documentRef.getElementById("kixiki-public-operation-summary");
    const faq = documentRef.getElementById("kixiki-public-delivery-faq");
    if (logistics) logistics.textContent = `🛵 ${operation}`;
    if (faq) faq.textContent = operation;
  }

  return true;
};

export const hydrateKixikiPublicData = async ({
  fetchImpl = fetch,
  documentRef = document,
  endpoint = KIXIKI_PUBLIC_ENDPOINT,
} = {}) => {
  try {
    const response = await fetchImpl(endpoint, {
      method: "GET",
      headers: { accept: "application/json" },
      credentials: "omit",
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return applyKixikiPublicProjection(payload, documentRef);
  } catch {
    return false;
  }
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const hydrate = () => hydrateKixikiPublicData();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate, { once: true });
  } else {
    hydrate();
  }
}
