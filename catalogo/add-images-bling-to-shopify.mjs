/**
 * Adiciona as imagens EXTRAS (além da principal) aos produtos já na Shopify.
 * O upload original subiu só imagens[0]; o catálogo ML (mcp-meli/out/catalogo.json)
 * tem várias. Aqui completamos.
 *
 * MATCH pela imagem principal (não por SKU — os SKUs divergiram): a URL da imagem
 * de capa na Shopify contém o ID do Mercado Livre (ex.: MLB93794785027), igual ao
 * imagens[0] do catálogo. Casamento exato e imune ao drift de SKU.
 *
 * - NÃO toca no Bling (Shopify não empurra pro Bling).
 * - Idempotente: pula produto que já tem >= 2 mídias.
 *
 * Pré: shopify store auth --store=akfd19-1c.myshopify.com --scopes=write_products,read_products
 *   node catalogo/add-images-bling-to-shopify.mjs --dry
 *   node catalogo/add-images-bling-to-shopify.mjs
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = "akfd19-1c.myshopify.com";
const DRY = process.argv.includes("--dry");
const MAX_IMG = 10;

const catalogo = JSON.parse(readFileSync(join(__dirname, "..", "mcp-meli", "out", "catalogo.json"), "utf8"));
const arr = Array.isArray(catalogo) ? catalogo : Object.values(catalogo).find(Array.isArray);

function exec(query, variables = {}) {
  const args = ["store", "execute", `--store=${STORE}`, "--allow-mutations", "--query", query];
  if (Object.keys(variables).length) args.push("--variables", JSON.stringify(variables));
  const res = spawnSync("shopify", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (res.status !== 0) { console.error("CLI error:", res.stderr); throw new Error("CLI non-zero"); }
  const i = res.stdout.indexOf("{");
  const parsed = JSON.parse(res.stdout.slice(i));
  return parsed.data || parsed;
}

const https = (u) => (u || "").replace(/^http:/, "https:");
const mlId = (u) => { const m = (u || "").match(/ML[AB]\d+/); return m ? m[0] : null; };

// catálogo: mlId(imagens[0]) -> imagens extras
const catByImg = {};
for (const x of arr) {
  const imgs = (x.imagens || []).map(https).filter(Boolean);
  if (imgs.length < 2) continue;
  const id = mlId(imgs[0]);
  if (!id || catByImg[id]) continue;
  catByImg[id] = { extra: imgs.slice(1, MAX_IMG), title: x.titulo || x.sku };
}

const QP = `query{ products(first:100){ nodes{ id title featuredImage{ url } media(first:30){ nodes{ id } } } } }`;
const M = `mutation($pid:ID!,$media:[CreateMediaInput!]!){ productCreateMedia(productId:$pid, media:$media){ media{ id } mediaUserErrors{ field message } } }`;

async function main() {
  const data = exec(QP);
  const shop = data.products.nodes;
  console.log(`${shop.length} produtos na Shopify · ${Object.keys(catByImg).length} no catálogo com imagens extras.`);
  let upd = 0, skip = 0, err = 0, added = 0, nomatch = 0;
  for (const p of shop) {
    const id = mlId(p.featuredImage?.url);
    const cat = id && catByImg[id];
    if (!cat) { nomatch++; continue; }
    if (p.media.nodes.length >= 2) { skip++; continue; }
    const media = cat.extra.map((u) => ({ originalSource: u, mediaContentType: "IMAGE" }));
    if (!media.length) { skip++; continue; }
    if (DRY) { console.log(`  +  ${p.title.slice(0, 42)} → +${media.length}`); added += media.length; upd++; continue; }
    try {
      const r = exec(M, { pid: p.id, media });
      const e = r?.productCreateMedia?.mediaUserErrors || [];
      if (e.length) { console.error(`  ❌ ${p.title.slice(0, 30)}: ${e.map((z) => z.message).join("; ")}`); err++; continue; }
      upd++; added += media.length;
      console.log(`  ✅ ${p.title.slice(0, 42)} +${media.length}`);
    } catch (e) { console.error(`  ❌ ${p.title.slice(0, 30)}: ${e.message}`); err++; }
  }
  console.log(`\n${DRY ? "🧪 DRY" : "✅"} ${upd} produtos, +${added} imgs, ${skip} já ok, ${nomatch} sem match`);
}
main();
