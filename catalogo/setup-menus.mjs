import { spawnSync } from "node:child_process";

const STORE = "akfd19-1c.myshopify.com";
const MAIN_MENU_ID = "gid://shopify/Menu/261788303579";

const COLLECTIONS = {
  cartuchos: "gid://shopify/Collection/533896364251",
  toners: "gid://shopify/Collection/533896397019",
  papeis: "gid://shopify/Collection/533896429787",
  impressoras: "gid://shopify/Collection/533896462555",
  perifericos: "gid://shopify/Collection/533896495323",
  monitores: "gid://shopify/Collection/533896528091",
  miniPcs: "gid://shopify/Collection/533896560859",
};

function exec(query, variables = {}) {
  const res = spawnSync(
    "shopify",
    [
      "store",
      "execute",
      `--store=${STORE}`,
      "--allow-mutations",
      "--query",
      query,
      "--variables",
      JSON.stringify(variables),
    ],
    { encoding: "utf8" }
  );
  if (res.status !== 0) {
    console.error("CLI error:", res.stderr);
    throw new Error("shopify CLI exited non-zero");
  }
  const stdout = res.stdout;
  const jsonStart = stdout.indexOf("{\n");
  return JSON.parse(stdout.slice(jsonStart));
}

const collectionItem = (title, gid) => ({ title, type: "COLLECTION", resourceId: gid });
const httpItem = (title, url) => ({ title, type: "HTTP", url });

const MAIN_MENU_ITEMS = [
  { title: "Início", type: "FRONTPAGE", url: "/" },
  collectionItem("Cartuchos", COLLECTIONS.cartuchos),
  collectionItem("Toners", COLLECTIONS.toners),
  collectionItem("Impressoras", COLLECTIONS.impressoras),
  collectionItem("Periféricos", COLLECTIONS.perifericos),
  collectionItem("Monitores", COLLECTIONS.monitores),
  collectionItem("Mini PCs", COLLECTIONS.miniPcs),
];

const FOOTER_SHOP_ITEMS = [
  collectionItem("Cartuchos de Tinta", COLLECTIONS.cartuchos),
  collectionItem("Toners", COLLECTIONS.toners),
  collectionItem("Papéis e Suprimentos", COLLECTIONS.papeis),
  collectionItem("Impressoras", COLLECTIONS.impressoras),
  collectionItem("Periféricos", COLLECTIONS.perifericos),
  collectionItem("Monitores", COLLECTIONS.monitores),
  collectionItem("Mini PCs", COLLECTIONS.miniPcs),
  { title: "Todos os produtos", type: "CATALOG", url: "/collections/all" },
];

const FOOTER_HELP_ITEMS = [
  httpItem("Política de troca", "/policies/refund-policy"),
  httpItem("Política de privacidade", "/policies/privacy-policy"),
  httpItem("Termos de uso", "/policies/terms-of-service"),
  httpItem("Frete e entrega", "/policies/shipping-policy"),
];

const FOOTER_ABOUT_ITEMS = [
  httpItem("Vendedor Platinum no Mercado Livre", "https://lista.mercadolivre.com.br/loja/dropchina-297222/"),
  httpItem("WhatsApp", "https://wa.me/5511000000000"),
];

const MENU_UPDATE = `mutation menuUpdate($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, handle: $handle, items: $items) { menu { id handle title } userErrors { field message } } }`;

const MENU_CREATE = `mutation menuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) { menuCreate(title: $title, handle: $handle, items: $items) { menu { id handle title } userErrors { field message } } }`;

console.log("=== Atualizando main-menu ===");
{
  const r = exec(MENU_UPDATE, {
    id: MAIN_MENU_ID,
    title: "Menu principal",
    handle: "main-menu",
    items: MAIN_MENU_ITEMS,
  });
  const errs = r.menuUpdate.userErrors;
  if (errs.length) console.error("  ✗", JSON.stringify(errs, null, 2));
  else console.log(`  ✓ ${MAIN_MENU_ITEMS.length} itens`);
}

const footerMenus = [
  { title: "Comprar", handle: "footer-shop", items: FOOTER_SHOP_ITEMS },
  { title: "Atendimento", handle: "footer-help", items: FOOTER_HELP_ITEMS },
  { title: "Institucional", handle: "footer-about", items: FOOTER_ABOUT_ITEMS },
];

console.log("\n=== Criando menus do footer ===");
for (const m of footerMenus) {
  const r = exec(MENU_CREATE, m);
  const errs = r.menuCreate.userErrors;
  if (errs.length) console.error(`  ✗ ${m.handle}:`, JSON.stringify(errs, null, 2));
  else console.log(`  ✓ ${m.handle} (${m.items.length} itens)`);
}

console.log("\n✅ Menus configurados.");
