# DropChina · MCP Amazon SP-API (read-only)

> **SCAFFOLD NAO TESTADO** — leia as advertencias abaixo antes de usar.

Cliente **estritamente somente leitura** da Amazon Selling Partner API (SP-API).
Audita catalogo, listings e inventario FBA do vendedor (DropChina Amazon BR).
**NAO escreve nada na Amazon.** Nenhuma chamada de PUT/POST/DELETE/PATCH e feita.

---

## Advertencias importantes

### Este scaffold e READ-ONLY e NAO foi testado
O codigo compila e a estrutura espelha o `mcp-meli`, mas **nao foi executado contra
a SP-API real** — nao ha conta de vendedor Amazon BR conectada ainda.

### A SP-API e complexa e exige aprovacao
Diferente do Mercado Livre, a Amazon SP-API exige:

1. **Conta de vendedor Amazon BR ativa** (Seller Central)
2. **Registro de developer** no proprio Seller Central (Apps & Services > Develop Apps)
3. **Aprovacao da Amazon** para acessar cada grupo de API:
   - Catalog Items / Listings: aprovacao moderada (~dias)
   - FBA Inventory: aprovacao moderada
   - Orders / Reports: processo mais rigoroso (**pode levar 1-2 semanas** e exige
     justificativa de uso de dados)
4. **Self-Authorization** para obter o `refresh_token` LWA

### A sincronizacao real de estoque/vendas e via Bling
Este cliente e **somente para auditoria de catalogo**. A integracao operacional
Amazon <-> Bling (sincronizacao de estoque e pedidos) deve ser feita pelo
**conector nativo do Bling para Amazon**, disponivel no painel do Bling no go-live.
Este scaffold nao substitui e nao interfere com essa integracao.

---

## Pre-requisitos para ativar

1. Acesse [Seller Central BR](https://sellercentral.amazon.com.br) > **Apps & Services > Develop Apps**
2. Crie um app (ou use um existente)
3. Clique em **Authorize** (self-authorization) — o Seller Central exibira o `refresh_token`
4. Anote `LWA_CLIENT_ID` e `LWA_CLIENT_SECRET` do app
5. Preencha o `.env`:

```bash
cp .env.example .env
# edite .env com os valores reais
```

6. Instale as dependencias e valide:

```bash
npm install
npm run authorize
npm run pull   # gera out/catalogo.json + out/auditoria.md
```

---

## Comandos

| Comando | Faz |
|---|---|
| `npm run authorize` | Valida credenciais fazendo uma chamada read simples a SP-API. |
| `npm run pull` | Puxa inventario FBA + catalogo + listings -> `out/catalogo.json` + `out/auditoria.md`. |
| `npm run mcp` | Sobe o MCP server (stdio, read-only). |
| `npm run typecheck` | Checagem de tipos TypeScript. |

### `npm run pull` — flags

```bash
npm run pull -- --seller-id=A1XXXXXXXX
# ou defina AMAZON_SELLER_ID no .env
```

O `sellerId` (Merchant Token) esta em: Seller Central > Account Info > Business Information.

---

## Tools MCP (todas read-only)

| Tool | Faz |
|---|---|
| `amz_search_catalog` | Busca no catalogo Amazon BR por keyword ou EAN/GTIN. |
| `amz_get_catalog_item` | Detalhe de um ASIN: titulo, marca, GTIN, categoria, imagens, rank. |
| `amz_get_listing` | Detalhe de um listing por SKU: preco, estoque FBA/MFN, status, pendencias. |
| `amz_list_inventory` | Lista todos os SKUs com estoque FBA do seller. |

### Configurar no Claude Desktop

```jsonc
// claude_desktop_config.json
{
  "mcpServers": {
    "dropchina-amazon": {
      "command": "node",
      "args": ["--import", "tsx/esm", "/caminho/para/mcp-amazon/src/mcp/server.ts"],
      "env": {
        "LWA_CLIENT_ID": "...",
        "LWA_CLIENT_SECRET": "...",
        "SP_API_REFRESH_TOKEN": "...",
        "SP_API_REGION": "na",
        "SP_API_MARKETPLACE_ID": "A2Q3Y263D1QR3R"
      }
    }
  }
}
```

---

## Estrutura

```
src/
├── config.ts              # le envs LWA + SP-API
├── types/
│   └── amazon-sp-api.d.ts # declaracao de modulo ambiente (scaffold sem npm install)
├── auth/
│   └── token-store.ts     # persiste refresh_token em tokens.json (0600)
├── api/
│   ├── client.ts          # wrapper fino sobre sdk amazon-sp-api + retry/backoff
│   ├── catalog.ts         # Catalog Items API — searchCatalogItems / getCatalogItem
│   ├── listings.ts        # Listings Items API — getListingsItem (read)
│   └── inventory.ts       # FBA Inventory API — getInventorySummaries (listagem de SKUs)
├── mcp/
│   └── server.ts          # MCP server stdio read-only (4 tools)
└── scripts/
    ├── authorize.ts       # valida credenciais + persiste refresh_token
    └── pull-catalogo.ts   # pull FBA inventory + catalog + listings -> out/
```

---

## Notas tecnicas

### Auth: LWA vs SigV4
A SP-API usa **LWA (Login with Amazon)** para autenticacao e, para alguns endpoints,
tambem exige **AWS SigV4** (assinatura HMAC das requests). O SDK `amazon-sp-api`
(amz-tools) gerencia os dois automaticamente. Para endpoints de catalogo/listings/
inventory (os usados aqui), o LWA sozinho e suficiente — as AWS credentials sao
opcionais neste scaffold.

### Throttling severo
- **Orders API**: ~1 req/min — NAO incluida no pull (evita bloqueio)
- **Catalog Items**: ~2 req/s — pull pausa 550ms entre ASINs
- **Listings Items**: ~5 req/s — pull pausa 220ms entre SKUs
- **FBA Inventory**: ~2 req/s — paginacao com pausa entre paginas
- O `client.ts` aplica retry exponencial com jitter em throttling (429/QuotaExceeded)

### Listagem de SKUs
A SP-API v2021 **nao tem endpoint "liste todos os produtos"**. O pull usa a
**FBA Inventory API** como fonte de SKUs (modelo FBA). Para sellers MFN (fulfillment
proprio), a alternativa e a **Reports API** (relatorio assincrono
`GET_MERCHANT_LISTINGS_ALL_DATA`) — mais complexa, a implementar quando necessario.

### Marketplace Brasil
- Marketplace ID: `A2Q3Y263D1QR3R`
- Cluster SP-API: `na` (us-east-1) — o Brasil usa o cluster North America
- Endpoint base: `https://sellingpartnerapi-na.amazon.com`
