/**
 * Frete regional na Shopify (origem Curitiba/PR, CEP 83045-030).
 * 3 zonas com FRETE GRÁTIS por região (thresholds do Augusto) + tarifa paga
 * por faixa de PESO (estimativa conservadora — AJUSTAR com cotações reais).
 *
 *   Sul                -> grátis >= R$400
 *   Sudeste + C-Oeste  -> grátis >= R$600
 *   Norte + Nordeste   -> grátis >= R$1000
 *
 * Plano Basic não tem frete calculado (CCS); por isso tabela por peso manual.
 * Peso taxado real = max(peso, cubado C*L*A/6000) — cobrado pelo peso do produto.
 *
 * Pré: shopify store auth --store=akfd19-1c.myshopify.com
 *   node catalogo/setup-frete-regional.mjs           # dry
 *   node catalogo/setup-frete-regional.mjs --apply
 */
import { spawnSync } from "node:child_process";

const STORE = "akfd19-1c.myshopify.com";
const APPLY = process.argv.includes("--apply");
const BRL = "BRL";

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

// Faixas de peso (kg) e preço estimado por região (conservador, origem CWB).
const ZONES = [
  { name: "Sul", freeMin: 400, ufs: ["PR", "SC", "RS"],
    tiers: [{ max: 1, price: 20 }, { min: 1, max: 3, price: 32 }, { min: 3, max: 10, price: 62 }, { min: 10, max: 30, price: 115 }] },
  { name: "Sudeste e Centro-Oeste", freeMin: 600, ufs: ["SP", "RJ", "MG", "ES", "GO", "MT", "MS", "DF"],
    tiers: [{ max: 1, price: 28 }, { min: 1, max: 3, price: 45 }, { min: 3, max: 10, price: 95 }, { min: 10, max: 30, price: 185 }] },
  { name: "Norte e Nordeste", freeMin: 1000, ufs: ["AC", "AM", "AP", "PA", "RO", "RR", "TO", "MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"],
    tiers: [{ max: 1, price: 40 }, { min: 1, max: 3, price: 65 }, { min: 3, max: 10, price: 150 }, { min: 10, max: 30, price: 290 }] },
];

function methodsFor(z) {
  const methods = z.tiers.map((t) => {
    const wc = [];
    if (t.min != null) wc.push({ criteria: { value: t.min, unit: "KILOGRAMS" }, operator: "GREATER_THAN_OR_EQUAL_TO" });
    if (t.max != null) wc.push({ criteria: { value: t.max, unit: "KILOGRAMS" }, operator: "LESS_THAN_OR_EQUAL_TO" });
    const faixa = `${t.min ?? 0}–${t.max}kg`;
    return { name: `Correios PAC (${faixa})`, active: true, rateDefinition: { price: { amount: String(t.price), currencyCode: BRL } }, weightConditionsToCreate: wc };
  });
  methods.push({ name: `Frete grátis (acima de R$${z.freeMin})`, active: true, rateDefinition: { price: { amount: "0", currencyCode: BRL } }, priceConditionsToCreate: [{ criteria: { amount: String(z.freeMin), currencyCode: BRL }, operator: "GREATER_THAN_OR_EQUAL_TO" }] });
  return methods;
}

const Q_PROFILE = `{ deliveryProfiles(first:1){ nodes{ id profileLocationGroups{ locationGroup{ id } locationGroupZones(first:20){ nodes{ zone{ id name } } } } } } }`;
const M = `mutation($id:ID!,$profile:DeliveryProfileInput!){ deliveryProfileUpdate(id:$id, profile:$profile){ profile{ id } userErrors{ field message } } }`;

async function main() {
  const d = exec(Q_PROFILE);
  const prof = d.deliveryProfiles.nodes[0];
  const lg = prof.profileLocationGroups[0];
  const zonasAtuais = lg.locationGroupZones.nodes.map((n) => n.zone);
  console.log(`Perfil: ${prof.id}`);
  console.log(`Zonas atuais (serão apagadas): ${zonasAtuais.map((z) => z.name).join(", ") || "—"}`);

  const zonesToCreate = ZONES.map((z) => ({
    name: z.name,
    countries: [{ code: "BR", provinces: z.ufs.map((c) => ({ code: c })) }],
    methodDefinitionsToCreate: methodsFor(z),
  }));

  console.log("\nNovas zonas:");
  for (const z of ZONES) {
    console.log(`  ${z.name} (${z.ufs.length} UFs) — grátis ≥ R$${z.freeMin}`);
    for (const t of z.tiers) console.log(`     ${t.min ?? 0}–${t.max}kg: R$${t.price}`);
  }

  const profile = {
    zonesToDelete: zonasAtuais.map((z) => z.id),
    locationGroupsToUpdate: [{ id: lg.locationGroup.id, zonesToCreate }],
  };

  if (!APPLY) { console.log("\nDRY-RUN — nada aplicado. Rode com --apply."); return; }
  const r = exec(M, { id: prof.id, profile });
  const e = r.deliveryProfileUpdate.userErrors;
  if (e.length) { console.error("ERROS:", JSON.stringify(e, null, 2)); process.exit(1); }
  console.log("\n✅ APLICADO: 3 zonas regionais criadas.");
}

main();
