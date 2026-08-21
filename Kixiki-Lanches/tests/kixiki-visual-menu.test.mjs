import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  applyMenuImageFallback,
  buildProductCardMarkup,
  createProductWhatsappUrl,
  fallbackForProduct,
  toggleMenuCard,
} from "../public/kixiki-public.js";

const product = {
  id: "xis-bacon",
  name: "X-Bacon",
  priceCents: 3200,
  description: "O clássico do Kixiki.",
  ingredients: "pão, hambúrguer, queijo, bacon",
  photoUrl: "/api/kixiki-product-image?product=xis-bacon&v=abc",
  active: true,
};

test("visual card front uses a real photo and back uses dynamic product details", () => {
  const markup = buildProductCardMarkup(product);
  assert.match(markup, /class="kx-menu-face kx-menu-front"/);
  assert.match(markup, /class="kx-menu-face kx-menu-back"/);
  assert.match(markup, /kixiki-product-image\?product=xis-bacon&amp;v=abc/);
  assert.match(markup, />X-Bacon</);
  assert.match(markup, />R\$\u00a032,00</);
  assert.match(markup, /Ver detalhes/);
  assert.match(markup, /O clássico do Kixiki/);
  assert.match(markup, /<strong>Composição<\/strong>/);
  assert.match(markup, /<li>pão<\/li>/);
  assert.match(markup, /<li>bacon<\/li>/);
});

test("product names keep cream contrast on the forest front in both themes", async () => {
  const css = await readFile(new URL("../public/brand-v5-themes.css", import.meta.url), "utf8");
  assert.match(
    css,
    /html\[data-kx-theme="day"\][\s\S]*?#sec-cardapio\.kx-menu-upgraded \.kx-menu-front-copy h3,[\s\S]*?html\[data-kx-theme="night"\][\s\S]*?color:\s*#fff8e8\s*!important/,
  );
});

test("product without a photo receives its branded family fallback", () => {
  const markup = buildProductCardMarkup({ ...product, photoUrl: "" });
  assert.equal(fallbackForProduct("xis-bacon"), "/assets/kixiki-burger-menu-v1.svg");
  assert.match(markup, /kixiki-burger-menu-v1\.svg/);
  assert.match(markup, /class="is-fallback"/);
  assert.match(markup, /Ilustração do Kixiki para X-Bacon/);
});

test("failed product image switches to fallback without a broken-image state", () => {
  const classes = new Set();
  const image = {
    dataset: {
      kxFallback: "/assets/kixiki-burger-menu-v1.svg",
      kxFallbackAlt: "Ilustração do Kixiki para X-Bacon",
    },
    src: "https://preview.test/api/broken",
    alt: "Foto real",
    getAttribute: () => "/api/broken",
    classList: { add: (name) => classes.add(name) },
  };
  assert.equal(applyMenuImageFallback(image), true);
  assert.equal(image.src, "/assets/kixiki-burger-menu-v1.svg");
  assert.equal(image.alt, "Ilustração do Kixiki para X-Bacon");
  assert.equal(classes.has("is-fallback"), true);
});

test("WhatsApp CTA is outside the rotating body and contains the real product", () => {
  const markup = buildProductCardMarkup(product);
  const flipEnds = markup.indexOf("</div>\n    <a class=\"kx-menu-whatsapp\"");
  assert.ok(flipEnds > 0, "CTA must follow the closed flip body");
  assert.match(markup, /data-kx-track="whatsapp_click"/);
  const url = createProductWhatsappUrl(product);
  assert.match(decodeURIComponent(url), /X-Bacon — R\$ 32,00/);
});

test("card state toggles for click or keyboard handlers without moving the CTA", () => {
  const classes = new Set();
  const attributes = { front: "false", back: "true" };
  const flip = {
    expanded: "false",
    getAttribute() { return this.expanded; },
    setAttribute(_name, value) { this.expanded = value; },
    closest() {
      return {
        classList: {
          toggle(name, enabled) {
            if (enabled) classes.add(name);
            else classes.delete(name);
          },
        },
        querySelector(selector) {
          const face = selector.includes("front") ? "front" : "back";
          return { setAttribute: (_name, value) => { attributes[face] = value; } };
        },
      };
    },
  };
  assert.equal(toggleMenuCard(flip), true);
  assert.equal(flip.expanded, "true");
  assert.equal(classes.has("is-flipped"), true);
  assert.deepEqual(attributes, { front: "true", back: "false" });
  assert.equal(toggleMenuCard(flip), false);
  assert.equal(flip.expanded, "false");
  assert.equal(classes.has("is-flipped"), false);
  assert.deepEqual(attributes, { front: "false", back: "true" });
});

test("missing price is never invented and removes the order CTA", () => {
  const markup = buildProductCardMarkup({ ...product, priceCents: undefined });
  assert.doesNotMatch(markup, /kx-menu-whatsapp/);
  assert.match(markup, /kx-menu-price-pending/);
  assert.equal(createProductWhatsappUrl({ ...product, priceCents: null }), "");
});

test("product without ingredients renders only description without empty pending notice", () => {
  const markup = buildProductCardMarkup({ ...product, description: "Marmita completa reforçada.", ingredients: "" });
  assert.match(markup, /Marmita completa reforçada\./);
  assert.doesNotMatch(markup, /Ingredientes ainda não informados/);
  assert.doesNotMatch(markup, /Consulte o Kixiki pelo WhatsApp/);
  assert.doesNotMatch(markup, /<li>/);
});

test("card backface styles enforce cream background and dark forest text in both themes", async () => {
  const css = await readFile(new URL("../public/brand-v5-themes.css", import.meta.url), "utf8");
  assert.match(css, /html\[data-kx-theme="night"\][\s\S]*?\.kx-menu-back[\s\S]*?background:[\s\S]*?#fff8e8\s*!important/);
  assert.match(css, /html\[data-kx-theme="night"\][\s\S]*?\.kx-menu-back-copy h3\s*\{[\s\S]*?color:\s*#012b18\s*!important/);
  assert.match(css, /html\[data-kx-theme="night"\][\s\S]*?\.kx-menu-back-copy p\s*\{[\s\S]*?color:\s*#28553f\s*!important/);
  assert.match(css, /html\[data-kx-theme="night"\][\s\S]*?\.kx-menu-back-foot strong\s*\{[\s\S]*?color:\s*#a86d00\s*!important/);
});
