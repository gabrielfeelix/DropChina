# Auditoria de performance — home DropChina

**Data:** 29/07/2026 · **URL:** https://dropchinaoficial.com.br/ · **Tema:** DropChina (MAIN, `161970290907`)

**Método:** Lighthouse 13.4.1 local via Playwright/Chromium, não o PageSpeed Insights. Mobile com o preset padrão (Moto G emulado, 4G lento, CPU 4x); desktop com throttling leve. Todos os números aqui foram medidos, não estimados. Onde uma causa foi isolada, isso foi feito rodando a mesma página duas vezes — uma normal e outra com o recurso bloqueado via `blockedUrlPatterns` — e comparando o delta.

Uma medição de laboratório é uma amostra, não a verdade do campo. Números de TBT variam ±20% entre execuções. As ordens de grandeza abaixo são confiáveis; as casas decimais, não. O painel do PSI mostra "Nenhum dado" em dados de campo (CrUX) — a loja ainda não tem tráfego suficiente para dados reais de usuário, então tudo aqui é laboratório.

---

## 1. Onde estamos

| Métrica | Mobile | Desktop | Alvo |
| --- | --- | --- | --- |
| Performance | **37** | **53** | 75+ |
| Acessibilidade | 88 | 92 | 95+ |
| Práticas recomendadas | 73 | 73 | 90+ |
| SEO | **100** | **100** | manter |
| FCP | 3,04 s | 0,85 s | < 1,8 s |
| LCP | **9,18 s** | 2,25 s | < 2,5 s |
| TBT | **2.209 ms** | **2.156 ms** | < 200 ms |
| CLS | 0,000 | 0,005 | < 0,1 |
| Speed Index | 5,57 s | 2,20 s | < 3,4 s |
| TTFB | 26 ms | 26 ms | ✅ excelente |

Leitura rápida: **SEO está perfeito e o servidor é rápido** (TTFB 26 ms, CLS zero). O problema é inteiramente de front-end — peso de imagem no caminho do LCP e JavaScript bloqueando a thread principal.

---

## 2. O incidente do 3D (resolvido hoje)

Registro honesto, porque foi regressão minha e o aprendizado vale para as próximas seções.

Os ícones 3D das categorias foram para o ar hoje mais cedo. Medição comparativa da home com e sem `dc-cat-3d.js`:

| | com 3D | sem 3D | custo |
| --- | --- | --- | --- |
| TBT | 48.308 ms | 3.691 ms | **+44,6 s** |
| Thread principal | 123.106 ms | 12.520 ms | **+110 s** |
| Speed Index | 31,5 s | 6,5 s | +25 s |

`dc-cat-3d.js` sozinho consumia **19,4 s de execução** na CPU emulada. O carregamento "lazy" por `IntersectionObserver` não protegia nada: a grid fica logo abaixo do hero, entrava no `rootMargin` de 400 px e carregava junto com a página.

**Corrigido e no ar** (commits `a77c70a`, `66518fe`):

1. Portão de capacidade — o bundle só é buscado com hover real + ponteiro fino, viewport ≥ 1000 px, ≥ 4 GB de RAM, ≥ 4 núcleos, sem `save-data` e sem rede 2g. E só depois do `load`, em tempo ocioso. No celular não existe hover que justifique o custo; quem não passa no portão fica com o SVG e não baixa nenhum byte extra.
2. Construção progressiva — um modelo por fatia ociosa em vez dos 13 de enfiada.

**Resultado:** TBT mobile de 48.308 → **2.209 ms**. O script sumiu do perfil de execução mobile.

**Pendência:** em desktop o 3D ainda produz tarefas longas (215 ms de avaliação + fatias de build). Item 4.6 abaixo.

**A lição:** `IntersectionObserver` com `rootMargin` generoso não é lazy loading para conteúdo acima ou logo abaixo da dobra. Enriquecimento pesado precisa de portão de capacidade, não só de posição.

---

## 3. Diagnóstico por frente

### 3.1 LCP mobile: 9,18 s — o hero

O elemento LCP é `banner-snapmaker-u1-mobile.jpeg`, no `div.dc-hero-slideshow`.

