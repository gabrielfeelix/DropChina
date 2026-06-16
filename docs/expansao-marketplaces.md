# Expansão de marketplaces — Shopee, Amazon, Casas Bahia/Via

> Pesquisa de viabilidade técnica + operacional para adicionar novos canais ao hub Bling.
> Contexto: Bling é a fonte de verdade (catálogo/estoque/fiscal). ML + Shopify já em andamento.
> A **sincronização** de cada canal é **integração nativa do Bling**; um cliente custom (estilo
> `mcp-meli`, read-only) serve só para **auditoria/leitura** de catálogo, não para vender.
> Data: jun/2026.

## TL;DR — decisão

| | Shopee | Amazon BR | Casas Bahia/Via |
|---|---|---|---|
| API pública | Open Platform v2 | SP-API | API própria (homologação) |
| Auth | partner_id+key, HMAC, OAuth token 4h | LWA OAuth2 + AWS SigV4 | client_id + access_token |
| Sandbox | sim | sim (static/dynamic) | sim (HLG) |
| Repo Node/TS | ✅ congminh1254/shopee-sdk | ✅ amz-tools/amazon-sp-api | ❌ nenhum (só PHP SkyHub obsoleto) |
| Bling nativo | ✅ | ✅ (FBM+FBA) | ✅ (canal já criado) |
| Comissão | ~14% + R$7/item (+6% frete grátis obrig. mar/26) | 8-20% (~10-15%); Ind R$2/item ou Pro R$19/mês | 18-21% (promo 17% até 31/03/26) |
| GTIN | obrig. categorias estratégicas | obrig. (com exemption) | obrig. em tudo |
| Conta | CPF ou CNPJ | CNPJ (Ind/Pro) | CNPJ obrigatório |
| Custom MCP vale? | opcional (auditoria) | só p/ escala/ads | ❌ não (API fechada, 1 integrador/conta) |

**Pré-requisito nº1 de QUALQUER expansão: GTIN.** 71 produtos sem GTIN hoje. Sem GTIN não anuncia em
Amazon/Casas Bahia e trava categorias na Shopee. Resolver antes.

**Ordem recomendada:** 0) GTIN → 1) Shopee → 2) Amazon → 3) Casas Bahia.
**Não pré-construir os 3 clientes** sem conta/credencial (não testa, apodrece). Replicar o padrão
`mcp-meli` só quando ativar cada canal.

---

## Shopee

- **API:** Shopee Open Platform / Open API v2 — https://open.shopee.com/developer-guide/
  - Auth: `partner_id` + `partner_key`, assinatura **HMAC-SHA256** por request, `access_token` via OAuth (válido 4h, renovável). Hosts: prod `partner.shopeemobile.com`, sandbox `partner.test-stable.shopeemobile.com`. Precisa registrar partner/app e aprovar.
  - Rate limit: ~100 req/min (429 ao exceder). Backoff exponencial.
  - Endpoints: `product/get_item_list|get_item_detail` (R), `product/update_stock` (W), `order/get_order_list|get_order_detail` (R), `shop/get_categories` (R), `logistics/*`.
- **Repos Node/TS:**
  - `congminh1254/shopee-sdk` — https://github.com/congminh1254/shopee-sdk (TS puro, ~142⭐, 0 deps exceto node-fetch, cobre v2, assinatura+token automáticos). **Melhor base.**
  - `sulistta/shopee-js` — https://github.com/sulistta/shopee-js (leve, fetch nativo + Web Crypto, edge-ready).
  - `aqualaguna/shopee-client`, `hynra/node-shopee`. Python: `JimCurryWang/python-shopee` (~232⭐).
