# DropChina — Shopify

E-commerce da [DropChina](https://lista.mercadolivre.com.br/loja/dropchina-297222/) na Shopify, baseado no tema **Tinker** customizado.

Vendedor Platinum no Mercado Livre com +50 mil vendas — agora com loja própria.

## Estrutura do projeto

```
.
├── theme/                  # Tema Shopify Tinker customizado
│   ├── assets/             # CSS, JS, fontes, ícones
│   ├── blocks/             # Blocks reutilizáveis (cards, galerias, etc.)
│   ├── config/             # settings_data.json (paleta, fontes), settings_schema.json
│   ├── layout/             # theme.liquid, password.liquid
│   ├── locales/            # Traduções (pt-PT, pt, en, etc.)
│   ├── sections/           # Sections de página (hero, header, footer, etc.)
│   ├── snippets/           # Snippets compartilhados
│   ├── templates/          # Templates JSON (index, product, collection, etc.)
│   └── .shopifyignore      # Filtra ruído do watcher
│
├── catalogo/               # Scripts de setup do catálogo via Admin API
│   ├── setup-loja.mjs      # Cria 7 coleções + 28 produtos
│   └── setup-menus.mjs     # Cria menu principal + 3 menus do footer
│
├── pesquisa-ux-ui-ecommerce.md   # Pesquisa de boas práticas UX/UI usada como base
└── README.md
```

## Identidade visual

- **Primária:** `#0F4FA8` (azul DropChina) com hover `#0A3D80`
- **Acento:** `#E85D04` (laranja queimado, urgência/promo)
- **Cards:** cinza Apple `#F5F5F7`
- **Texto:** `#1A1A1A`
- **Botão primário:** preto (`#1A1A1A`) com hover azul — estilo Apple/VISION
- **Fonte:** Inter (body, subheading, heading, accent)

## Trabalhar no tema localmente

Pré-requisitos: [Node.js 24+](https://nodejs.org), [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install).

```bash
npm install -g @shopify/cli@latest

cd theme
shopify theme dev \
  --store=akfd19-1c.myshopify.com \
  --store-password=<senha-storefront>
```

O servidor sobe em `http://127.0.0.1:9292` com hot-reload.

## Recriar/atualizar o catálogo

Os scripts em `catalogo/` usam `shopify store auth` + `shopify store execute` (sem precisar de Custom App ou token manual).

```bash
# Autenticar uma vez (abre browser pra autorizar):
shopify store auth \
  --store=akfd19-1c.myshopify.com \
  --scopes=write_products,read_products,write_publications,read_publications,write_files,write_online_store_navigation,write_online_store_pages

# Criar/atualizar 7 coleções + 28 produtos:
node catalogo/setup-loja.mjs

# Criar/atualizar menus (header + 3 do footer):
node catalogo/setup-menus.mjs
```

## Catálogo

7 coleções smart (auto-preenchidas via tags):

- Cartuchos de Tinta
- Toners
- Papéis e Suprimentos
- Impressoras
- Periféricos e Acessórios
- Monitores
- Mini PCs e Computadores

28 produtos criados a partir do catálogo do Mercado Livre, com descrições estruturadas (overview, características, especificações, compatibilidade).

## Customizações principais

- **Templates JSON reescritos:** [theme/templates/index.json](theme/templates/index.json), [theme/templates/product.json](theme/templates/product.json), [theme/templates/collection.json](theme/templates/collection.json)
- **Header & Footer:** [theme/sections/header-group.json](theme/sections/header-group.json), [theme/sections/footer-group.json](theme/sections/footer-group.json) — em PT-BR, com selo ML Platinum
- **Color schemes:** [theme/config/settings_data.json](theme/config/settings_data.json) — 8 schemes mapeados pra paleta DropChina
