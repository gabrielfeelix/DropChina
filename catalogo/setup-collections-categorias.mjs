/**
 * Cria/alinha as smart collections da taxonomia DropChina (5 departamentos)
 * e publica no Online Store. Idempotente.
 *
 * - Subcategorias: 1 regra TAG EQUALS categoria-<subcat>.
 * - Departamentos: OR (appliedDisjunctively) das tags das subcategorias.
 * - Não cria subcats vazias (sem produto na loja) além de Beleza (placeholder
 *   pedido). As tags vazias entram só na regra OR do departamento (inertes).
 *
 * Pré: shopify store auth --store=akfd19-1c.myshopify.com
 *   node catalogo/setup-collections-categorias.mjs          # dry
 *   node catalogo/setup-collections-categorias.mjs --apply
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

const t = (tag) => ({ column: "TAG", relation: "EQUALS", condition: tag });

// handle -> definição. disj=true => departamento (OR de várias tags).
const DESIRED = [
  // --- subcategorias que precisam criar/ajustar ---
  { handle: "cartuchos-de-tinta", title: "Cartuchos de Tinta", disj: false, tags: ["categoria-cartuchos-tinta"] }, // troca regra antiga categoria-cartuchos
  { handle: "placas-de-video",   title: "Placas de Vídeo",     disj: false, tags: ["categoria-placas-video"] },   // troca regra antiga placa-video
  { handle: "audio",             title: "Áudio & Headsets",    disj: false, tags: ["categoria-audio"] },
  { handle: "teclados",          title: "Teclados & Mouses",   disj: false, tags: ["categoria-teclados"] },
  { handle: "redes",             title: "Redes & Streaming",   disj: false, tags: ["categoria-redes"] },
  { handle: "variedades",        title: "Variedades",          disj: false, tags: ["categoria-variedades"] },
  { handle: "beleza",            title: "Beleza",              disj: false, tags: ["categoria-beleza"] }, // placeholder (vazio até subir produtos)

  // --- departamentos (OR) ---
  { handle: "impressao", title: "Impressão & Suprimentos", disj: true,
    tags: ["categoria-impressoras", "categoria-toners", "categoria-cartuchos-tinta", "categoria-impressao-3d", "categoria-cilindros-pecas"] },
  { handle: "informatica", title: "Informática", disj: true,
    tags: ["categoria-audio", "categoria-teclados", "categoria-placas-video", "categoria-monitores", "categoria-perifericos",
           "categoria-redes", "categoria-mini-pcs", "categoria-cabos", "categoria-carregadores", "categoria-suportes", "categoria-armazenamento"] },
  { handle: "papelaria", title: "Papelaria", disj: true,
    tags: ["categoria-papeis", "categoria-etiquetas", "categoria-embalagem"] },
];

function existingCollections() {
  const out = {};
  let cursor = null, page = 0;
  do {
    const q = `query($c:String){ collections(first:100, after:$c){ nodes{ id handle title ruleSet{ appliedDisjunctively rules{ column relation condition } } } pageInfo{ hasNextPage endCursor } } }`;
    const d = exec(q, cursor ? { c: cursor } : {});
    for (const n of d.collections.nodes) out[n.handle] = n;
    cursor = d.collections.pageInfo.hasNextPage ? d.collections.pageInfo.endCursor : null;
    page++;
  } while (cursor && page < 10);
  return out;
}

function onlineStorePubId() {
  const d = exec(`query{ publications(first:20){ nodes{ id name } } }`);
  const p = d.publications.nodes.find((x) => /online store/i.test(x.name)) || d.publications.nodes[0];
  return p && p.id;
}

const rulesEqual = (a, want, disj) => {
  if (!a) return false;
  if (!!a.appliedDisjunctively !== !!disj) return false;
  const cur = (a.rules || []).map((r) => `${r.column}:${r.relation}:${r.condition}`).sort().join("|");
  const tgt = want.map((tag) => `TAG:EQUALS:${tag}`).sort().join("|");
  return cur === tgt;
};

const C_CREATE = `mutation($in:CollectionInput!){ collectionCreate(input:$in){ collection{ id handle } userErrors{ field message } } }`;
const C_UPDATE = `mutation($in:CollectionInput!){ collectionUpdate(input:$in){ collection{ id handle } userErrors{ field message } } }`;
const PUBLISH  = `mutation($id:ID!,$pid:ID!){ publishablePublish(id:$id, input:[{publicationId:$pid}]){ userErrors{ field message } } }`;

async function main() {
  const have = existingCollections();
  const pubId = APPLY ? onlineStorePubId() : "(dry)";
  let created = 0, updated = 0, ok = 0;

  for (const d of DESIRED) {
    const ex = have[d.handle];
    const ruleSet = { appliedDisjunctively: d.disj, rules: d.tags.map(t) };

    if (ex && rulesEqual(ex.ruleSet, d.tags, d.disj)) { ok++; console.log(`  = ${d.handle.padEnd(20)} ok`); continue; }

    if (ex) {
      updated++;
      console.log(`  ~ ${d.handle.padEnd(20)} UPDATE regra → ${d.tags.join(" | ")}`);
      if (APPLY) {
        const r = exec(C_UPDATE, { in: { id: ex.id, ruleSet } });
        const e = r.collectionUpdate.userErrors; if (e.length) console.error("   !", JSON.stringify(e));
      }
    } else {
      created++;
      console.log(`  + ${d.handle.padEnd(20)} CREATE "${d.title}" [${d.disj ? "OR" : "tag"}] → ${d.tags.join(" | ")}`);
      if (APPLY) {
        const r = exec(C_CREATE, { in: { title: d.title, handle: d.handle, ruleSet } });
        const e = r.collectionCreate.userErrors; if (e.length) { console.error("   !", JSON.stringify(e)); continue; }
        const id = r.collectionCreate.collection.id;
        if (pubId) { const pr = exec(PUBLISH, { id, pid: pubId }); const pe = pr.publishablePublish.userErrors; if (pe.length) console.error("   ! publish", JSON.stringify(pe)); }
      }
    }
  }
  console.log(`\n${APPLY ? "APLICADO" : "DRY-RUN"}: ${created} criar, ${updated} atualizar, ${ok} já ok.`);
}

main();
