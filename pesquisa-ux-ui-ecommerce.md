# Pesquisa Profunda: UX & UI para E-commerce
### Boas práticas, padrões de layout e princípios de conversão para websites
*Compilado em maio/2026 — fontes: Baymard Institute, NN/g, Shopify, benchmarks 2026*

---

## Sumário executivo (TL;DR)

Antes de você mergulhar nas 60 páginas mentais que vêm a seguir, os pontos não-negociáveis:

1. **UX em e-commerce é resolver fricção, não decorar.** Um site bonito que confunde converte menos que um site simples que guia. Toda decisão de design responde a uma pergunta: *isso reduz hesitação ou aumenta?*
2. **Mobile-first é literal.** Mais de 60% das vendas de e-commerce em 2026 vêm de mobile, e a taxa de conversão mobile costuma ser mais baixa que desktop — então é onde mais se ganha otimizando.
3. **As 5 telas que fazem o trabalho pesado:** Home, PLP (listagem de produtos), PDP (página de produto), Carrinho e Checkout. Acertar essas cinco resolve ~90% do potencial de conversão de uma loja.
4. **Confiança > criatividade.** Selos, reviews, política clara, fotos boas, preço transparente. Sem isso, nenhum design "premium" salva.
5. **62% dos top sites do mundo têm PDP "medíocre" ou pior** segundo a Baymard. A barra está mais baixa do que parece — fazer o básico bem feito já te coloca acima da média.

---

## Parte 1 — Fundamentos: princípios que orientam tudo

### 1.1 A "Lei de Jakob"
Como Jakob Nielsen resume: *"Usuários passam a maior parte do tempo em outros sites. Isso significa que eles esperam que o seu site funcione igual a todos os outros que eles já conhecem."*

Tradução prática: **carrinho fica no canto superior direito. Logo no topo à esquerda. Busca no topo. Filtros na lateral esquerda em desktop. Preço perto do botão "comprar".** Inovar nesses padrões custa conversão. Inove em conteúdo, voz da marca, fotografia, micro-interações — não na arquitetura básica.

### 1.2 Carga cognitiva: menos decisão = mais conversão
Cada decisão que o usuário precisa tomar é fricção. Princípios:
- **Hick's Law**: mais opções visíveis ao mesmo tempo aumentam o tempo de decisão exponencialmente.
- **Lei de Fitts**: alvos maiores e mais próximos são mais fáceis de clicar (= botões de ação principais grandes e bem posicionados).
- **Lei de Miller**: memória de curto prazo guarda 5–9 itens. Por isso menus com submenus categorizados funcionam melhor que listas longas.

### 1.3 Os 5 pilares de uma boa UX de e-commerce
Toda decisão de design pode ser auditada contra esses 5 critérios:

| Pilar | Pergunta que ele responde |
|---|---|
| **Clareza** | O usuário entende o que vendo, sem esforço? |
| **Confiança** | Ele acredita que vai receber o produto, no prazo, como descrito? |
| **Velocidade** | A página responde em até 2,5s? Cliques têm retorno visual imediato? |
| **Consistência** | Botões, navegação, padrões repetem em todo o site? |
| **Foco** | Cada tela tem uma ação primária óbvia? |

### 1.4 O custo da fricção (números pra usar em apresentação)
- Cada 1 segundo a mais de carregamento reduz conversão de forma mensurável.
- 19% dos usuários abandonam compra por serem forçados a criar conta (Baymard).
- Taxa média global de abandono de carrinho: 69–70%.
- A média de campos em checkouts é 11,3 — e 22% dos usuários já abandonaram por checkout complicado.

---

## Parte 2 — Arquitetura de informação e navegação

### 2.1 Header (cabeçalho fixo)
O header é o "cockpit" da loja. Em 2026 quase 100% dos top e-commerces usam **header sticky** (fica fixo ao rolar). Composição padrão:

```
[Logo] ────── [Menu de categorias] ────── [Busca] ─── [Conta] [Favoritos] [Carrinho]
```

**Boas práticas:**
- Logo sempre clicável e leva à home.
- Busca **sempre visível** (não esconder atrás de ícone em desktop). Mobile pode usar ícone se o espaço apertar.
- Ícone do carrinho com **badge numérico** mostrando quantidade.
- "Faixa de anúncio" no topo (free shipping, frete grátis acima de X, etc.) — funciona bem, mas precisa ter botão de fechar.