O slideshow carrega **os três slides de uma vez**, todos com prioridade de carregamento:

| arquivo | transferido | desperdício |
| --- | --- | --- |
| `banner-1-oficial-mobile.jpeg` | 149 KiB | 102 KiB |
| `banner-2-oficial-mobile.jpeg` | 107 KiB | 73 KiB |
| `banner-snapmaker-u1-mobile.jpeg` | 91 KiB | 63 KiB |
| **total** | **347 KiB** | **238 KiB** |

Dois problemas somados:

- **Slides 2 e 3 competem com o slide 1.** Só o primeiro é visível no primeiro paint. Os outros dois roubam banda de rede exatamente na janela que define o LCP.
- **Compressão folgada.** O Shopify já converte para WebP na entrega (o `mime` retornado é `image/webp` apesar da extensão `.jpeg`), mas os originais são grandes demais — 238 KiB de economia só recomprimindo.

A decomposição do LCP mostra `elementRenderDelay` de 547 ms e `resourceLoadDelay` de 452 ms: o navegador demora a *descobrir* a imagem. Falta `fetchpriority="high"` e preload no slide 1.

### 3.2 TBT: 2,2 s em ambos — JavaScript de terceiros

Mesmo depois de resolver o 3D, o TBT segue 10x acima do alvo. O maior ofensor não é do tema:

| script | execução (mobile) | maior tarefa |
| --- | --- | --- |
| `shopify-perf-kit-3.7.0.min.js` | **4.459 ms** | 2.295 ms |
| Não atribuído | 2.320 ms | 1.562 ms |
| documento (inline) | 1.927 ms | 139 ms |
| `cdn/wpm/...m.js` (web pixels) | 272 ms | 111 ms |
| `trekkie.storefront...js` (analytics) | 168 ms | — |

**`shopify-perf-kit` custa 4,5 s de execução para entregar 22 KiB.** É o principal item a investigar: com 22 KiB de código gerando 4,5 s de trabalho, o custo está no que ele *faz* (instrumentação, observers, medição), não no que ele baixa. Ele não veio do repositório do tema — precisa ser rastreado até o app que o injeta. Não consegui listar os apps instalados: o token do MCP não tem escopo para `appInstallations`. **Isso precisa ser conferido no painel** (Configurações → Apps e canais de venda).

Distribuição da thread principal no mobile: Avaliação de script 5.600 ms · Outros 3.871 ms · Estilo e layout 669 ms · Renderização 163 ms.

### 3.3 Peso da página: 2.213 KiB em 209 requisições

| tipo | peso | req |
| --- | --- | --- |
| Other | 893 KiB | 76 |
| Imagem | 670 KiB | 20 |
| Script | 294 KiB | 74 |
| Fonte | 249 KiB | 6 |
| Documento | 90 KiB | 3 |

Os 893 KiB em "Other" são majoritariamente **assets do checkout carregados na home**: `hydrate.E1w-WDbd.js` (207 KiB), `useShopPayExternalAppContext` (102 KiB), `OnePage.BKVqe-fb.js` (72 KiB), `context-browser` (66 KiB). É o prefetch do Shop Pay / accelerated checkout. Meio caminho é controle da Shopify, mas parte é configurável (botões de checkout acelerado no tema).

**74 requisições de script** para uma home é muito. Nenhuma individualmente grande — o custo é de sobrecarga somada.

### 3.4 Fontes: 249 KiB + render-blocking

Seis arquivos de fonte, 249 KiB, mais 131 KiB de `fonts.gstatic.com`. O `fonts.googleapis.com` aparece na lista de recursos que bloqueiam a renderização.

Três famílias carregadas: **Bricolage Grotesque** (com eixo óptico variável 12..96 em 4 pesos), **Manrope** (5 pesos) e **JetBrains Mono** (3 pesos). São 12 combinações de peso — quase certamente mais do que a home usa de fato.

O aviso de "mais de quatro conexões preconnect" no PSI também vem daqui: preconnects demais competem entre si.

