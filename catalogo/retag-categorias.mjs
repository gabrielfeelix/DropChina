/**
 * Re-tag de categorias na Shopify (loja viva), 100% dentro da Shopify.
 *
 * Cada produto recebe UMA tag canônica `categoria-<subcat>` derivada do
 * productType (campo já preenchido no import) + heurística de título.
 * As coleções smart casam por essa tag única; os departamentos são
 * coleções smart com OR das tags de subcategoria (sem tags extras).
 *
 * Taxonomia (5 departamentos):
 *   Impressão & Suprimentos · Informática · Papelaria · Beleza · Variedades
 *
 * Itens fora do nicho caem em `categoria-variedades` (catch-all).
 *
 * - NÃO toca no Bling (Shopify não empurra pro Bling). Preserva tags marca-*.
 * - Idempotente: só mexe se a tag de categoria mudar.
 *
 * Pré: shopify store auth --store=akfd19-1c.myshopify.com --scopes=write_products,read_products
 *   node catalogo/retag-categorias.mjs           # dry-run + distribuição
 *   node catalogo/retag-categorias.mjs --apply    # aplica
 */
import { spawnSync } from "node:child_process";

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

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/**
 * Mapeia productType (normalizado) -> tag de subcategoria.
 * Match exato primeiro; depois heurística por palavra-chave em type+título.
 */
const EXACT = {
  "toners": "categoria-toners",
  "cartuchos de tinta": "categoria-cartuchos-tinta",
  "impressoras": "categoria-impressoras",
  "impressoras 3d": "categoria-impressao-3d",
  "filamentos": "categoria-impressao-3d",
  "fones de ouvido": "categoria-audio",
  "fones": "categoria-audio",
  "teclados fisicos": "categoria-teclados",
  "kits de teclado e mouse": "categoria-teclados",
  "mouses": "categoria-teclados",
  "leitores de cartao": "categoria-perifericos",
  "monitores": "categoria-monitores",
  "placas de video": "categoria-placas-video",
  "antenas": "categoria-redes",
  "media streaming": "categoria-redes",
  "carregadores": "categoria-carregadores",
  "adaptadores": "categoria-cabos",
  "leitores e scanners": "categoria-perifericos",
  "hds e ssds": "categoria-armazenamento",
  "mini pcs": "categoria-mini-pcs",
  "gabinetes": "categoria-mini-pcs",
  "papeis para impressao": "categoria-papeis",
  "seladoras": "categoria-embalagem",
};

// palavra-chave (em productType OU título) -> tag. Ordem importa (mais específico antes).
const KEYWORDS = [
  [/3d|filament/, "categoria-impressao-3d"],
  [/cilindro|\bchip|correia|cabeca de impress|fotocondutor|\bpeca|revelador/, "categoria-cilindros-pecas"],
  [/toner/, "categoria-toners"],
  [/cartucho.*(tinta)|tinta.*cartucho|cartucho de tinta/, "categoria-cartuchos-tinta"],
  [/refil.*tinta|tinta.*refil|bulk ?ink/, "categoria-cartuchos-tinta"],
  [/papel|papeis|fotografic/, "categoria-papeis"],
  [/etiqueta|ribbon|bobina|rotul/, "categoria-etiquetas"],
  [/seladora|embalagem/, "categoria-embalagem"],
  [/impressora/, "categoria-impressoras"],
  [/scanner|leitor/, "categoria-perifericos"],
  [/teclado|mouse/, "categoria-teclados"],
  [/fone|headset|headphone|earbud|caixa de som|speaker|microfone/, "categoria-audio"],
  [/monitor/, "categoria-monitores"],
  [/placa de video|placa de vídeo|gpu|geforce|radeon|\bgt ?\d|\brx ?\d/, "categoria-placas-video"],
  [/ssd|\bhd\b|hd externo|armazenamento|pen ?drive|cartao de memoria|nvme/, "categoria-armazenamento"],
  [/mini ?pc|gabinete|placa mae|processador|memoria ram|\bram\b|fonte atx/, "categoria-mini-pcs"],
  [/carregador|fonte (de )?aliment/, "categoria-carregadores"],
  [/cabo|adaptador|hub usb|hdmi|displayport|\bvga\b/, "categoria-cabos"],
  [/antena|starlink|roteador|repetidor|streaming|wi-?fi|rede/, "categoria-redes"],
  [/suporte|mesa|stand|apoio/, "categoria-suportes"],
  [/cabelo|barba|barbear|aparador|escova|secador|chapinha|maquiagem|beleza|perfume|skincare|depil/, "categoria-beleza"],
];

