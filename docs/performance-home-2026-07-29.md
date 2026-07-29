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

## 5. Ordem sugerida de execução

**Primeira leva** (impacto alto, mexe só no tema, uma tarde): 4.1 + 4.2 + 4.4. Expectativa: LCP mobile abaixo de 5 s, score mobile na casa dos 55-65.

**Segunda leva** (depende de decisão de negócio): 4.3 e 4.7 — exigem olhar a lista de apps e decidir o que sai.

**Terceira leva** (qualidade): 4.5 + 4.6 + 4.8.

Medir de novo depois de cada leva, com o mesmo método deste documento, para que os números sejam comparáveis. O harness está em `scripts/cat-3d/` (o `deep.js` usado aqui está no scratchpad da sessão e pode ser versionado se for virar rotina).

---

## 6. Ressalvas

- **Sem dados de campo.** O CrUX não tem amostra para este domínio. Laboratório com CPU 4x mais lenta é conservador de propósito; o usuário real com celular decente vê números melhores. A ordem de prioridade não muda.
- **Não usei a skill `/web-ai-agent`.** Ela é orientada a busca na web; para performance, medição direta do site é evidência mais forte. Se quiser a leitura de conversão/GEO que ela cobre, é um trabalho separado e complementar.
- **Não olhei páginas de produto nem coleção.** Esta auditoria é só da home. A PDP costuma ter perfil diferente (mais imagens, mais scripts de variante) e merece rodada própria.
- **Nada do plano da seção 4 foi implementado.** Só o conserto do 3D (seção 2) está no ar.
