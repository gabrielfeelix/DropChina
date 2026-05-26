# Prompt: Chrome Extension "DropChina Importer"

## Contexto do projeto

Sou dono da loja DropChina (Shopify) — `dropchina-9753.myshopify.com`. Vendo produtos
de escritório (cartuchos, toners, impressoras, periféricos). Tenho 28 produtos
cadastrados mas as imagens são placeholders cinza. Quero importar fotos e dados de
anúncios meus do **Mercado Livre** (loja `dropchina-297222`) e de páginas de outras
plataformas (Shopee, AliExpress, OLX, sites de fabricante tipo HP/Brother).

Sites como Mercado Livre/Shopee têm anti-bot agressivo (Cloudflare, captcha, 403 em
scrapers servidor-side). A única forma confiável de extrair conteúdo é via **Chrome
Extension** rodando no contexto do browser do usuário (já passou pelo captcha,
sessão autenticada se necessário).

## Objetivo

Construir uma **Chrome Extension MV3** chamada **"DropChina Importer"** que:

1. **Detecta** quando o usuário está numa página de produto (Mercado Livre, Shopee,
   AliExpress, OLX, sites fabricante) e injeta um botão "Importar pra DropChina".
2. Ao clicar, **extrai do DOM**: título, preço, descrição, marca/vendor, URLs de
   todas as imagens (principal + galeria), variantes (cor/tamanho), SKU se houver.
3. Mostra um **popup de preview/edit** com os dados extraídos. Usuário pode:
   - Editar título, preço, descrição
   - Marcar/desmarcar imagens (algumas podem ser irrelevantes)
   - Escolher coleção destino (Cartuchos, Toners, Impressoras, etc — lista vem da loja)
   - Definir status (draft/active)
4. Ao confirmar, **chama a Shopify Admin API REST/GraphQL**:
   - `productCreate` (cria produto com título/preço/descrição/vendor/tags)
   - `productCreateMedia` (faz upload das imagens via URL — Shopify baixa)
   - `collectionAddProducts` (adiciona à coleção escolhida)
5. **Mostra resultado**: link pro produto no admin Shopify + opção "Próximo".

Modo **bulk** opcional: numa página de listagem (ex: minha loja inteira no ML),
botão "Importar todos os produtos desta página" — abre cada produto em iframe/tab
oculta, extrai, fila, importa um por um com progress bar.

## Stack técnica

- **Manifest V3** (Chrome ≥ 88, Edge, Brave compatíveis)
- **TypeScript** estrito (recomendado) ou JavaScript ES modules
- **Vite** com plugin `@crxjs/vite-plugin` (build, hot reload, manifest gen)
- **React 18** + **TailwindCSS** pro popup/options UI
- Sem dependência de framework pesado nos content scripts (vanilla JS direto no DOM
  alvo pra evitar conflito com a página).
- **Zustand** pra state management leve (queue de imports, sessão Shopify)
- **chrome.storage.local** pra persistir credenciais Shopify e configurações
- **chrome.runtime.sendMessage** pra comunicar content script ↔ background ↔ popup

## Estrutura de arquivos

```
dropchina-importer/
├── manifest.json              # MV3 manifest gerado por crxjs
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Listener mensagens, chama Shopify API
│   ├── content/
│   │   ├── injector.ts        # Detecta site, injeta botão
│   │   ├── extractors/
│   │   │   ├── mercadolivre.ts
│   │   │   ├── shopee.ts
│   │   │   ├── aliexpress.ts
│   │   │   ├── olx.ts
│   │   │   ├── generic.ts     # Fallback baseado em JSON-LD / Open Graph
│   │   │   └── index.ts       # Router por hostname
│   │   └── ui/
│   │       └── floating-button.ts  # Botão flutuante com CSS isolado (shadow DOM)
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── ProductPreview.tsx
│   │   ├── ImageGrid.tsx       # Seleção das imagens
│   │   ├── CollectionPicker.tsx
│   │   └── ImportQueue.tsx     # Lista de bulk import em andamento
│   ├── options/
│   │   └── Settings.tsx        # Config: store domain, access token, default collection
│   ├── lib/
│   │   ├── shopify.ts          # Admin REST + GraphQL client
│   │   ├── extractors-utils.ts # Helpers comuns (parseBRL, sanitizeTitle, etc)
│   │   └── storage.ts          # Wrapper chrome.storage com tipos
│   └── types/
│       ├── product.ts          # Interface ExtractedProduct
│       └── shopify.ts          # Tipos Admin API (products, collections, media)
├── public/
│   └── icons/                  # 16, 32, 48, 128px
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## manifest.json (essencial)

```json
{
  "manifest_version": 3,
  "name": "DropChina Importer",
  "version": "1.0.0",
  "description": "Importa produtos de Mercado Livre, Shopee e mais pra loja Shopify DropChina.",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://*.mercadolivre.com.br/*",
    "https://*.mercadolibre.com/*",
    "https://shopee.com.br/*",
    "https://pt.aliexpress.com/*",
    "https://www.olx.com.br/*",
    "https://*.myshopify.com/*",
    "https://shopify.com/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
  },
  "content_scripts": [
    {
      "matches": [
        "https://produto.mercadolivre.com.br/*",
        "https://www.mercadolivre.com.br/*",
        "https://lista.mercadolivre.com.br/*",
        "https://shopee.com.br/*",
        "https://pt.aliexpress.com/item/*"
      ],
      "js": ["src/content/injector.ts"],
      "run_at": "document_idle"
    }
  ],
  "options_page": "src/options/index.html",
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```

## Extractor por site — exemplo Mercado Livre

```typescript
// src/content/extractors/mercadolivre.ts
import type { ExtractedProduct } from '@/types/product';