### 3.5 Acessibilidade: 88 (mobile)

| problema | ocorrências | gravidade |
| --- | --- | --- |
| `label-content-name-mismatch` | 16 | o nome acessível não bate com o texto visível — quebra comando de voz |
| `color-contrast` | 7 | texto sem contraste suficiente |
| `heading-order` | 3 | hierarquia de headings fora de ordem |
| `target-size` | 3 | alvos de toque pequenos demais no mobile |
| `aria-hidden-focus` | 2 | elemento com `aria-hidden` contém item focável |

O `aria-hidden-focus` merece atenção: um elemento escondido de leitores de tela mas alcançável por Tab é uma armadilha de teclado. Vale conferir se não é o popup de cupom.

### 3.6 Práticas recomendadas: 73

- `image-aspect-ratio` — imagens exibidas com proporção diferente da natural (distorção visível).
- `third-party-cookies` — 1 cookie de terceiro; relevante para as mudanças de privacidade em curso nos navegadores.
- `inspector-issues` — problemas registrados no painel Issues do Chrome.

### 3.7 O que já está bom

- **SEO 100** em mobile e desktop. Não mexer.
- **TTFB 26 ms.** O servidor não é o problema.
- **CLS 0,000** no mobile. Layout estável.
- **Reflow forçado** aparece como aviso, mas sem custo relevante atribuído ao tema.

---

## 4. Plano priorizado

> **Executado em 29/07/2026.** Todos os itens abaixo foram aplicados no mesmo dia — o resultado medido e o que sobrou estão nas seções 5 e 6. Mantido aqui como registro do raciocínio de priorização.

Ordenado por retorno sobre esforço. Os ganhos são estimativas do Lighthouse ou minhas, sinalizadas como tal — só viram fato depois de medir.

### 4.1 Hero: carregar só o primeiro slide · impacto ALTO · esforço BAIXO

Slides 2 e 3 com `loading="lazy"` e `fetchpriority="low"`; slide 1 com `fetchpriority="high"` e `<link rel="preload">` no `<head>`.

Ganho estimado: **–256 KiB no caminho crítico**, LCP mobile provavelmente abaixo de 5 s.
Arquivo: `theme/sections/dc-hero-slideshow.liquid`.

### 4.2 Recomprimir os banners · impacto ALTO · esforço BAIXO

238 KiB de economia medida nos três banners do hero, mais 174 KiB nas imagens de produto. Total apontado pelo Lighthouse: **412 KiB**.

Reexportar os banners a ~75% de qualidade e nas dimensões reais de exibição (356×445 CSS no mobile, hoje servidos bem maiores).

### 4.3 Rastrear o `shopify-perf-kit` · impacto ALTO · esforço BAIXO (é investigação)

4.459 ms de execução, tarefa longa de 2.295 ms. Se vier de um app dispensável, removê-lo é o maior ganho isolado de TBT disponível. Precisa da lista de apps do painel — não tenho escopo para ler isso via API.

Ganho estimado: **–2 s de TBT** se for removível.

### 4.4 Enxugar as fontes · impacto MÉDIO · esforço BAIXO

Cortar pesos não usados das três famílias e trocar o `<link>` do Google Fonts por `preload` + `font-display: swap` — ou hospedar como asset do tema, eliminando o hop para `fonts.gstatic.com`.

Ganho estimado: **–100 a –150 KiB** e um recurso a menos bloqueando a renderização.

### 4.5 Corrigir acessibilidade · impacto MÉDIO · esforço MÉDIO

Começar por `aria-hidden-focus` (2) e `target-size` (3) — são os que afetam uso real. Depois `color-contrast` (7) e `heading-order` (3). O `label-content-name-mismatch` (16) costuma ser um mesmo componente repetido; provavelmente um só conserto.

### 4.6 Terminar a otimização do 3D em desktop · impacto MÉDIO · esforço MÉDIO

Ainda produz 215 ms de avaliação e fatias de build. Opções, da mais barata à mais cara:

