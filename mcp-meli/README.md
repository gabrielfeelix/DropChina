# DropChina · MCP Mercado Livre (read-only)

Cliente **somente leitura** da API do Mercado Livre. Puxa o catálogo de anúncios do vendedor (DropChina) para **auditar** e **popular o Bling** — sem escrever nada no ML. GET não altera/pausa/vincula anúncio: **zero risco** pra operação Platinum.

> Por que existe: o painel do ML não exporta catálogo completo (anúncios+atributos+categorias) de forma decente — o caminho confiável é a API. Aqui ela vira fonte do catálogo + relatório de auditoria. O vínculo real ML↔Bling (que sincroniza estoque/preço) é outra coisa, feita no **painel do Bling no go-live** — não é deste cliente.

## Estado atual (v0.1)
- OAuth 2.0 (Authorization Code) com refresh **rotativo** persistido.
- Cliente GET com retry (401 refresh, 429 backoff).
- Puxa todos os anúncios (scan), detalhe via multiget (20/req), extrai SKU, lê categorias.
- Script de **pull + auditoria** (sem SKU / sem GTIN / por categoria).
- MCP server read-only com 5 tools.

## Setup
Pré-requisito: criar o app no DevCenter e preencher o `.env` — ver [`00_Checklist_DevCenter_ML.md`](00_Checklist_DevCenter_ML.md).

```bash
npm install
cp .env.example .env     # preencher MELI_CLIENT_ID/SECRET/REDIRECT_URI
npm run authorize        # OAuth (fluxo de colar o code — ML exige redirect HTTPS)
npm run pull             # gera out/catalogo.json + out/auditoria.md
```

## ⚠️ redirect_uri precisa ser HTTPS
O ML **não aceita** `http://localhost` no redirect (diferente do Bling). Por isso a autorização usa **colar o code**: o ML redireciona pra uma URL HTTPS registrada (ex.: do próprio domínio), e você copia o `code` da barra de endereço pro CLI. Detalhe no checklist.

## Comandos
| Comando | Faz |
|---|---|
| `npm run authorize` | Fluxo OAuth (1ª vez). `-- --code=...` pra trocar o code. |
| `npm run pull` | Puxa o catálogo e gera `out/catalogo.json` + `out/auditoria.md`. |
| `npm run mcp` | Sobe o MCP server (stdio, read-only). |
| `npm run typecheck` | Checagem de tipos. |

## Tools MCP (todas read-only)
| Tool | Faz |
|---|---|
| `meli_whoami` | user_id do dono do token. |
| `meli_list_item_ids` | Todos os ids (MLB) dos anúncios (scan). |
| `meli_get_items` | Detalhe de até 20 anúncios (multiget) + SKU extraído. |
| `meli_get_category` | Detalhe de uma categoria ML (com path). |
| `meli_get_category_attributes` | Atributos/ficha técnica de uma categoria (auditar o que falta). |

## Estrutura
```
src/
├── config.ts              # .env + endpoints (auth.mercadolivre.com.br, api.mercadolibre.com)
├── auth/
│   ├── oauth.ts           # authorize URL, troca de code, refresh rotativo serializado
│   └── token-store.ts     # tokens.json (0600) — persiste o refresh novo a cada uso
├── api/
│   ├── client.ts          # GET com Bearer + retry 401/429
│   ├── items.ts           # user/me, listar ids (scan), multiget, extrair SKU
│   └── categories.ts      # categoria + atributos (cache)
├── mcp/server.ts          # MCP server read-only (5 tools)
└── scripts/
    ├── authorize.ts       # OAuth (colar code)
    └── pull-catalogo.ts   # pull + auditoria → out/
```

## Notas técnicas
- `access_token` dura 6h; `refresh_token` é **single-use** (rotaciona) e expira em ~6 meses sem uso — o cliente persiste o novo automaticamente.
- API do ML **não traz dado fiscal** (NCM/origem/CEST) — isso nunca esteve no anúncio; resolve-se no Bling depois (XML de entrada).
- `available_quantity` em recurso público é **referencial por faixa**, não o estoque exato — irrelevante aqui (estoque será dono do Bling no go-live).
- SKU lido na ordem: variação `SELLER_SKU` → variação `seller_custom_field` → item `SELLER_SKU` → item `seller_custom_field`.