### 2.2 Menu de categorias
Para catálogos com mais de ~20 produtos, **mega menu** é o padrão. Vantagens:
- Mostra toda a hierarquia de uma vez (reduz cliques).
- Permite categorização visual (com imagens, ícones, destaques).
- Funciona como mini-landing por categoria.

**Regras práticas:**
- Máximo 5–7 categorias-pai no menu principal.
- Categorias em **bold** para hierarquia visual clara.
- "What's New" e "Promoções" geralmente em destaque (cor diferente).
- Mobile: usar **menu hamburger com acordeão**, nunca tentar replicar o mega menu desktop.

### 2.3 Busca interna
Subestimada e crítica. Quem usa busca tem **2–3x mais probabilidade de converter** que quem só navega.

Itens obrigatórios em 2026:
- **Autocomplete** (sugestões enquanto digita).
- **Correção de erro de digitação** ("você quis dizer...").
- **Sugestão visual** (mostrar 3–5 produtos em miniatura nos resultados de autocomplete).
- **Buscas populares** quando o campo está vazio.
- Resultados com filtros aplicáveis (mesma estrutura da PLP).

### 2.4 Breadcrumbs
Categoria > Subcategoria > Produto. Parece pequeno, mas resolve 2 problemas: orientação espacial e SEO. Coloque sempre acima do título da página.

---

## Parte 3 — Homepage

### 3.1 Função real da home
A home **não vende**. Ela **orienta** e estabelece confiança. O objetivo dela é fazer o usuário entender em 3 segundos:
1. O que vocês vendem
2. Pra quem
3. Por que confiar (preço/qualidade/diferencial)

E levar ele rapidamente para uma PLP ou PDP, onde a venda acontece de verdade.

### 3.2 Estrutura padrão de homepage que converte (2026)

```
┌─────────────────────────────────────────────┐
│ Faixa promo (opcional, ex: "Frete grátis")  │
├─────────────────────────────────────────────┤
│ HEADER (logo, menu, busca, carrinho)        │
├─────────────────────────────────────────────┤
│                                             │
│   HERO                                      │
│   • Headline curto (5-10 palavras)          │
│   • Sub-headline com proposta de valor      │
│   • CTA primário (1 botão de destaque)      │
│   • Imagem/video lifestyle do produto       │
│                                             │
├─────────────────────────────────────────────┤
│  CATEGORIAS EM DESTAQUE (3-6 blocos)        │
│  [Card] [Card] [Card]                       │
├─────────────────────────────────────────────┤
│  MAIS VENDIDOS / NOVIDADES                  │
│  Carrossel ou grid de 4-8 produtos          │
├─────────────────────────────────────────────┤
│  PROVA SOCIAL                               │
│  Reviews, selos, logos de imprensa          │
├─────────────────────────────────────────────┤
│  STORYTELLING / DIFERENCIAL                 │
│  "Por que comprar com a gente"              │
├─────────────────────────────────────────────┤
│  GARANTIAS                                  │
│  Frete, devolução, pagamento, suporte       │
├─────────────────────────────────────────────┤
│  FOOTER (links, redes, newsletter)          │
└─────────────────────────────────────────────┘
```

### 3.3 Hero section: regras
- **1 CTA primário.** Múltiplos CTAs concorrentes podem reduzir conversão em até 266% (estudo citado pela Arfadia/HubSpot).
- **Headline orientado a benefício**, não feature. Não escreva "Cartuchos de impressora", escreva "Imprima 3x mais barato, sem perder qualidade".
- Use **imagem ou vídeo do produto em uso** (lifestyle) — supera fotos em fundo branco para a maioria dos segmentos.
- Hero ocupa 60–100% da viewport em desktop, 50–70% em mobile (deixe espaço para "anteceder" o conteúdo abaixo).
- Headline + sub + CTA todos acima da dobra. Sem exceção.

### 3.4 Cards de categoria
Não use só nome de categoria. Use **imagem + nome + (opcional) CTA "ver tudo"**. Imagem comunica em milissegundos o que texto leva segundos.

### 3.5 Prova social
Onde colocar:
- Logos de imprensa/marcas que vendem (logo após hero).
- Reviews em destaque (com foto do cliente quando possível).
- Contadores ("+50.000 clientes atendidos", "4.9★ no Mercado Livre").
- Reviews em forma de carrossel ou grid.

