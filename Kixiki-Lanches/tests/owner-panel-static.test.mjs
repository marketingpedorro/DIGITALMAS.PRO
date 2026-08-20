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

test("generated review QR is valid SVG without invalid dimensions", async () => {
  const qr = await read("../public/dono/review-qr.svg");
  assert.match(qr, /<svg/);
  assert.match(qr, /viewBox="0 0 \d+ \d+"/);
  assert.doesNotMatch(qr, /NaN/);
});
