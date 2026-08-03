# Runbook — Tagueamento & Medição (Fase 0, primeiro alvo)

> Objetivo: encanamento de medição 100% instalado e testado, pra quando o estoque virar já dar
> pra medir e escalar ads. **Tudo grátis.** Criado 2026-07-06.
>
> **Divisão de trabalho:**
> - 🧑 **Gabriel** = criar contas Google/Meta (precisa login humano — não dá pra automatizar aqui).
> - 🤖 **Eu (Crescimento)** = organizar ordem, receber IDs, definir eventos, validar.
> - 🎨 **Chat Shopify** = colar os IDs no `theme/` + banner LGPD + Custom Pixel do checkout.

---

## ⚠️ Pegadinhas Shopify 2026 (não errar)
- Checkout **não** é mais rastreado por `theme.liquid` — usa **Custom Pixel** em *Configurações → Eventos do cliente*. (chat Shopify)
- Eventos GA4 precisam do array **`items[]`** (id, name, price, qty) senão relatório de produto vem vazio.
- **LGPD:** banner em PT, botão "Recusar" tão fácil quanto "Aceitar", guardar prova de consentimento. Consent Mode v2 antes de disparar tags.
- Merchant Center exige **GTIN** (gargalo no chat Bling) — só afeta Google Shopping, não trava GA4/Pixel.

---

## Ordem de execução

### Passo 1 — Banner LGPD + Consent Mode v2 🧑🎨
Sem consentimento, GA4/Ads ficam cegos no BR. Instalar app de consentimento (ex: da App Store Shopify, plano grátis) → configurar granular (aceitar/recusar/preferências) → Consent Mode v2 ligado. **Bloqueia disparo das tags até haver escolha.**
- **Entregável:** banner no ar, testado em aba anônima.

### Passo 2 — GA4 🧑 → me devolve o ID
Criar propriedade GA4 (analytics.google.com) da loja. Moeda **BRL**, fuso **-03** (igual Shopify).
- **Me devolve:** `Measurement ID` no formato `G-XXXXXXX`.

### Passo 3 — GTM 🧑 → me devolve o ID
Criar container Web (tagmanager.google.com).
- **Me devolve:** `Container ID` no formato `GTM-XXXXXX`.

### Passo 4 — Meta Business + Pixel 🧑 → me devolve o ID
Criar Meta Business Manager → verificar domínio `dropchinaoficial.com.br` → criar Pixel (Dataset).
- **Me devolve:** `Pixel ID` (numérico) + confirmação de domínio verificado.

### Passo 5 — Microsoft Clarity 🧑 → me devolve o ID
Criar projeto em clarity.microsoft.com (grátis, heatmap + gravação). Ligar já, mesmo esgotado — dá dado de comportamento desde o dia 1.
- **Me devolve:** `Project ID`.

### Passo 6 — Instalação no tema 🎨 (chat Shopify)
Eu passo os 5 IDs pro chat Shopify, que instala no `theme/` + Custom Pixel no checkout:
- GA4 + GTM (via app Google & YouTube da Shopify OU GTM manual no theme).
- Meta Pixel (app oficial Meta na Shopify — já traz CAPI).
- Clarity (script no head).

### Passo 7 — Search Console 🧑
Verificar domínio (via DNS ou tag) + enviar sitemap (`/sitemap.xml` automático do Shopify).

### Passo 8 — Validação 🤖🧑 (fecha a Fase 0 de medição)
Compra-teste / navegação-teste e conferir que os eventos chegam:
- [ ] GA4 tempo real registra `page_view` + `view_item`.
- [ ] Meta Events Manager registra `PageView` + `ViewContent`.
- [ ] Clarity gravando sessão.
- [ ] Banner LGPD bloqueia tags antes do consentimento.
- [ ] (Quando estoque live) `add_to_cart` + `purchase` com `items[]` preenchido.

---

## Eventos de e-commerce a garantir (GA4 + Meta)
| Etapa funil | GA4 | Meta | Quando |
|---|---|---|---|
| Ver página | `page_view` | `PageView` | já |
| Ver produto | `view_item` | `ViewContent` | já |
| Add carrinho | `add_to_cart` | `AddToCart` | estoque live |
| Início checkout | `begin_checkout` | `InitiateCheckout` | estoque live |
| Compra | `purchase` | `Purchase` | estoque live |

## IDs a coletar (espelho do `../social/contas-e-acessos.md`)
- [ ] GA4 `G-________`
- [ ] GTM `GTM-________`
- [ ] Meta Pixel `________` + domínio verificado
- [ ] Clarity `________`
- [ ] Search Console verificado + sitemap enviado

## Custo
Tudo **R$ 0**. App de banner LGPD tem plano grátis; se precisar pago fica ~R$0-50/mês (decidir depois).