Para a DropChina especificamente, **mostrar o histórico no Mercado Livre (Platinum)** é um trunfo enorme de confiança.

---

## Parte 4 — Página de listagem de produtos (PLP)

### 4.1 Estrutura padrão

```
┌────────────────────────────────────────────────┐
│ Breadcrumb: Home > Cartuchos > HP             │
│                                                │
│ H1: Cartuchos HP (45 produtos)                 │
├──────────┬─────────────────────────────────────┤
│          │  Ordenar por: [Relevância ▼]        │
│ FILTROS  │  Visualização: [▦] [▤]              │
│          │                                     │
│ Preço    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ Marca    │  │ IMG │ │ IMG │ │ IMG │ │ IMG │   │
│ Modelo   │  │     │ │     │ │     │ │     │   │
│ Cor      │  └─────┘ └─────┘ └─────┘ └─────┘   │
│ Avaliação│   Nome    Nome    Nome    Nome      │
│          │   R$ 99   R$ 89   R$ 120  R$ 150   │
│          │   ★4.8    ★4.6    ★4.9    ★4.5     │
│          │                                     │
│          │   [+ produtos]                      │
│          │                                     │
│          │   ← Paginação 1 2 3 →               │
└──────────┴─────────────────────────────────────┘
```

### 4.2 Filtros: o coração da PLP
- **Filtros à esquerda em desktop, modal em mobile.**
- Sempre mostrar **número de produtos** por filtro: "HP (12)".
- Filtros **aplicados aparecem como tags removíveis** no topo dos resultados.
- Filtros mais usados primeiro (Preço, Marca quase sempre).
- Filtros sticky (acompanham o scroll) em catálogos grandes.

### 4.3 Cards de produto: o que mostrar
Hierarquia visual no card:
1. **Imagem (60% do card)** — fundo neutro, produto centralizado.
2. **Nome curto** — 2 linhas máximo.
3. **Preço** — destacado, com preço antigo riscado se houver desconto.
4. **Avaliação** — estrelas + número de reviews.
5. **(Opcional)** Tag de "Mais vendido", "Frete grátis", "Novo".
6. **Hover/tap**: trocar para 2ª imagem ou mostrar botão "comprar rápido".

**Não confunda o card.** Não coloque botão "comprar" + "favoritar" + "comparar" + "ver mais" juntos. Card simples converte mais.

### 4.4 Ordenação
Opções padrão:
- Relevância (default)
- Mais vendidos
- Menor preço
- Maior preço
- Lançamentos
- Avaliação

---

## Parte 5 — Página de produto (PDP) — onde a compra acontece

> **Dado-bomba da Baymard:** apenas 48% dos sites top do mundo têm PDP "decente" ou "boa". 52% são medíocres ou piores. **A barra é baixa — vale a pena investir aqui.**

### 5.1 Layout above-the-fold de PDP

```
┌──────────────────────────────────────────────────────┐
│ Breadcrumb                                            │
├──────────────────────────────────────┬────────────────┤
│                                      │ Nome do produto│
│                                      │ ★★★★★ (124)    │
│                                      │                │
│         GALERIA DE IMAGENS           │ R$ 299,00      │
│         (1 grande + thumbs)          │ ou 10x R$29,90 │
│                                      │                │
│                                      │ Cor: [●●●]     │
│                                      │ Tamanho: [P][M]│
│                                      │ Qtd: [ - 1 + ] │
│                                      │                │
│                                      │ [COMPRAR]      │
│                                      │ [+ ao carrinho]│
│                                      │                │
│                                      │ ✓ Frete grátis │
│                                      │ ✓ Em estoque   │
│                                      │ ✓ Devolução 30d│
└──────────────────────────────────────┴────────────────┘
```

### 5.2 As 10 boas práticas obrigatórias da Baymard (resumo do benchmark 2026)

