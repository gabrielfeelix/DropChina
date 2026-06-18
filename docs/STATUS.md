# STATUS do projeto — DropChina (sync multicanal Bling)

> Foto do estado atual e próximas etapas. Atualizado 17/jun/2026. Branch: `main`.
> Leia junto: `go-live-bling-checklist.md` (mestre) e `plano-geral.md` (3 trilhos).

## Onde estamos
Montando a operação com **Bling como hub** (fonte de verdade de catálogo/estoque/fiscal),
sincronizando **Mercado Livre** (Platinum, em produção) + **Shopify** (vitrine, em montagem).
Catálogo e estoque já dentro do Bling; falta vínculo dos canais, fiscal no Bling e ligar a sync.

## Pronto ✅
- **Catálogo no Bling:** 136 produtos (carga do ML), com SKU, preço, peso, dimensões, origem, categoria.
- **Estoque baseline:** 135 produtos com saldo real do ML (`available_quantity`), 5948 un, snapshot de hoje.
- **Canais saneados:** ML duplicado e ViaVarejo desativados; sobrou 1 ML + 1 Shopify ativos.
- **Diagnóstico fiscal:** auditado — NCM 0% (bloqueia NF-e), GTIN ~40%, resto dos campos 100%.
- **Fiscal confirmado com Augusto:** empresa **LTDA**, **tem contador**, **emite NF-e de tudo** no ML
  (contato do contador recebido). Não criamos fiscal do zero — só replicar no Bling.
- **Scaffolds de expansão:** `mcp-shopee/` e `mcp-amazon/` (read-only, espelham mcp-meli, typecheck ok, não testados).
- **Documentação:** ver índice abaixo.

## Ferramentas/código do repo
- `mcp-bling/` — cliente API v3 do Bling (fonte de verdade). Scripts: `fill:estoque`, `discover:kits`, `load:meli`, etc.
- `mcp-meli/` — cliente READ-ONLY do Mercado Livre (pull de catálogo/estoque; agora captura FULL).
- `mcp-shopee/`, `mcp-amazon/` — scaffolds read-only (ativar só com conta/credencial).
- `catalogo/limpar-demos.mjs` — apaga os 28 demos da Shopify (dry + backup; rodar antes do export).

## Docs (índice)
- `docs/go-live-bling-checklist.md` — **mestre**: o que falta pra loja 100%, com status e responsável.
- `docs/ncm-por-categoria-draft.md` — NCM por categoria pro contador validar (destrava NF-e).
- `docs/bling-otimizacao-100.md` — módulos do Bling a aproveitar (financeiro, compras, frete, automações).
- `docs/precificacao-e-restricoes-marketplaces.md` — markup por canal + produtos proibidos/restritos.
- `docs/expansao-marketplaces.md` — Shopee/Amazon/Casas Bahia (API, repos, Bling nativo).
- `docs/runbook-casas-bahia.md` — Casas Bahia 100% Bling nativo (sem código).

## Próximas etapas (ordem)
```
1. Contador: validar NCM (draft) + passar regime/CFOP + certificado A1   ← Gabriel já vai contatar
2. Claude: aplicar NCM/CEST nos 136 via API (após validação)            → destrava NF-e
3. Augusto: SKU nos 12 anúncios do ML
4. Gabriel: vínculo ML↔Bling (browser) — Claude confere via API
5. Shopify: apagar 28 demos → exportar Bling→Shopify
6. Gabriel: config Shopify (frete Melhor Envio, pagamento Mercado Pago+Pix, impostos, domínio, políticas)
7. Markup de preço por canal no Bling
8. Re-balanço de estoque fresco
9. Ligar sync (estoque depósito=Todos + pedidos Pago→Em aberto), 16 FULL fora do push
10. Emissão automática de NF-e + envio por e-mail (Bling)
11. Teste com 1 SKU → monitorar 24-48h → go-live
```

## Pendências por responsável

### 👤 Augusto
- SKU nos 12 anúncios pausados do ML (mobilidade elétrica + 2 fones)
- Decidir escopo: manter ou podar itens fora do nicho (mobilidade, creatina, Starlink, etc.)
- Instalar/apontar certificado A1 no Bling
- Confirmar plano do Bling (cobre conciliação/DRE/NF-e do volume?)
- Validar preços e estoque do baseline

### 🧾 Contador (Gabriel vai contatar)
- Validar o draft de NCM por categoria
- Regime tributário, CSOSN/CST, CFOP, natureza de operação
- CEST/ST se houver
- Série/ambiente de NF-e no Bling

### 👤 Gabriel
- Vínculo ML↔Bling (browser)
- Shopify: apagar demos, exportar do Bling, config frete/checkout/pagamento/impostos/domínio/políticas
- Markup de preço por canal
- Ligar a sync (Fase 5) quando 1-9 prontos

### 🤖 Claude (é só acionar)
- Aplicar NCM/CEST/GTIN em massa via API (após contador validar)
- Re-balanço de estoque + re-pull ML
- Conferir vínculos/canais via API
- Limpeza de demos Shopify (você dispara o --confirm)
- Auditorias e ajustes de catálogo

## Frentes paralelas — negócio digital (além do operacional Bling/sync)
O serviço inclui montar a presença digital completa. Pastas + planos criados (pesquisa jun/2026):
- **`marketing/`** — Google (GTM, GA4, Merchant Center, Ads, Search Console), Meta Pixel/CAPI, consentimento LGPD. Liga ao gargalo do GTIN (Merchant Center exige).
- **`social/`** — redes sociais: Instagram/Facebook + WhatsApp Business + TikTok Shop; catálogo via Meta Commerce Manager; cadência de conteúdo.
- **`brand/`** — identidade visual + manual da marca + logo; aplica no tema Shopify e nas redes.

Dependências entre frentes: domínio apontado → verificação Meta; export Bling→Shopify → catálogo nas redes; `brand/` → avatares/templates de `social/`; GTIN → Merchant Center.

## Riscos ativos (lembrar)
- Não ligar sync de estoque com Bling desatualizado → zera anúncio Platinum.
- 16 anúncios FULL: ML controla estoque, Bling não sobrescreve.
- SKU divergente → duplica cadastro; vincular por GTIN/manual, nunca import cego.
- Pedidos: status Pago→Em aberto, nunca "Todos" (baixa 2×).
