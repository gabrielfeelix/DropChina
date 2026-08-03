# Plano de Crescimento — DropChina

> Roadmap de aquisição/tráfego faseado contra o bloqueador de estoque.
> Nicho: suprimentos de impressão + informática (cartuchos, toners, impressoras, periféricos).
> Público: B2C recompra + **PMEs** (escritórios, papelarias, lan houses, gráficas pequenas, contadores).
> Criado 2026-07-06.

---

## Por que este plano existe
A auditoria deu 51/100, mas o teto real é o **bloqueador operacional: tudo "Esgotado"**. Investir em mídia com a loja esgotada = pagar pra levar gente a uma página que não vende. Então o plano separa o que fazer **antes** e **depois** do estoque virar.

---

## Fase 0 — Fundação (AGORA, loja esgotada) · grátis
Objetivo: quando o estoque virar, não perder 1 dia montando encanamento. Tudo aqui é pré-requisito e não depende de estoque.

- [ ] **Contas sociais** ativas: Instagram Business + Página Facebook vinculada + WhatsApp Business.
- [ ] **Meta Business Manager** criado + **domínio verificado** (`dropchinaoficial.com.br`).
- [ ] **Tagueamento** instalado e testado: GA4 + GTM + Meta Pixel + banner LGPD (Consent Mode v2).
- [ ] **Microsoft Clarity** (grátis) rodando — heatmap desde já.
- [ ] **Google Search Console** verificado + sitemap enviado.
- [ ] **Brand mínimo**: avatar, capas, paleta, 3 templates de post.
- [ ] **Google Meu Negócio** criado (endereço Maringá-PR já existe no schema).
- [ ] **Conteúdo estocado**: 7-10 posts prontos na fila.

**Métrica da fase:** encanamento 100% testado com 1 evento de teste chegando em GA4 + Meta. Nada de vendas ainda — é fundação.

## Fase 1 — Orgânico + aquecimento (loja esgotada OU recém-live) · grátis
Objetivo: construir audiência e pixel aquecido de graça, pra mídia paga já começar barata.

- [ ] Publicar 3-5×/semana (carrossel educativo + reel de alcance). Ver `conteudo/`.
- [ ] WhatsApp Business com catálogo dos top SKUs + mensagem de saudação + link na bio.
- [ ] Responder/DM ativo — cada seguidor vira contato.
- [ ] Coletar e-mails via newsletter (cupom BEMVINDO10 quando criado).
- [ ] Pixel acumulando visitantes → base para Públicos Semelhantes (Lookalike) depois.

**Métrica da fase:** primeiros 100-300 seguidores reais, pixel com evento de PageView/ViewContent volumando, lista de e-mail começando.

## Fase 2 — Mídia paga (SÓ com estoque LIVE) · orçamento à parte
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
estoque LIVE ─────► mídia paga faz sentido
GTIN nos produtos ► Merchant Center ─► Google Shopping / free listings
brand pronto ─────► templates de post ─► conteúdo com cara de marca
Pixel/GA4 (IDs) ──► chat Shopify liga no tema ─► medição ─► otimização de ads
```

## O que fica com cada chat (fronteira)
- **Eu (Crescimento):** conteúdo, contas sociais, brand, definir tagueamento, gerar IDs, planejar/rodar campanhas, relatórios.
- **Chat Shopify:** inserir Pixel/GA4/Clarity no `theme/`, banner LGPD no tema, cupom, SEO on-page.
- **Chat Bling:** estoque, GTIN, export catálogo Shopify, NF-e.
