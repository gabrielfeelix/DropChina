# Plano geral — DropChina (3 trilhos)

> Visão única do projeto cruzando os 3 trilhos: Operação (Bling/sync), Marca, Presença digital.
> Sem datas fixas (dependem de contador/Augusto); ordem por dependência e marcos. Atualizado 16/jun/2026.
> Docs de detalhe: `STATUS.md`, `go-live-bling-checklist.md`, `bling-otimizacao-100.md`,
> `ncm-por-categoria-draft.md`, `precificacao-e-restricoes-marketplaces.md`, e `marketing/` `social/` `brand/`.

## Os 3 trilhos
- **A — Operação (faz dinheiro entrar):** Bling como hub, NF-e, ML + Shopify vendendo com sync.
- **B — Marca:** identidade visual, logo, manual da marca.
- **C — Presença digital:** loja no ar com domínio, tagueamento/LGPD, redes sociais, mídia.

A é prioridade. B roda em paralelo. C depende de pedaços de A (domínio, export) e de B (identidade).

## Caminho crítico (o que destrava o resto)
```
NCM validado (contador)  ─┬─►  NF-e no Bling  ─►  vínculo ML  ─►  sync ML
                          └─►  GTIN preenchido  ─►  Merchant Center (Google) + Amazon/CB
domínio apontado  ─►  Shopify no ar + verificação Meta  ─►  catálogo nas redes
export Bling→Shopify  ─►  catálogo na loja  ─►  catálogo nas redes
identidade (brand)  ─►  tema Shopify + avatares/templates das redes
```
**GTIN e NCM são os dois nós que travam mais coisa.** Resolvê-los cedo libera operação + Google + marketplaces.

---

## TRILHO A — Operação

| Marco | Depende de | Quem |
|---|---|---|
| A1. NCM validado + aplicado nos 136 | contador validar draft | contador → 🤖 aplica |
| A2. Fiscal no Bling (certificado A1, regime, CFOP, série, emissão auto) | contador + Augusto | 👤 |
| A3. 12 SKU no ML + vínculo ML↔Bling | Augusto (SKU) | 👤 / 🤖 confere |
| A4. Shopify: apagar demos + export Bling→Shopify | A1 (catálogo pronto) | 🤖 limpa / 👤 exporta |
| A5. Config Shopify: frete (Melhor Envio), pagamento (Mercado Pago+Pix), impostos, políticas, domínio | — | 👤 |
| A6. Markup de preço por canal | — | 👤 |
| A7. Ligar sync (estoque depósito=Todos + pedidos Pago→Em aberto), 16 FULL fora | A1-A4 | 👤 |
| A8. Emissão + envio de NF-e por e-mail automático | A2 | 👤 |
| A9. Teste 1 SKU → monitorar 24-48h → **go-live** | A1-A8 | 🤝 |
| A10. (otimização) nota de entrada/compras, conciliação de taxas, financeiro | go-live | 👤 |

## TRILHO B — Marca

| Marco | Quem |
|---|---|
| B1. Briefing + benchmark + persona | 🤝 |
| B2. Logo + variações + favicon | designer/Gabriel |
| B3. Paleta + tipografia (Google Fonts p/ Shopify) | designer/Gabriel |
| B4. Manual da marca (brandbook) + tom de voz | Gabriel |
| B5. Templates (post/story/banner/e-mail) + avatares | Gabriel |
| B6. Aplicar identidade no tema Shopify | Gabriel |

## TRILHO C — Presença digital

| Marco | Depende de | Quem |
|---|---|---|
| C1. Domínio `dropchinaoficial.com.br` apontado pra Shopify (DNS) | decisão Hostinger | 👤 |
| C2. Banner LGPD + Consent Mode v2 | C1 | 👤 |
| C3. GTM + GA4 + eventos e-commerce (Custom Pixel no checkout) | C1 | 👤 |
| C4. Search Console + sitemap | C1 | 👤 |
| C5. Google Merchant Center (feed) | **GTIN** (A1) + C1 | 👤 |
| C6. Meta Pixel + CAPI | C1 | 👤 |
| C7. Redes: IG/FB business + verificar domínio + Commerce Manager (catálogo) | C1 + A4 + B5 | 👤 |
| C8. WhatsApp Business + catálogo | B5 | 👤 |
| C9. TikTok Shop | A4 | 👤 |
| C10. Google Ads + redes Ads (mídia) | C3-C7 | 👤 |

---

## Ordem macro recomendada
```
AGORA      A1 (contador→NCM) + B1-B3 (marca começa) + C1 (domínio)  ← em paralelo
DEPOIS     A2-A4 (fiscal + Shopify catálogo) + B4-B6 (identidade aplicada)
ENTÃO      A5-A9 (config + sync + go-live)  +  C2-C6 (tag/LGPD/Merchant/Pixel)
POR FIM    C7-C10 (redes + catálogo social + mídia) + A10 (financeiro/otimização)
```

## Legenda
🤖 Claude (via API/scripts) · 👤 Gabriel/Augusto/contador (navegador/conta) · 🤝 conjunto.

## Próximo gatilho
Contador devolver os NCMs validados → Claude aplica nos 136 → NF-e destrava → cascata do Trilho A.
Em paralelo: decidir domínio (C1) e começar a marca (B1-B3).
