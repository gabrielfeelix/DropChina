/**
 * Seta o PESO (pesoBruto do Bling, em kg) nas variantes da Shopify.
 * Fonte: catalogo/pesos-bling.json (codigo -> pesoBruto)  [gerar via mcp-bling dump-pesos]
 * Match: catalogo/vinculo-shopify-bling.csv (SKU/codigo Bling -> ID Produto Shopify)
 *
 * - Peso necessário pra tabela de frete por peso funcionar no checkout.
 * - Idempotente: só atualiza se o peso mudar (tolerância 1g).
 *
 * Pré: shopify store auth --store=akfd19-1c.myshopify.com
 *   node catalogo/set-pesos-shopify.mjs           # dry
 *   node catalogo/set-pesos-shopify.mjs --apply
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = "akfd19-1c.myshopify.com";
const APPLY = process.argv.includes("--apply");

function exec(query, variables = {}) {
  const args = ["store", "execute", `--store=${STORE}`, "--allow-mutations", "--query", query];
  if (Object.keys(variables).length) args.push("--variables", JSON.stringify(variables));
  const res = spawnSync("shopify", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (res.status !== 0) { console.error("CLI error:", res.stderr); throw new Error("CLI non-zero"); }
  const i = res.stdout.indexOf("{");
  const parsed = JSON.parse(res.stdout.slice(i));
  if (parsed.errors) { console.error(JSON.stringify(parsed.errors, null, 2)); throw new Error("GraphQL errors"); }
  return parsed.data || parsed;
}

const numId = (s) => String(s).match(/\d+/g)?.pop() || "";

// pesos: codigo -> pesoBruto(kg)
const pesos = JSON.parse(readFileSync(join(__dirname, "pesos-bling.json"), "utf8"));

// vinculo CSV: "SKU,ID" (ID = última coluna; SKU pode ter espaços)
const csv = readFileSync(join(__dirname, "vinculo-shopify-bling.csv"), "utf8").trim().split(/\r?\n/);
const idToPeso = {}; // shopifyProductId(num) -> pesoBruto
let semPesoNoMapa = 0;
for (const line of csv.slice(1)) {
  const parts = line.split(",");
  const pid = numId(parts[parts.length - 1]);
  const sku = parts.slice(0, -1).join(",").trim();
  const entry = pesos[sku];
  if (!pid) continue;
  if (entry && entry.pesoBruto > 0) idToPeso[pid] = entry.pesoBruto;
  else semPesoNoMapa++;
}
console.log(`Vínculo: ${csv.length - 1} linhas · ${Object.keys(idToPeso).length} com peso · ${semPesoNoMapa} sem peso no Bling`);

// produtos Shopify + variante + peso atual
function allShopify() {
  const out = [];
  let cursor = null, page = 0;
  do {
    const q = `query($c:String){ products(first:100, after:$c){ nodes{ id title variants(first:1){ nodes{ id inventoryItem{ measurement{ weight{ value unit } } } } } } pageInfo{ hasNextPage endCursor } } }`;
    const d = exec(q, cursor ? { c: cursor } : {});
    out.push(...d.products.nodes);
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
    page++;
  } while (cursor && page < 10);
  return out;
}

const M = `mutation($pid:ID!,$variants:[ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId:$pid, variants:$variants){ userErrors{ field message } } }`;

async function main() {
  const prods = allShopify();
  console.log(`${prods.length} produtos na Shopify.\n`);
  let upd = 0, ok = 0, semMatch = 0;

  for (const p of prods) {
    const peso = idToPeso[numId(p.id)];
    if (peso == null) { semMatch++; continue; }
    const v = p.variants.nodes[0];
    if (!v) { semMatch++; continue; }
    const cur = v.inventoryItem?.measurement?.weight;
    const curKg = cur ? (cur.unit === "GRAMS" ? cur.value / 1000 : cur.unit === "KILOGRAMS" ? cur.value : null) : null;
    if (curKg != null && Math.abs(curKg - peso) < 0.001) { ok++; continue; }

    upd++;
    if (!APPLY) { console.log(`  ~ ${p.title.slice(0, 48).padEnd(48)} ${curKg ?? "—"}kg → ${peso}kg`); continue; }
    const r = exec(M, { pid: p.id, variants: [{ id: v.id, inventoryItem: { measurement: { weight: { value: peso, unit: "KILOGRAMS" } } } }] });
    const e = r.productVariantsBulkUpdate.userErrors;
    if (e.length) console.error("   !", p.title.slice(0, 30), JSON.stringify(e));
  }

  console.log(`\n${APPLY ? "APLICADO" : "DRY-RUN"}: ${upd} ${APPLY ? "atualizados" : "mudariam"}, ${ok} já ok, ${semMatch} sem match/peso.`);
}

main();
