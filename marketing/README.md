# marketing/ — Google, tagueamento, analytics e ads

> Plano da camada de **rastreamento e mídia** da loja Shopify (DropChina). Setup técnico que
> mede e impulsiona vendas. Pesquisa jun/2026 · **revisado 04/ago/2026**. Maioria é config no
> admin Shopify + contas Google/Meta.
>
> ⚠️ **Estado em 04/ago: nada disto está instalado.** Nem GA4, nem GTM, nem Pixel, nem Clarity,
> nem banner LGPD. A loja roda com 230 sessões/mês e 0 pedido, sem medição. Execução no runbook
> [`setup-tagueamento.md`](setup-tagueamento.md), que tem a ordem revisada (Clarity primeiro).

## Stack (o que montar)
| Ferramenta | Pra que | Prioridade |
|---|---|---|
| **Consent Mode v2 + banner LGPD** | consentimento de cookies (LGPD obriga no BR) — sem ele Ads/GA4 ficam cegos | ⏱️ 1º (compliance) |
| **Google Tag Manager (GTM)** | container central das tags (GA4, Meta, Ads) | ⏱️ base |
| **GA4** | funil de e-commerce (view_item → add_to_cart → purchase) | ⏱️ base |
| **Google & YouTube (app Shopify)** | conecta Merchant Center + GA4 + Ads automático | ⏱️ atalho |
| **Google Merchant Center** | feed de produtos → Shopping + listagens grátis | ⏱️ (exige GTIN!) |
| **Google Ads (Performance Max)** | mídia paga de e-commerce | 🔜 depois da base |
| **Google Search Console** | indexação/SEO da loja | ⏱️ rápido |
| **Meta Pixel + Conversions API (CAPI)** | rastreio Facebook/Instagram Ads | ⏱️ |
| **Google Business Profile** | perfil de marca em busca local | ⏱️ **alta** — endereço de Maringá-PR existe, e pro público PME rende mais que Instagram |
| **Server-side tagging (sGTM)** | recupera 30-40% de conversão perdida por adblock | 🔜 só >R$100k/mês |

## ⚠️ Pontos que pegam (Shopify 2026)
- **Checkout NÃO é mais rastreado pelo `theme.liquid`** (Shopify removeu `checkout.liquid` em 2024).
  Usa **Custom Pixel** em Configurações → Eventos do cliente (Customer Events).
- **Merchant Center exige GTIN** — **53 produtos sem GTIN** (recontado em 04/ago; 101 de 154 já têm).
- **LGPD:** banner em português, "Recusar" tão fácil quanto "Aceitar", guardar prova de consentimento.
- Eventos GA4 **precisam do array `items[]`** (id, name, price, qty) senão relatório de produto vem vazio.

## Ordem de implementação (revisada 04/ago)
```
0. Microsoft Clarity  ← PRIMEIRO. É o único que mostra POR QUE não converte
1. GA4 + Search Console  → campo já existe no tema, só colar o ID
2. Banner LGPD + Consent Mode v2 (app tipo LGPDY)
3. Meta Pixel + CAPI (app oficial Meta na Shopify)
4. GTM container + Custom Pixel no checkout
5. Validar com compra-teste (GA4 purchase + Meta event)
6. (depois) Google Ads Performance Max + Merchant Center free listings
7. (futuro) server-side tagging se escalar
```
> Antes o Clarity era o passo 5 e o app "Google & YouTube" abria a fila. Invertido porque o
> problema de hoje não é *quanto* tráfego chega — é *por que ele vai embora*.

## Mínimo essencial (checklist)
- [ ] Banner LGPD + consentimento granular + prova
- [ ] GTM container (web + custom pixel checkout)
- [ ] GA4 com eventos de e-commerce (`items[]`, currency/timezone = Shopify)
- [ ] Merchant Center com feed aprovado (GTIN, frete, imposto)
- [ ] Search Console (domínio verificado + sitemap)
- [ ] Meta Pixel + CAPI ativos
- [ ] GA4 ↔ Google Ads linkados
- [ ] Compra-teste validando os 3 rastreios

## Custo
Ferramentas core (GTM, GA4, Merchant Center, Pixel, Search Console) = **grátis**. Banner LGPD ~grátis-R$50/mês.
Ads = orçamento de mídia à parte. sGTM ~R$15-50/mês infra (só no futuro).

Fontes: support.google.com/analytics · help.shopify.com (custom pixels, Google listings) · flexyconsent.com (LGPD) · facebook.com/business (CAPI) · weltpixel.com (sGTM Shopify 2026).
