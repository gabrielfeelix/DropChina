# STATUS ATUAL — DropChina

> **Este é o documento de entrada. Se a pergunta é "qual o status atual?", a resposta está aqui.**
> Última atualização: **24/nov/2026** · Branch: `feat/shopify-ui-institucional`
>
> ⚠️ Existe um `docs/STATUS.md` antigo (17/jun) — **ignorar**, foi superado por este.

---

## Em uma linha

A loja **vende** — pagamento no ar, estoque sincronizado, fiscal 100% completo. Mas **nunca houve
uma venda**: são ~230 sessões por mês e 0 pedidos, com **zero medição instalada** para saber por
quê. O gargalo deixou de ser operacional e virou **conversão**.

---

## O que está no ar (verificado por API, não por memória)

| Frente | Estado |
|---|---|
| **Pagamento** | Pagar.me/Stone — cartão, Pix e boleto, fora do modo teste desde 30/jul |
| **Fiscal / NF-e** | Configuração completa · certificado A1 até 29/09/2026 · **catálogo 100% com NCM** (04/ago) |
| **Pedido Shopify → Bling** | ✅ **Testado ponta a ponta em 04/ago.** Entra em segundos, **com CPF**, SKU casado, canal certo. Cancelar na Shopify vira Cancelado no Bling |
| **Estoque Bling → Shopify** | Sincronizado, **0 divergências** |
| **Exclusão Bling → Shopify** | Coberta por `sync-exclusoes-shopify.ts` — ⚠️ **ainda não agendada em cron** |
| **Catálogo** | 164 produtos no Bling (154 ativos + 6 na lixeira + 4 inativos) · 119 na Shopify · **101/154 com GTIN** |
| **Vendas** | **0 pedidos na Shopify.** Os 8 do Bling são do Mercado Livre, de nov/2024 |
| **Medição** | ✅ **Clarity** (`y70lfm3dio`) e **GA4** (`G-KZ4CGVHY7X`) no ar, confirmados no HTML · Search Console validado + sitemap · Merchant Center `5843491607` Active. Falta Pixel e banner LGPD |
| **Marca** | 🟡 Instagram, Facebook, YouTube e Google Meu Negócio próprios criados (23/08) · logo escolhida, falta vetorizar e aplicar · ⚠️ **ficha FALSA no Google se passando pela empresa** e Reclame Aqui sob controle de terceiro |

---

## 24/nov/2026 — scooters AZM X13 + X15, coleção Mobilidade Elétrica

- **X15 criada e no ar** (Shopify `10445208682715`, Bling pai `16739874702`, vínculos criados com preço 6.000).
  4 cores: Branco, Prateado, Cinza-escuro, Preto (SKU `DC-AZM-X15-<COR>`), 10 un. cada, cartão R$ 6.000.
  Fotos sem a logo AZM do vendedor, quadradas 1200×1200, em `catalogo/scooter-x15/<cor>/`.
  Scripts: `criar-x15-shopify.ts`, `criar-x15-bling.ts`, `x15-midia.ts`.
- **X13:** vínculos Bling recriados com **5.500** (estavam 4.500 = Pix; "Sincronizar preços" derrubaria o cartão).
  5 cores confirmadas pelo Augusto (rosa não existe). Garantia 3 meses de fábrica (Augusto, 24/nov).
- **Coleção `mobilidade-eletrica`** criada e publicada (smart, tag `categoria-mobilidade-eletrica`) — X13 + X15.
- **Decisão de preço:** preço Shopify = cartão. Pix = desconto % da Pagar.me, igual pra loja toda → vai passar de **8% para 5%**.
- **Pagar.me:** 3 falhas de 18/nov (A1 Combo, R$ 3.962,70) = recusa do emissor (1007/1025/1019), não da loja.
  3 cartões em 4 min às 3h → padrão de teste de cartão. Chave secreta em `mcp-bling/.env` (`PAGARME_SECRET_KEY`).
- **CLI Shopify:** sessão venceu em 30/jul. Login é por código de dispositivo — dá pra autorizar pelo celular.