1. **Use BOTÕES, não dropdowns, para seleção de variações** (tamanho, cor, modelo). 57% dos sites top erram nisso. Dropdown esconde opções; botão mostra disponibilidade imediatamente.
2. **Imagens "em escala"** — mostre o produto na mão de alguém, ao lado de objeto referência. 42% dos usuários tentam estimar tamanho pela imagem.
3. **Galeria com no mínimo 5 imagens** + zoom. Inclua: produto isolado, em uso, detalhes, embalagem, escala.
4. **Preço por unidade** quando vendido em múltiplos (R$ 0,21 por folha, etc.).
5. **Estimativa de frete já na PDP** (não esperar pro checkout). Surpresa de frete = abandono.
6. **Indicador de estoque honesto** ("Apenas 3 unidades restantes" só se for verdade — falso reduz confiança quando descoberto).
7. **Reviews com foto** dos clientes, ordenáveis por mais úteis/recentes.
8. **Política de devolução clara e visível**, perto do botão de comprar.
9. **Descrição estruturada com seções** (acordeões): Descrição, Especificações, Conteúdo da embalagem, FAQ.
10. **Cross-sell coerente** ("Frequentemente comprados juntos") no rodapé da página.

### 5.3 CTA principal: comprar vs. adicionar ao carrinho
- Em sites brasileiros, **"Comprar"** costuma converter melhor que "Adicionar ao carrinho" (sentido de imediatismo).
- O ideal é ter **dois botões**: "Comprar" (primário, leva direto pro checkout) e "Adicionar ao carrinho" (secundário, continua navegando).
- Botão primário grande, cor de destaque, alto contraste, **sticky no mobile** (acompanha o scroll).

### 5.4 Galeria de imagens
- Imagem principal grande (mínimo 600x600px renderizado).
- Thumbs abaixo (desktop) ou em carrossel swipeable (mobile).
- Zoom on hover (desktop), pinch-to-zoom (mobile).
- Indicador de quantas imagens existem.
- **Vídeo é diferencial enorme** — produtos com vídeo convertem significativamente mais.

### 5.5 Especificações
Use **tabela de especificações** estruturada, não parágrafo corrido. Compradores de produtos técnicos (que é o caso da DropChina) escaneiam, não leem.

---

## Parte 6 — Carrinho

### 6.1 Estrutura

```
┌─────────────────────────────────────────────────────┐
│ Meu carrinho (3 itens)                              │
├─────────────────────────────────────────┬───────────┤
│ ┌───┐                                   │  RESUMO   │
│ │IMG│ Cartucho HP 664 Preto             │           │
│ └───┘ R$ 89,90                          │ Subtotal  │
│       [- 1 +]              [Remover]    │ R$ 218,70 │
│                                         │           │
│ ┌───┐                                   │ Frete     │
│ │IMG│ Cartucho HP 664 Tricolor          │ R$ 15,00  │
│ └───┘ R$ 99,90                          │           │
│       [- 1 +]              [Remover]    │ Total     │
│                                         │ R$ 233,70 │
│ ── Cupom de desconto ──                 │           │
│ [______________] [Aplicar]              │ [FINALIZAR│
│                                         │  COMPRA]  │
└─────────────────────────────────────────┴───────────┘
```

### 6.2 Boas práticas de carrinho
- **Imagem do produto sempre visível** (memória curta — sem imagem o usuário esquece o que está comprando).
- **Botão "remover" claro**, mas não dominante.
- **Permitir mudar quantidade** com botões +/−.
- **Mostrar frete antes do checkout** (estimativa por CEP).
- **Calculadora de "falta X para frete grátis"** se a loja tiver essa política — converte muito (incentiva aumentar AOV).
- **Botão principal "Finalizar compra"** bem destacado.
- **Mini-carrinho lateral** (slide-out drawer) quando o usuário adiciona produto em qualquer página, sem forçar ele a sair do contexto.

---

## Parte 7 — Checkout — o ponto mais sensível

> Taxa média de abandono no checkout: **70%**. Cada campo a menos, cada segundo a menos = $$$.

### 7.1 As regras de ouro (Baymard)

1. **Guest checkout em primeiro lugar.** 19% dos usuários abandonam por serem forçados a criar conta. Ofereça "Continuar como visitante" como opção mais visível.
2. **"Design fechado"** — remova o menu principal do site durante o checkout. Deixe só o logo (que serve como "saída" segura). Menos distração = mais conclusão.
3. **Indicador de progresso** ("Endereço > Pagamento > Confirmação") — reduz ansiedade.
4. **Mínimo de campos.** O número médio é 11,3 — tente baixar pra 8.
5. **Auto-detect cidade/estado pelo CEP.** Brasil tem ViaCEP; é mandatório usar.
6. **Validação em tempo real** (não esperar submit pra mostrar erros).
7. **NUNCA limpe o formulário em erro.** Um dos piores erros de UX que existem.
8. **"Endereço de cobrança = endereço de entrega"** marcado por default.
9. **Mostre os selos de segurança** (SSL, bandeiras de cartão, PIX, Pagar.me, etc.) perto do botão de pagamento.
10. **Custo total transparente** — frete, impostos, descontos, tudo visível antes do botão "pagar".

