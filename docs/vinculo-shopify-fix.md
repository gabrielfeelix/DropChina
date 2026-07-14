# Fix do sync Bling→Shopify — plano de vínculo (13/jul/2026)

> Fecha o `diagnostico-sync-bling-shopify.md` (03/jul) com research atualizado +
> validação via API (Shopify MCP + Bling). **Parte da IA já feita; falta a parte
> de UI do Gabriel (conta Bling).**

## Diagnóstico atual — SÃO DOIS PROBLEMAS (teste decisivo feito 13/jul)

O painel **"Compatibilidade com os canais → Nenhum canal configurado"** é o score da
**Central de Anúncios**, NÃO o vínculo de estoque — indicador separado, ignorar.
O que liga estoque/preço é o campo **"ID na Loja"** no **carrinho verde (multiloja)**.

**Problema 1 — 61/62 sem vínculo.** `produtos/lojas` (idLoja 206107628) retorna só 1
registro (1105 EVOLUT). Os outros 61 não têm vínculo nenhum. → import da planilha.

**Problema 2 — o 1 vinculado NÃO empurra estoque.** Teste decisivo no carrinho verde
do 1105 EVOLUT: checkbox "Dropchina oficial" **marcado**, **"ID na loja" = 9380934844635**
(preenchido, = ID Shopify certo), Bling estoque = **50** — e Shopify segue **0**.
**→ Teoria do "vínculo fantasma" REFUTADA.** O vínculo é real e a UI reconhece. O bloqueio
é o **push do estoque em si**: depósito mapeado, escopo do app Bling (`write_inventory`),
ou **sync nunca disparada** desde que vínculo+estoque existiram.

## DIAGNÓSTICO FECHADO (13/jul, tarde) — é o TOKEN do Bling

Testei todas as camadas do Bling no 1105 EVOLUT — **todas certas** e o push ainda falha:
- Vínculo "Dropchina oficial" marcado; "ID na loja" = 9380934844635 (certo).
- Estoque = **50** no depósito **Geral** (id 14888019804, único, padrão) — confirmado via
  `estoques.getBalances`. Filial (Shopify) → depósito **Geral**. Regra "atualizar estoque
  no canal" = ON, "Todos os depósitos".
- Sync manual **por Todos E por Geral** → Bling diz **"concluída com sucesso"**.
- **Shopify continua 0** nas duas.

