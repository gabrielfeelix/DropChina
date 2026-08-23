# STATUS — Frente CRESCIMENTO (tráfego + redes + growth)

> **Dono desta pasta:** chat CRESCIMENTO. Escopo: `marketing/` `social/` `brand/`.
> **Não toca:** `theme/` (chat Shopify), `mcp-bling/` `mcp-meli/` `catalogo/` (chat Bling).
> **Este arquivo é o comando central.** Abastecer sempre que houver atualização (log no fim).
> 📗 **Começa aqui pra entender o todo:** [`PLAYBOOK-ORGANICO.md`](PLAYBOOK-ORGANICO.md) — o mapa completo do orgânico em linguagem simples.
> Última atualização: **2026-08-04**

---

## 🚦 Estado em uma linha
A loja **vende** — pagamento no ar, estoque sincronizado, fiscal completo. O gargalo virou de lado:
**230 sessões em 30 dias e 0 pedidos.** Já chega gente e ela vai embora. Antes de atrair mais
tráfego, descobrir por que esse tráfego não converte — e ligar a medição, que segue **em zero**.

## 🧭 Regra de ouro do timing (revisada 04/ago)
| Situação | O que fazer |
|---|---|
| **Sem medição (hoje)** | Instalar Clarity → GA4 → Pixel. Tapar os vazamentos de conversão. **Ainda zero mídia paga** — mas agora por falta de medição, não de estoque. |
| **Medindo + conversão > 0** | Aquecer público → remarketing → prospecção. |

---

## ⚠️ Correções de 04/ago — o que este arquivo dizia de errado
A versão de 06/jul governava a frente com premissas que caíram. Registrado pra ninguém repetir:

| Dizia | Realidade verificada em 04/ago |
|---|---|
| "Loja 100% esgotada" | Estoque sincronizado, 0 divergências Bling↔Shopify. **34 de 119** produtos esgotados (29%) |
| "Mídia paga bloqueada por estoque" | Pagamento (Pagar.me) no ar desde 30/jul, checkout funciona ponta a ponta |
| "Cupom BEMVINDO10 pendente de criação" | **Existe e está ATIVO.** Há também um `DROP10` |
| "Blog = Fase 2, depois" | **10+ artigos publicados desde 07/jul** |
| "71 produtos sem GTIN" (`marketing/README.md`) | **53 sem GTIN**, 101 de 154 já têm |

## ✅ Feito
- Auditoria externa do site consumida (`analise dropchina.txt`, score 51/100) → virou backlog priorizado.
- Blog no ar: 10+ artigos educativos publicados (07/jul).
- Cupons `BEMVINDO10` e `DROP10` ativos no Shopify.
- Campos de **GA4** e **Search Console** já existem no tema (Personalizar → Medição e verificação) — falta só colar os IDs.
- Catálogo 100% com NCM (04/ago) — nada trava emissão de NF-e.

## ❌ Não feito (o buraco real)
- **Medição: zero.** Sem GA4, sem GTM, sem Meta Pixel, sem Clarity, sem banner LGPD.
  Cada dia sem Pixel é público que não acumula — quando ligar ads, começa do zero e caro.
- **Contas sociais: zero.** Nenhum perfil existe (ver `contas-e-acessos.md`, tudo ⬜).
- **Google Meu Negócio:** não criado (endereço de São José dos Pinhais já existe, é só reivindicar).
- **Prova social:** nenhum produto tem avaliação. Judge.me nunca instalado.

## 🎯 Próximas ações (ordem revisada 04/ago)
1. **Microsoft Clarity** — script no head, grátis. É o único que responde *por que* as 230 sessões
   não compraram. GA4 diz quantos; Clarity mostra a sessão gravada. Com esse volume dá pra
   assistir numa tarde e aprender mais que um mês de relatório.
2. **GA4 + Search Console** — o campo já está no tema, é colar o ID. ~10 min.
3. **Meta Pixel** — mesmo sem verba. Audiência acumulando de graça.
4. **Tapar vazamentos de conversão** (não é marketing, mas é o que segura a venda):
   - 29% da vitrine aparece apagada — card de esgotado a 42% de opacidade, forte demais
   - zero avaliação em qualquer produto (Judge.me)
   - frete que em item pesado chegava a 100% do valor da venda
5. **Google Meu Negócio** + **Search Console** — busca local de alta intenção, grátis.
6. **Contas sociais** (IG Business + Página FB + WhatsApp Business nº 41 99534-2751).
7. **Conteúdo** — 7 posts prontos na fila (`conteudo/posts-prontos.md`).

## 🔄 Inversão a discutir com o Gabriel
O playbook está desenhado pra B2C de Instagram, mas o público declarado em
`plano-crescimento.md` inclui **PMEs** — escritório, papelaria, lan house, contador. Toner é
**recompra previsível**, não compra por impulso. Pra esse público, Instagram é o canal mais fraco:
**Google Meu Negócio, Search Console e WhatsApp** valem mais e são justamente os que estão parados
enquanto o plano prioriza conteúdo de Insta. Decidir antes de investir esforço em produção de post.

## ⛔ Bloqueado (dependências reais que sobraram)
- **Merchant Center / Google Shopping** ← 53 produtos sem GTIN (chat Bling).
- **Catálogo nas redes** ← domínio verificado no Meta (passo 4 do runbook de tagueamento).
- **Ligar Clarity/Pixel no tema** ← chat Shopify insere no `theme/`. GA4 e GSC já têm campo pronto.

## ❓ Preciso do Gabriel agora
- **Criar as contas e me devolver os IDs** (login humano, não automatizo): Clarity, GA4, GTM,
  Meta Pixel + domínio verificado, Search Console. Runbook: `../marketing/setup-tagueamento.md`.
- **Decidir a inversão B2C × PME** acima — muda a ordem do que produzo.

---

## 📓 Log de atualizações
- **2026-08-04** — Revisão contra a realidade. Três bloqueios de 06/jul já tinham caído sem
  ninguém atualizar o doc (estoque, cupom, blog). Gargalo redefinido: não é falta de tráfego, é
  conversão zero com medição zero. Ordem reordenada com Clarity em 1º. GTIN recontado: 53 sem.
  Levantada a inversão B2C × PME.
- **2026-07-06** — Frente iniciada. Mapeado estado, confirmado bloqueio de estoque e ausência de
  conta DropChina no Meta. Criada estrutura operacional da pasta. Decisões do Gabriel travadas
  (contas do zero, WhatsApp 2751, tagueamento 1º, budget grátis). Runbook de tagueamento criado.
