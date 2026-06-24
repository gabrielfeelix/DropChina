/**
 * Cria na Shopify (dropchina-9753) os produtos do Bling que TÊM NCM confirmado.
 * Fonte: mcp-meli/out/catalogo.json (dado do ML/Bling) + mcp-bling/src/scripts/ncm-map.json.
 *
 * Garantias:
 *  - SKU = código do Bling  → vínculo automático Bling↔Shopify (doc oficial: vincula por SKU)
 *  - tag categoria-*        → entra na coleção certa (smart collections por tag)
 *  - publica no canal Loja Virtual (senão não aparece na vitrine)
 *  - idempotente: pula SKU que já existe na loja (não duplica)
 *  - NÃO seta estoque: vem do Bling via sync (Bling = fonte do estoque)
 *
 * Pré: shopify store auth --store=dropchina-9753.myshopify.com --scopes=write_products,read_products,write_publications,read_publications,write_files
 *   node catalogo/upload-bling-to-shopify.mjs --dry   # mostra os 3 primeiros, não grava
 *   node catalogo/upload-bling-to-shopify.mjs         # cria tudo
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = "akfd19-1c.myshopify.com"; // domínio permanente da loja (dropchina-9753 é alias)
const PUBLICATION_ID = "gid://shopify/Publication/196225990875"; // Loja Virtual
const DRY = process.argv.includes("--dry");

const catalogo = JSON.parse(readFileSync(join(__dirname, "..", "mcp-meli", "out", "catalogo.json"), "utf8"));
const ncmMap = JSON.parse(readFileSync(join(__dirname, "..", "mcp-bling", "src", "scripts", "ncm-map.json"), "utf8"));
const arr = Array.isArray(catalogo) ? catalogo : Object.values(catalogo).find(Array.isArray);

function exec(query, variables = {}) {
  const res = spawnSync("shopify", ["store", "execute", `--store=${STORE}`, "--allow-mutations", "--query", query, "--variables", JSON.stringify(variables)], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (res.status !== 0) { console.error("CLI error:", res.stderr); throw new Error("shopify CLI exited non-zero"); }
  const jsonStart = res.stdout.indexOf("{\n") >= 0 ? res.stdout.indexOf("{\n") : res.stdout.indexOf("{");
  return JSON.parse(res.stdout.slice(jsonStart));
}

const slug = (s) => (s || "").normalize("NFKD").replace(/[^\w ]/g, "").trim().toLowerCase().replace(/\s+/g, "-");
const cleanTitle = (t) => (t || "").trim().replace(/\s+/g, " ").replace(/\b(\w{3,})(\s+\1\b)+/gi, "$1");
function tagDe(cat) {
  const c = (cat || "").toLowerCase();
  if (/toner/.test(c)) return "categoria-toners";
  if (/cartuchos de tinta/.test(c)) return "categoria-cartuchos";
  if (/papel|papéis/.test(c)) return "categoria-papeis";
  if (/impressão 3d|impressoras 3d/.test(c)) return "categoria-impressao-3d";
  if (/impressora/.test(c)) return "categoria-impressoras";
  if (/monitor/.test(c)) return "categoria-monitores";
  if (/mini pc|computador/.test(c)) return "categoria-mini-pcs";
  if (/placa de v|placas de v/.test(c)) return "placa-video";
  return "categoria-perifericos";
}
const SKIP_ATTR = /condição do item|é um acessório|é portátil|é recarregável|é carregado|formato de venda|unidades por kit|garantia/i;
function descricaoHtml(x) {
  const attrs = (x.atributos || []).filter((a) => a.valor && !["", "N/A"].includes(a.valor) && !SKIP_ATTR.test(a.nome || "")).slice(0, 8);
  const li = attrs.map((a) => `<li><strong>${a.nome}:</strong> ${a.valor}</li>`).join("");
  const base = (x.descricao || x.titulo || "").slice(0, 600);
  return `<p>${base}</p>` + (li ? `<h3>Especificações</h3><ul>${li}</ul>` : "");
}

// monta lista: 62 com NCM, dedup por sku
const comNcm = new Set(Object.entries(ncmMap).filter(([, v]) => v.confidence === "HIGH" && v.ncm).map(([s]) => s));
const bySku = {};
for (const x of arr) if (x.sku && !x.skuEhMlb && comNcm.has(x.sku)) bySku[x.sku] = bySku[x.sku] || x;
const produtos = Object.values(bySku);

const Q_EXISTS = `query($q: String!){ productVariants(first:20, query:$q){ nodes{ id sku } } }`;
const M_SET = `mutation($input: ProductSetInput!){ productSet(input:$input, synchronous:true){ product{ id } userErrors{ field message } } }`;
const M_PUB = `mutation($id: ID!, $pub: ID!){ publishablePublish(id:$id, input:{publicationId:$pub}){ userErrors{ message } } }`;

function exists(sku) {
  // busca por sku (com aspas duplas) e confirma match EXATO em código (SKU com espaço quebra busca solta)
  const r = exec(Q_EXISTS, { q: `sku:"${sku.replace(/"/g, "")}"` });
  return (r?.data?.productVariants?.nodes || []).some((n) => n.sku === sku);
}

async function main() {
  console.log(`${produtos.length} produtos com NCM no Bling.`);
  let criados = 0, pulados = 0, erros = 0;
  for (let i = 0; i < produtos.length; i++) {
    const x = produtos[i];
    const cat = (x.categoriaNome || "").split(">").pop().trim();
    const img = ((x.imagens || [])[0] || "").replace(/^http:/, "https:");
    const tags = [tagDe(x.categoriaNome), x.marca ? "marca-" + slug(x.marca) : null].filter(Boolean);
    const input = {
      title: cleanTitle(x.titulo),
      descriptionHtml: descricaoHtml(x),
      productType: cat || "Outros",
      vendor: x.marca || "DropChina",
      status: "ACTIVE",
      tags,
      productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
      variants: [{
        optionValues: [{ optionName: "Title", name: "Default Title" }],
        price: String(x.preco ?? 0),
        sku: x.sku,
        ...(x.gtin ? { barcode: String(x.gtin) } : {}),
        inventoryItem: { tracked: true },
      }],
      ...(img ? { files: [{ originalSource: img, contentType: "IMAGE" }] } : {}),
    };
    if (DRY) {
      if (i < 3) console.log(`\n--- ${x.sku} ---\n  título: ${input.title}\n  tags: ${tags}\n  preço: ${input.price ?? x.preco} | gtin: ${x.gtin || "-"}\n  img: ${img ? "ok" : "SEM"}\n  desc: ${descricaoHtml(x).slice(0, 120)}...`);
      continue;
    }
    try {
      if (exists(x.sku)) { console.log(`  ⏭️  ${x.sku} (já existe)`); pulados++; continue; }
      const r = exec(M_SET, { input });
      const errs = r?.data?.productSet?.userErrors || [];
      if (errs.length) { console.error(`  ❌ ${x.sku}: ${errs.map((e) => e.message).join("; ")}`); erros++; continue; }
      const id = r?.data?.productSet?.product?.id;
      if (id) {
        const pr = exec(M_PUB, { id, pub: PUBLICATION_ID });
        const pe = pr?.data?.publishablePublish?.userErrors || [];
        if (pe.length) console.error(`  ⚠️ ${x.sku} publish: ${pe.map((e) => e.message).join("; ")}`);
      }
      criados++;
      console.log(`  ✅ ${x.sku} → ${input.title.slice(0, 45)}`);
    } catch (e) { console.error(`  ❌ ${x.sku}: ${e.message}`); erros++; }
  }
  console.log(DRY ? "\n🧪 DRY — nada gravado." : `\n✅ ${criados} criados, ${pulados} pulados, ${erros} erros.`);
}
main();