### Pendências (24/nov)
- **Tema (precisa CLI logado ou editor):**
  - ✅ Feito 24/nov via CLI (`--only --nodelete`): banner X13 v3 (5 cores), link do banner X15 → PDP, seção `mobilidade_home` na home.
  - Banner **mobile** da X13 ainda diz 6 cores (falta arte mobile).
  - ✅ Menu: 7º link "Mobilidade" na barra (`nav_link_7`) + departamento `dep_mobilidade` (ícone `scooter`) no "Todas as categorias".
  - ✅ Grade de categorias: card `cat_mob` com modelo 3D `mobilidade-eletrica` (scooter em `scripts/cat-3d/src/models.js`).
  - ✅ Card: "Frete grátis" (≥ R$ 1.000) não aparece mais em item > 30 kg.
  - Pix 8% → 5% no tema (`pix_pct` em `dc-product-card.liquid`, `dc-pdp.liquid`, `dc-header.liquid`; textos em `header-group.json`, `dc-faq.liquid`, `meta-tags.liquid`) — **só depois** de trocar na Pagar.me (HUB → Minhas integrações → Shopify → desconto Pix).
  - ⚠️ Assets dos banners das scooters (exceto x13-v3) só existem no tema live: nunca push sem `--only`.
- **Banners:** preços "R$ 4.500 / R$ 5.000 à vista" não batem com Pix 5% (5.225 / 5.700).
- **X15:** fotos de vermelho e azul (banner mostra; Augusto confirmar se existem).
- **NCM** vazio em X13 e X15 — Augusto vai ver com o contador. Custo (COGS) das motos não informado.
- `pix_price` (metafield) da X13 = 4500 e da X15 removido do script — tema ignora; limpar.

---

## 29/set/2026 — filamentos Bambu, Pix 8%, parcelamento

- **15 filamentos Bambu no ar** (Bling + Shopify, vinculados, estoque 10): 7 PLA Lite, 1 PLA Basic laranja,
  7 PETG Basic. Dados em `catalogo/filamentos-bambu-*.json`, descrições em `catalogo/filamentos-bambu/descricoes.md`.
  Scripts: `criar-filamentos-bambu.ts` (Bling), `criar-filamentos-shopify.ts`, `filamentos-midia.ts` (galeria + descrição rica).
- **Pix 8%** na Pagar.me e no tema. **Parcelamento Pagar.me:** 10x sem juros, máx 12x, parcela mínima R$ 59.
  ⚠️ Juros estão 0/0 — 11x e 12x saem sem juros até alguém definir a taxa. Tema calcula parcelas com o mínimo de R$ 59.
- **Custo dos 7 PETG não informado** (campo vazio no Bling). PETG: Bling/vínculo 204,90; Shopify 189,90 com riscado 204,90
  (editado no painel por Gabriel) — "Sincronizar preços" no Bling volta a loja para 204,90.
- **Novas coleções:** impressoras-3d, filamentos-3d, filamentos-pla, filamentos-petg, filamentos-de-natal, cameras-videoconferencia.
  Publicação via REST `published: true` (o app não tem `write_publications`).
- **Tema:** megamenu abre painel pelo destino do link (antes pela posição); painel de Ofertas com selo do maior desconto real;
  card/PDP mostram só o que o checkout cobra (metafield `dropchina.pix_price` ignorado); descrição rica `<div class="dc-rich">`
  em `dc-pdp-story.liquid` (imagens compartilhadas em `assets/dc-fil-*`, via `src="dc-asset:"`).
- **Vínculo multiloja:** criado por API nasce com `preco 0` se não mandar o preço; PUT em `/produtos/lojas/{id}` dá 404 —
  corrigir = apagar e recriar (`criar-vinculos-shopify.ts` agora manda o preço).
- Pesquisa de preço vs concorrência (119 produtos): `catalogo/precos-concorrencia/resultado-2026-09-29.csv` — 41 mais caros.
- Pendente: banner de Natal (briefing `marketing/briefing-banner-natal-filamentos.md`, Vitória); certificado A1 vencia 29/09.