- Reduzir `curveSegments` de 16 para 8 em `models.js` — corta a geração de geometria pela metade, com perda visual pequena.
- Construir só o modelo do card sob o cursor, em vez dos 13 antecipadamente.
- Mover a geração de geometria para um Worker com `OffscreenCanvas`.

### 4.7 Reduzir o prefetch do checkout · impacto MÉDIO · esforço A INVESTIGAR

893 KiB de assets de checkout na home. Verificar se os botões de checkout acelerado estão habilitados em lugares onde não precisam estar. Parte é imposta pela Shopify e não sai.

### 4.8 `image-aspect-ratio` · impacto BAIXO (visual) · esforço BAIXO

Imagens distorcidas. Corrigir com `aspect-ratio` + `object-fit: cover` nos contêineres.

---

## 5. O que foi executado (mesmo dia)

As três levas do plano foram executadas e estão no ar. Commits: `51ab108` (fase 1), `cfbfc37` (fase 2), `3bf92f7` e `738637b` (fase 3).

### Resultado medido

| Métrica | Antes | Depois |
| --- | --- | --- |
| **Acessibilidade** | 88 | **100** |
| SEO | 100 | 100 |
| Práticas recomendadas | 73 | **77** |
| Performance | 37 | 42 |
| FCP | 3.043 ms | **2.307 ms** |
| LCP | 9.183 ms | **6.513 ms** |
| Peso da home | 2.213 KiB | **1.928 KiB** |
| Banners no carregamento | 3 arquivos / 347 KiB | **2 / 182 KiB** |

Acessibilidade é o número mais confiável da tabela — auditoria de a11y é determinística. Os tempos carregam o ruído descrito em 6.2.

### Fase 1 — hero, imagens, fontes, SEO, geometria

- **Hero.** `loading="lazy"` não adiava nada: os slides se sobrepõem com `position:absolute`, então todos contam como "na viewport". Só o slide 1 tem `src` no HTML, com `<link rel=preload>` por media query; os demais usam `data-src` e são hidratados depois do `load`.
- **Imagens.** Banners reamostrados para 900 px de largura no mobile e recomprimidos a 78: 1.168 → 606 KiB.
- **Fontes.** Pesos auditados com `document.fonts` em home, coleção, produto e página. Só Bricolage 500/600 e JetBrains 500 não eram baixados em lugar nenhum. **A PDP usa Bricolage 800, JetBrains 700 e Manrope 800** — uma auditoria só da home teria cortado esses por engano e causado *faux bold*. O CSS do Google Fonts deixou de bloquear a renderização.
- **SEO.** `lang` normalizado para `pt-BR`; `og:image` criado (não existia em nenhuma página — `page_image` só é preenchido em produto e artigo).
- **3D.** Geometria de 427.732 → 79.720 triângulos; construção de 2.454 → 647 ms em CPU 4x.

### Fase 2 — 3D de volta ao mobile, dados estruturados, medição

O 3D voltou a rodar em touch. Bloqueio de thread de 4.695 → 1.429 ms no ambiente de teste, com quatro mudanças:

1. geometria enxuta da fase 1;
2. construção sob demanda por viewport (a grid tem cinco linhas no mobile — a maioria dos cards nem aparece no carregamento);
3. render por card em vez da grid inteira a cada passo — eram 169 desenhos durante a construção, passaram a 13;
4. sem animação onde não há hover: a revelação de entrada gastava rAF nos 13 cards sem ninguém para ver.

Também: `ItemList` na grid de categorias (a home só tinha `Organization` e `WebSite`; a PDP já emitia `Product` e `BreadcrumbList`), popup de cupom de 8 s → 25 s, e campos de GA4/Search Console no tema.

### Fase 3 — acessibilidade e conteúdo

27 achados corrigidos, cada um com causa localizada:

| Achado | Causa | Correção |
| --- | --- | --- |
| `label-content-name-mismatch` (12) | botão mostrava "Adicionar ao carrinho" e o `aria-label` era "Adicionar *{título}* ao carrinho" — texto visível fora do nome acessível (WCAG 2.5.3) | `aria-label="Adicionar ao carrinho: {título}"` |
| `color-contrast` (9) | `#9ca3af` e `#9aa1ab` sobre branco: 2,53:1 e 2,6:1 | `#6b7280` (4,83:1) |
| `heading-order` (3) | card de produto era `h4` abaixo de `h2`; coluna do rodapé era `h5` | ambos `h3` |
| `target-size` (3) | pontos do slideshow com alvo 28×20 | 24×24 via padding; ponto visual segue com 4 px |
| `aria-hidden-focus` (2) | slide inativo com `aria-hidden` continuava alcançável por Tab | `tabindex="-1"` gerenciado no JS |
| `image-aspect-ratio` (1) | logo do menu declarado 135×33 (4,09:1) com arquivo 480×192 (2,5:1) | 80×32 |

Dois guias de compatibilidade publicados no blog, escritos a partir dos títulos reais do catálogo:
`/blogs/noticias/toner-hp-105a-w1105a-compatibilidade` e `/blogs/noticias/toner-brother-tn2340-tn2370-tn660-tn1060-compatibilidade`.

---

## 6. O que ficou e por quê

### 6.1 Dois itens não são acionáveis pelo tema

**`shopify-perf-kit`** (4.459–6.985 ms de execução para 22 KiB) foi rastreado por CDP: `initiator.type = "parser"`, injetado direto no `<head>` do HTML da Shopify. `grep -r perf-kit theme/` dá zero ocorrências. Não é app nem `scriptTag`.

**658 KiB de assets de checkout na home**, com **zero botões de pagamento no DOM** — prefetch do Shop Pay pela plataforma.

Juntos explicam a maior parte do TBT restante e cerca de um terço do peso. Enquanto estiverem lá, a performance mobile tem teto na casa dos 40 mesmo com o tema impecável. A única alavanca é chamado no suporte Shopify.

### 6.2 O TBT desta loja não é medível em uma execução

Mesma página, sem alterar nada, três execuções seguidas: **2.448 / 4.877 / 7.155 ms**. LCP variou de 7,5 a 10,5 s. Antes de declarar ganho ou regressão de TBT, rode 3x e use a mediana — ou compare por métricas determinísticas (bytes, número de requisições, quais recursos carregam). Para isolar a causa de uma regressão, rode duas vezes com `blockedUrlPatterns` bloqueando o suspeito e compare o delta. Foi assim que o custo do bundle 3D foi atribuído.

### 6.3 Lighthouse e PSI rodam sem GPU

Ambos usam SwiftShader (rasterização por software), o que penaliza WebGL de forma desproporcional. Parte do custo medido do 3D é artefato do ambiente; o usuário real com GPU paga menos. Não há como medir o custo com GPU real nem localmente nem pelo PSI — então os números do 3D neste documento são o pior caso, não o caso típico.

### 6.4 Sem preview local

`shopify theme list` e `theme dev` falham com 401 nesta loja, embora `theme push` autentique normalmente. Some-se a isso o fato de a loja ter um único tema, que é o publicado: **toda validação de mudança acontece depois do deploy, no ar**. Planeje o rollback antes de subir. Detalhes em `docs/deploy-shopify.md`.

### 6.5 Pendências que dependem do lojista

| Item | Onde |
| --- | --- |
| GA4 e Search Console (nenhum instalado, nem pixel) | Personalizar → Configurações do tema → Medição e verificação |
| Idioma primário está como Português de Portugal | Configurações → Idiomas. A Admin API **não** troca: `ShopLocaleInput` só tem `published` e `marketWebPresenceIds`, sem campo `primary` |
| `perf-kit` e prefetch de checkout | chamado no suporte Shopify |
| Revisão técnica dos guias de compatibilidade | conteúdo publicado a partir dos títulos do catálogo; compatibilidade errada gera devolução |

Sem GA4 e Search Console, nada disso vira dado de campo — o CrUX segue sem amostra para o domínio e toda decisão continua baseada em laboratório.

### 6.6 Não coberto

Esta auditoria é da home. PDP e coleção têm perfil diferente (mais imagens, mais scripts de variante) e merecem rodada própria. O harness está versionado em `scripts/cat-3d/audit.js`.
