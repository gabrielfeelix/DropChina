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

## FIX EM ANDAMENTO — token novo com write_inventory

Gerar token Shopify com `write_inventory` e colar no Bling (Autenticação → campo Token).
- App criado no **Shopify Dev Dashboard**: **"Bling Estoque"** (app id 397135216641,
  dashboard/org 218254417), versão **`bling-estoque-2` (Ativa)**, api 2026-07, embedded.
  Escopos: `write_inventory,read_inventory,read_locations,read_orders,write_orders,read_products,write_products`.
  "Usar fluxo de instalação legado" = **false**.
- **PENDENTE:** obter um token **não-expirável** desse app e colar no Bling.
  - Dev Dashboard `client_credentials` → token `shpat_` expira **24h** (ruim p/ campo estático do Bling).
  - Não-expirável: habilitar **"fluxo de instalação legado"** no app e instalar na loja
    (token offline não expira), OU usar o caminho **Admin → "Desenvolver apps"** (custom app
    clássico) que dá `shpat_` permanente direto. Alternativa: OAuth authorization_code com
    `expiring:0` (merchant apps são isentos de expiração).
- Depois de colar o token: Testar → Salvar → forçar sync num produto **ainda em 0**
  (ex.: StarLink, NÃO o 1105 que já subi manual) e conferir na Shopify via MCP se 0→N.
  - **Chegou** → token era a causa, sync nativo consertado → importar os 61 vínculos
    (`catalogo/bling-vinculo-import.csv`) + sync geral.
  - **Continuou 0** → escalar ticket Bling com a evidência acima.

**Band-aid disponível** (se precisar vender antes do token): escrever os 62 saldos direto
na Shopify via MCP (`inventorySetQuantities`, `ignoreCompareQuantity:true` — o argumento
`compareQuantity`/`ignoreCompareQuantity` AINDA é exigido na API 2026-07, ao contrário do
que dizia o `diagnostico-sync-bling-shopify.md`). Já testado no 1105 EVOLUT (=50 agora).

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
