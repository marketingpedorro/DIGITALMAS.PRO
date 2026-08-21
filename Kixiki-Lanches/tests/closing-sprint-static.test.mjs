import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("public header has a secondary accessible owner key on every viewport", async () => {
  const html = await read("../public/kixiki.html");
  const css = await read("../public/brand-v5-themes.css");
  const runtime = await read("../public/kixiki.min.js");
  assert.match(html, /class="kx-owner-access" href="\/dono\/"/);
  assert.match(html, /aria-label="Acesso do proprietário"/);
  assert.match(html, /title="Acesso do proprietário"/);
  assert.match(html, /class="kx-header-actions"/);
  assert.match(html, /<script src="kixiki\.min\.js"><\/script>/);
  assert.match(runtime, /kx-theme-toggle/);
  assert.match(runtime, /kixiki-theme/);
  assert.match(css, /\.kx-owner-access/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.kx-header-actions/);
});

test("404 is branded, uses the official mascot and keeps a real Netlify 404 path", async () => {
  const html = await read("../public/404.html");
  const mascot = await read("../public/assets/kixiki-burger-mascot-v1.svg");
  const config = await read("../../netlify.toml");
  assert.match(html, /<title>Página não encontrada \| Kixiki Lanches<\/title>/);
  assert.match(html, /<span class="code">FORA DO CARDÁPIO<\/span>/);
  assert.doesNotMatch(html, /ERRO 404 · FORA DO CARDÁPIO/);
  assert.match(html, /Esse lanche não está no cardápio 😅/);
  assert.match(html, /Você caiu numa página que não existe/);
  assert.match(html, /E ficar por aqui não vai matar a fome/);
  assert.match(html, /href="\/">Voltar para o Kixiki<\/a>/);
  assert.match(html, /wa\.me\/48988048681/);
  assert.match(html, /kixiki-burger-mascot-v1\.svg/);
  assert.match(mascot, /<title[^>]*>Hamburguesinha Kixiki<\/title>/);
  assert.doesNotMatch(config, /from = "\/\*"[\s\S]*status = 200/);
});

test("Tática Regalo has approved copy, inverted brand scene and accessible scrollytelling", async () => {
  const html = await read("../public/kixiki.html");
  const css = await read("../public/brand-v5-themes.css");
  const section = html.slice(html.indexOf('id="sec-digitalmas-referral"'), html.indexOf("<!-- SECCIÓN 9"));
  assert.match(section, /Gostou do site do Kixiki\?/);
  assert.match(section, /o Kixiki deixou um presente para você\. 🎁/);
  assert.match(section, /Fale diretamente com a DigitalMas\.PRO e conte que chegou pelo Kixiki/);
  assert.match(section, /Quero descobrir meu presente →/);
  assert.match(section, /https:\/\/digitalmas\.pro\/\?utm_source=kixiki&amp;utm_medium=referral&amp;utm_campaign=referral_mvp_01/);
  assert.match(section, /data-kx-track-view="gift_view"/);
  assert.match(section, /data-kx-track="gift_cta_click"/);
  assert.doesNotMatch(section, /KIXIKI20|20% DE DESCONTO/i);
  assert.equal((section.match(/<a\b/g) || []).length, 1);
  assert.match(section, /class="kx-gift-stage"/);
  assert.match(section, /class="kx-gift-orbit" aria-hidden="true"/);
  assert.match(css, /#sec-digitalmas-referral\.kx-gift\s*\{[\s\S]*?display:\s*grid\s*!important/);
  assert.match(css, /#sec-digitalmas-referral\.kx-gift\s*\{[\s\S]*?linear-gradient\(125deg, #f8b62f/);
  assert.match(css, /\.kx-gift-cta\s*\{[\s\S]*?background:\s*#012b17/);
  assert.match(css, /@supports \(animation-timeline: view\(\)\)/);
  assert.match(css, /view-timeline-name:\s*--kx-gift-scene/);
  assert.match(css, /animation-timeline:\s*--kx-gift-scene/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?#sec-digitalmas-referral[\s\S]*?animation:\s*none !important/);
});

test("client emits only the four MVP events and preserves first-party attribution", async () => {
  const html = await read("../public/kixiki.html");
  const client = await read("../public/kixiki-analytics.js");
  const config = await read("../../netlify.toml");
  assert.match(html, /src="\/kixiki-analytics\.js"/);
  for (const event of ["page_view", "whatsapp_click", "gift_view", "gift_cta_click"]) {
    assert.match(client, new RegExp(`"${event}"`));
  }
  assert.match(client, /utm_source/);
  assert.match(client, /utm_medium/);
  assert.match(client, /utm_campaign/);
  assert.match(client, /document\.referrer/);
  assert.match(client, /sessionStorage/);
  assert.doesNotMatch(client, /lead_created|client_won|email|userId|fingerprint/i);
  assert.match(config, /from = "\/api\/kixiki-events"/);
  assert.match(config, /from = "\/api\/kixiki-metrics"/);
});

test("owner panel exposes a compact read-only verification surface for MVP metrics", async () => {
  const html = await read("../public/dono/index.html");
  const app = await read("../public/dono/app.js");
  assert.match(html, /MEDIÇÃO MVP · C001/);
  assert.match(html, /id="metricPageView"/);
  assert.match(html, /id="metricWhatsappClick"/);
  assert.match(html, /id="metricGiftView"/);
  assert.match(html, /id="metricGiftClick"/);
  assert.match(app, /\/api\/kixiki-metrics/);
  assert.match(app, /credentials: "same-origin"/);
});
