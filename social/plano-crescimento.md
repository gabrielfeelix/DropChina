# Plano de Crescimento — DropChina

> Roadmap de aquisição/tráfego faseado.
> Nicho: suprimentos de impressão + informática (cartuchos, toners, impressoras, periféricos).
> Público: B2C recompra + **PMEs** (escritórios, papelarias, lan houses, gráficas pequenas, contadores).
> Criado 2026-07-06 · **revisado 2026-08-04**.

---

## Por que este plano existe

**Versão original (06/jul):** o teto era o bloqueador operacional — tudo "Esgotado". Investir em
mídia com a loja esgotada seria pagar pra levar gente a uma página que não vende.

**Revisão (04/ago): esse bloqueador caiu.** Estoque sincronizado, pagamento no ar, fiscal completo.
O teto virou outro e é pior: **230 sessões em 30 dias, 0 pedidos.** O tráfego já existe e não
converte — e não há **nenhuma medição instalada** pra saber onde ele morre.

Consequência prática: a Fase 0 continua sendo a fase certa, mas **por outro motivo**. Não é mais
"esperar o estoque"; é "instalar medição e tapar vazamento antes de comprar tráfego".

> ⚠️ A ordem interna da Fase 0 mudou: **Clarity vem primeiro**, antes de GA4. GA4 conta quantos;
> Clarity grava a sessão e mostra o porquê. Com 230 sessões, assistir gravação ensina mais rápido
> que qualquer relatório.

---

## Fase 0 — Fundação (AGORA) · grátis
Objetivo: **entender e destravar a conversão** antes de comprar tráfego. Nada aqui custa dinheiro.

- [ ] **Microsoft Clarity** rodando — 1º de tudo. Gravação de sessão + heatmap responde por que as 230 sessões não compraram.
- [ ] **GA4** — o campo já existe no tema (Personalizar → Medição e verificação), só colar o `G-`.
- [ ] **Google Search Console** verificado + sitemap enviado — campo de verificação também já está no tema.
- [ ] **Meta Pixel** + banner LGPD (Consent Mode v2).
- [ ] **Meta Business Manager** criado + **domínio verificado** (`dropchinaoficial.com.br`).
- [ ] **Tapar vazamentos de conversão** — card de esgotado apagado demais (29% da vitrine), zero avaliação em produto (Judge.me), frete desproporcional em item pesado.
- [ ] **Google Meu Negócio** criado (endereço Maringá-PR já existe no schema).
- [ ] **Contas sociais** ativas: Instagram Business + Página Facebook vinculada + WhatsApp Business.
- [ ] **Brand mínimo**: avatar, capas, paleta, 3 templates de post.
- [x] ~~**Conteúdo estocado**~~ — 7 posts prontos na fila + 10 artigos de blog **já publicados** (07/jul).

**Métrica da fase:** medição testada com evento chegando em GA4 + Meta, **e a primeira venda
orgânica acontecendo**. Enquanto a conversão for 0%, não se abre verba de mídia.

## Fase 1 — Orgânico + aquecimento · grátis
Objetivo: construir audiência e pixel aquecido de graça, pra mídia paga já começar barata.

- [ ] Publicar 3-5×/semana (carrossel educativo + reel de alcance). Ver `conteudo/`.
- [ ] WhatsApp Business com catálogo dos top SKUs + mensagem de saudação + link na bio.
- [ ] Responder/DM ativo — cada seguidor vira contato.
- [ ] Coletar e-mails via newsletter — cupom **BEMVINDO10 já existe e está ativo** (e há um `DROP10` também).
- [ ] Pixel acumulando visitantes → base para Públicos Semelhantes (Lookalike) depois.

**Métrica da fase:** primeiros 100-300 seguidores reais, pixel com evento de PageView/ViewContent volumando, lista de e-mail começando.

## Fase 2 — Mídia paga (SÓ com medição rodando E conversão > 0) · orçamento à parte
Objetivo: escalar com retorno mensurável. Ordem importa — do público mais quente pro mais frio.

1. **Remarketing** (mais barato, converte mais): quem visitou/adicionou ao carrinho e não comprou.
2. **Catálogo dinâmico** (DPA): anúncio automático do produto que a pessoa viu. Exige catálogo Meta sincronizado da Shopify.
3. **Prospecção**: Advantage+ Shopping / Performance Max com Lookalike da base aquecida.
4. **Google**: Performance Max + free listings do Merchant Center (exige GTIN — gargalo no chat Bling).

**Regra de gasto:** começar pequeno (teste), só escalar verba no que der ROAS positivo. Nunca abrir prospecção fria antes de remarketing rodar.

**Métrica da fase:** ROAS ≥ break-even, CPA abaixo da margem, taxa de conversão rumo a 1% (baseline do setor 1-2,5%).

---

## Sequência de dependências (o que destrava o quê)
```
domínio apontado ─► verificação Meta ─► catálogo nas redes ─► DPA/remarketing
Clarity ──────────► entender por que não converte ─► tapar vazamento ─► conversão > 0
conversão > 0 ────► mídia paga faz sentido      (antes disso, é comprar visita que vaza)
GTIN nos produtos ► Merchant Center ─► Google Shopping / free listings   (53 ainda sem)
brand pronto ─────► templates de post ─► conteúdo com cara de marca
Pixel/GA4 (IDs) ──► chat Shopify liga no tema ─► medição ─► otimização de ads
```

> Atualizado em 04/ago: "estoque LIVE" saiu da cadeia — deixou de ser bloqueador. Entrou
> "conversão > 0", que é o gargalo real hoje.

## O que fica com cada chat (fronteira)
- **Eu (Crescimento):** conteúdo, contas sociais, brand, definir tagueamento, gerar IDs, planejar/rodar campanhas, relatórios.
- **Chat Shopify:** inserir Pixel/GA4/Clarity no `theme/`, banner LGPD no tema, cupom, SEO on-page.
- **Chat Bling:** estoque, GTIN, export catálogo Shopify, NF-e.