**Prova definitiva:** escrevi 1105 EVOLUT = 50 na Shopify **via Shopify MCP**
(`inventorySetQuantities`, location 91848278235) → **entrou na hora** (totalInventory 0→50).
Logo: **Shopify aceita escrita de estoque; o furo é 100% o token do Bling** — o token
configurado na integração Shopify do Bling **não tem `write_inventory`**. Por isso "sucesso"
local no Bling e 0 na Shopify. Bate com os reviews do app Bling ("diz que enviou, Shopify
não recebe"). A integração do Bling é por **Token colado** (campo editável + "Testar"),
NÃO OAuth — não existe "reautorizar".

## ✅ RESOLVIDO NO NATIVO — atualizar o app "Bling" na Shopify

**Causa raiz real:** o app "Bling" instalado na Shopify estava com **escopo antigo, sem
`write_inventory`** (foi instalado antes do Bling adicionar a permissão de inventário no app
deles). Por isso o Bling reportava "sync concluída com sucesso" (local) mas a escrita na
Shopify era negada silenciosamente → estoque 0.

**Fix (1 clique, sem reinstalar):** Shopify Admin → **Apps e canais de venda** → busca/abre o
app **"Bling"** → aparece a tela de permissões com um botão **"Atualizar"** → clicar. Isso
re-concede os escopos atuais do app (incluindo estoque). Não precisou desinstalar.

**Testado e confirmado (13/jul):** zeramos 1105 EVOLUT na Shopify (via MCP), forçamos o sync
manual no Bling, e o **Bling empurrou 0→50 sozinho** = push nativo funcionando. Cloud do Bling,
sem servidor, sem manutenção.

**Falta pra cobrir tudo:** só o 1105 EVOLUT estava vinculado. Importar os **61 vínculos**
restantes (`catalogo/bling-vinculo-import.csv`) pela planilha do Bling → depois um sync geral →
Bling passa a dirigir o estoque de todos os 62.

---

## (BACKUP) Ponte própria Bling→Shopify — feita antes de achar o "Atualizar app"

> Mantida no repo como rede de segurança. NÃO é necessária na operação agora que o nativo
> funciona. Contexto: o campo Token da integração Shopify do Bling é READ-ONLY (OAuth, app
> próprio deles) — não dá pra colar token. A ponte contornava o leg quebrado escrevendo direto.

### Ponte: `mcp-bling/src/scripts/sync-estoque-shopify.ts`
- Lê saldo do Bling (`estoques.getBalances`, `saldoVirtualTotal`) e escreve na Shopify via
  Admin API. Casa por SKU==codigo; só mexe em variação `tracked`; só escreve se difere.
- **Token Shopify gerado na hora** por `client_credentials` (app **"Bling Estoque"** do Dev
  Dashboard — app id 397135216641). Expira 24h, então cada run minta um novo → ideal p/ cron.
  Credenciais em `mcp-bling/.env` (gitignored): `SHOPIFY_STORE`, `SHOPIFY_CLIENT_ID`,
  `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_LOCATION_ID`. **Pré-requisito:** o app precisa estar
  INSTALADO na loja (via OAuth authorize uma vez) senão `client_credentials` dá `app_not_installed`.
- Rodar: `npx tsx src/scripts/sync-estoque-shopify.ts --dry` (mostra) / sem `--dry` (escreve).
- **Executado 13/jul: 44 produtos 0→saldo real.** Loja parou de mostrar esgotado.

### Gotchas da Admin API 2026-07 (mutation inventorySetQuantities) — IMPORTANTE
Ao contrário do que dizia o `diagnostico-sync-bling-shopify.md`, na API DIRETA 2026-07:
- **NÃO** aceita `ignoreCompareQuantity` nem `compareQuantity`.
- `InventoryQuantityInput` **exige `changeFromQuantity`** (= saldo atual "de onde").
- **Exige a diretiva `@idempotent(key: <uuid>)` no CAMPO** `inventorySetQuantities` (não na
  operação `mutation`). Sem ela: `BAD_REQUEST @idempotent directive is required`.
- (Obs: o **Shopify MCP** usa uma versão mais antiga que AINDA exige `ignoreCompareQuantity` —
  os dois endpoints divergem de schema.)

### Pendências
- **Agendar a ponte (cron)** ex. a cada 30 min, pra manter Shopify sincronizada com o Bling.
- **Importar os 61 vínculos** no Bling (`catalogo/bling-vinculo-import.csv`) — bom pra pedidos/
  preço, mas o ESTOQUE já vai pela ponte (não depende do vínculo nativo).
- **Ticket Bling:** push nativo reporta "sucesso" e não escreve (token do app deles sem
  write_inventory ou integração quebrada). Evidência: vínculo real + estoque 50 + "sucesso" + 0
  na Shopify; nossa escrita direta entra. Não bloqueia — a ponte resolve.

## Validado via API (parte da IA — feito)
- ✅ **SKU bate 1:1 Bling↔Shopify** (ex.: `1105 EVOLUT`, `tn660 DropChina`, `StarLink`).
  Import por SKU **não vai duplicar**.
- ✅ **Todo produto Shopify é 1 variação só** → usa-se o **ID do produto** como "ID na Loja"
  (é o que o Bling já guardou p/ 1105 EVOLUT: 9380934844635). Sem dor de variação.
- ✅ **Nome da loja (coluna J)** = **`Dropchina oficial`** (idLoja 206107628, Shopify, ativo).
- ✅ **totalInventory=0 em todos** os 62 rastreados → confirma o sintoma.
- ⛔ Produtos ISD/automação novos (`ISD-PANO-*`, `ISD-TOTEM-*`, `PANTUM-*`, etc.) são
  `tracked:false` → **fora do escopo** do sync de estoque (são "em breve"/vitrine).
- ✅ **Planilha de vínculo pronta:** `catalogo/bling-vinculo-import.csv` (62 linhas:
  SKU · ID Bling · ID na Loja/Shopify · Preço · Loja). Gerada por
  `mcp-bling/src/scripts/gerar-vinculo-import.ts`.

## Parte do Gabriel (UI Bling — precisa da conta)

### 1) Teste decisivo — FEITO (13/jul)
No 1105 EVOLUT: "ID na loja" = 9380934844635 (preenchido), vínculo marcado, Bling
estoque 50, Shopify 0. Vínculo é real → problema é o push (ver Problema 2 acima).
**Próximo:** forçar sync manual só no 1105 EVOLUT e a IA confere na Shopify se o 50
chega. Se não chegar → depósito/app (passo 3).

### 2) Vínculo em massa por planilha (o fix)
1. `Cadastros > Produtos` → seleciona os 62 → menu direito →
   **"Exportar planilha de produtos selecionados para vínculo multiloja"** → Shopify.
2. No arquivo exportado: **col A** já vem com o ID Bling. Casa pela col A com
   `catalogo/bling-vinculo-import.csv` e cola:
   - **col B** = ID na Loja = ID Shopify (coluna "ID_na_Loja/Shopify" do nosso csv)
   - **col E** = Preço · **col J** = `Dropchina oficial`
3. Salva CSV → **Engrenagem → Todas as Configurações → Importações de Dados →
   "Importar e atualizar vínculos produtos multilojas"**.
4. Força sync: seleciona → **"Sincronizar estoque do sistema na loja virtual"** →
   escolhe loja + depósito → **"Sincronizar estoque"**.
5. Confere 1 produto (ex.: `1105 EVOLUT`) na Shopify: estoque deixou de ser 0?

### 3) Se ainda falhar após vincular
- Conferir **depósito mapeado** do canal (Minhas Instalações → Filial) e que tem saldo.
- Reautorizar o app do Bling na Shopify (Central de Extensões → Shopify → "Ir para
  Shopify" → instalar → voltar → "Testar"). Reinstalar **não apaga** vínculos.
- Ticket Bling com a evidência do `diagnostico-sync-bling-shopify.md`.

## Alternativas (se a UI travar de vez)
- **Bypass:** script próprio lê estoque do Bling e escreve na Shopify (token
  client_credentials do app "Bling Sync", ou via Shopify MCP), agendado. Independe
  da integração nativa do Bling.
- **Band-aid:** escrever os 62 saldos reais direto na Shopify agora (via MCP,
  `inventorySetQuantities`). Vende hoje; número fica estático até o sync assumir.
  A IA pode disparar isso quando autorizado.

## Fontes-chave (research 13/jul)
Ajuda Bling: `articles/360046278034` (ID na Loja = vínculo), `4418747598487` e
`360039804353` (planilha + import), `360046917833` (sincronizar), `4418749025815`
(import por SKU). Análogo AnyMarket: `suporte.anymarket.com.br/.../19000163303`.
