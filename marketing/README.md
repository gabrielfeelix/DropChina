# marketing/ — Google, tagueamento, analytics e ads

> Plano da camada de **rastreamento e mídia** da loja Shopify (DropChina). Setup técnico que
> mede e impulsiona vendas. Pesquisa jun/2026. Maioria é config no admin Shopify + contas Google/Meta.

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
| **Google Business Profile** | perfil de marca (só se tiver endereço físico) | 🔜 opcional |
| **Server-side tagging (sGTM)** | recupera 30-40% de conversão perdida por adblock | 🔜 só >R$100k/mês |

## ⚠️ Pontos que pegam (Shopify 2026)
- **Checkout NÃO é mais rastreado pelo `theme.liquid`** (Shopify removeu `checkout.liquid` em 2024).
  Usa **Custom Pixel** em Configurações → Eventos do cliente (Customer Events).
- **Merchant Center exige GTIN** — conecta direto com o gargalo dos 71 sem GTIN (ver go-live checklist).
- **LGPD:** banner em português, "Recusar" tão fácil quanto "Aceitar", guardar prova de consentimento.
- Eventos GA4 **precisam do array `items[]`** (id, name, price, qty) senão relatório de produto vem vazio.

## Ordem de implementação
```
1. Banner LGPD + Consent Mode v2 (app tipo LGPDY)
2. App "Google & YouTube" na Shopify  → cria GA4 + Merchant Center + Ads de uma vez
3. GTM container + Custom Pixel no checkout
4. Google Search Console (verifica domínio + sitemap)
5. Meta Pixel + CAPI (app oficial Meta na Shopify)
6. Validar com compra-teste (GA4 purchase + Meta event + Ads conversion)
7. (depois) Google Ads Performance Max + Merchant Center free listings
8. (futuro) server-side tagging se escalar
```

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
