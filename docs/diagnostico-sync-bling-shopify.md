# Diagnóstico — sync de estoque Bling → Shopify (03/jul/2026)

> Investigação a fundo do bloqueio "Sincronização concluída com sucesso, mas estoque não
> atualiza na Shopify". Fecha o buraco que o `handoff-shopify-bling-sync.md` abriu em 24/jun.
> **Root cause achado. Não é o token.** Ler o TL;DR e pular pro "O que falta fazer".

---

## TL;DR

O sync do Bling reporta sucesso mas os 62 produtos ficam **estoque 0 / "Esgotado"** na Shopify.

**Causa raiz (2 camadas, ambas confirmadas via API):**
1. **Nenhum dos 62 produtos está realmente vinculado** ao canal Shopify no Bling. A API `produtos/lojas`
   retorna 1 registro (produtoLoja 997018181), mas na **UI do Bling esse produto mostra "Nenhum canal
   configurado"** — é vínculo **FANTASMA**: o `produtosLojas.create` via API cria registro que o painel e o
   motor de sync do Bling **ignoram**. Ou seja, na prática **0 vínculos reais** → o sync não tem o que empurrar.
2. (histórico) Mesmo o "vínculo" fantasma (estoque 50 no Bling) está 0 na Shopify — consistente com o sync não reconhecer o link.

   ~~O único produto vinculado TAMBÉM está 0 na Shopify~~ — mesmo com estoque 50 no Bling e "ID na loja"
   correto. A regra de envio de estoque no Bling **está ATIVADA** (confirmado 03/jul: Regras de operação →
   Produtos → "Atualizar o estoque no canal de venda" = Ativado, Todos os depósitos). Então o push travar
   aponta agora pra **(a) sync nunca disparada desde que estoque/vínculo existiram**, ou **(b) app do Bling
   na Shopify sem `write_inventory`**. Teste: disparar sync manual e ver se o linkado recebe 50.

**O token NUNCA foi o problema.** O Bling conecta na Shopify via **app OAuth próprio dele** (não por token
colado). O campo "Token" na tela de Autenticação é **read-only** (preenchido pelo OAuth). Todo o esforço de
gerar token custom foi paralelo — não entra no Bling por ali.

**O que destrava, por ordem de esforço:**
- **Rápido / band-aid:** escrever estoque direto na Shopify via API (token que geramos). Vende hoje. Não conserta o sync.
- **Certo:** no Bling — ligar a regra de envio de estoque + vincular os 62 + (talvez) reinstalar o app do Bling na Shopify. Precisa de ações na UI do Bling/Shopify (conta do Gabriel/Augusto) + provável ticket no suporte Bling.

---

## Sintoma

- 62 produtos publicados na Shopify, todos **`inventoryQuantity: 0`** → aparecem "Esgotado".
- Bling tem saldo real (ex.: `1105 EVOLUT` = 50 un).
- Ação Bling "Sincronizar estoque do sistema na loja virtual" → **"Sincronização concluída com sucesso"**, Shopify não muda.

## Lado Shopify — 100% OK (descartado como causa)

Verificado via Admin API:
- Produtos ACTIVE e publicados.
- Estoque **rastreado** (`inventoryItem.tracked = true`).
- **1 localização só**: `Rua Osvaldo Cruz, 263` (`gid://shopify/Location/91848278235`), ativa, atende online.
- Registro de nível de estoque **já existe** na location (available = 0). Pronto pra receber saldo.

→ Sem misconfiguração no Shopify. O problema é 100% no envio pelo Bling.

## Lado Bling — a causa raiz

Consultado via Bling API v3 (`Authorization: Bearer <access_token>`), canal Shopify `idLoja=206107628`:

```
GET /Api/v3/produtos/lojas?idLoja=206107628
→ { "data": [ { "id": 997018181, "codigo": "9380934844635",
                "produto": { "id": 16659520427 }, "loja": { "id": 206107628 } } ] }
```

- **1 vínculo só.** `codigo` = "ID na loja" = **`9380934844635`** = ID do **PRODUTO** Shopify (não da variação).
  → o formato do de-para `catalogo/vinculo-shopify-bling.csv` (SKU → ID produto Shopify) está **correto**.
- Produto Bling `16659520427` (`1105 EVOLUT`): `estoque.saldoVirtualTotal = 50`.
- Esse produto na Shopify (`gid://shopify/Product/9380934844635`, SKU "1105 EVOLUT"): **totalInventory = 0**.

