# Proposta de seções para a home

Mockup navegável: [`proposta-home-secoes.html`](proposta-home-secoes.html)

O GitHub não renderiza HTML no preview — baixe o arquivo e abra no navegador, ou veja a
versão publicada em https://claude.ai/code/artifact/b9a11ce8-0bc0-407a-88d7-16ed53a0053c

O buscador de compatibilidade no mockup é funcional: escolha marca e modelo e ele responde
com o índice real do catálogo.

## Diagnóstico

A home tem 12 seções, mas só quatro vendem — e duas delas são o mesmo carrossel
(`dc-product-list`) repetido. Nenhuma seção sabe que a DropChina é uma loja de suprimentos de
impressão: ela está montada como loja de eletrônico genérico.

O catálogo diz o contrário. Impressão & Suprimentos tem 39 produtos, Toners 26 (HP 13,
Brother 11, Samsung 1), Papéis e Papelaria 13 cada. Impressão domina.

## O ativo não usado

32 dos 38 produtos de impressão já carregam `custom.compatibilidade` — um array de modelos de
impressora — mais as tags `compat-hp`, `compat-brother`, `compat-samsung` e `compat-ricoh`.
Quatro famílias cobrem 26 dos 32 produtos:

| família | produtos |
|---|---|
| HP 105A / W1105A | 11 |
| Brother TN2340 / TN2370 / TN660 | 7 |
| Brother TN1060 | 4 |
| HP 667 | 4 |

Nenhuma seção da loja exibe esse dado hoje.

## As nove seções

**Tier 1 — só existem porque é loja de impressão**

1. Buscador de compatibilidade — marca → modelo → o que serve
2. Custo por página — a métrica de quem compra para empresa
3. Escada de kits — 1un / 2× / 5× / 10× lado a lado
4. Impressora + suprimento — sobe ticket e define quem volta

**Tier 2 — adaptações, com cara própria**

5. Categorias com contagem e hierarquia (`dc-categories-grid`)
6. Ofertas relâmpago com contador (`dc-coupon-strip`, já no tema)

**Tier 3 — destaque dedicado**

7. Faixa de Impressão 3D
8. Atacado CNPJ (`atacado-banner`, já no tema)
9. Tabs por marca de impressora

## Problemas encontrados nos dados

Não eram o objetivo da análise; apareceram ao ler o catálogo e **nenhum foi corrigido**.

- **Kit 5× mais caro que a compra avulsa.** HP 105A Evolut: avulso R$ 36,00/un, Kit 2×
  R$ 30,75/un, Kit 5× **R$ 37,18/un**, Kit 10× R$ 32,30/un. A escada de kits existe para
  provocar comparação — corrigir o Kit 5× é pré-requisito para publicá-la.
- **Cartucho HP 667 não lista a DeskJet 2975**, que a loja vende. Ou o dado está incompleto,
  ou o cartucho não serve. O buscador exporia isso publicamente.
- **Monitores com 0 produtos e Mini PCs com 1** — categoria vazia no menu é rota morta.
- **Cupom BEMVINDO10 não existe no Shopify**, mas a newsletter já promete 10% OFF.
- **Nenhum produto perto de R$ 29k.** Teto do catálogo é o Bambu Lab A1 Combo a R$ 5.280,
  seguido da Epson WF-C5890 a R$ 3.876. Isso muda a conta da negociação de taxa com a
  Pagar.me, que partia de um ticket de R$ 29 mil em 12×.

## Ordem sugerida

1. Ligar o que já existe: `dc-coupon-strip`, `dc-category-spotlight`, `atacado-banner`
2. Corrigir o preço do Kit 5×
3. Buscador de compatibilidade
4. Custo por página e escada de kits
5. Impressora + suprimento, e a faixa de 3D

Dados extraídos do Shopify Admin API em 24/jul/2026: 25 coleções, 38 produtos de impressão
amostrados. Preços e estoques como estavam no momento da consulta.