const DEPT = {
  "categoria-impressoras": "Impressão & Suprimentos",
  "categoria-toners": "Impressão & Suprimentos",
  "categoria-cartuchos-tinta": "Impressão & Suprimentos",
  "categoria-impressao-3d": "Impressão & Suprimentos",
  "categoria-cilindros-pecas": "Impressão & Suprimentos",
  "categoria-audio": "Informática",
  "categoria-suportes": "Informática",
  "categoria-cabos": "Informática",
  "categoria-carregadores": "Informática",
  "categoria-teclados": "Informática",
  "categoria-monitores": "Informática",
  "categoria-placas-video": "Informática",
  "categoria-perifericos": "Informática",
  "categoria-redes": "Informática",
  "categoria-armazenamento": "Informática",
  "categoria-mini-pcs": "Informática",
  "categoria-papeis": "Papelaria",
  "categoria-etiquetas": "Papelaria",
  "categoria-embalagem": "Papelaria",
  "categoria-beleza": "Beleza",
  "categoria-variedades": "Variedades",
};

function classify(productType, title) {
  const t = norm(productType);
  if (EXACT[t]) return EXACT[t];
  const hay = `${t} ${norm(title)}`;
  for (const [re, tag] of KEYWORDS) if (re.test(hay)) return tag;
  return "categoria-variedades";
}

function allProducts() {
  const out = [];
  let cursor = null, page = 0;
  do {
    const q = `query($c:String){ products(first:100, after:$c){ nodes{ id title productType tags } pageInfo{ hasNextPage endCursor } } }`;
    const d = exec(q, cursor ? { c: cursor } : {});
    out.push(...d.products.nodes);
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
    page++;
  } while (cursor && page < 20);
  return out;
}

const TAGS_ADD = `mutation($id:ID!,$tags:[String!]!){ tagsAdd(id:$id, tags:$tags){ userErrors{ message } } }`;
const TAGS_REMOVE = `mutation($id:ID!,$tags:[String!]!){ tagsRemove(id:$id, tags:$tags){ userErrors{ message } } }`;

async function main() {
  const prods = allProducts();
  console.log(`${prods.length} produtos na Shopify.\n`);

  const byTag = {}, byDept = {}, unmappedTypes = {};
  let changes = 0;

  for (const p of prods) {
    const target = classify(p.productType, p.title);
    const dept = DEPT[target] || "??";
    byTag[target] = (byTag[target] || 0) + 1;
    byDept[dept] = (byDept[dept] || 0) + 1;
    if (target === "categoria-variedades") {
      const k = p.productType || "(sem tipo)";
      unmappedTypes[k] = (unmappedTypes[k] || 0) + 1;
    }

    const current = p.tags.filter((t) => t.startsWith("categoria-"));
    const needsAdd = !current.includes(target);
    const toRemove = current.filter((t) => t !== target);
    if (!needsAdd && toRemove.length === 0) continue;
    changes++;

    if (!APPLY) {
      console.log(`  ~ ${p.title.slice(0, 46).padEnd(46)} [${(p.productType || "").slice(0, 20)}] ${current.join(",") || "—"} → ${target}`);
      continue;
    }
    if (toRemove.length) exec(TAGS_REMOVE, { id: p.id, tags: toRemove });
    if (needsAdd) exec(TAGS_ADD, { id: p.id, tags: [target] });
  }

  console.log(`\n=== DEPARTAMENTOS ===`);
  for (const [d, n] of Object.entries(byDept).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${d}`);
  console.log(`\n=== TAGS DE SUBCATEGORIA ===`);
  for (const [t, n] of Object.entries(byTag).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${t}`);
  if (Object.keys(unmappedTypes).length) {
    console.log(`\n=== caíram em VARIEDADES (revisar se algum deveria ter categoria própria) ===`);
    for (const [t, n] of Object.entries(unmappedTypes).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${t}`);
  }
  console.log(`\n${APPLY ? "APLICADO" : "DRY-RUN"}: ${changes} produto(s) ${APPLY ? "re-taggeados" : "mudariam"}.`);
}

main();
