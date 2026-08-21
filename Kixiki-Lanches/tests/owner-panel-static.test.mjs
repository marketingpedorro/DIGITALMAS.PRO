import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("owner panel is pt-BR, private to search engines and contains the approved baseline", async () => {
  const html = await read("../public/dono/index.html");
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /noindex,nofollow,noarchive/);
  assert.match(html, /4,70/);
  assert.match(html, />19</);
  assert.match(html, /0<\/b> respostas observadas/);
  assert.match(html, /review-qr\.svg/);
});

test("owner panel follows the Kixiki forest, cream and mustard palette", async () => {
  const html = await read("../public/dono/index.html");
  const css = await read("../public/dono/styles.css");

  assert.match(html, /theme-color" content="#001e10"/);
  assert.match(css, /--bg-deep:\s*#001e10/);
  assert.match(css, /--cream:\s*#fff8e7/);
  assert.match(css, /--accent:\s*#f8b62f/);
  assert.doesNotMatch(css, /#9df52f|#b7ff58|157,\s*245,\s*47/i);
});

test("owner catalog is grouped and exposes compact editable product summaries", async () => {
  const html = await read("../public/dono/index.html");
  const app = await read("../public/dono/app.js");

  assert.match(html, /Os 18 itens atuais estão organizados por categoria/);
  assert.match(app, /const CATALOG_GROUPS =/);
  assert.match(app, /Marmitas caseiras/);
  assert.match(app, /Hambúrgueres e Xis Gaúcho/);
  assert.match(app, /Pastéis caseiros/);
  assert.match(app, /Porções e petiscos/);
  assert.match(app, /<details class="product-card">/);
});

test("save status and manual save action remain visible outside the overview", async () => {
  const html = await read("../public/dono/index.html");
  const app = await read("../public/dono/app.js");

  assert.match(html, /class="global-save-bar"/);
  assert.match(html, /id="saveStripButton"/);
  assert.equal((html.match(/data-save-state/g) || []).length, 2);
  assert.equal((html.match(/data-last-update/g) || []).length, 2);
  assert.match(app, /\$\$\('\[data-save-state\]'\)/);
  assert.match(app, /\$\$\('\[data-last-update\]'\)/);
  assert.match(app, /\$\("#saveStripButton"\)\.addEventListener\("click", syncRemote\)/);
});

test("every rendered catalog item has server-confirmed individual save feedback", async () => {
  const app = await read("../public/dono/app.js");
  const css = await read("../public/dono/styles.css");

  assert.match(app, /data-product-save="\$\{index\}"[^>]*>Salvar item</);
  assert.match(app, /data-product-feedback="\$\{escapeHtml\(item\.id\)\}"/);
  assert.match(app, /role="status" aria-live="polite"/);
  assert.match(app, /const outcome = await syncRemote\(\)/);
  assert.match(app, /✓ \$\{label\}: alterações salvas\./);
  assert.match(app, /Alterações deste item pendentes\./);
  assert.match(css, /\.product-save-feedback\.synced/);
  assert.match(css, /\.item-save-button/);
});

test("client code exposes exactly the three approved SEO priorities", async () => {
  const app = await read("../public/dono/app.js");
  const taskCopy = app.slice(app.indexOf("const TASK_COPY"), app.indexOf("const DAY_LABELS"));
  assert.equal((taskCopy.match(/\bid:/g) || []).length, 3);
  assert.match(taskCopy, /service-truth/);
  assert.match(taskCopy, /operational-data/);
  assert.match(taskCopy, /google-reputation/);
});

test("legacy demo auth and prohibited review language are absent", async () => {
  const html = await read("../public/dono/index.html");
  const app = await read("../public/dono/app.js");
  const combined = `${html}\n${app}`;
  assert.doesNotMatch(combined, /demo123|carlos\.dullius|sessionStorage/i);
  assert.doesNotMatch(combined, /5\s*estrelas?/i);
  assert.match(combined, /avaliação honesta/i);
});

test("owner panel uses its own endpoint and never the Director workspace", async () => {
  const app = await read("../public/dono/app.js");
  const handler = await read("../netlify/functions/kixiki-owner-handler.mjs");
  assert.match(app, /\/api\/kixiki-owner/);
  assert.doesNotMatch(app, /\/api\/workspace|director\//);
  assert.match(handler, /digitalmas-c001-owner/);
  assert.match(handler, /c001\/kixiki\/owner\/panel-v1\.json/);
  assert.doesNotMatch(handler, /digitalmas-agency-os|director\//);
});

test("Netlify config protects and routes the owner panel", async () => {
  const config = await read("../../netlify.toml");
  assert.match(config, /for = "\/dono\/\*"/);
  assert.match(config, /from = "\/api\/kixiki-owner"/);
  assert.match(config, /to = "\/\.netlify\/functions\/kixiki-owner"/);
  assert.match(config, /Cache-Control = "private, no-store"/);
});

test("public bridge is isolated from owner auth, writes and storage internals", async () => {
  const html = await read("../public/kixiki.html");
  const client = await read("../public/kixiki-public.js");
  const handler = await read("../netlify/functions/kixiki-public-handler.mjs");
  const config = await read("../../netlify.toml");

  assert.match(html, /src="\/kixiki-public\.js"/);
  assert.match(client, /\/api\/kixiki-public/);
  assert.doesNotMatch(client, /\/api\/kixiki-owner|Netlify|Blob|kixiki-owner|localStorage/);
  assert.doesNotMatch(handler, /getUser|\.set\(|PUT|POST|PATCH|DELETE/);
  assert.match(config, /from = "\/api\/kixiki-public"/);
  assert.match(config, /to = "\/\.netlify\/functions\/kixiki-public"/);
});

test("public HTML has neutral delivery fallbacks in hero, logistics and FAQ", async () => {
  const html = await read("../public/kixiki.html");
  assert.match(html, /kixiki-hero-sub[\s\S]*Consulte entrega ou retirada pelo WhatsApp/);
  assert.match(html, /kixiki-public-operation-summary[^>]*>🛵 Entrega ou retirada: consulte disponibilidade pelo WhatsApp/);
  assert.match(html, /kixiki-public-delivery-faq[^>]*>Consulte a disponibilidade de entrega ou retirada/);
  assert.doesNotMatch(
    html,
    /entrega rápida|entrega ágil|Raio de Entrega|Entregamos|dinheiro na entrega/i,
  );
});

test("generated review QR is valid SVG without invalid dimensions", async () => {
  const qr = await read("../public/dono/review-qr.svg");
  assert.match(qr, /<svg/);
  assert.match(qr, /viewBox="0 0 \d+ \d+"/);
  assert.doesNotMatch(qr, /NaN/);
});
