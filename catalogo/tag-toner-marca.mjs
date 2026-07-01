/**
 * Taggeia os toners por FABRICANTE COMPATÍVEL (marca da impressora), via título:
 * compat-hp / compat-brother / compat-samsung / compat-ricoh.
 * Base pras coleções "Toners HP/Brother/Samsung" (Augusto pediu separar por fabricante).
 *
 * Idempotente. Não mexe em outras tags.
 *   node catalogo/tag-toner-marca.mjs           # dry
 *   node catalogo/tag-toner-marca.mjs --apply
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

const norm = (s) => (s || "").toLowerCase();
// ordem: mais específico primeiro
const RULES = [
  ["compat-ricoh", /ricoh|sp\s?3500|sp\s?3510|sp\s?3410/],
  ["compat-samsung", /samsung|mlt|d111|m2020|m2070/],
  ["compat-brother", /brother|\btn[- ]?\d{3,4}|dcp|hl[- ]?1\d|l2540|l2520|l2360|l2320|l2720|l2740|l5652|l6702|1212|1617|1602|1510|1512/],
  ["compat-hp", /\bhp\b|w1105|1105|105a|107a|107w|108a|108w|135a|136a|137fnw|131a|133pn|w1330|w1332|m107|m135|m432|m408|330x/],
];
function classify(title) {
  const t = norm(title);
  for (const [tag, re] of RULES) if (re.test(t)) return tag;
  return null;
}

const TAGS_ADD = `mutation($id:ID!,$tags:[String!]!){ tagsAdd(id:$id, tags:$tags){ userErrors{ message } } }`;
const TAGS_REMOVE = `mutation($id:ID!,$tags:[String!]!){ tagsRemove(id:$id, tags:$tags){ userErrors{ message } } }`;
const ALL_COMPAT = ["compat-hp", "compat-brother", "compat-samsung", "compat-ricoh"];

async function main() {
  const d = exec(`{ products(first:100, query:"tag:categoria-toners"){ nodes{ id title tags } } }`);
  const prods = d.products.nodes;
  console.log(`${prods.length} toners.\n`);
  const cont = {}; let changes = 0, semClass = 0;

  for (const p of prods) {
    const target = classify(p.title);
    if (!target) { semClass++; console.log(`  ? sem classe: ${p.title.slice(0, 50)}`); continue; }
    cont[target] = (cont[target] || 0) + 1;
    const current = p.tags.filter((t) => t.startsWith("compat-"));
    const needsAdd = !current.includes(target);
    const toRemove = current.filter((t) => t !== target);
    if (!needsAdd && !toRemove.length) continue;
    changes++;
    if (!APPLY) { console.log(`  ~ ${p.title.slice(0, 50).padEnd(50)} → ${target}`); continue; }
    if (toRemove.length) exec(TAGS_REMOVE, { id: p.id, tags: toRemove });
    if (needsAdd) exec(TAGS_ADD, { id: p.id, tags: [target] });
  }
  console.log("\n=== por fabricante ===");
  for (const [k, v] of Object.entries(cont).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(2)}  ${k}`);
  console.log(`\n${APPLY ? "APLICADO" : "DRY-RUN"}: ${changes} mudariam · ${semClass} sem classe.`);
}

main();