---

## O que trava dinheiro, em ordem

1. **Conversão zero sem diagnóstico** — 230 sessões, 0 pedidos, nenhuma ferramenta para saber onde
   vaza. Suspeitos: 29% da vitrine aparece apagada (card de esgotado a 42% de opacidade), nenhum
   produto tem avaliação, frete alto em item pesado
2. **Gateway nunca testado com cartão real** — o teste de 04/ago validou Shopify→Bling, não a Pagar.me
3. **43 produtos do Bling sem vínculo** com a loja — nunca foram exportados, não existem na vitrine
4. **Fundação de marca iniciada em 23/08** — contas próprias no ar, ver
   `docs/handoff-2026-08-23.md`. Sobraram 3 bloqueios de terceiros: recurso do Facebook,
   dono da ficha do Google Meu Negócio, e validação do Reclame Aqui pela contabilidade
5. **43 produtos fora do sitemap** — 76 no sitemap contra 119 na loja. Fora do sitemap, o Google
   não indexa. Achado em 23/08, não investigado

---

## Filas por dono

### Gabriel
- [ ] **Google Meu Negócio** — maior "uau" por esforço, grátis, não depende de logo
- [ ] **Logo + aplicar no site** (header, favicon, cores)
- [ ] **Clarity** (10 min, começa a gravar sessão desde já) · depois GA4 e Search Console — os
      campos **já existem no tema**, é só colar o ID
- [ ] Agendar o **cron** dos 2 scripts de sync
- [x] ~~Transferência de **store owner**~~ ✅ **feito 23/08** — owner agora é
      `contato@dropchinaoficial.com.br`. Gabriel acessa como colaborador `4YU MKT`
- [ ] **Conferir cobrança e plano** após a transferência — o novo dono herda a fatura em aberto
- [ ] Decidir 2 preços divergentes: `ISD Full` (Bling 389 / loja 350) e `tn660 DropChina` (100 / 99)
- [ ] Suavizar o card de esgotado — 34 produtos, 29% da vitrine
- [ ] 5 produtos sem imagem de capa: `A1 mini` (ATIVO, R$ 5.999), `Impressora Vinik`, `Sata 240GB`, `Sata 480GB`, `ISD-SIGNAGE-55`
- [ ] Abrir a caixa `contato@` procurando cobrança do `cloudclu` (ver seção de infraestrutura)

### Augusto
- [ ] Clicar **"Sincronizar preços do sistema na loja virtual"** toda vez que mexer em preço — não sobe sozinho
- [ ] **Exportar os 43 produtos sem vínculo** ("Exportar produtos multiloja")
- [ ] Fotografar o **código de barras** das caixas em estoque — destrava os 53 GTIN faltantes
- [ ] Confirmar com a contadora os 2 NCM corrigidos por conta própria (figurinhas e kit de cozinha)
- [ ] Desinstalar os 2 apps do Mercado Pago

### Decisões pendentes
- **B2C × PME** — o público declarado inclui PMEs, e toner é recompra, não impulso. Muda se o
  esforço vai para Instagram ou para Google/WhatsApp. Ver `marketing/plano-fundacao-marca.md`
- **Ficha falsa no Google** — denunciar a `DropChina` de Guabirotuba/Curitiba, que é terceiro se
  passando pela empresa. Ver `docs/handoff-2026-08-23.md`
- **Marca DropChina em massa** nos toners/papel — o Augusto pediu. Tensão: marca própria em item de
  terceiro é motivo de denúncia no ML
- **Provedor de e-mail** para sair do revendedor

---

## Onde está cada coisa

