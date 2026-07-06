# Catálogo Bling — estado dos dados (06/jul/2026)

> Foto do preenchimento do catálogo no Bling e o que trava cada campo. Fonte de
> verdade = Bling (hub). Estoque/preço vêm do ML via `mcp-meli/out/catalogo.json`.

## Preenchimento (146 produtos)
| Campo | Estado | Fonte / como preenche |
|---|---|---|
| Estoque | ✅ 100% (5.898 un) | ML (`npm run fill:estoque`) |
| Preço | ✅ 100% | ML, anúncio ativo de maior estoque (`npm run set:precos`) |
| NCM | ✅ **137/146 (94%)** | pesquisa oficial TIPI/COSIT (`ncm-map.json` + `set:ncm`); 9 casos-limite p/ contadora |
| Origem | ✅ 100% | carga inicial |
| GTIN | 🟡 **101/146** — no teto do dado | ver abaixo |
| **Custo (COGS)** | ❌ **0/146** | ver abaixo — **não vem do ML** |
| Descrição curta | 🟡 141/146 (5 novos sem) | `set:short-desc` (opcional) |

## Custo de produto (COGS) — NÃO existe na API do ML
Verificado no anúncio cru (`GET /items/{id}`): os ~61 campos do item têm `price`,
`base_price`, `original_price` (todos **preço de venda**), mas **nenhum campo de
custo de aquisição**. Os endpoints de "custo" do ML (`comissao-por-vender`,
`custos-de-envio`) são **custo de VENDER** (comissão + frete), não COGS.
Custo é dado interno do vendedor — nunca esteve no ML. **Expandir o escopo da API
do ML não resolve.**

**De onde o custo VEM (pra habilitar margem/lucro real, DRE, curva ABC):**
1. **Nota de entrada** do fornecedor no Bling → preenche custo + estoque automático (melhor caminho permanente).
2. **Planilha SKU→custo** manual → Claude aplica em massa (script tipo `set:precos`).

## GTIN — no teto do dado disponível
101/146 preenchidos. Os 45 vazios **não têm código de barras em nenhuma fonte**
(nem ML, nem fornecedor) — é ausência do dado, não limite de API. O ML tinha GTIN
p/ só +2 (barbeador + 1 fone), barrados pela validação de PUT do Bling (ver nota).
Merchant Center (Google Shopping) exige GTIN OU marca+MPN — pros sem barcode, usar
`identifier_exists=false` ou marca+modelo no feed.

## Nota técnica — PUT de produto no Bling
`PUT /produtos/{id}` aceita atualização **parcial** de `tributacao.ncm` e `preco`
(merge por campo — usado por `set:ncm` e `set:precos`, com guarda que confirma que
origem/ncm não mudam). Mas ao gravar **campo-núcleo** (ex.: `gtin`), o Bling exige
o **objeto completo** (nome/tipo/situação/formato/...) senão retorna
`VALIDATION_ERROR`. Por isso não há script `set-gtin-from-meli` (ROI ~0 vs risco).
