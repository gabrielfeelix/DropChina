# DropChina

Monorepo da [DropChina](https://lista.mercadolivre.com.br/loja/dropchina-297222/) — vendedor Platinum no Mercado Livre (+50 mil vendas) montando operação própria.

A loja Shopify é **apenas uma das superfícies**. A fonte de verdade de catálogo, estoque e fiscal é o **Bling** (ERP), exposto via MCP. Este repositório reúne todas as peças do negócio: ERP, tema da loja, scripts de catálogo, design e documentação.

## Arquitetura

```
  Mercado Livre  ──(read-only)──►  mcp-meli/  ──catálogo/auditoria──┐
   (anúncios)                                                       ▼
Bling (ERP)  ──fonte de verdade──►  mcp-bling/  ──tools──►  IA / automações
   │                                                              │
   └── catálogo, estoque, fiscal                                  ▼
                                                          theme/ (Shopify)  ──►  loja
```

## Estrutura do repositório

```
.
├── mcp-bling/        # MCP server (API v3 do Bling) — FONTE DE VERDADE
│   ├── src/api/      # client, categorias, produtos, nfe, campos customizados
│   ├── src/auth/     # OAuth 2.0 + token store
│   ├── src/mcp/      # server stdio (tools)
│   └── src/scripts/  # authorize, seed-*, load:meli, fill:estoque, fill:campos,
│                     #   discover:kits, enrich:descricao, set:short-desc, set:gtin
│
├── mcp-meli/         # Cliente READ-ONLY da API do Mercado Livre
│   ├── src/api/      # client (GET), items (scan/multiget), categories
│   ├── src/auth/     # OAuth 2.0 (refresh rotativo)
│   ├── src/mcp/      # server stdio (read-only)
│   └── src/scripts/  # authorize (colar code), pull-catalogo (auditoria)
│
├── mcp-shopee/       # (scaffold) Cliente READ-ONLY Shopee Open API v2 — auditoria
├── mcp-amazon/       # (scaffold) Cliente READ-ONLY Amazon SP-API — auditoria
│                     #   ↳ ativar só com conta+credencial; sync real é Bling nativo
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

### Catálogo — progresso e o que falta (18/jun/2026)

195 produtos no Bling (com SKU). Pull ML fresco (207 anúncios, 12 sem SKU pulados).

**GTIN — onde paramos (`set:gtin` lê `src/scripts/gtin-map.json`):**
- ✅ **14 GTIN gravados** (HIGH): 5 recuperados de campo errado da ficha ML (Pantum, Evolut 1105, GA.MA, Pcyes RTX, Snapmaker) + 9 pesquisados/confirmados (JBL 520BT preto×2 e branco, HP DHH-1601, HP DHE-8009, Ugreen 80191 ×2, Monitor Skul, Starlink Mini).
- 🟡 **MED — conferir na caixa antes** (no map, não gravados): Midea MDWTF08S1 (EAN varia por tensão 110/220V), Pcyes One B300 (varia por SO Linux/Windows).
- ⏳ **Pesquisa pendente** (2 lotes não rodados): cluster HP 667 (cartuchos preto/color/kit) e Patriot SSD 240/480 + Bambu A1 Combo.
- ⛔ **Sem EAN público** (NOT_FOUND, deixar vazio): Epson WF-C5890, ISD-12, Gabinete CLANM Grodd.
- ⛔ **Compatíveis/remanufaturados** (~35: Masterprint, Premium, Evolut, Genérica, Compatível…) e SKUs compartilhados ambíguos (BOMBA.DAGUA, CABO.HDMI.VGA): geralmente sem GTIN real — não inventar.
- Restam ~57 sem GTIN. **Regra:** GTIN errado é pior que vazio. Só grava HIGH com fonte; MED/dúvida → conferir caixa.

**Descrição curta:** `set:short-desc` gravou os 5 itens novos (Bambu, 2× SSD Patriot, Snapmaker, Vinik).

**NCM (`set:ncm` lê `src/scripts/ncm-map.json`) — fiscal confirmado pelo contador (24/jun):**
- ✅ **62 NCM gravados** (HIGH): núcleo do catálogo (toner 84439933, papel foto 4811xx, fone 85183000, cartucho tinta 84439923, impressoras, lava-louça, mini PC, Starlink, leitor). CSOSN 102, sem ST.
- 🟡 **26 MED** não gravados (matcher de nome incerto/errado — conferir).
- ⛔ **52 FLAG**: 33 gaps de nicho (SSD, monitor, filamento, carregador, placa, suporte…) → `docs/ncm-gaps-contador.md` pro contador validar; 19 fora do nicho (Augusto poda).
- Config fiscal completa: `docs/fiscal-config-confirmado.md`. Certificado A1 instalado (vence 29/09/2026).

Scripts seguros: `load:meli --create-only` (não re-PUTa existentes), `set:gtin`/`set:short-desc` testam `tributacao.origem` antes/depois e abortam se o PUT zerar campo.

## theme — loja Shopify

Tema custom **DropChina** (base Tinker, look Fantasy Gaming) — é o tema **publicado** na loja viva. A pasta `theme/` é a **fonte da verdade** e bate 1:1 com produção.

- Loja: **`dropchina-9753.myshopify.com`** · domínio: **dropchinaoficial.com.br**
- Tema vivo: **DropChina** `#161970290907`

Pré-requisitos: [Node.js 24+](https://nodejs.org) + [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install) (`npm i -g @shopify/cli@latest`).

### Fluxo: local → Shopify → GitHub
```bash
cd theme
# 1. preview ao vivo (hot-reload, NÃO toca na loja):
shopify theme dev --store=dropchina-9753.myshopify.com

# 2. subir pra loja (o site atualiza):
shopify theme push --store=dropchina-9753.myshopify.com --theme=161970290907

# 3. salvar no GitHub:
git add theme/ && git commit -m "..." && git push
```

> ⚠️ **Antes de `push`, faça `pull`.** Se alguém editar pelo painel da Shopify (editor de tema), rode `shopify theme pull` primeiro — senão o push do repo apaga o que mudou no painel. Vale principalmente pro `config/settings_data.json` (config do customizador).

### Catálogo (setup via Admin API)

Scripts em `catalogo/` usam `shopify store auth` + `shopify store execute` (sem Custom App nem token manual).

```bash
shopify store auth \
  --store=dropchina-9753.myshopify.com \
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