- **Bling nativo:** sim — produto/estoque/pedido/logística (Shopee Xpress)/NF-e parcial.
  - Docs: [Config Shopee](https://ajuda.bling.com.br/hc/pt-br/articles/4414396074007), [Auth](https://ajuda.bling.com.br/hc/pt-br/articles/360058301693), [Sync estoque](https://ajuda.bling.com.br/hc/pt-br/articles/360058449713).
- **Seller:** CPF (rápido) ou CNPJ (recomendado, libera Shopee Xpress). Comissão base 12% + transação 2% + R$7/item (R$4 p/ CPF pequeno) + **frete grátis 6% obrigatório mar/2026**. GTIN obrigatório em eletrônicos/eletrodomésticos.
- **Catálogo:** categorias via `get_categories`; atributos obrigatórios por categoria; imagem mín 1 (rec 800x800, fundo branco). Mais rígido que ML.
- **Armadilhas:** alta taxa out-of-stock → suspensão; falsificação (precisa NF de compra); SLA de despacho; cancelamento <2%.
- **Veredito:** Bling nativo faz a sync. Cliente custom read-only (com `shopee-sdk`) só para auditoria/alertas — opcional, quando ativar.

## Amazon BR

- **API:** Selling Partner API (SP-API) — https://developer-docs.amazon.com/sp-api (MWS **descontinuado** mar/2024).
  - Auth: **LWA OAuth2** (refresh token) + (alguns casos) AWS Signature v4. Registro de developer no Solution Provider Portal + aprovação (1-2 semanas; PII = 3 revisões extras).
  - Sandbox: static + dynamic. Rate: token bucket, **throttling severo** (Orders ~1 req/min). 429 + backoff exponencial.
  - Endpoints: Listings Items (`getListingsItem` R / `putListingsItem`,`patch`,`delete` W), FBA Inventory (R/W), Orders (`getOrders`,`getOrder`,`getOrderItems` R), Catalog Items (R), **Product Type Definitions** (R — schema obrigatório por categoria), Reports (R) / Feeds (W bulk até 25k SKU).
- **Repos Node/TS:**
  - `amz-tools/amazon-sp-api` — https://github.com/amz-tools/amazon-sp-api (262⭐, auth+retry+sandbox). **Melhor base.**
  - `@scaleleap/selling-partner-api-sdk` — https://github.com/ScaleLeap/selling-partner-api-sdk (fully typed, modular, tipos gerados dos models oficiais).
  - Oficiais: `amzn/selling-partner-api-models`, `amzn/selling-partner-api-samples`.
- **Bling nativo:** sim — FBM + FBA + FBA Onsite. Produto/estoque/pedido/NF-e. Não expõe Brand Analytics/A+/Ads.
  - Docs: [Config Amazon](https://ajuda.bling.com.br/hc/pt-br/articles/5096545607831), [Guia FBA](https://ajuda.bling.com.br/hc/pt-br/articles/4402794177943).
- **Seller:** Individual R$0/mês + R$2/item, ou Profissional R$19/mês (1º ano free). Comissão 8-20% por categoria. **GTIN obrigatório** (exemption p/ marca própria/kit/registro de marca, ~48h). FBA (Prime, logística Amazon) vs FBM (controle/itens grandes).
- **Catálogo:** product types com JSON schema (validar antes de criar); GTIN→ASIN; imagem principal fundo branco, ≥1000px (rec 1600+). Catálogo centralizado (1 produto = 1 ASIN global). Brand Registry (INPI) libera A+/Analytics.
- **Armadilhas:** SP-API **notoriamente complexa**; throttling Orders; order defect rate <1%, late shipment <4%; 2 contas = suspensão.
- **Veredito:** Bling nativo cobre a operação padrão. Custom só se precisar escala de auditoria, Ads ou Brand Analytics — alto custo de dev.

## Casas Bahia / Via (Grupo Casas Bahia, ex-Via Varejo)

- **API:** **própria** — https://developers.grupocasasbahia.com.br/ (NÃO é SkyHub). Hosts: HLG `api-mktplace-hlg.viavarejo.com.br`, PRD `api-mktplace.viavarejo.com.br`.
  - Auth: headers `client_id` + `access_token` (gerados no portal/homologação). HTTPS. **Homologação obrigatória** antes de produção (contato `integracao.mktp@viavarejo.com.br`).
  - Endpoints: categorias (R), produtos (R/W), estoque (R/W), preços (W), pedidos `GET /api/v2/orders/{id}` (R), labels/tracking (W), NF-e v2 (W), SAC v2. Swagger no API Portal.
  - Rate limits: não documentados publicamente.
- **Repos:** **nenhum** Node/TS/Python público mantido. Só PHP SkyHub (`bittools/skyhub-php` oficial; `bbarreto/skyhub-php-sdk` obsoleto 2018) — e SkyHub é p/ B2W/Americanas, outro marketplace. `github.com/viavarejo` sem repos públicos de marketplace.
- **Bling nativo:** sim, completo — produto/estoque/pedido/NF-e/preço. **Canal já criado na conta do cliente** ("DROPCHINA" ViaVarejo, desativado na limpeza de canais).
  - ⚠️ **Casas Bahia permite só 1 integrador por conta.** Se Bling é o integrador, não roda custom junto.
  - Docs: [Auth Casas Bahia](https://ajuda.bling.com.br/hc/pt-br/articles/360044457714), [Config](https://ajuda.bling.com.br/hc/pt-br/articles/4415802622615), [Categorias/campos](https://ajuda.bling.com.br/hc/pt-br/articles/360044460974).
- **Seller:** **CNPJ obrigatório**. Comissão 18.5-21% (promo 17% até 31/03/2026). Registro grátis (~2 dias). **GTIN obrigatório em tudo.** SLA despacho **24h**. Reputação 1-5 libera desconto de frete.
- **Catálogo:** título máx 60 char; atributos por categoria (cor/tamanho/voltagem/dimensões/peso/marca); imagem mín 2, 900x900-1200x1200, máx 2MB, JPEG, sem marca d'água.
- **Veredito:** **100% Bling nativo.** API fechada/homologada, sem SDK, limite de 1 integrador. Não construir custom.

---

## Arquitetura de expansão (quando ativar)

Para cada novo canal, repetir o padrão já provado (igual ML/Shopify):
```
1. Abrir conta de seller no marketplace (CNPJ, fiscal, aprovação)
2. Resolver GTIN dos produtos do canal (pré-requisito)
3. Conectar integração nativa no Bling (canal)
4. Vincular produtos por SKU/GTIN — conferir, sem duplicar
5. Ligar sync (estoque depósito=Todos + import pedidos Pago→Em aberto)
6. Buffer anti-oversell (delay de sync + mais canais = mais janela)
```
Cliente custom read-only (estilo `mcp-meli`) é **opcional**, só para Shopee/Amazon, e só quando
houver conta+credencial para auditar de verdade. Casas Bahia: não fazer custom.

## Repos (consolidado)

- Shopee: https://github.com/congminh1254/shopee-sdk · https://github.com/sulistta/shopee-js · https://github.com/JimCurryWang/python-shopee
- Amazon: https://github.com/amz-tools/amazon-sp-api · https://github.com/ScaleLeap/selling-partner-api-sdk · https://github.com/amzn/selling-partner-api-models · https://github.com/amzn/selling-partner-api-samples
- Casas Bahia: (nenhum Node/TS) · https://github.com/bittools/skyhub-php (PHP, outro marketplace)
