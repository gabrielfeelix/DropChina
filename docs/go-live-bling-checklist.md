# Go-live Bling — checklist mestre da operação

> **Leia isto primeiro.** Mapa do que falta pra loja ficar 100% operante com o Bling como hub
> (catálogo, estoque, fiscal, canais, frete). Status real auditado via API em 16/jun/2026.
> Docs companheiros: `docs/expansao-marketplaces.md`, `docs/precificacao-e-restricoes-marketplaces.md`,
> `docs/runbook-casas-bahia.md`. Arquitetura: `mcp-bling/01_DropChina_Projeto_e_Arquitetura.md`.

Legenda: ✅ pronto · 🟡 em andamento · ❌ falta/bloqueia · 👤 ação no navegador (Gabriel/Augusto/contador) · 🤖 Claude pode fazer via API.

## 1. Catálogo
| Item | Status | Quem |
|---|---|---|
| Produtos cadastrados (136) | ✅ | 🤖 feito (carga ML→Bling) |
| SKU, preço, peso, dimensões, origem, categoria | ✅ 15/15 na amostra | 🤖 |
| Estoque baseline (5948 un) | ✅ | 🤖 `npm run fill:estoque` |
| **GTIN** | 🟡 ~40% (71 sem) | 🤖 audita / 👤 fonte do GTIN |
| 12 anúncios sem SKU | 🟡 | 👤 Augusto (no ML) |

## 2. Fiscal / NF-e  ← MAIOR BURACO
| Item | Status | Quem |
|---|---|---|
| **NCM por produto** | ❌ **0% — bloqueia NF-e** | 🤖 posso aplicar / 👤 contador valida |
| Certificado e-CNPJ A1 instalado no Bling | ❓ verificar | 👤 Augusto |
| Regime tributário (Simples/etc), CSOSN/CST, CFOP | ❓ | 👤 contador/Augusto |
| Natureza de operação (venda) | ❓ | 👤 |
| Série/numeração NF-e + ambiente produção | ❓ | 👤 |
| CEST (se houver Substituição Tributária) | ❌ | 🤖 aplico / 👤 valida |
| Regra de emissão automática (emitir quando ML libera etiqueta) | ❌ | 👤 config Bling |

> Sem NCM **não emite nota** — e sem nota não vende legalmente nem despacha no ML/Full. É o
> primeiro bloqueador a resolver. NCM pode vir: da **nota de entrada** do fornecedor (Bling preenche
> sozinho), do **contador**, ou de um **draft por categoria** (Claude propõe, contador valida).

## 3. Estoque / Depósito
| Item | Status | Quem |
|---|---|---|
| Depósito padrão (id 14888019804) | ✅ | — |
| Baseline aplicado | ✅ | 🤖 |
| Re-balanço fresco antes do go-live | 🟡 | 🤖 script pronto |
| Reserva de estoque (pedido pendente reserva; cancelado estorna) | ❓ conferir | 👤 |
| 16 anúncios FULL fora do push Bling→ML | ⚠️ planejado | 👤 config |

## 4. Canais + sincronização
| Item | Status | Quem |
|---|---|---|
| ML: matar duplicado + ViaVarejo | ✅ | 👤 feito |
| ML: vínculo anúncio↔produto | 🟡 Parte 4 | 👤 |
| Shopify: apagar 28 demos | ❌ | 🤖 `limpar-demos.mjs` (você dispara) |
| Shopify: export Bling→Shopify | ❌ | 👤 Bling |
| Sync estoque (depósito=Todos) | ❌ Fase 5 | 👤 |
| Import pedidos (Pago→Em aberto, nunca "Todos") | ❌ Fase 5 | 👤 |
| Markup de preço por canal | ❌ | 👤 (ver doc precificação) |

## 5. Frete
| Canal | Onde configura o preço | Papel do Bling |
|---|---|---|
| **Mercado Livre** | no ML (Mercado Envios: Full/Flex/normal) | importa etiqueta + rastreio |
| **Shopify** | no Shopify (Shopify Shipping ou app Melhor Envio/Frenet) | importa pedido c/ frete |
| **Bling** | — | back-office: gera etiqueta + declaração de conteúdo, integra transportadora |

→ Regra: **preço de frete = no canal. Bling = etiqueta/rastreio/declaração.** Opcional: integrar
Melhor Envio/Correios no Bling pra emitir etiqueta centralizada.

## 6. Pagamento
| Canal | Como |
|---|---|
| Mercado Livre | Mercado Pago (nativo) — 👤 |
| Shopify | gateway no Shopify (Shopify Payments / Mercado Pago / Pix) — 👤 |

## 7. Fluxo de pedido (quando ligar a Fase 5)
Venda no canal → Bling importa pedido → baixa estoque → reenvia saldo aos outros canais → emite NF-e
→ manda código de rastreio de volta ao canal. Tudo automático, depende de: vínculo + sync ligada +
NF-e configurada + import auto de pedidos.

---

## O que o Claude faz ativamente (é só me acionar)
- 🤖 Auditar catálogo (GTIN, NCM, campos fiscais/logísticos) — feito, repetível
- 🤖 **Preencher NCM/CEST/GTIN em massa** via API (a partir de fonte validada ou draft por categoria)
- 🤖 Criar/atualizar produtos, descrição, preço, campos customizados em massa (idempotente por SKU)
- 🤖 Re-balanço de estoque (`fill:estoque`) e re-pull do ML (`mcp-meli`)
- 🤖 Verificar canais/vínculos via API (`canaisDeVenda`, `produtosLojas`)
- 🤖 Limpeza de demos Shopify (`limpar-demos.mjs`, você dispara o --confirm)
- 🤖 Propor draft de NCM por categoria pro contador validar

## O que SÓ o Gabriel/Augusto/contador faz (navegador/conta)
- 👤 Instalar certificado A1, configurar regime/CFOP/CSOSN, série NF-e, emissão automática
- 👤 Conectar/configurar integrações de canal, ligar sync, markup por canal
- 👤 Configurar frete (ML e Shopify) e pagamento
- 👤 Dar SKU nos 12 anúncios do ML

## Ordem recomendada até go-live
```
1. NCM em todos os produtos (desbloqueia NF-e)        ← bloqueador fiscal
2. Config fiscal completa (certificado, regime, série) ← contador/Augusto
3. 12 SKU no ML (Augusto) + vínculo ML↔Bling (Parte 4)
4. Shopify: apagar demos → export Bling→Shopify
5. Markup de preço por canal
6. Re-balanço de estoque fresco
7. Ligar sync (estoque depósito=Todos + pedidos Pago→Em aberto), 16 FULL de fora
8. Teste com 1 SKU → monitorar 24-48h → go-live
```
