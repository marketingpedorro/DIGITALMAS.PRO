export const KIXIKI_PUBLIC_ENDPOINT = "/api/kixiki-public";

const WHATSAPP_NUMBER = "48988048681";

export const NEUTRAL_OPERATION_COPY = Object.freeze({
  hero:
    "Marmitas quentinhas no almoço e lanches gigantes à noite. Consulte entrega ou retirada pelo WhatsApp.",
  logistics: "🛵 Entrega ou retirada: consulte disponibilidade pelo WhatsApp.",
  faq: "Consulte a disponibilidade de entrega ou retirada para sua região pelo WhatsApp.",
});

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

const MENU_FALLBACKS = Object.freeze({
  marmita: "/assets/kixiki-marmita-mascot-v1.svg",
  xis: "/assets/kixiki-burger-menu-v1.svg",
  pas: "/assets/kixiki-pastel-mascot-v1.svg",
  por: "/assets/kixiki-porcao-mascot-v1.svg",
  item: "/assets/kixiki-logo-v0.1.svg",
});

const MENU_CATEGORY = Object.freeze({
  marmita: "MARMITA",
  xis: "XIS",
  pas: "PASTEL",
  por: "PORÇÃO",
  item: "KIXIKI",
});

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>'"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
      character
    ],
  );

export const familyForProduct = (productId) => {
  const prefix = String(productId || "").split("-")[0];
  return Object.hasOwn(MENU_FALLBACKS, prefix) ? prefix : "item";
};

export const fallbackForProduct = (productId) => MENU_FALLBACKS[familyForProduct(productId)];