### 7.2 One-page vs. multi-step
Debate antigo. Em 2026 a tendência é:
- **One-page** para checkouts simples (1–3 produtos, sem opções complexas).
- **Multi-step** para checkouts complexos (com agendamento, configuração, B2B).
- **Híbrido com acordeões** (one-page que mostra etapas) costuma ser o que melhor performa em e-commerce de produto físico.

### 7.3 Formas de pagamento Brasil 2026 (essencial)
- **PIX** (com QR code e cópia, geração automática) — virou padrão, muitos usuários só pagam assim.
- **Cartão de crédito** com parcelamento até 10x ou 12x.
- **Boleto** (em queda, mas ainda relevante).
- **Carteiras digitais** (Mercado Pago, PicPay, Apple/Google Pay).
- **"Compre agora, pague depois"** em alta (Pagaleve, Koin).

---

## Parte 8 — UI: o que faz um e-commerce parecer bonito e profissional

### 8.1 Sistema de cores
- **1 cor primária** (marca + CTAs principais).
- **1 cor secundária** (acentos, links, hover).
- **1 cor de ação/urgência** (geralmente vermelho, laranja ou amarelo — para promoções, alertas, "fim de estoque").
- **Neutros generosos** (branco, off-white, cinza claro, cinza escuro, preto).
- **Verde para sucesso, vermelho para erro.** Não invente aqui.

Tendências 2026:
- **Dark/Glow mode** (fundo escuro + acentos luminosos) — fortíssimo em tech, gaming, premium. Cowboy bikes, Apple, marcas tech viraram referência.
- **Bento grids** (blocos modulares como dashboards) substituindo listas longas.
- **Beges e off-whites quentes** voltando como neutro em vez do branco puro.

### 8.2 Tipografia
- **Fonte 1: Sans-serif para corpo de texto** (Inter, DM Sans, Geist, Manrope são apostas seguras em 2026).
- **Fonte 2 (opcional): display para headlines** — algo com personalidade.
- **Tamanhos: corpo 16px mínimo. Headlines 32–64px.** Em mobile, corpo nunca abaixo de 14px.
- **Linha de altura** 1.5x para texto longo, 1.1–1.2x para headlines.
- **Contraste mínimo 4.5:1** (WCAG AA) — obrigatório.

### 8.3 Espaçamento e ritmo
- Use uma **escala consistente**: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- **Whitespace é luxo.** Sites premium respiram. Não tente preencher tudo.
- **Padding interno** dos componentes maior que parece necessário (16–24px é mínimo confortável).

### 8.4 Iconografia e ilustrações
- **Use um único pack de ícones** (Lucide, Heroicons, Phosphor são opções modernas e gratuitas).
- **Ícones de UI consistentes em estilo** (outline OU filled, não misture).
- **Ilustrações são opcionais** — se usar, mantenha o mesmo estilo em todo o site.

### 8.5 Micro-interações que valem ouro
- **Botão hover** com leve mudança (cor, sombra, escala).
- **Adicionar ao carrinho** com animação (item voando pro ícone do carrinho, badge crescendo).
- **Loading states** em tudo (skeletons > spinners).
- **Feedback de erro/sucesso** com toast notifications.
- **Scroll suave** entre âncoras.

Cuidado: micro-interação demais vira poluição. Pergunte sempre: *isso comunica algo útil ou só decora?*

### 8.6 Imagens — o ativo visual mais importante
- **Fotos profissionais** (não bancos de imagem genéricos quando der pra evitar).
- **Padronização visual:** mesmo fundo, mesma iluminação, mesmo ângulo em fotos de catálogo.
- **Lifestyle + product shot:** mostre o produto isolado E em uso.
- **Otimização:** WebP/AVIF, lazy loading, imagens com tamanho correto pra cada breakpoint. Imagem mal otimizada destrói LCP (Largest Contentful Paint) e mata SEO.

---

## Parte 9 — Mobile-first sério

Não basta ser "responsivo". Mobile-first é projetar **primeiro pro polegar**.

