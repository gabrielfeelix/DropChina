# DropChina

Monorepo da [DropChina](https://lista.mercadolivre.com.br/loja/dropchina-297222/) — vendedor Platinum no Mercado Livre (+50 mil vendas) montando operação própria.

A loja Shopify é **apenas uma das superfícies**. A fonte de verdade de catálogo, estoque e fiscal é o **Bling** (ERP), exposto via MCP. Este repositório reúne todas as peças do negócio: ERP, tema da loja, scripts de catálogo, design e documentação.

## Arquitetura

```
Bling (ERP)  ──fonte de verdade──►  mcp-bling/  ──tools──►  IA / automações
   │                                                              │
   └── catálogo, estoque, fiscal                                  ▼
                                                          theme/ (Shopify)  ──►  loja
```

## Estrutura do repositório

```
.
├── mcp-bling/        # MCP server (API v3 do Bling) — FONTE DE VERDADE
│   ├── src/api/      # client, categorias, rate-limiter
│   ├── src/auth/     # OAuth 2.0 + token store
│   ├── src/mcp/      # server stdio (tools)
│   └── src/scripts/  # authorize, seed-categorias
│
├── theme/            # Tema Shopify (Tinker customizado) — look Fantasy
│   ├── assets/       # CSS, JS, imagens (dropchina-fantasy.css, dc-*.js)
│   ├── blocks/       # blocks reutilizáveis
│   ├── config/       # settings_data.json, settings_schema.json
│   ├── layout/       # theme.liquid
│   ├── sections/     # dc-header, dc-hero-slideshow, dc-pdp, dc-plp, etc.
│   ├── snippets/     # dc-product-card, dc-search-input
│   └── templates/    # index, product, collection, page.* (JSON)
│
├── catalogo/         # Scripts de setup do catálogo via Shopify Admin API
├── design-oficial/   # Referência de design (HTML/CSS/JSX + screenshots)
├── docs/             # Planos e prompts (ex.: plano do redesign Fantasy)
├── audit/            # UI review
├── banners/          # Banners de origem (compre-por-linha, etc.)
├── extension/        # (arquivado) extensão auxiliar
└── scripts/          # Utilitários (import-images.py)
```

## mcp-bling — fonte de verdade

MCP server local pra API v3 do Bling. Catálogo, estoque e fiscal saem daqui; a loja é consumidora.

Estado atual (v0.1): OAuth 2.0 com refresh automático, rate limiter (≤3 req/s), tools `bling_list_categories` / `bling_create_category`, seed idempotente das 12 categorias. Produtos, estoque e NF-e nas próximas levas.

Detalhes, setup e runbook: [mcp-bling/README.md](mcp-bling/README.md). Arquitetura: [mcp-bling/01_DropChina_Projeto_e_Arquitetura.md](mcp-bling/01_DropChina_Projeto_e_Arquitetura.md).

```bash
cd mcp-bling
npm install
cp .env.example .env   # preencher credenciais do Bling
npm run authorize      # OAuth (abre browser)
npm run seed:categorias
```

## theme — loja Shopify

Tema Tinker customizado, look **Fantasy Gaming** (header preto, hero full-bleed, cards gaming, predictive search, PDP/PLP redesenhadas).

Pré-requisitos: [Node.js 24+](https://nodejs.org), [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install).

```bash
npm install -g @shopify/cli@latest

cd theme
shopify theme dev \
  --store=akfd19-1c.myshopify.com \
  --store-password=<senha-storefront>
```

Sobe em `http://127.0.0.1:9292` com hot-reload.

### Catálogo (setup via Admin API)

Scripts em `catalogo/` usam `shopify store auth` + `shopify store execute` (sem Custom App nem token manual).

```bash
shopify store auth \
  --store=akfd19-1c.myshopify.com \
  --scopes=write_products,read_products,write_publications,read_publications,write_files,write_online_store_navigation,write_online_store_pages

node catalogo/setup-loja.mjs    # coleções + produtos
node catalogo/setup-menus.mjs   # menus header + footer
```

> Médio prazo: o catálogo da loja passa a ser sincronizado a partir do Bling (via `mcp-bling/`), não mais por scripts manuais.

## Roadmap

- [x] Tema Shopify Fantasy (header, hero, PDP, PLP, footer, side-cart)
- [x] MCP Bling v0.1 — OAuth + categorias
- [ ] MCP Bling — produtos, estoque, NF-e
- [ ] Sincronização Bling → Shopify (catálogo + estoque)
