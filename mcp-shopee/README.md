# DropChina · MCP Shopee (read-only) — SCAFFOLD

> **STATUS: SCAFFOLD — preencher credenciais quando abrir conta no Shopee Open Platform.**
> Este pacote NÃO foi testado com credenciais reais. A estrutura espelha o `mcp-meli`
> e segue a documentação pública da Shopee Open Platform API v2 (open.shopee.com).
> Quando você tiver o `partner_id` e `partner_key`, preencha o `.env` e valide.

Cliente **somente leitura** da Shopee Open Platform API v2. Puxa o catálogo de anúncios da loja para **auditar** — sem escrever nada na Shopee.

---

## O que este pacote FAZ (quando ativado)

- Autoriza a loja via OAuth (fluxo de colar o code, igual ao ML — Shopee também exige HTTPS).
- Autentica cada request com assinatura HMAC-SHA256 (obrigatória pela Shopee Open Platform).
- Lista todos os anúncios ativos (`get_item_list`, paginado).
- Puxa detalhes em batch de 50 (`get_item_base_info`): SKU, preço, estoque, fotos, dimensões.
- Lista categorias (`get_category`) e atributos de categoria (`get_attributes`).
- Gera `out/catalogo.json` + `out/auditoria.md` (sem SKU, sem foto, por categoria).
- Sobe um MCP server read-only com 6 tools para uso com Claude Code.

## O que este pacote NÃO faz

- **Não escreve nada na Shopee** (nenhum POST/PUT/DELETE de produto, pedido ou estoque).
- Não sincroniza com o Bling (isso é feito em outro pacote, no go-live).

---

## O que plugar ao abrir a conta

1. **Criar app no Shopee Open Platform** (open.shopee.com → My Apps → Create App)
   - Tipo: Open API (não Affiliate)
   - Registrar a `redirect_uri` HTTPS (ex.: `https://dropchinaoficial.com.br/oauth/shopee`)
   - Anotar `partner_id` e `partner_key`

2. **Preencher `.env`**
   ```bash
   cp .env.example .env
   # editar .env com os valores reais:
   # SHOPEE_PARTNER_ID=...
   # SHOPEE_PARTNER_KEY=...
   # SHOPEE_SHOP_ID=...   (obtido após autorizar a loja)
   # SHOPEE_REDIRECT_URI=https://dropchinaoficial.com.br/oauth/shopee
   # SHOPEE_REGION=prod
   ```

3. **Instalar deps e autorizar**
   ```bash
   npm install
   npm run authorize   # imprime URL → abrir no browser → colar code
   npm run authorize -- --code=SEU_CODE --shop-id=SEU_SHOP_ID
   ```

4. **Testar pull**
   ```bash
   npm run pull   # gera out/catalogo.json + out/auditoria.md
   ```

---

## Comandos

| Comando | Faz |
|---|---|
| `npm run authorize` | Fluxo OAuth (1ª vez). `-- --code=... --shop-id=...` pra trocar o code. |
| `npm run pull` | Puxa o catálogo e gera `out/catalogo.json` + `out/auditoria.md`. |
| `npm run mcp` | Sobe o MCP server (stdio, read-only). |
| `npm run typecheck` | Checagem de tipos (sem compilar). |

---

## Tools MCP (todas read-only)

| Tool | Faz |
|---|---|
| `shopee_list_item_ids` | Todos os item_ids da loja (paginado). |
| `shopee_get_items` | Detalhe normalizado de até 50 itens (SKU, estoque, preço, fotos). |
| `shopee_get_item_raw` | Mesmo que acima, mas retorna o JSON bruto da API (debug). |
| `shopee_get_categories` | Lista completa de categorias. |
| `shopee_get_category` | Detalhe de uma categoria por ID. |
| `shopee_get_category_attributes` | Atributos/ficha técnica de uma categoria. |

---

## Estrutura

```
src/
├── config.ts              # .env + host prod/sandbox
├── auth/
│   ├── sign.ts            # HMAC-SHA256 (public + shop-level)
│   ├── oauth.ts           # URL de autorização, troca de code, refresh
│   └── token-store.ts     # tokens.json (0600)
├── api/
│   ├── client.ts          # shopeeGet com assinatura + retry 429
│   ├── items.ts           # listAllItemIds, getItemsBaseInfo, normalizeItem
│   └── categories.ts      # getAllCategories, getCategoryById, getCategoryAttributes
├── mcp/server.ts          # MCP server read-only (6 tools)
└── scripts/
    ├── authorize.ts       # OAuth (colar code)
    └── pull-catalogo.ts   # pull + auditoria → out/
```

---

## Notas técnicas

- **Assinatura obrigatória**: toda request à Shopee Open Platform v2 precisa de HMAC-SHA256.
  - APIs públicas (auth): `partner_id + api_path + timestamp`
  - APIs de loja: `partner_id + api_path + timestamp + access_token + shop_id`
- **access_token** dura ~4h; **refresh_token** dura ~30 dias sem uso. O cliente renova automaticamente.
- **Rate limit**: ~100 req/min. O cliente faz backoff exponencial em 429.
- **Hosts**: `https://partner.shopeemobile.com` (prod) e `https://partner.test-stable.shopeemobile.com` (sandbox).
- **SHOPEE_REGION=sandbox** + conta de sandbox do Open Platform para testes sem afetar a loja real.
- A Shopee retorna HTTP 200 mesmo em erros lógicos — o cliente verifica o campo `error` no JSON.