export const createProductWhatsappUrl = (product) => {
  if (!Number.isInteger(product?.priceCents)) return "";
  const price = money(product.priceCents);
  const message = `Olá! Vim pelo site do Kixiki e gostaria de pedir:\n${product.name} — ${price}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const safeProductPhoto = (value) => {
  if (typeof value !== "string" || !value) return "";
  if (value.startsWith("/api/kixiki-product-image?")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
};

const ingredientItems = (value) =>
  String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);

export const buildProductCardMarkup = (product) => {
  const id = normalize(product?.id);
  const name = String(product?.name || "").trim();
  if (!id || !name) return "";
  const family = familyForProduct(id);
  const fallback = fallbackForProduct(id);
  const photo = safeProductPhoto(product.photoUrl);
  const imageSrc = photo || fallback;
  const imageAlt = photo ? `${name} do Kixiki Lanches` : `Ilustração do Kixiki para ${name}`;
  const price = Number.isInteger(product.priceCents) ? money(product.priceCents) : "";
  const whatsapp = createProductWhatsappUrl(product);
  const ingredients = ingredientItems(product.ingredients);
  const backId = `kx-menu-back-${id}`;

  return `<article class="kx-menu-card" data-kixiki-product="${escapeHtml(id)}">
    <div class="kx-menu-flip" role="button" tabindex="0" aria-expanded="false" aria-controls="${escapeHtml(backId)}" aria-label="Ver ingredientes e detalhes de ${escapeHtml(name)}">
      <div class="kx-menu-inner">
        <section class="kx-menu-face kx-menu-front" aria-hidden="false" aria-label="Foto e preço de ${escapeHtml(name)}">
          <div class="kx-menu-photo">
            <img src="${escapeHtml(imageSrc)}" data-kx-fallback="${escapeHtml(fallback)}" data-kx-fallback-alt="${escapeHtml(`Ilustração do Kixiki para ${name}`)}" class="${photo ? "" : "is-fallback"}" width="640" height="480" loading="lazy" decoding="async" alt="${escapeHtml(imageAlt)}">
            <span class="kx-menu-category">${escapeHtml(MENU_CATEGORY[family])}</span>
          </div>
          <div class="kx-menu-front-copy">
            <h3>${escapeHtml(name)}</h3>
            ${price ? `<strong>${escapeHtml(price)}</strong>` : ""}
            <span class="kx-menu-flip-hint"><span aria-hidden="true">↻</span> Ver ingredientes</span>
          </div>
        </section>
        <section id="${escapeHtml(backId)}" class="kx-menu-face kx-menu-back" aria-hidden="true" aria-label="Ingredientes e detalhes de ${escapeHtml(name)}">
          <span class="kx-menu-category">${escapeHtml(MENU_CATEGORY[family])}</span>
          <div class="kx-menu-back-copy">
            <h3>${escapeHtml(name)}</h3>
            ${product.description ? `<p>${escapeHtml(product.description)}</p>` : ""}
            ${ingredients.length ? `<div class="kx-menu-ingredients"><strong>Ingredientes</strong><ul>${ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <div class="kx-menu-back-foot">
            ${price ? `<strong>${escapeHtml(price)}</strong>` : ""}
            <span><span aria-hidden="true">↻</span> Voltar para foto</span>
          </div>
        </section>
      </div>
    </div>
    ${whatsapp ? `<a class="kx-menu-whatsapp" data-kx-track="whatsapp_click" href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${escapeHtml(name)} no WhatsApp"><span aria-hidden="true">◉</span> Pedir no WhatsApp</a>` : `<span class="kx-menu-price-pending">Consulte o preço no WhatsApp</span>`}
  </article>`;
};

const parseStaticPrice = (value) => {
  const normalized = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
};

const staticMenuProducts = (documentRef) =>
  PRODUCT_SLOTS.flatMap(({ slot, ids }) => {
    const elements = elementsForSlot(documentRef, slot);
    const name = elements.name?.textContent?.trim();
    if (!name) return [];
    return [{
      id: ids[0],
      name,
      priceCents: parseStaticPrice(elements.price?.textContent),
      description: elements.description?.textContent?.trim() || "",
      ingredients: "",
      active: true,
    }];
  });

export const toggleMenuCard = (flip) => {
  const expanded = flip.getAttribute("aria-expanded") === "true";
  flip.setAttribute("aria-expanded", String(!expanded));
  const card = flip.closest(".kx-menu-card");
  card?.classList.toggle("is-flipped", !expanded);
  card?.querySelector?.(".kx-menu-front")?.setAttribute("aria-hidden", String(!expanded));
  card?.querySelector?.(".kx-menu-back")?.setAttribute("aria-hidden", String(expanded));
  return !expanded;
};

export const applyMenuImageFallback = (image) => {
  const fallback = image?.dataset?.kxFallback;
  if (!fallback || image.getAttribute("src") === fallback) return false;
  image.src = fallback;
  image.alt = image.dataset.kxFallbackAlt || "Ilustração de produto do Kixiki";
  image.classList.add("is-fallback");
  return true;
};

const bindVisualMenu = (root) => {
  root.querySelectorAll(".kx-menu-flip").forEach((flip) => {
    flip.addEventListener("click", () => toggleMenuCard(flip));
    flip.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleMenuCard(flip);
    });
  });

  root.querySelectorAll(".kx-menu-whatsapp").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
  });

  root.querySelectorAll(".kx-menu-photo img").forEach((image) => {
    image.addEventListener("error", () => applyMenuImageFallback(image));
  });
};

export const renderVisualMenu = (products, documentRef = document) => {
  const root = documentRef.getElementById("kixiki-visual-menu");
  const grid = documentRef.getElementById("kixiki-menu-grid");
  const empty = documentRef.getElementById("kixiki-menu-empty");
  const section = documentRef.getElementById("sec-cardapio");
  if (!root || !grid || !empty || !section || !Array.isArray(products)) return false;

  const visibleProducts = products.filter((product) => product?.active !== false && product?.name);
  grid.innerHTML = visibleProducts.map(buildProductCardMarkup).join("");
  empty.hidden = visibleProducts.length !== 0;
  root.hidden = false;
  section.classList.add("kx-menu-upgraded");
  bindVisualMenu(root);
  return true;
};

export const initVisualMenu = (documentRef = document) =>
  renderVisualMenu(staticMenuProducts(documentRef), documentRef);

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

const applyNeutralOperationCopy = (documentRef) => {
  const hero = documentRef.getElementById("kixiki-hero-sub");
  const logistics = documentRef.getElementById("kixiki-public-operation-summary");
  const faq = documentRef.getElementById("kixiki-public-delivery-faq");
  if (hero) hero.textContent = NEUTRAL_OPERATION_COPY.hero;
  if (logistics) logistics.textContent = NEUTRAL_OPERATION_COPY.logistics;
  if (faq) faq.textContent = NEUTRAL_OPERATION_COPY.faq;
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
  applyNeutralOperationCopy(documentRef);
  if (!payload || typeof payload !== "object") return false;

  const mappedProducts = Array.isArray(payload.products)
    ? payload.products
        .map((product) => ({ product, slot: slotForProduct(product) }))
        .filter(({ slot }) => slot)
    : [];

  if (Array.isArray(payload.products)) {
    renderVisualMenu(payload.products, documentRef);
  }

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
    if (!response.ok) {
      applyNeutralOperationCopy(documentRef);
      return false;
    }
    const payload = await response.json();
    return applyKixikiPublicProjection(payload, documentRef);
  } catch {
    applyNeutralOperationCopy(documentRef);
    return false;
  }
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const hydrate = () => {
    initVisualMenu();
    return hydrateKixikiPublicData();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate, { once: true });
  } else {
    hydrate();
  }
}