export function extractMercadoLivre(): ExtractedProduct | null {
  // Verificar se é página de produto (tem .ui-pdp-title)
  const titleEl = document.querySelector('.ui-pdp-title');
  if (!titleEl) return null;

  const title = titleEl.textContent?.trim() ?? '';

  // Preço: ML tem 2 elementos — fração e centavos
  const priceWhole = document.querySelector('.andes-money-amount__fraction')?.textContent?.replace(/\./g, '');
  const priceCents = document.querySelector('.andes-money-amount__cents')?.textContent ?? '00';
  const price = priceWhole ? parseFloat(`${priceWhole}.${priceCents}`) : 0;

  // Descrição
  const description = document.querySelector('.ui-pdp-description__content')?.innerHTML ?? '';

  // Vendor (marca, dentro da tabela de specs)
  let vendor = '';
  document.querySelectorAll('.andes-table__row').forEach((row) => {
    const th = row.querySelector('th')?.textContent?.trim().toLowerCase();
    if (th === 'marca') {
      vendor = row.querySelector('td')?.textContent?.trim() ?? '';
    }
  });

  // Galeria de imagens (ML usa thumbs <figure> com links pra imagem grande)
  const images = Array.from(
    document.querySelectorAll('.ui-pdp-gallery__figure img, .ui-pdp-image')
  )
    .map((img) => {
      const src = (img as HTMLImageElement).src;
      // ML serve thumbs 50x50 — substituir por full size
      return src.replace(/-[A-Z]\.(jpg|webp|png)/, '-F.$1');
    })
    .filter((url, i, arr) => arr.indexOf(url) === i); // dedupe

  // SKU (se disponível)
  const sku = document.querySelector('[data-testid="sku"]')?.textContent?.trim();

  // Variantes (cor/tamanho) — ML tem .ui-pdp-variations
  const variants = Array.from(document.querySelectorAll('.ui-pdp-variations__picker')).map((picker) => ({
    name: picker.querySelector('.ui-pdp-variations__title')?.textContent?.trim() ?? '',
    options: Array.from(picker.querySelectorAll('.ui-pdp-variations__option'))
      .map((opt) => opt.textContent?.trim() ?? '')
      .filter(Boolean),
  }));

  return {
    source: 'mercadolivre',
    sourceUrl: window.location.href,
    title,
    price,
    currency: 'BRL',
    description,
    vendor,
    sku,
    images,
    variants,
  };
}
```

## Interface ExtractedProduct

```typescript
// src/types/product.ts
export interface ExtractedProduct {
  source: 'mercadolivre' | 'shopee' | 'aliexpress' | 'olx' | 'generic';
  sourceUrl: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  description: string;
  vendor?: string;
  sku?: string;
  images: string[];
  variants: Array<{
    name: string;
    options: string[];
  }>;
  collectionHandle?: string; // user picks in popup
}
```

## Shopify Admin Client

```typescript
// src/lib/shopify.ts
import type { ExtractedProduct } from '@/types/product';

const API_VERSION = '2026-01';

export class ShopifyClient {
  constructor(
    private storeDomain: string, // ex: dropchina-9753.myshopify.com
    private accessToken: string  // Admin API access token (Custom App)
  ) {}

