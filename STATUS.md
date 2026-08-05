# STATUS ATUAL — DropChina

> **Este é o documento de entrada. Se a pergunta é "qual o status atual?", a resposta está aqui.**
> Última atualização: **04/ago/2026** · Branch: `feat/shopify-ui-institucional`
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
| **Medição** | ❌ **Nada.** Sem GA4, GTM, Pixel, Clarity ou banner LGPD |
| **Marca** | ❌ Sem logo, sem perfil social, sem Google Meu Negócio |

---

## O que trava dinheiro, em ordem

1. **Conversão zero sem diagnóstico** — 230 sessões, 0 pedidos, nenhuma ferramenta para saber onde
   vaza. Suspeitos: 29% da vitrine aparece apagada (card de esgotado a 42% de opacidade), nenhum
   produto tem avaliação, frete alto em item pesado
2. **Gateway nunca testado com cartão real** — o teste de 04/ago validou Shopify→Bling, não a Pagar.me
3. **43 produtos do Bling sem vínculo** com a loja — nunca foram exportados, não existem na vitrine
4. **Fundação de marca não iniciada** — escopo contratado, ver `marketing/plano-fundacao-marca.md`

---

## Filas por dono

### Gabriel
- [ ] **Google Meu Negócio** — maior "uau" por esforço, grátis, não depende de logo
- [ ] **Logo + aplicar no site** (header, favicon, cores)
- [ ] **Clarity** (10 min, começa a gravar sessão desde já) · depois GA4 e Search Console — os
      campos **já existem no tema**, é só colar o ID
- [ ] Agendar o **cron** dos 2 scripts de sync
- [ ] Adicionar a DropChina como **empresa cliente no Partner** (org `4YU MKT` já criada) e
      encaminhar a transferência de **store owner** para o Augusto
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
- **Marca DropChina em massa** nos toners/papel — o Augusto pediu. Tensão: marca própria em item de
  terceiro é motivo de denúncia no ML
- **Provedor de e-mail** para sair do revendedor

---

## Onde está cada coisa

| Assunto | Documento |
|---|---|
| **Este resumo** | `STATUS.md` (aqui) |
| Último dia de trabalho detalhado | `docs/handoff-2026-08-03.md` |
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