### 9.1 Princípios
- **Botões na "thumb zone"** — área alcançável com o polegar (terço inferior da tela).
- **Touch targets mínimo 44x44px** (iOS HIG e Material Design concordam).
- **Sticky CTA** na PDP (botão "comprar" fica fixo embaixo enquanto rola).
- **Menu hamburger** com bom acordeão.
- **Busca como ícone** que abre overlay full-screen.
- **Tap, não hover** — não dependa de hover pra nada essencial.
- **Carrosséis com swipe nativo**, não setinhas pequenas.

### 9.2 Erros comuns em mobile
- Texto pequeno demais (corpo abaixo de 14px).
- Botões grudados (precisa de espaço entre alvos clicáveis).
- Formulários sem teclado correto (campo de email deve abrir teclado com @).
- Modais que não fecham fácil.
- Tabelas que viram horror em telas pequenas (use cards em mobile, tabela em desktop).

---

## Parte 10 — Confiança: o ativo invisível

Trust não é uma feature, é o resultado da soma de pequenos sinais. Em e-commerce especialmente, sem trust, nada vende.

### Checklist de sinais de confiança:
- ✅ Logo profissional e identidade visual consistente.
- ✅ HTTPS visível.
- ✅ Selos de segurança no checkout.
- ✅ Bandeiras de cartão visíveis.
- ✅ Reviews de clientes (com foto se possível).
- ✅ Página "Sobre" com história real, fotos do time.
- ✅ Contato fácil (WhatsApp, telefone, email).
- ✅ Política de troca e devolução clara, com link no rodapé E na PDP.
- ✅ CNPJ no rodapé.
- ✅ Endereço físico (se houver).
- ✅ Páginas legais (privacidade, termos, LGPD).
- ✅ Avaliações externas (Reclame Aqui, Google Reviews, Mercado Livre — esse último é trunfo da DropChina).

---

## Parte 11 — Performance: UX invisível

Velocidade é UX. Você pode ter o site mais bonito do mundo, mas se demora 5 segundos pra carregar, ninguém vê.

### Métricas que importam (Core Web Vitals):
- **LCP (Largest Contentful Paint)**: tempo até o maior elemento aparecer. Meta: <2.5s.
- **INP (Interaction to Next Paint)**: responsividade. Meta: <200ms.
- **CLS (Cumulative Layout Shift)**: estabilidade visual. Meta: <0.1.

### Otimizações práticas:
- Imagens em WebP/AVIF.
- Lazy loading abaixo da dobra.
- Preload da imagem do hero.
- CDN para assets.
- Minificação CSS/JS.
- Cache agressivo.
- Reduzir scripts de terceiros (cada pixel de Facebook, GA, hotjar etc. soma).

---

## Parte 12 — Referências visuais e benchmarks para estudar

Sites para abrir, navegar e dissecar:

### Premium / referência de UX
- **Apple.com.br** — masterclass de hierarquia visual e whitespace.
- **Allbirds** — minimalismo executado com personalidade.
- **Glossier** — branding + UX integrados.

### Tech / Gamer (relevante pra DropChina)
- **Pichau** — referência local em PC gamer.
- **Kabum** — agressivo em conversão, vale estudar PLP e PDP.
- **Terabyte Shop** — outro benchmark gamer Brasil.
- **PCYES** (da Oderço!) — referência mencionada pelo Augusto, vale dissecar.
- **Razer.com** — dark mode + glow aesthetic premium.
- **Logitech G** — categorização de produtos técnicos.

### Marketplaces (padrões de mercado)
- **Mercado Livre** — o usuário da DropChina já vem desse padrão. Cuidado pra não confundir.
- **Amazon** — referência mundial em PDP (mesmo sendo feia, converte porque domina informação).

### Internacionais para inspiração
- **Snow Peak** — visual storytelling em e-commerce.
- **Cowboy Bikes** — configurador de produto + dark aesthetic.
- **Rare Beauty** — mobile UX impecável.

---

## Parte 13 — Aplicação prática: framework de auditoria

Sempre que olhar um e-commerce (o seu ou referência), passe por essa checklist mental:

### Em 5 segundos:
- [ ] Entendi o que vende?
- [ ] Vi onde clicar para começar?
- [ ] Pareceu profissional/confiável?

### Em 30 segundos:
- [ ] Encontrei a busca?
- [ ] As categorias fazem sentido?
- [ ] Vi prova social?