  private get headers() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  private get graphqlEndpoint() {
    return `https://${this.storeDomain}/admin/api/${API_VERSION}/graphql.json`;
  }

  async createProduct(product: ExtractedProduct): Promise<{ id: string; handle: string }> {
    const mutation = `
      mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
          product { id handle title }
          userErrors { field message }
        }
      }
    `;

    const variables = {
      input: {
        title: product.title,
        descriptionHtml: product.description,
        vendor: product.vendor || 'DropChina',
        productType: this.inferProductType(product),
        status: 'DRAFT',
        tags: this.inferTags(product),
        variants: [{
          price: product.price.toFixed(2),
          sku: product.sku || '',
          inventoryManagement: 'SHOPIFY',
          inventoryPolicy: 'DENY',
        }],
      },
      media: product.images.map((url) => ({
        originalSource: url,
        mediaContentType: 'IMAGE',
        alt: product.title,
      })),
    };

    const res = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await res.json();
    if (data.data?.productCreate?.userErrors?.length) {
      throw new Error(data.data.productCreate.userErrors.map((e: any) => e.message).join(', '));
    }
    return {
      id: data.data.productCreate.product.id,
      handle: data.data.productCreate.product.handle,
    };
  }

  async listCollections(): Promise<Array<{ id: string; title: string; handle: string }>> {
    const query = `
      query {
        collections(first: 50) {
          nodes { id title handle }
        }
      }
    `;
    const res = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    return data.data.collections.nodes;
  }