| Assunto | Documento |
|---|---|
| **Este resumo** | `STATUS.md` (aqui) |
| Último dia de trabalho detalhado | `docs/handoff-2026-08-23.md` — contas de marca e medição |
| Dia anterior | `docs/handoff-2026-08-03.md` |
| Dia em que o pagamento entrou no ar | `docs/handoff-2026-07-30.md` |
| **O que sobe do Bling e o que é botão** | `docs/handoff-2026-08-03.md` §2 |
| **Fundação de marca** (escopo contratado) | `marketing/plano-fundacao-marca.md` |
| Frente de crescimento / tráfego | `social/STATUS.md` |
| Execução técnica da medição | `marketing/setup-tagueamento.md` |
| **Dependência do revendedor de hospedagem** | `docs/migracao-dns-email.md` |
| Fiscal / NF-e | `docs/fiscal-nfe-auditoria-2026-07-30.md` |
| Frete | memória `dropchina-frete-shopify` |
| ⚠️ Desatualizado, não usar | `docs/STATUS.md` (17/jun) |

---

## Armadilhas — não "consertar" achando que é bug

- **Juros 0/0 na Pagar.me é intencional.** O Augusto fechou a taxa e banca as 10x sem juros
- **"Lançar estoque" e "lançar contas" desligados na NF-e é intencional** — evita baixa dupla
- **Idioma padrão pt-PT não tem conserto** — a Shopify não deixa trocar; pt-BR entrou como secundário
- **SKU com espaço** (`1105 EVOLUT`, `tn660 DropChina`) é a convenção histórica, não corrupção
- **Imagens do Bling em modo URL externa é decisão**, não bug — o pipeline escreve `imagensURL`
- **Os 3 preços da faixa de frete >30kg** (215/360/560) foram estimados, não são custo real

### Armadilhas da API v3 do Bling
- `produtos.get` **esconde excluídos** — padrão devolve 154, `criterio: 5` devolve 164, excluídos só com `criterio: 4`
- Filtros de data **só funcionam com o par** inicial+final. Só o inicial devolve o catálogo inteiro **sem avisar**
- A **listagem não traz `tributacao`** — NCM aparece vazio. Só `produtos.find` traz
- O **vínculo multiloja tem preço próprio** (snapshot do último sync). A Shopify lê esse, não o preço do produto

### Acesso à hospedagem
- **2083** = cPanel · **2096** = webmail · **2087** = WHM do revendedor (nunca funciona para nós)

---

## Números de referência

| O quê | Valor |
|---|---|
| Loja | `dropchinaoficial.com.br` · `akfd19-1c.myshopify.com` · plano Basic, BRL |
| Tema publicado | DropChina `#161970290907` |
| Canal Shopify no Bling | `Dropchina oficial`, id `206107628` |
| Depósito Bling | Geral, id `14888019804` |
| Location Shopify | `gid://shopify/Location/91848278235` |
| CNPJ | DROPCHINA LTDA · 57.306.430/0001-53 |
| Endereço (Receita) | Rua Mandirituba, 216, Fundos — Afonso Pena, São José dos Pinhais/PR, 83045-030 |
| Contas de marca | GA4 `G-KZ4CGVHY7X` · Google Tag `GT-KDQF3CD7` · Clarity `y70lfm3dio` · Merchant Center `5843491607` · IG/FB/YT `@dropchinaoficial` |
| WhatsApp oficial | 41 99534-2751 |
| Sessões / pedidos | ~230 por 30 dias · **0 pedidos** |

---

## Scripts úteis (`mcp-bling/`)

```bash
npx tsx src/scripts/compare-bling-shopify.ts     # diff completo Bling × Shopify
npx tsx src/scripts/sync-estoque-shopify.ts      # ponte de estoque
npx tsx src/scripts/sync-exclusoes-shopify.ts    # arquiva na loja o que foi excluído no Bling
npx tsx src/scripts/check-pedidos.ts             # últimos pedidos no Bling, com CPF
npx tsx src/scripts/audit-alteracoes.ts A B      # o que mudou no Bling entre duas datas
python3 ../scripts/cpanel-audit.py               # zona DNS, caixas de e-mail, quota
```

⚠️ Rodar o cron **em uma máquina só** — o refresh token do Bling rotaciona e duas máquinas se
invalidam mutuamente.