### Na PDP:
- [ ] Imagens grandes, boas, várias?
- [ ] Preço claro e parcelamento?
- [ ] Frete estimável aqui?
- [ ] Botão de comprar óbvio?
- [ ] Reviews disponíveis?
- [ ] Especificações claras?

### No checkout:
- [ ] Posso comprar como visitante?
- [ ] Quantos campos?
- [ ] Tem PIX?
- [ ] Tem indicador de progresso?
- [ ] Resumo do pedido sempre visível?

---

## Parte 14 — Erros mais comuns que matam conversão

Os "anti-padrões" que você deve EVITAR a todo custo:

1. **Pop-up imediato bloqueando a tela.** Espera ao menos 15s ou exit-intent.
2. **Carrossel automático com muitos slides** — usuários não esperam.
3. **Botão "comprar" cinza ou sem destaque.**
4. **Campos de checkout em ordem ilógica.**
5. **Frete só aparecer no fim do checkout.**
6. **Sem opção de guest checkout.**
7. **Limpar formulário em erro.**
8. **Fotos de produto de baixa qualidade ou inconsistentes.**
9. **Múltiplos CTAs concorrentes no hero.**
10. **Texto branco sobre imagem clara** (contraste ruim).
11. **Falsa urgência** ("últimas 2 unidades" que nunca acaba) — destrói confiança quando descoberto.
12. **Cores de status invertidas** (verde pra erro, vermelho pra sucesso — não ria, acontece).
13. **Forçar cadastro pra ver preço.**
14. **Esconder custo de frete até o fim.**
15. **Newsletter pop-up no checkout** — interrompe a venda pra pedir email.

---

## Parte 15 — Onde aprofundar (fontes-fonte)

Para você Gabriel, que tá montando repertório e portfólio até janeiro:

### Leitura obrigatória
- **Baymard Institute** (baymard.com/research) — mais de 200.000 horas de pesquisa em UX de e-commerce. O artigo "Product Page UX 2026: 10 Pitfalls and Best Practices" é leitura essencial.
- **Nielsen Norman Group** (nngroup.com) — fundação teórica de UX, vários artigos específicos de e-commerce.
- **Smashing Magazine** — design e dev, com bons estudos de caso.
- **Growth.design** — case studies em formato visual (excelente formato pra portfolio inspiration).

### Métricas pra rastrear (mesmo que você não analise muito, vale conhecer)
- Taxa de conversão geral
- Taxa de abandono de carrinho
- Taxa de abandono de checkout
- AOV (Average Order Value / Ticket médio)
- Bounce rate por página
- Tempo médio na PDP
- Taxa de uso da busca

---

## Encerrando

Gabriel, se eu pudesse resumir tudo em uma frase só: **UX de e-commerce é remover dúvida**. Toda decisão de layout, copy, cor, imagem, posição de botão — tudo deve responder à pergunta *"isso ajuda o usuário a se sentir seguro de comprar?"*. Se sim, mantém. Se não, corta.

Pro projeto da DropChina especificamente, algumas leituras pessoais minhas com base no que você compartilhou:

- **Use o sucesso no Mercado Livre (Platinum) como ativo de prova social** — banner, selo, screenshot de reviews. É um diferencial que o site sozinho não constrói rápido.
- **A linha de produtos é técnica (cartuchos, periféricos, mini PC).** Compradores escaneiam especificações. Tabelas estruturadas, filtros bons na PLP e descrição em acordeões vão pesar mais que storytelling emocional.
- **Dark mode tem ótimo encaixe com gamer/tech**, mas atenção: usuário B2B/escritório (cartuchos, papel, impressora) prefere algo mais limpo. Pode valer um light mode equilibrado com acentos escuros, ou um toggle.
- **PIX bem evidente no checkout** vai resolver muita conversão, especialmente em um catálogo de preço médio.
- **A referência da PCYES (v2-gabriel.vercel.app) que você mostrou pro Augusto é uma boa âncora estética** — mantenha o nível, mas garanta os fundamentos de UX acima antes de qualquer decisão de UI.

Se quiser, na sequência eu posso te ajudar a:
1. Auditar a v2 da PCYES contra esse framework.
2. Montar wireframes de baixa fidelidade pras 5 páginas-chave da DropChina.
3. Definir um sistema de design enxuto (cores, tipo, espaçamento, componentes) pra você executar mais rápido no Figma.

Qual desses três é o próximo passo mais útil?
