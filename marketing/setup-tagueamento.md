# Runbook — Tagueamento & Medição (Fase 0, primeiro alvo)

> Objetivo: encanamento de medição 100% instalado e testado. **Tudo grátis.**
> Criado 2026-07-06 · **revisado 2026-08-04**.
>
> ⚠️ **Mudou desde a criação:** o motivo deixou de ser "preparar pra quando o estoque virar" —
> o estoque virou. Hoje a loja vende e mesmo assim são **230 sessões / 0 pedidos**, sem nenhuma
> medição instalada. O runbook virou urgente, não preparatório.
>
> 🔀 **Ordem alterada:** o **Clarity saiu do passo 5 pro passo 0**. Ele é o único que responde
> *por que* não converte (grava a sessão); GA4 conta *quantos*. Com o volume atual, gravação
> ensina mais rápido que relatório.
>
> ✅ **Atalho novo:** o tema **já tem campo pronto** para o **GA4** e para o **token do Search
> Console** em *Personalizar → Configurações do tema → Medição e verificação*. Para esses dois
> não é preciso mexer em código — basta colar o ID.
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
- Merchant Center exige **GTIN** — **53 produtos sem** (contagem de 04/ago; 101 de 154 já têm).
  Só afeta Google Shopping, não trava GA4/Pixel.

---

## Ordem de execução

### Passo 0 — Microsoft Clarity 🧑 → me devolve o ID · **COMEÇA AQUI**
Criar projeto em clarity.microsoft.com (grátis, sem limite de sessão). É o primeiro porque é o
único que mostra **onde a pessoa desistiu** — gravação de sessão + heatmap. Com 230 sessões/mês
acumuladas, dá pra assistir numa tarde e sair com hipótese de conversão.
- **Me devolve:** `Project ID`.

### Passo 1 — Banner LGPD + Consent Mode v2 🧑🎨
Sem consentimento, GA4/Ads ficam cegos no BR. Instalar app de consentimento (ex: da App Store Shopify, plano grátis) → configurar granular (aceitar/recusar/preferências) → Consent Mode v2 ligado. **Bloqueia disparo das tags até haver escolha.**
- **Entregável:** banner no ar, testado em aba anônima.

### Passo 2 — GA4 🧑 → me devolve o ID
Criar propriedade GA4 (analytics.google.com) da loja. Moeda **BRL**, fuso **-03** (igual Shopify).
- **Me devolve:** `Measurement ID` no formato `G-XXXXXXX`.
- ✅ **Campo já existe no tema** (*Personalizar → Medição e verificação → ID de medição do GA4*).
  Colar ali e salvar já liga — não precisa passar pelo chat Shopify.

### Passo 3 — GTM 🧑 → me devolve o ID
Criar container Web (tagmanager.google.com).
- **Me devolve:** `Container ID` no formato `GTM-XXXXXX`.

### Passo 4 — Meta Business + Pixel 🧑 → me devolve o ID
Criar Meta Business Manager → verificar domínio `dropchinaoficial.com.br` → criar Pixel (Dataset).
- **Me devolve:** `Pixel ID` (numérico) + confirmação de domínio verificado.

### Passo 5 — *(vago — Clarity subiu para o Passo 0)*

### Passo 6 — Instalação no tema 🎨 (chat Shopify)
O que **não** tem campo pronto e precisa do chat Shopify:
- **GTM** (container manual no theme, se for usar).
- **Meta Pixel** (app oficial Meta na Shopify — já traz CAPI).
- **Clarity** (script no head).
- **Custom Pixel do checkout** (Configurações → Eventos do cliente).

GA4 e Search Console **não entram aqui** — têm campo no customizador do tema.

### Passo 7 — Search Console 🧑
Verificar domínio + enviar sitemap (`/sitemap.xml` automático do Shopify).
- ✅ **Campo já existe no tema** (*Personalizar → Medição e verificação → Token do Google Search
  Console*) — cola só o valor do `content` da meta tag, sem aspas nem a tag inteira.

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
- [ ] **Clarity `________`** ← primeiro
- [ ] GA4 `G-________` (campo pronto no tema)
- [ ] Search Console verificado + sitemap enviado (campo pronto no tema)
- [ ] Meta Pixel `________` + domínio verificado
- [ ] GTM `GTM-________`

## Custo
Tudo **R$ 0**. App de banner LGPD tem plano grátis; se precisar pago fica ~R$0-50/mês (decidir depois).
