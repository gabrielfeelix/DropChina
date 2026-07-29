# dc-cat-3d — ícones 3D das categorias

Fonte do bundle `theme/assets/dc-cat-3d.js`, usado pela seção
`theme/sections/dc-categories-grid.liquid`.

## Como funciona

Um **único** contexto WebGL para a grid inteira. O canvas é posicionado
absoluto sobre `.dc-categories__grid` (`pointer-events: none`, acima dos
cards para não ser tapado pelo fundo branco do hover) e cada modelo é
desenhado na região do seu próprio card via `setScissor`/`setViewport`.

Decisões que mantêm o custo baixo:

| Problema | Solução |
| --- | --- |
| 13 canvases estouram o limite de contextos WebGL do navegador | 1 canvas, 13 regiões scissor |
| Autorotate mantém a GPU acordada | render sob demanda — só o card em hover redesenha (`preserveDrawingBuffer` mantém o resto dos pixels) |
| Shadow map para 13 objetos | desligado; sombra de contato é um decalque com gradiente radial |
| Bundle no caminho do LCP | fetch só quando a grid chega a 400 px da viewport |
| Retina dobrando os pixels | `devicePixelRatio` limitado a 1.5 |

Peso: ~148 KB gzip (three.js r184 tree-shaken + os 13 modelos procedurais).
Zero textura, zero asset externo, zero CDN.

Respeita `prefers-reduced-motion`: sem giro de entrada e sem hover, só o
render estático.

## Fallback

O SVG chapado do bloco continua no HTML. Ele só é escondido (`.dc-cat3d-on`)
depois que o WebGL sobe. Sem WebGL, sem `IntersectionObserver`, ou com o
bloco sem "Modelo 3D" selecionado, o SVG é o ícone.

## Build

```bash
cd scripts/cat-3d
npm install
npm run build      # escreve theme/assets/dc-cat-3d.js
npm run preview    # build + screenshot headless (out-rest.png / out-hover.png)
```

`src/models.js` é a mesma geometria do visualizador interno
(`Visualizador 3D por categoria/models.js`) — ao mexer num modelo lá,
copie para cá e rode o build.

## Adicionar uma categoria

1. Novo `key` em `BUILD` e em `CATEGORIES` (`src/models.js`).
2. `npm run build`.
3. Nova opção no select `cat3d_key` do schema da seção.