  async addToCollection(productId: string, collectionId: string): Promise<void> {
    const mutation = `
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection { id }
          userErrors { field message }
        }
      }
    `;
    await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        query: mutation,
        variables: { id: collectionId, productIds: [productId] },
      }),
    });
  }

  private inferProductType(product: ExtractedProduct): string {
    const t = product.title.toLowerCase();
    if (t.includes('cartucho')) return 'Cartuchos';
    if (t.includes('toner')) return 'Toners';
    if (t.includes('impressora')) return 'Impressoras';
    if (t.includes('monitor')) return 'Monitores';
    return 'Periféricos';
  }

  private inferTags(product: ExtractedProduct): string[] {
    const tags = ['importado', product.source];
    if (product.vendor) tags.push(product.vendor.toLowerCase());
    return tags;
  }
}
```

## Configuração inicial (Options page)

Usuário precisa configurar 2 coisas ANTES de usar:

1. **Store domain**: `dropchina-9753.myshopify.com`
2. **Admin API access token**: gerado no Shopify Admin → Settings → Apps and sales
   channels → Develop apps → Create app → Configure Admin API scopes → habilitar:
   - `write_products`
   - `write_inventory`
   - `read_inventory`
   - `write_publications` (pra publicar online store)
   - `read_files` / `write_files` (pra upload de mídia)

Salvar token em `chrome.storage.local` (criptografado se possível — usar
`SubtleCrypto` API com chave derivada de password do usuário).

## UX do popup (React)

```
┌──────────────────────────────────────┐
│ DropChina Importer        [⚙ config] │
├──────────────────────────────────────┤
│ Detectado: Mercado Livre             │
│                                      │
│ Título:                              │
│ ┌──────────────────────────────────┐ │
│ │ Cartucho HP 667 Preto Original   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Preço: R$ 89,90                      │
│ Marca: HP                            │
│                                      │
│ Imagens (6 encontradas):             │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┐│
│ │ ☑   │ ☑   │ ☑   │ ☐   │ ☑   │ ☑   ││
│ │ img │ img │ img │ img │ img │ img ││
│ └─────┴─────┴─────┴─────┴─────┴─────┘│
│                                      │
│ Coleção: [Cartuchos ▼]               │
│ Status:  [Draft ▼]                   │
│                                      │
│      [Cancelar]  [Importar →]        │
└──────────────────────────────────────┘
```

Após import: tela de sucesso com link "Ver no Admin" e botão "Próximo produto".

## Modo bulk

Numa página de listagem (`lista.mercadolivre.com.br/loja/...`), detectar e injetar
botão "Importar todos (N produtos)". Ao clicar:

1. Extrair URLs de todos os produtos da listagem (paginar se necessário).
2. Abrir cada URL em iframe oculto (sandbox + permissions corretas) ou via
   `chrome.tabs.create({ active: false })`.
3. Aguardar load, executar extractor via `chrome.scripting.executeScript`.
4. Enfileirar dados na storage local com status `pending`.
5. Worker processa fila com rate limit (2 produtos/segundo pra não bater rate limit
   Shopify) e atualiza progresso visível.
6. Erros vão pra fila `failed` com botão "Retry".

## Considerações de segurança e ética

- **Access token Shopify nunca em logs**. Armazenar em `chrome.storage.local`, ler
  apenas no background service worker, nunca expor em content scripts.
- **Respeitar `robots.txt`** quando possível (apesar do uso interpessoal — você é
  dono dos próprios anúncios no ML, então é seu conteúdo).
- **Rate limit**: Shopify Admin API tem cost-based limit (40 cost/segundo pra REST,
  GraphQL é leaky bucket). Implementar exponential backoff em 429.
- **Não fazer scraping massivo de competidores** — escopo é importar próprios
  anúncios pra própria loja. Adicionar disclaimer na options page.
- **Termos do Shopify**: Custom Apps são permitidos pra uso interno. App não vai pra
  marketplace público então sem revisão.
- **Termos do Mercado Livre**: scraping de páginas próprias pra uso pessoal é
  geralmente OK; scraping de competidores pode violar TOS.
- **LGPD**: não coletar dados de usuários, só de páginas públicas de produtos.

## Considerações de robustez

- **Selectors quebram quando o site atualiza HTML**. Centralizar selectors em
  constantes (`src/content/extractors/selectors.ts`) pra atualizar rápido.
- **Fallback JSON-LD**: muitos e-commerces incluem `<script type="application/ld+json">`
  com `Product` schema. Usar como fallback se DOM scraping falhar.
- **Fallback Open Graph**: meta tags `og:title`, `og:image`, `og:price:amount` como
  último recurso pra sites desconhecidos.
- **Detect site via hostname** — router em `src/content/extractors/index.ts`:
  ```typescript
  export function getExtractor(hostname: string) {
    if (hostname.includes('mercadolivre.com.br')) return extractMercadoLivre;
    if (hostname.includes('shopee.com.br')) return extractShopee;
    if (hostname.includes('aliexpress.com')) return extractAliExpress;
    if (hostname.includes('olx.com.br')) return extractOlx;
    return extractGeneric; // JSON-LD + OG fallback
  }
  ```
- **Imagens grandes**: alguns sites servem thumbs (50px) por default. Substituir por
  URL full-size via regex conhecido (ex: ML usa `-O.jpg` thumb, `-F.jpg` full).
- **CSP da página alvo**: extension content script roda em "isolated world" então
  CSP da página não bloqueia, mas requests CORS podem ser bloqueados — usar
  `chrome.runtime.sendMessage` pra delegar fetches pro service worker.

## Testes

- **Unit tests** com **Vitest** pros extractors:
  - Salvar HTML real de páginas de produto em `tests/fixtures/`
  - Cada teste carrega o HTML com `jsdom`, roda extractor, valida output
- **Integration test** do fluxo Shopify:
  - Mock fetch do Admin API com `msw`
  - Validar request body de `productCreate`
- **E2E manual**: instalar extension em Chrome, abrir produto ML real, validar
  popup, importar, conferir no Shopify Admin.

## Roadmap sugerido (MVP em 3 fases)

**Fase 1 — Single product import (1 semana)**
- Manifest + options page (config Shopify)
- Extractor Mercado Livre (mais usado)
- Popup com preview/edit
- Shopify productCreate + productCreateMedia
- ✅ Critério: importar 1 produto ML → aparece no admin Shopify com imagens

**Fase 2 — UX completa (1 semana)**
- Extractors Shopee + AliExpress (mais valor)
- Image grid com seleção/reorder
- Collection picker (lista colections via API)
- Status draft/active
- Histórico de imports (chrome.storage)

**Fase 3 — Bulk + polish (1 semana)**
- Modo bulk em listagens
- Queue com progress bar + retry
- Magic Edit IA (opcional): chamar GPT/Claude pra reescrever título/descrição em
  PT-BR otimizado SEO (via API key do usuário)
- Extractor genérico via JSON-LD
- Testes Vitest

## Entrega

Repositório Git público ou privado com:
- README.md com setup + screenshots
- Build scripts (`npm run dev` pra hot reload, `npm run build` pra produção)
- `.zip` pronto pra upload no Chrome Web Store (opcional) ou load unpacked em
  modo desenvolvedor

---

**Comece pela Fase 1 com extractor Mercado Livre.** Quando rodar localmente,
me mostra um print do popup + um produto importado no admin Shopify. Daí
seguimos pras outras fases.