**Conclusão:** mesmo o único produto vinculado, com estoque e ID certo, **não recebe o saldo** → o push
está desativado/quebrado no Bling. Somado aos 61 sem vínculo, explica 100% do sintoma.

---

## Placar das 10 hipóteses

| # | Hipótese | Veredito | Evidência |
|---|---|---|---|
| 1 | Token do Bling sem `write_inventory` | ❌ irrelevante | Bling usa app OAuth próprio, não token colado; campo Token read-only |
| 2 | `atkn` (app automation token) serve de token Admin API | ❌ refutado | Doc oficial: é só pro CLI (CI/CD deploy). 401 em REST/GraphQL |
| 3 | "ID na loja" = produto vs variação | ✅ resolvido | Bling usa ID do **produto** (formato do CSV está certo) |
| 4 | Vínculos faltando | ✅ **CONFIRMADO** | `produtos/lojas` retorna 1 na API, mas... (ver #5) |
| 4b | Vínculos da API são **FANTASMA** (UI não reconhece) | ✅ **CONFIRMADO — raiz real** | Na tela do produto 1105 EVOLUT, painel "Compatibilidade com os canais" = **"Nenhum canal configurado"**, apesar da API retornar produtoLoja 997018181. O `produtosLojas.create` via API cria registro que a UI/sync do Bling **ignora**. Logo NENHUM dos 62 está realmente linkado → sync não tem o que empurrar |
| 5 | Shopify com rastreamento off | ❌ | `tracked = true` |
| 6 | Location errada / múltiplas | ❌ | 1 location só, ativa |
| 7 | Regra de envio de estoque OFF no Bling | ❌ **refutado** | Regras de operação→Produtos: "Atualizar o estoque no canal de venda" = **Ativado**, depósito = **Todos os depósitos**, Estoque marcado na Exportação (confirmado por print 03/jul) |
| 8 | App do Bling na Shopify sem `write_inventory` | 🔴 **SUSPEITO #1** | não dá pra inspecionar escopo do app deles daqui; com regra ON e 1 produto linkado (estoque 50) ainda a 0, é o candidato mais forte |
| 9 | Sync nunca disparada pós-estoque/vínculo | 🔴 **SUSPEITO #2** | vínculo/estoque podem ter entrado depois da última sync; testar disparando "Sincronizar estoque" manual |
| 10 | Depósito do canal não mapeado | 🟡 possível | depósito Bling 14888019804; mapping do canal não verificado |

---

## Descoberta técnica útil: como pegar token Admin API nessa loja (Dev Dashboard)

A loja migrou 100% pro **Dev Dashboard** (custom apps clássicos "legados" aposentados pela Shopify em
01/jan/2026). Isso complicou a geração de token, mas resolvemos:

- **`atkn` (app automation token)** do Dev Dashboard = **só pro CLI da Shopify** (deploy CI/CD). **Não** é
  token de API — dá 401 em qualquer chamada Admin. Beco sem saída.
- **client_credentials grant** = o caminho. App do Dev Dashboard instalado + `client_id` + `client_secret`:

```bash
curl -X POST "https://akfd19-1c.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=<CLIENT_ID>" -d "client_secret=<CLIENT_SECRET>"
# → { "access_token": "shpat_...", "scope": "write_inventory,...", "expires_in": 86399 }
```

  - Token `shpat_` funciona como `X-Shopify-Access-Token` (REST + GraphQL). **Expira em 24h** — bom pra
    scripts (renova sozinho), inútil pra campo estático.
  - Só funciona se app + loja estão na **mesma org** do Dev Dashboard (deram certo aqui).
  - **App criado:** "Bling Sync" (Dev Dashboard, org DropChina). `client_id = 552ae5e28f52f06965163c3efad5c478`.
    Escopos: `write_inventory,read_inventory,read_locations,write_products,read_products,write_orders,read_orders`.
  - Secrets (client_secret, tokens) **NÃO** ficam neste repo — pegar no Dev Dashboard → Bling Sync → Configurações → Credenciais.
- **Token que NÃO expira** (se um dia precisar colar num sistema externo): authorization code grant / "fluxo
  de instalação legado" no app → OAuth `/admin/oauth/authorize` → troca o `code` em `/admin/oauth/access_token`
  com `expiring:0`. Apps de merchant são isentos da regra de expiração.

### Gotcha da API 2026-07 (mutation de estoque)
`inventorySetQuantities` mudou: **não** aceita mais `ignoreCompareQuantity` nem `compareQuantity`.
Campo de comparação virou `changeFromQuantity` (opcional). Input válido:
```graphql
mutation { inventorySetQuantities(input:{
  reason:"correction", name:"available",
  quantities:[{ inventoryItemId:"gid://shopify/InventoryItem/<ID>",
                locationId:"gid://shopify/Location/91848278235", quantity:<N> }]
}){ inventoryAdjustmentGroup{ reason } userErrors{ field message } } }
```

---

## IDs e dados úteis

- **Loja Shopify:** `akfd19-1c.myshopify.com` (= `dropchina-9753` = dropchinaoficial.com.br). Location única: `gid://shopify/Location/91848278235`.
- **Canal Bling Shopify:** `idLoja = 206107628` ("Dropchina oficial").
- **App Dev Dashboard "Bling Sync":** `client_id = 552ae5e28f52f06965163c3efad5c478` (secret no Dev Dashboard).
- **Bling OAuth (mcp-bling):** `tokens.json` — o access token expira em 6h; refresh via `POST /Api/v3/oauth/token`
  (grant_type=refresh_token, Basic auth com client_id/secret do `.env`). ⚠️ O refresh_token roda (rotaciona) a
  cada uso — se `mcp-bling` parar de autenticar, rodar `npm run authorize` de novo.
- **De-para pronto:** `catalogo/vinculo-shopify-bling.csv` (62 linhas, SKU Bling → ID produto Shopify). Todos os
  62 casam com estoque do baseline ML (`mcp-meli/out/catalogo.json`, campo `estoqueRef`; total 1578 un).

---

## O que falta fazer (fix real do sync nativo — precisa da UI Bling/Shopify)

Ações na conta (Gabriel/Augusto), não dá pra fazer via API:

1. ~~Ligar o envio de estoque no Bling.~~ ✅ **JÁ ESTÁ ON** (confirmado 03/jul). Regras de operação →
   Produtos: "Atualizar o estoque no canal de venda" = Ativado, depósito = Todos os depósitos. Nada a fazer aqui.
   **Próximo teste:** disparar "Sincronizar estoque na loja virtual" manual e conferir se o produto linkado
   (1105 EVOLUT) recebe 50 na Shopify. Se receber → só falta linkar os 61. Se ficar 0 → pular pro passo 3 (app).
2. **Vincular os 62 produtos** ao canal Shopify. Melhor via **planilha de vínculo** do Bling usando
   `catalogo/vinculo-shopify-bling.csv` (ID na loja = ID produto Shopify). Alternativa: manual (ícone carrinho
   verde por produto). Evitar depender do `produtosLojas.create` via API — histórico de não ser reconhecido.
3. **Conferir o app do Bling na Shopify.** Shopify Admin → Configurações → Apps → app **Bling** → confirmar que
   tem permissão de estoque (`write_inventory`). Se faltar, reinstalar/reautorizar o app do Bling.
4. **Rodar a sync** de novo e conferir o `1105 EVOLUT` na Shopify.
5. **Se ainda falhar** → ticket no Bling (Menu: Integrações). Evidência de ouro pro ticket:
   *"Produto vinculado ao canal Shopify (produtoLoja id 997018181, ID na loja 9380934844635), com estoque 50
   no Bling, permanece 0 na Shopify após 'Sincronização concluída com sucesso'. Shopify confirmadamente com
   rastreamento ligado e 1 location. Plano Cobalto."*

## Alternativa — bypass do sync nativo (se o Bling continuar quebrado)

Como o push nativo do Bling pra Shopify se mostrou não-confiável, dá pra **contornar**: script próprio que
lê estoque do Bling (via `mcp-bling`) e escreve na Shopify (token client_credentials, renova sozinho), rodando
agendado. Bling segue de hub pra ML + fiscal; a ponte Bling→Shopify de estoque fica sob nosso controle.
Prós: confiável, independe da integração Shopify do Bling. Contras: precisa rodar em algum lugar (cron).

## Band-aid imediato (destrava venda hoje)

Escrever o estoque real (baseline ML, 1578 un nos 62) direto na Shopify via API. Vende hoje. Não conserta o
sync — o número fica estático até o Bling assumir; risco de oversell vs ML baixo enquanto a loja é nova.
