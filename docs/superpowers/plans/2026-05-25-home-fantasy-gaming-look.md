# DropChina Home — Pivot pro look Fantasy Gaming

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refazer a homepage da DropChina (loja Shopify Tinker em `dropchina-9753.myshopify.com`) no estilo visual da loja **Fantasy Gaming** (https://www.fantasygaming.com.br/) — header preto, hero cinematográfico, múltiplos carrosséis de produto com cards comerciais brasileiros (badge "% OFF", preço PIX destacado, coração favorito), vitrine de marcas, vídeo YouTube embedado, depoimentos com aspas, footer preto institucional, botão WhatsApp flutuante verde. **Catálogo NÃO muda** (cartuchos/toners/impressoras/periféricos/monitores/mini PCs — 28 produtos já existentes).

**Architecture:** Edição cirúrgica do CSS custom (`theme/assets/dropchina-vision.css`) + recomposição do `theme/templates/index.json` (seções e blocks JSON do tema Tinker) + criação de novas sections Liquid quando o Tinker não tem equivalente (vídeo YouTube, brand-carousel B&W, cards promo verticais). **Não** se reescreve o tema Tinker — só se sobrescreve e se compõe. Preserva headers/blocks/snippets existentes; só adiciona seções novas em `theme/sections/`.

**Paleta final aprovada:**
- `#000000` header + footer
- `#22c55e` CTA verde "Confira" + botão WhatsApp flutuante
- `#0F4FA8` azul DropChina mantido como **preço PIX destacado** + focus rings + hover de link
- `#E85D04` laranja mantido como **badge urgência/PIX/OFF** (substituindo o badge preto do Fantasy, alinhado com identidade DropChina)
- `#1A1A1A` texto · `#FFFFFF` fundo · `#F5F5F7` cinza apple (cards)
- `#FF3B30` preço com desconto (vermelho varejo BR)
- Fonte Inter mantida (n4/n6/n7)

**Tech Stack:** Shopify Tinker 3.5.1 (blocks-based theme), Liquid, JSON templates, CSS3 com custom properties. Dev server via `shopify theme dev`. Validação via `shopify theme check` + `mcp__plugin_shopify-plugin_shopify-mcp__validate_theme`.

**Ordem das fases** (top-down conforme decidido):
- **Fase 1:** Tokens + Header preto + Footer preto + WhatsApp flutuante (fundacional global)
- **Fase 2:** Hero cinematográfico full-bleed
- **Fase 3:** Faixa de trust badges (4 colunas Segurança/Envio/PIX/Promoções)
- **Fase 4:** 3 banners promocionais pretos com CTA verde "Confira"
- **Fase 5:** Card de produto novo (estilo Fantasy: badge OFF, coração, preço PIX destacado)
- **Fase 6:** Carrosséis "Destaques" + "Mais vendidos"
- **Fase 7:** Vitrine "Escolha pela marca" (carrossel B&W)
- **Fase 8:** Vídeo YouTube embedado
- **Fase 9:** Depoimentos novo estilo (aspas grandes ❝ ❞)
- **Fase 10:** Polimento + screenshots + audit

**Não inclui** (planos separados depois): PDP novo, PLP/coleção novo, cart drawer, search, páginas institucionais, imagens reais dos produtos (continua placeholder cinza por enquanto — vai exigir trabalho separado de upload via productCreateMedia).

---

## File Structure

**Arquivos a criar:**
- `theme/sections/whatsapp-float.liquid` — botão WhatsApp flutuante global
- `theme/sections/brand-carousel.liquid` — vitrine de marcas B&W com setas
- `theme/sections/youtube-embed.liquid` — vídeo YouTube responsivo
- `theme/sections/trust-badges.liquid` — faixa 4-col Segurança/Envio/PIX/Promoções
- `theme/snippets/dropchina-card-product.liquid` — markup do card de produto novo (override)
- `theme/assets/dropchina-fantasy.css` — **novo** arquivo CSS com o look Fantasy (substitui gradualmente o `dropchina-vision.css`)

**Arquivos a modificar:**
- `theme/templates/index.json` — recomposição completa da home
- `theme/sections/header-group.json` — settings do header global (cor preta)
- `theme/sections/footer-group.json` — settings do footer global (cor preta)
- `theme/config/settings_data.json` — color schemes ajustados, link CSS novo
- `theme/layout/theme.liquid` — incluir CSS novo + section whatsapp-float global
- `theme/assets/dropchina-vision.css` — desativar via comentário, manter como referência

**Arquivos a NÃO tocar:**
- `theme/blocks/*.liquid` — todos os blocks do Tinker são preservados; o card novo é via snippet, não block
- `theme/sections/main-collection.liquid` / `main-product.liquid` — PDP e PLP ficam pra plano separado
- `theme/templates/product.json` / `collection.json` — idem
- `theme/locales/*.json` — sem mudança de strings

---

## Pré-requisitos antes da Fase 1

- [ ] **PR-1: Commitar trabalho pendente como baseline**

Antes de começar a refazer, gravar o estado atual.

```bash
cd /home/gabfelix/dev/dropchina-shopify
git status
git add theme/assets/dropchina-vision.css theme/config/settings_data.json theme/templates/index.json
git commit -m "chore(baseline): consolidar tokens de raio e .button--urgent antes do pivot Fantasy"
```

Expected: 1 commit novo, `git status` mostra só `audit/` untracked.

- [ ] **PR-2: Subir dev server e validar baseline**

```bash
cd /home/gabfelix/dev/dropchina-shopify/theme
shopify theme dev --store=dropchina-9753.myshopify.com --store-password=dropchina1
```

Expected: server escutando em `http://127.0.0.1:9292`. Abrir no browser e confirmar que home carrega sem erro (mesmo que feia/sem imagens).

- [ ] **PR-3: Criar branch dedicada**

```bash
cd /home/gabfelix/dev/dropchina-shopify
git checkout -b feat/home-fantasy-look
```

Expected: branch `feat/home-fantasy-look` ativa.

---

## Fase 1 — Fundação (Tokens, Header preto, Footer preto, WhatsApp)

### Task 1.1: Criar `dropchina-fantasy.css` com tokens de design

**Files:**
- Create: `theme/assets/dropchina-fantasy.css`

- [ ] **Step 1: Criar o arquivo com tokens**

Arquivo: `theme/assets/dropchina-fantasy.css`

```css
/* ============================================================
   DropChina — Fantasy Gaming look
   Substitui o VISION-style. Header preto, cards comerciais,
   carrosséis múltiplos, paleta azul DropChina + verde Fantasy.
   ============================================================ */

:root {
  /* Cores */
  --dc-black: #000000;
  --dc-text: #1a1a1a;
  --dc-text-muted: #6b7280;
  --dc-bg: #ffffff;
  --dc-surface: #f5f5f7;
  --dc-border: #e5e7eb;

  /* Cor de marca DropChina mantida */
  --dc-blue: #0f4fa8;
  --dc-blue-hover: #0a3d80;

  /* Cor de urgência DropChina */
  --dc-orange: #e85d04;
  --dc-orange-hover: #c44d03;

  /* Cor verde Fantasy (CTAs compra + WhatsApp) */
  --dc-green: #22c55e;
  --dc-green-hover: #16a34a;

  /* Cor varejo BR (preço com desconto) */
  --dc-red: #ff3b30;

  /* Raio */
  --dc-radius-xs: 8px;
  --dc-radius-sm: 10px;
  --dc-radius-md: 12px;
  --dc-radius-lg: 16px;
  --dc-radius-pill: 999px;

  /* Sombra */
  --dc-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --dc-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --dc-shadow-lg: 0 12px 32px -8px rgba(0, 0, 0, 0.12);

  /* Easing */
  --dc-ease: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reduced motion respeitado */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Incluir o CSS no layout**

Modify: `theme/layout/theme.liquid`

Buscar a linha que contém `dropchina-vision.css` e logo abaixo adicionar:

```liquid
{{ 'dropchina-fantasy.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 3: Validar tema**

```bash
cd /home/gabfelix/dev/dropchina-shopify/theme
shopify theme check
```

Expected: 0 erros novos (warnings OK).

- [ ] **Step 4: Commit**

```bash
git add theme/assets/dropchina-fantasy.css theme/layout/theme.liquid
git commit -m "feat(fantasy): tokens base do novo look (cores Fantasy + DropChina, raio, sombra)"
```

---

### Task 1.2: Header preto full-width

**Files:**
- Modify: `theme/assets/dropchina-fantasy.css` (append)
- Modify: `theme/sections/header-group.json` (color scheme do header section)

- [ ] **Step 1: Adicionar color scheme "scheme-black" para header**

Modify: `theme/config/settings_data.json`

No bloco `"color_schemes"`, adicionar (ou substituir) o `scheme-7` para representar o header preto:

```json
"scheme-7": {
  "settings": {
    "background": "#000000",
    "foreground_heading": "#ffffff",
    "foreground": "#ffffff",
    "primary": "#22c55e",
    "primary_hover": "#16a34a",
    "border": "#1a1a1a",
    "shadow": "#000000",
    "primary_button_background": "#22c55e",
    "primary_button_text": "#ffffff",
    "primary_button_border": "#22c55e",
    "primary_button_hover_background": "#16a34a",
    "primary_button_hover_text": "#ffffff",
    "primary_button_hover_border": "#16a34a",
    "secondary_button_background": "transparent",
    "secondary_button_text": "#ffffff",
    "secondary_button_border": "#ffffff",
    "secondary_button_hover_background": "#ffffff",
    "secondary_button_hover_text": "#000000",
    "secondary_button_hover_border": "#ffffff",
    "input_background": "#1a1a1a",
    "input_text_color": "#ffffff",
    "input_border_color": "#333333",
    "input_hover_background": "#222222"
  }
}
```

(Manter os outros schemes intactos. O `settings_data.json` é uma linha gigante — usar editor que faça pretty-print ou aplicar via diff cuidadoso.)

- [ ] **Step 2: Apontar header-group para scheme-7**

Modify: `theme/sections/header-group.json`

Buscar a section `header` e mudar `"color_scheme"` para `"scheme-7"`. Aplicar também ao `header-announcements` se existir.

- [ ] **Step 3: Override CSS do header**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== HEADER PRETO FULL-WIDTH ===== */
.section-header,
header.section-header {
  background: var(--dc-black) !important;
  color: #fff !important;
  border-bottom: 1px solid #1a1a1a;
}

.section-header a,
.section-header .menu__list a,
.section-header .header__icons a {
  color: #fff !important;
}

.section-header a:hover,
.section-header .menu__list a:hover {
  color: var(--dc-green) !important;
}

/* Busca grande pill no header */
.section-header search-modal-trigger,
.section-header .search__input,
.section-header [class*="search"] input[type="search"] {
  background: #1a1a1a !important;
  color: #fff !important;
  border: 1px solid #333 !important;
  border-radius: var(--dc-radius-pill) !important;
  padding: 14px 24px !important;
  width: 100% !important;
  min-width: 400px;
}

.section-header [class*="search"] input::placeholder {
  color: #888 !important;
}

/* Logo: garantir cor branca/invertida se SVG */
.section-header .header__logo img,
.section-header [class*="logo"] img {
  filter: brightness(0) invert(1);
}

/* Carrinho/conta icons brancos */
.section-header svg {
  color: #fff !important;
  stroke: #fff;
}

/* Menu secundário (categorias) — fundo branco abaixo do header preto */
.section-header-bottom,
.header-group__menu-row {
  background: #fff;
  border-bottom: 1px solid var(--dc-border);
}

.section-header-bottom a {
  color: var(--dc-text) !important;
}

.section-header-bottom a:hover {
  color: var(--dc-blue) !important;
}
```

- [ ] **Step 4: Recarregar dev server e visualizar**

```bash
# Dev server já rodando — basta refresh do browser
# http://127.0.0.1:9292/
```

Expected: header agora aparece preto com texto branco. Menu de categorias em branco logo abaixo. Logo invertida (branca sobre preto).

- [ ] **Step 5: Commit**

```bash
git add theme/assets/dropchina-fantasy.css theme/config/settings_data.json theme/sections/header-group.json
git commit -m "feat(fantasy): header preto full-width com busca pill e menu categorias abaixo"
```

---

### Task 1.3: Footer preto institucional

**Files:**
- Modify: `theme/assets/dropchina-fantasy.css` (append)
- Modify: `theme/sections/footer-group.json` (scheme do footer)

- [ ] **Step 1: Apontar footer para scheme-7**

Modify: `theme/sections/footer-group.json`

Buscar `"color_scheme"` da section `footer` e setar para `"scheme-7"`.

- [ ] **Step 2: Override CSS do footer**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== FOOTER PRETO ===== */
.section-footer,
footer.section-footer {
  background: var(--dc-black) !important;
  color: #fff !important;
  padding-block: 64px !important;
}

.section-footer h3,
.section-footer h4,
.section-footer h5 {
  color: #fff !important;
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  margin-bottom: 16px !important;
}

.section-footer a,
.section-footer p {
  color: #b8bbbe !important;
  font-size: 0.875rem;
  line-height: 1.6;
}

.section-footer a:hover {
  color: #fff !important;
}

.section-footer .footer__logo img {
  filter: brightness(0) invert(1);
  max-height: 56px;
}

/* Linha de copyright */
.section-footer .footer__copyright,
.section-footer [class*="copyright"] {
  border-top: 1px solid #1a1a1a;
  padding-top: 24px;
  margin-top: 48px;
  font-size: 0.8125rem;
  color: #6b7280 !important;
}

/* Redes sociais — ícones brancos circulares */
.section-footer .social-link,
.section-footer [class*="social"] a {
  color: #fff !important;
  background: #1a1a1a;
  border-radius: var(--dc-radius-pill);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms var(--dc-ease);
}

.section-footer .social-link:hover {
  background: var(--dc-green) !important;
}

/* WhatsApps com ícone verde nos contatos */
.section-footer a[href*="wa.me"],
.section-footer a[href*="whatsapp"] {
  color: var(--dc-green) !important;
  font-weight: 600;
}
```

- [ ] **Step 3: Refresh e validar**

Visualizar `http://127.0.0.1:9292/` — footer aparece preto, links cinza claro, redes sociais em pílulas circulares.

- [ ] **Step 4: Commit**

```bash
git add theme/assets/dropchina-fantasy.css theme/sections/footer-group.json
git commit -m "feat(fantasy): footer preto com tipografia institucional e socials circulares"
```

---

### Task 1.4: Botão WhatsApp flutuante verde

**Files:**
- Create: `theme/sections/whatsapp-float.liquid`
- Modify: `theme/layout/theme.liquid`

- [ ] **Step 1: Criar a section**

Create: `theme/sections/whatsapp-float.liquid`

```liquid
{% comment %}
  Botão WhatsApp flutuante — visível em todas as páginas
{% endcomment %}

{% if section.settings.phone != blank %}
  <a
    href="https://wa.me/{{ section.settings.phone }}?text={{ section.settings.message | url_encode }}"
    class="whatsapp-float"
    target="_blank"
    rel="noopener"
    aria-label="Fale conosco no WhatsApp"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  </a>
{% endif %}

<style>
  .whatsapp-float {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
    z-index: 999;
    transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .whatsapp-float:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(34, 197, 94, 0.5);
  }
  .whatsapp-float:focus-visible {
    outline: 3px solid #0f4fa8;
    outline-offset: 4px;
  }
  @media (max-width: 768px) {
    .whatsapp-float {
      width: 52px;
      height: 52px;
      bottom: 16px;
      right: 16px;
    }
    .whatsapp-float svg {
      width: 24px;
      height: 24px;
    }
  }
</style>

{% schema %}
{
  "name": "WhatsApp flutuante",
  "settings": [
    {
      "type": "text",
      "id": "phone",
      "label": "Número WhatsApp (com código país, ex: 5511938066545)",
      "default": "5511938066545"
    },
    {
      "type": "textarea",
      "id": "message",
      "label": "Mensagem inicial",
      "default": "Olá! Vim pelo site DropChina e gostaria de mais informações."
    }
  ],
  "presets": [
    { "name": "WhatsApp flutuante" }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Incluir no layout global**

Modify: `theme/layout/theme.liquid`

Procurar a tag `</body>` e logo antes dela adicionar:

```liquid
{% section 'whatsapp-float' %}
```

- [ ] **Step 3: Validar com MCP Shopify**

Usar o validator:

```bash
shopify theme check theme/sections/whatsapp-float.liquid
```

Expected: 0 erros.

- [ ] **Step 4: Refresh e visualizar**

`http://127.0.0.1:9292/` — botão verde circular aparece no canto inferior direito de todas as páginas, com animação ao passar mouse.

- [ ] **Step 5: Commit**

```bash
git add theme/sections/whatsapp-float.liquid theme/layout/theme.liquid
git commit -m "feat(fantasy): botão WhatsApp flutuante verde global em todas as páginas"
```

---

## Fase 2 — Hero cinematográfico full-bleed

### Task 2.1: Reescrever section hero principal em `index.json`

**Files:**
- Modify: `theme/templates/index.json` (substituir o `hero_main`)
- Modify: `theme/assets/dropchina-fantasy.css` (append regras hero)

- [ ] **Step 1: Substituir o hero atual no index.json**

Modify: `theme/templates/index.json`

Localizar a section `"hero_main"` (linhas ~3-230) e **substituir todo o objeto** pelo seguinte. Manter o ID `hero_main` na chave da seção e na propriedade `order`:

```json
"hero_main": {
  "type": "slideshow",
  "blocks": {
    "slide_1": {
      "type": "_slide",
      "settings": {
        "image": "shopify://shop_images/hero-toner-laser.jpg",
        "image_overlay_opacity": 30,
        "image_overlay_color": "#000000",
        "horizontal_alignment": "center",
        "vertical_alignment": "center",
        "color_scheme": "scheme-7",
        "link": "shopify://collections/toners",
        "open_in_new_tab": false
      },
      "blocks": {
        "text_eyebrow": {
          "type": "text",
          "settings": {
            "text": "<p>OFICIAL · VENDEDOR PLATINUM</p>",
            "alignment": "center",
            "case": "uppercase",
            "letter_spacing": "0.16em",
            "font_size": "0.875rem",
            "color": "#22c55e"
          },
          "blocks": {}
        },
        "text_headline": {
          "type": "text",
          "settings": {
            "text": "<h1>Toners e Cartuchos</h1>",
            "alignment": "center",
            "type_preset": "h1",
            "font_size": "clamp(2.5rem, 6vw, 5rem)",
            "line_height": "1.05",
            "letter_spacing": "-0.02em",
            "color": "#ffffff"
          },
          "blocks": {}
        },
        "text_sub": {
          "type": "text",
          "settings": {
            "text": "<p>Até 50% de economia em rendimento por página</p>",
            "alignment": "center",
            "font_size": "1.125rem",
            "color": "#e5e7eb"
          },
          "blocks": {}
        },
        "btn_primary": {
          "type": "button",
          "settings": {
            "label": "Ver Toners",
            "link": "shopify://collections/toners",
            "style": "primary"
          },
          "blocks": {}
        }
      },
      "block_order": ["text_eyebrow", "text_headline", "text_sub", "btn_primary"]
    },
    "slide_2": {
      "type": "_slide",
      "settings": {
        "image_overlay_opacity": 40,
        "image_overlay_color": "#0f4fa8",
        "horizontal_alignment": "center",
        "vertical_alignment": "center",
        "color_scheme": "scheme-7",
        "link": "shopify://collections/impressoras"
      },
      "blocks": {
        "text_eyebrow_2": {
          "type": "text",
          "settings": {
            "text": "<p>FRETE GRÁTIS · TODO BRASIL</p>",
            "alignment": "center",
            "case": "uppercase",
            "letter_spacing": "0.16em",
            "font_size": "0.875rem",
            "color": "#22c55e"
          },
          "blocks": {}
        },
        "text_headline_2": {
          "type": "text",
          "settings": {
            "text": "<h1>Impressoras Multifuncionais</h1>",
            "alignment": "center",
            "type_preset": "h1",
            "font_size": "clamp(2.5rem, 6vw, 5rem)",
            "line_height": "1.05",
            "letter_spacing": "-0.02em",
            "color": "#ffffff"
          },
          "blocks": {}
        },
        "text_sub_2": {
          "type": "text",
          "settings": {
            "text": "<p>Wi-Fi, cópia, scanner — tudo em um</p>",
            "alignment": "center",
            "font_size": "1.125rem",
            "color": "#e5e7eb"
          },
          "blocks": {}
        },
        "btn_primary_2": {
          "type": "button",
          "settings": {
            "label": "Ver Impressoras",
            "link": "shopify://collections/impressoras",
            "style": "primary"
          },
          "blocks": {}
        }
      },
      "block_order": ["text_eyebrow_2", "text_headline_2", "text_sub_2", "btn_primary_2"]
    },
    "slide_3": {
      "type": "_slide",
      "settings": {
        "image_overlay_opacity": 35,
        "image_overlay_color": "#000000",
        "horizontal_alignment": "center",
        "vertical_alignment": "center",
        "color_scheme": "scheme-7",
        "link": "shopify://collections/perifericos"
      },
      "blocks": {
        "text_eyebrow_3": {
          "type": "text",
          "settings": {
            "text": "<p>PIX · 5% DE DESCONTO</p>",
            "alignment": "center",
            "case": "uppercase",
            "letter_spacing": "0.16em",
            "font_size": "0.875rem",
            "color": "#e85d04"
          },
          "blocks": {}
        },
        "text_headline_3": {
          "type": "text",
          "settings": {
            "text": "<h1>Periféricos Premium</h1>",
            "alignment": "center",
            "type_preset": "h1",
            "font_size": "clamp(2.5rem, 6vw, 5rem)",
            "line_height": "1.05",
            "letter_spacing": "-0.02em",
            "color": "#ffffff"
          },
          "blocks": {}
        },
        "text_sub_3": {
          "type": "text",
          "settings": {
            "text": "<p>Mouses, teclados, webcams e fones para escritório</p>",
            "alignment": "center",
            "font_size": "1.125rem",
            "color": "#e5e7eb"
          },
          "blocks": {}
        },
        "btn_primary_3": {
          "type": "button",
          "settings": {
            "label": "Ver Periféricos",
            "link": "shopify://collections/perifericos",
            "style": "primary"
          },
          "blocks": {}
        }
      },
      "block_order": ["text_eyebrow_3", "text_headline_3", "text_sub_3", "btn_primary_3"]
    }
  },
  "block_order": ["slide_1", "slide_2", "slide_3"],
  "settings": {
    "height": "custom",
    "custom_height": 540,
    "height_mobile": "custom",
    "custom_height_mobile": 420,
    "show_arrows": true,
    "show_dots": true,
    "autoplay": true,
    "autoplay_speed": 6,
    "transition_style": "slide",
    "color_scheme": "scheme-7",
    "section_width": "full",
    "padding-block-start": 0,
    "padding-block-end": 0,
    "padding-inline-start": 0,
    "padding-inline-end": 0
  }
}
```

> **Nota:** Se o tema Tinker usa `slideshow` ao invés de `hero` para carrosséis, ajustar `"type"` na seção. Verificar com `ls theme/sections/slideshow.liquid` — existe (confirmado no levantamento).

- [ ] **Step 2: Adicionar CSS de override do hero/slideshow**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== HERO SLIDESHOW FULL-BLEED (estilo Fantasy) ===== */
section[id*="hero_main"],
section.slideshow {
  border-radius: 0 !important;
  margin: 0 !important;
  max-width: 100% !important;
  padding: 0 !important;
}

section.slideshow .slideshow__slide,
section.slideshow .slide {
  min-height: 480px;
  border-radius: 0;
}

@media (min-width: 768px) {
  section.slideshow .slideshow__slide,
  section.slideshow .slide {
    min-height: 540px;
  }
}

/* Setas grandes circulares brancas */
section.slideshow .slideshow__arrow,
section.slideshow [class*="arrow"] button {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #fff !important;
}

section.slideshow .slideshow__arrow:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* Dots embaixo */
section.slideshow .slideshow__dots [aria-current="true"],
section.slideshow .slideshow__dots .active {
  background: #fff !important;
}

section.slideshow .slideshow__dots button {
  background: rgba(255, 255, 255, 0.4) !important;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
```

- [ ] **Step 3: Refresh, validar visualmente**

`http://127.0.0.1:9292/` — hero agora é carrossel full-bleed sem cantos arredondados, 3 slides com transição automática, setas circulares brancas com blur, dots embaixo.

> **Conhecida limitação:** as imagens dos slides (`shopify://shop_images/...`) precisam ser uploadadas via Shopify admin manualmente. Por agora aparecerá só o overlay escuro com texto centralizado — visual ainda funciona como placeholder.

- [ ] **Step 4: Commit**

```bash
git add theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): hero slideshow full-bleed com 3 slides cinematográficos"
```

---

## Fase 3 — Trust badges (4 colunas Segurança/Envio/PIX/Promoções)

### Task 3.1: Criar section `trust-badges.liquid`

**Files:**
- Create: `theme/sections/trust-badges.liquid`
- Modify: `theme/templates/index.json` (adicionar à ordem)
- Modify: `theme/assets/dropchina-fantasy.css` (estilo)

- [ ] **Step 1: Criar a section**

Create: `theme/sections/trust-badges.liquid`

```liquid
<section class="trust-badges" aria-label="Garantias da loja">
  <div class="trust-badges__container">
    {% for block in section.blocks %}
      <div class="trust-badges__item" {{ block.shopify_attributes }}>
        <div class="trust-badges__icon" aria-hidden="true">
          {{ block.settings.icon_svg }}
        </div>
        <div class="trust-badges__text">
          <h3 class="trust-badges__title">{{ block.settings.title }}</h3>
          <p class="trust-badges__sub">{{ block.settings.sub }}</p>
        </div>
      </div>
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Trust badges",
  "tag": "section",
  "class": "section-trust-badges",
  "blocks": [
    {
      "type": "badge",
      "name": "Badge",
      "limit": 4,
      "settings": [
        {
          "type": "html",
          "id": "icon_svg",
          "label": "Ícone SVG inline (cor#0f4fa8 recomendada)",
          "default": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#0f4fa8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' width='32' height='32'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Título (negrito)",
          "default": "Segurança"
        },
        {
          "type": "text",
          "id": "sub",
          "label": "Subtítulo",
          "default": "Loja com SSL de proteção"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Trust badges",
      "blocks": [
        {
          "type": "badge",
          "settings": {
            "title": "Segurança",
            "sub": "Loja com SSL de proteção"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "Envio",
            "sub": "Envio para todo Brasil",
            "icon_svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#0f4fa8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' width='32' height='32'><rect x='1' y='3' width='15' height='13'/><polygon points='16 8 20 8 23 11 23 16 16 16 16 8'/><circle cx='5.5' cy='18.5' r='2.5'/><circle cx='18.5' cy='18.5' r='2.5'/></svg>"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "PIX",
            "sub": "Economize pagando no PIX",
            "icon_svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#0f4fa8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' width='32' height='32'><polygon points='12 2 22 12 12 22 2 12 12 2'/></svg>"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "Promoções",
            "sub": "Promoções diárias",
            "icon_svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#0f4fa8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' width='32' height='32'><polygon points='12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2'/></svg>"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Estilo CSS**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== TRUST BADGES (faixa 4 colunas) ===== */
.trust-badges {
  background: #fff;
  border-top: 1px solid var(--dc-border);
  border-bottom: 1px solid var(--dc-border);
  padding-block: 28px;
}

.trust-badges__container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.trust-badges__item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trust-badges__icon svg {
  flex-shrink: 0;
}

.trust-badges__title {
  font-size: 0.9375rem !important;
  font-weight: 700 !important;
  margin: 0 0 2px !important;
  color: var(--dc-text);
}

.trust-badges__sub {
  font-size: 0.8125rem;
  color: var(--dc-text-muted);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .trust-badges__container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .trust-badges__container {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Adicionar à ordem no `index.json`**

Modify: `theme/templates/index.json`

Adicionar nova chave na `"sections"` object:

```json
"trust_badges_main": {
  "type": "trust-badges",
  "blocks": {
    "b1": { "type": "badge", "settings": { "title": "Segurança", "sub": "Loja com SSL de proteção" } },
    "b2": { "type": "badge", "settings": { "title": "Envio", "sub": "Envio para todo Brasil" } },
    "b3": { "type": "badge", "settings": { "title": "PIX", "sub": "Economize pagando no PIX" } },
    "b4": { "type": "badge", "settings": { "title": "Promoções", "sub": "Promoções diárias" } }
  },
  "block_order": ["b1", "b2", "b3", "b4"]
}
```

E ajustar `"order"` para inserir `trust_badges_main` logo depois do `hero_main`:

```json
"order": ["hero_main", "trust_badges_main", ...resto]
```

- [ ] **Step 4: Validar + visualizar**

```bash
shopify theme check theme/sections/trust-badges.liquid
```

`http://127.0.0.1:9292/` — abaixo do hero aparece faixa branca com 4 colunas (ícone + título + sub).

- [ ] **Step 5: Commit**

```bash
git add theme/sections/trust-badges.liquid theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): faixa trust badges 4-col com ícones SVG inline"
```

---

## Fase 4 — 3 banners promocionais (cards pretos + CTA verde)

### Task 4.1: Compor 3 banners usando `media-with-content` existente

**Files:**
- Modify: `theme/templates/index.json`
- Modify: `theme/assets/dropchina-fantasy.css`

- [ ] **Step 1: Adicionar 3 banners agrupados**

Modify: `theme/templates/index.json`

Adicionar uma section `promo_banners_main` que envolve 3 sub-blocks. Como `media-with-content` é por section, criamos uma section wrapper customizada **OU** usamos 3 sections separadas. Pra simplificar e respeitar Tinker, criar **uma section nova** `promo-cards.liquid`:

Create: `theme/sections/promo-cards.liquid`

```liquid
<section class="promo-cards" aria-label="Destaques promocionais">
  <div class="promo-cards__container">
    {% for block in section.blocks %}
      <a href="{{ block.settings.link }}" class="promo-card" {{ block.shopify_attributes }}>
        <div class="promo-card__image">
          {% if block.settings.image %}
            {{ block.settings.image | image_url: width: 800 | image_tag: loading: 'lazy', alt: block.settings.title }}
          {% endif %}
        </div>
        <div class="promo-card__body">
          {% if block.settings.eyebrow != blank %}
            <p class="promo-card__eyebrow">{{ block.settings.eyebrow }}</p>
          {% endif %}
          <h3 class="promo-card__title">{{ block.settings.title }}</h3>
          {% if block.settings.price != blank %}
            <p class="promo-card__price">R$ <strong>{{ block.settings.price }}</strong></p>
          {% endif %}
          <span class="promo-card__cta">{{ block.settings.cta_label | default: 'Confira' }}</span>
        </div>
      </a>
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Promo Cards 3-col",
  "tag": "section",
  "class": "section-promo-cards",
  "blocks": [
    {
      "type": "card",
      "name": "Card promocional",
      "limit": 3,
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Imagem do produto" },
        { "type": "text", "id": "eyebrow", "label": "Eyebrow (opcional)" },
        { "type": "text", "id": "title", "label": "Título (2 linhas)", "default": "Produto destaque" },
        { "type": "text", "id": "price", "label": "Preço (ex: 2.493,75)" },
        { "type": "text", "id": "cta_label", "label": "Texto do botão", "default": "Confira" },
        { "type": "url", "id": "link", "label": "Link" }
      ]
    }
  ],
  "settings": [
    { "type": "header", "content": "Espaçamento" },
    { "type": "range", "id": "padding_top", "min": 0, "max": 96, "step": 4, "unit": "px", "label": "Padding top", "default": 48 },
    { "type": "range", "id": "padding_bottom", "min": 0, "max": 96, "step": 4, "unit": "px", "label": "Padding bottom", "default": 48 }
  ],
  "presets": [
    {
      "name": "3 banners promocionais",
      "blocks": [
        { "type": "card", "settings": { "title": "Toner Brother TN-660", "price": "139,90", "cta_label": "Confira" } },
        { "type": "card", "settings": { "title": "Impressora HP Multifuncional", "price": "899,00", "cta_label": "Confira" } },
        { "type": "card", "settings": { "title": "Monitor 24\" Full HD", "price": "1.249,00", "cta_label": "Confira" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: CSS dos cards**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== PROMO CARDS 3-COL (banners pretos) ===== */
.promo-cards {
  background: #fff;
  padding-block: 48px;
}

.promo-cards__container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.promo-card {
  background: #0d0d0f;
  border-radius: var(--dc-radius-lg);
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: #fff;
  text-decoration: none;
  min-height: 200px;
  transition: transform 200ms var(--dc-ease),
              box-shadow 200ms var(--dc-ease);
}

.promo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.3);
}

.promo-card__image {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.promo-card__image img {
  width: 100%;
  height: auto;
  object-fit: contain;
  max-height: 140px;
  mix-blend-mode: screen;
}

.promo-card__body {
  flex: 1;
}

.promo-card__eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
  margin: 0 0 8px;
}

.promo-card__title {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
  line-height: 1.25;
  color: #fff !important;
  margin: 0 0 8px !important;
}

.promo-card__price {
  font-size: 1rem;
  color: #b8bbbe;
  margin: 0 0 16px;
}

.promo-card__price strong {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
}

.promo-card__cta {
  display: inline-block;
  background: var(--dc-green);
  color: #fff;
  font-weight: 700;
  font-size: 0.9375rem;
  padding: 12px 24px;
  border-radius: var(--dc-radius-pill);
  transition: background 200ms var(--dc-ease);
}

.promo-card:hover .promo-card__cta {
  background: var(--dc-green-hover);
}

@media (max-width: 1024px) {
  .promo-cards__container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .promo-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  .promo-card__image {
    flex: 0 0 auto;
    width: 60%;
  }
}
```

- [ ] **Step 3: Adicionar ao `index.json`**

Modify: `theme/templates/index.json`

```json
"promo_banners_main": {
  "type": "promo-cards",
  "blocks": {
    "c1": { "type": "card", "settings": { "title": "Toner Brother TN-660", "price": "139,90", "cta_label": "Confira", "link": "shopify://collections/toners" } },
    "c2": { "type": "card", "settings": { "title": "Impressora HP Multifuncional", "price": "899,00", "cta_label": "Confira", "link": "shopify://collections/impressoras" } },
    "c3": { "type": "card", "settings": { "title": "Monitor 24\" Full HD", "price": "1.249,00", "cta_label": "Confira", "link": "shopify://collections/monitores" } }
  },
  "block_order": ["c1", "c2", "c3"]
}
```

E adicionar `"promo_banners_main"` na `"order"` logo após `"trust_badges_main"`.

- [ ] **Step 4: Validar + visualizar**

```bash
shopify theme check theme/sections/promo-cards.liquid
```

`http://127.0.0.1:9292/` — abaixo da trust-badge faixa aparecem 3 cards pretos lado a lado, com CTA verde "Confira".

- [ ] **Step 5: Commit**

```bash
git add theme/sections/promo-cards.liquid theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): 3 cards promocionais pretos com CTA verde 'Confira'"
```

---

## Fase 5 — Card de produto novo (estilo Fantasy)

### Task 5.1: Reescrever look do card de produto

**Files:**
- Modify: `theme/assets/dropchina-fantasy.css` (append + DESATIVAR regras antigas)

- [ ] **Step 1: Desativar overrides do `dropchina-vision.css`**

Como vamos manter o arquivo como referência mas não usá-lo, remover sua inclusão do layout.

Modify: `theme/layout/theme.liquid`

Encontrar e **REMOVER** a linha:

```liquid
{{ 'dropchina-vision.css' | asset_url | stylesheet_tag }}
```

Garantir que `dropchina-fantasy.css` continua incluído.

- [ ] **Step 2: Adicionar look novo do card**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ============================================================
   CARD DE PRODUTO — Estilo Fantasy Gaming
   ============================================================ */

.product-card,
[class*="product-card"] > .resource-card,
.resource-card--product-card {
  background: #fff !important;
  border: 1px solid var(--dc-border) !important;
  border-radius: var(--dc-radius-md) !important;
  overflow: hidden;
  transition: box-shadow 200ms var(--dc-ease),
              transform 200ms var(--dc-ease);
  position: relative;
}

.product-card:hover {
  box-shadow: var(--dc-shadow-md);
  transform: translateY(-2px);
  border-color: #d4d4d8 !important;
}

/* Imagem do produto */
.product-card .card-gallery,
.product-card .product-card__gallery,
.product-card-gallery {
  background: #fff !important;
  padding: 24px !important;
  border-radius: 0 !important;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-card .card-gallery img,
.product-card-gallery img {
  mix-blend-mode: normal;
  max-height: 180px;
  object-fit: contain;
  transition: transform 320ms var(--dc-ease);
}

.product-card:hover .card-gallery img {
  transform: scale(1.04);
}

/* Badge "% OFF" — círculo preto no topo esquerdo */
.product-card .badge,
.product-card .product-card__badge,
.product-card [class*="discount-badge"] {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #000 !important;
  color: #fff !important;
  font-size: 0.6875rem !important;
  font-weight: 800 !important;
  padding: 6px 10px !important;
  border-radius: var(--dc-radius-pill) !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  z-index: 2;
  line-height: 1.1;
  text-align: center;
}

/* Quando é discount mostrar "% OFF" em vez de "Save R$ X" */
.product-card .badge::after {
  content: "";
}

/* Coração favorito (top-right) */
.product-card .product-card__wishlist,
.product-card [class*="wishlist"] {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: #f5f5f7 !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 200ms var(--dc-ease);
}

.product-card .product-card__wishlist:hover {
  background: #e5e7eb !important;
}

/* Conteúdo do card (info abaixo da imagem) */
.product-card .group-block,
.product-card .product-card__content,
.product-card .resource-card__info {
  background: #fff !important;
  border-top: 1px solid var(--dc-border);
  padding: 16px 20px 20px !important;
}

/* Título do produto */
.product-card .group-block a.contents p,
.product-card [class*="title"] a,
.product-card h3 {
  color: var(--dc-text) !important;
  font-size: 0.9375rem !important;
  font-weight: 500 !important;
  line-height: 1.35;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
  margin-bottom: 12px !important;
}

/* Preço PIX (destaque azul DropChina) */
.product-card .price-pix,
.product-card .product-card__price-pix {
  font-size: 1.25rem !important;
  font-weight: 800 !important;
  color: var(--dc-blue) !important;
  margin: 0 !important;
  line-height: 1.1;
}

.product-card .price-pix__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--dc-text-muted);
  margin-left: 6px;
}

.product-card .price-pix__discount {
  display: block;
  font-size: 0.75rem;
  color: var(--dc-text-muted);
  font-weight: 500;
  margin-top: 2px;
}

/* Preço cheio riscado */
.product-card .price--on-sale,
.product-card .price__compare-at,
.product-card s {
  font-size: 0.8125rem;
  color: var(--dc-text-muted);
  text-decoration: line-through;
}

/* Preço com desconto (cartão) */
.product-card .price__current,
.product-card .price--current {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--dc-text);
}

/* Parcelas */
.product-card .product-card__installments {
  font-size: 0.75rem;
  color: var(--dc-text-muted);
  margin-top: 4px;
}
```

- [ ] **Step 3: Refresh + screenshot**

`http://127.0.0.1:9292/collections/all` — cards agora aparecem com fundo branco, borda fina cinza, sombra ao hover. Sem badge OFF ainda (depende dos produtos terem `compare_at_price`). Sem foto real ainda (problema separado).

- [ ] **Step 4: Commit**

```bash
git add theme/layout/theme.liquid theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): card de produto estilo Fantasy (branco + badge OFF + coracao + preço PIX azul)"
```

---

## Fase 6 — Carrosséis "Destaques" e "Mais vendidos"

### Task 6.1: Substituir product-lists por carrosséis nativos do Tinker

**Files:**
- Modify: `theme/templates/index.json`
- Modify: `theme/assets/dropchina-fantasy.css`

- [ ] **Step 1: Verificar se Tinker tem carrossel de produtos**

```bash
grep -l "carousel" theme/sections/*.liquid
grep -l "carousel" theme/blocks/*.liquid
cat theme/sections/carousel.liquid | head -30
```

Expected: `theme/sections/carousel.liquid` existe. Usar.

- [ ] **Step 2: Reescrever section "Destaques" e "Mais vendidos" como carousel**

Modify: `theme/templates/index.json`

Localizar as duas sections do tipo `product-list` (provavelmente `best_sellers` e `second_collection`). **Substituir cada uma** por:

```json
"destaques_main": {
  "type": "carousel",
  "blocks": {
    "title_block": {
      "type": "_inline-text",
      "settings": {
        "text": "<h2>Destaques</h2>",
        "type_preset": "h2",
        "alignment": "center"
      }
    },
    "products_block": {
      "type": "product-card-group",
      "settings": {
        "collection": "best-sellers",
        "products_to_show": 8,
        "products_per_view_desktop": 4,
        "products_per_view_mobile": 1.2
      }
    }
  },
  "block_order": ["title_block", "products_block"],
  "settings": {
    "show_arrows": true,
    "show_dots": false,
    "color_scheme": "scheme-1",
    "padding-block-start": 48,
    "padding-block-end": 48
  }
}
```

> **Nota:** os nomes exatos dos blocks (`_inline-text`, `product-card-group`) precisam ser verificados contra `theme/blocks/`. Se o Tinker usa nomes diferentes, ajustar. Os blocks `_inline-text.liquid` e `product-card-group.liquid` existem (confirmado).

Repetir o padrão criando `"mais_vendidos_main"` com `"collection": "mais-vendidos"` (ou outra collection real do catálogo).

Ajustar `"order"` no JSON para incluir:
```json
"order": ["hero_main", "trust_badges_main", "promo_banners_main", "destaques_main", "mais_vendidos_main", ...]
```

- [ ] **Step 3: Estilo do carousel**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== CAROUSEL DE PRODUTOS ===== */
section.carousel {
  background: #fff;
  padding-block: 48px !important;
}

section.carousel h2 {
  text-align: center;
  font-size: clamp(1.5rem, 3vw, 2rem) !important;
  font-weight: 700 !important;
  margin-bottom: 32px !important;
  color: var(--dc-text);
}

/* Setas circulares */
section.carousel .carousel__arrow,
section.carousel [aria-label*="Previous"],
section.carousel [aria-label*="Next"] {
  background: #fff !important;
  border: 1px solid var(--dc-border) !important;
  width: 44px;
  height: 44px;
  border-radius: 50% !important;
  box-shadow: var(--dc-shadow-sm);
  color: var(--dc-text) !important;
}

section.carousel .carousel__arrow:hover {
  background: var(--dc-surface) !important;
  border-color: #d4d4d8 !important;
}

/* Espaço entre cards */
section.carousel .product-card-group,
section.carousel [class*="grid"] {
  gap: 16px !important;
}
```

- [ ] **Step 4: Validar + visualizar**

`http://127.0.0.1:9292/` — agora aparecem 2 carrosséis com 4 cards visíveis, setas laterais redondas, título centralizado no topo.

- [ ] **Step 5: Commit**

```bash
git add theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): carrosséis Destaques + Mais vendidos com 4-up de cards e setas circulares"
```

---

## Fase 7 — Vitrine "Escolha pela marca"

### Task 7.1: Criar section `brand-carousel.liquid`

**Files:**
- Create: `theme/sections/brand-carousel.liquid`
- Modify: `theme/templates/index.json`
- Modify: `theme/assets/dropchina-fantasy.css`

- [ ] **Step 1: Criar a section**

Create: `theme/sections/brand-carousel.liquid`

```liquid
<section class="brand-carousel" aria-label="Marcas que vendemos">
  <div class="brand-carousel__container">
    {% if section.settings.heading != blank %}
      <h2 class="brand-carousel__title">{{ section.settings.heading }}</h2>
    {% endif %}

    <div class="brand-carousel__track" role="list">
      {% for block in section.blocks %}
        <a
          href="{{ block.settings.link | default: '#' }}"
          class="brand-carousel__item"
          role="listitem"
          {{ block.shopify_attributes }}
          aria-label="{{ block.settings.alt }}"
        >
          {% if block.settings.logo %}
            {{ block.settings.logo | image_url: width: 240 | image_tag:
                 loading: 'lazy',
                 alt: block.settings.alt,
                 class: 'brand-carousel__logo' }}
          {% else %}
            <span class="brand-carousel__placeholder">{{ block.settings.alt }}</span>
          {% endif %}
        </a>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Brand carousel",
  "tag": "section",
  "class": "section-brand-carousel",
  "settings": [
    { "type": "text", "id": "heading", "label": "Título", "default": "Escolha pela marca" }
  ],
  "blocks": [
    {
      "type": "brand",
      "name": "Marca",
      "settings": [
        { "type": "image_picker", "id": "logo", "label": "Logo (PNG transparente, recomendado)" },
        { "type": "text", "id": "alt", "label": "Nome da marca (alt text)", "default": "Marca" },
        { "type": "url", "id": "link", "label": "Link (opcional, ex: coleção da marca)" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Escolha pela marca",
      "blocks": [
        { "type": "brand", "settings": { "alt": "HP" } },
        { "type": "brand", "settings": { "alt": "Brother" } },
        { "type": "brand", "settings": { "alt": "Epson" } },
        { "type": "brand", "settings": { "alt": "Canon" } },
        { "type": "brand", "settings": { "alt": "Logitech" } },
        { "type": "brand", "settings": { "alt": "Samsung" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Estilo CSS**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== BRAND CAROUSEL ===== */
.brand-carousel {
  background: var(--dc-surface);
  padding-block: 48px;
}

.brand-carousel__container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: 24px;
}

.brand-carousel__title {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  text-align: center;
  margin-bottom: 32px !important;
  color: var(--dc-text);
}

.brand-carousel__track {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 48px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-block: 8px;
}

.brand-carousel__track::-webkit-scrollbar { display: none; }

.brand-carousel__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 160px;
  scroll-snap-align: center;
  transition: filter 200ms var(--dc-ease), opacity 200ms var(--dc-ease);
  filter: grayscale(1);
  opacity: 0.6;
}

.brand-carousel__item:hover {
  filter: grayscale(0);
  opacity: 1;
}

.brand-carousel__logo {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
}

.brand-carousel__placeholder {
  font-weight: 700;
  color: var(--dc-text-muted);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .brand-carousel__track { gap: 24px; }
  .brand-carousel__item { width: 120px; height: 60px; }
}
```

- [ ] **Step 3: Adicionar ao `index.json`**

```json
"brand_carousel_main": {
  "type": "brand-carousel",
  "blocks": {
    "br1": { "type": "brand", "settings": { "alt": "HP" } },
    "br2": { "type": "brand", "settings": { "alt": "Brother" } },
    "br3": { "type": "brand", "settings": { "alt": "Epson" } },
    "br4": { "type": "brand", "settings": { "alt": "Canon" } },
    "br5": { "type": "brand", "settings": { "alt": "Logitech" } },
    "br6": { "type": "brand", "settings": { "alt": "Samsung" } }
  },
  "block_order": ["br1", "br2", "br3", "br4", "br5", "br6"],
  "settings": { "heading": "Escolha pela marca" }
}
```

Adicionar `"brand_carousel_main"` na `"order"` depois dos carrosséis de produto.

- [ ] **Step 4: Validar + visualizar**

`http://127.0.0.1:9292/` — aparece nova section cinza claro com nomes/placeholders das marcas em B&W. Quando logos forem uploadados via Shopify admin, eles aparecem grayscale com hover colorido.

- [ ] **Step 5: Commit**

```bash
git add theme/sections/brand-carousel.liquid theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): vitrine 'Escolha pela marca' B&W com hover colorido"
```

---

## Fase 8 — Vídeo YouTube embedado

### Task 8.1: Criar section `youtube-embed.liquid`

**Files:**
- Create: `theme/sections/youtube-embed.liquid`
- Modify: `theme/templates/index.json`
- Modify: `theme/assets/dropchina-fantasy.css`

- [ ] **Step 1: Criar a section**

Create: `theme/sections/youtube-embed.liquid`

```liquid
<section class="youtube-embed" aria-label="Vídeo destaque">
  <div class="youtube-embed__container">
    {% if section.settings.heading != blank %}
      <h2 class="youtube-embed__title">
        {% if section.settings.icon_play %}<span aria-hidden="true">▶</span>{% endif %}
        {{ section.settings.heading }}
      </h2>
    {% endif %}

    {% if section.settings.video_id != blank %}
      <div class="youtube-embed__frame">
        <iframe
          src="https://www.youtube.com/embed/{{ section.settings.video_id }}?rel=0&modestbranding=1"
          title="{{ section.settings.heading | default: 'Vídeo' }}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>

      {% if section.settings.cta_label != blank and section.settings.cta_link != blank %}
        <a href="{{ section.settings.cta_link }}" class="youtube-embed__cta" target="_blank" rel="noopener">
          {{ section.settings.cta_label }}
        </a>
      {% endif %}
    {% else %}
      <p style="text-align:center;color:#9ca3af;">Configure o ID do vídeo no theme editor.</p>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "YouTube embed",
  "tag": "section",
  "class": "section-youtube-embed",
  "settings": [
    { "type": "text", "id": "heading", "label": "Título", "default": "Veja em ação" },
    { "type": "checkbox", "id": "icon_play", "label": "Mostrar ícone play antes do título", "default": true },
    { "type": "text", "id": "video_id", "label": "ID do vídeo YouTube (parte após v=)", "info": "Ex: dQw4w9WgXcQ" },
    { "type": "text", "id": "cta_label", "label": "Texto do botão (opcional)", "default": "Assista no YouTube" },
    { "type": "url", "id": "cta_link", "label": "Link do botão (opcional)" }
  ],
  "presets": [
    { "name": "Vídeo YouTube" }
  ]
}
{% endschema %}
```

- [ ] **Step 2: CSS**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== YOUTUBE EMBED ===== */
.youtube-embed {
  background: #fff;
  padding-block: 48px;
}

.youtube-embed__container {
  max-width: 960px;
  margin: 0 auto;
  padding-inline: 24px;
  text-align: center;
}

.youtube-embed__title {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: var(--dc-text) !important;
  margin-bottom: 24px !important;
}

.youtube-embed__title span {
  color: var(--dc-red);
  margin-right: 8px;
}

.youtube-embed__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--dc-radius-lg);
  overflow: hidden;
  box-shadow: var(--dc-shadow-lg);
  background: #000;
}

.youtube-embed__frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.youtube-embed__cta {
  display: inline-block;
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--dc-text-muted);
  text-decoration: underline;
}

.youtube-embed__cta:hover {
  color: var(--dc-blue);
}
```

- [ ] **Step 3: Adicionar ao `index.json`**

```json
"youtube_main": {
  "type": "youtube-embed",
  "settings": {
    "heading": "Por que escolher DropChina",
    "icon_play": true,
    "video_id": "",
    "cta_label": "Assista no YouTube",
    "cta_link": ""
  }
}
```

Inserir na `"order"` antes dos depoimentos. Deixar `video_id` vazio — usuário configura no theme editor com vídeo real.

- [ ] **Step 4: Validar**

`shopify theme check theme/sections/youtube-embed.liquid`

Acessar `http://127.0.0.1:9292/` — section nova aparece (com placeholder até o video_id ser preenchido).

- [ ] **Step 5: Commit**

```bash
git add theme/sections/youtube-embed.liquid theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): section YouTube embed configurável via theme editor"
```

---

## Fase 9 — Depoimentos estilo Fantasy (aspas grandes)

### Task 9.1: Atualizar look do `testimonials.liquid`

**Files:**
- Read first: `theme/sections/testimonials.liquid` (verificar markup atual)
- Modify: `theme/assets/dropchina-fantasy.css` (append)

- [ ] **Step 1: Inspecionar markup atual**

```bash
cat theme/sections/testimonials.liquid | head -120
```

Anotar classes CSS usadas (provavelmente `.testimonial-card`, `.testimonial-card__rating`, `.testimonial-card__author`).

- [ ] **Step 2: Override CSS estilo Fantasy**

Append em `theme/assets/dropchina-fantasy.css`:

```css
/* ===== TESTIMONIALS (estilo Fantasy: aspas grandes) ===== */
.section-testimonials,
section[class*="testimonials"] {
  background: var(--dc-surface);
  padding-block: 64px !important;
}

.section-testimonials > h2,
section[class*="testimonials"] > h2,
section[class*="testimonials"] .section__title {
  text-align: center;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  margin-bottom: 40px !important;
}

.testimonial-card {
  background: #fff !important;
  border: 1px solid var(--dc-border) !important;
  border-radius: var(--dc-radius-md) !important;
  padding: 28px 24px !important;
  position: relative;
  text-align: center;
  box-shadow: none !important;
}

/* Aspas grandes ❝ */
.testimonial-card::before {
  content: "❝";
  position: absolute;
  top: 12px;
  left: 18px;
  font-size: 2rem;
  color: #d4d4d8;
  font-family: Georgia, serif;
  line-height: 1;
}

.testimonial-card::after {
  content: "❞";
  position: absolute;
  bottom: 12px;
  right: 18px;
  font-size: 2rem;
  color: #d4d4d8;
  font-family: Georgia, serif;
  line-height: 1;
}

.testimonial-card__quote,
.testimonial-card p {
  font-size: 0.9375rem !important;
  line-height: 1.5;
  color: var(--dc-text);
  margin-bottom: 20px;
  padding: 0 12px;
}

/* Avatar circular */
.testimonial-card__avatar,
.testimonial-card [class*="avatar"] {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 12px;
  overflow: hidden;
  background: var(--dc-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dc-blue);
}

.testimonial-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Nome + cidade */
.testimonial-card__author,
.testimonial-card__name {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: var(--dc-text);
  margin-bottom: 6px;
}

.testimonial-card__city {
  font-size: 0.75rem;
  color: var(--dc-text-muted);
  margin-bottom: 8px;
}

/* Estrelas amarelas */
.testimonial-card__rating,
.testimonial-card [class*="rating"] {
  color: #f59e0b;
  font-size: 1rem !important;
  display: flex;
  justify-content: center;
  gap: 2px;
}
```

- [ ] **Step 3: Atualizar copy dos testimonials no `index.json`**

Modify: `theme/templates/index.json`

Localizar a section `testimonials` e atualizar os 4 blocks para incluir cidade/estado real (ex: "São Paulo/SP", "Belo Horizonte/MG"). Manter 5 estrelas em 3 dos 4 cards e 4 estrelas em 1 (credibilidade — recomendação do UI-REVIEW).

- [ ] **Step 4: Refresh + screenshot**

`http://127.0.0.1:9292/` — depoimentos agora aparecem com aspas tipográficas ❝ ❞ nos cantos, avatar circular, fundo branco com borda fina.

- [ ] **Step 5: Commit**

```bash
git add theme/templates/index.json theme/assets/dropchina-fantasy.css
git commit -m "feat(fantasy): depoimentos com aspas tipográficas e layout center estilo Fantasy"
```

---

## Fase 10 — Polimento, screenshots, audit

### Task 10.1: Limpar e validar

**Files:**
- Possible: `theme/assets/dropchina-vision.css` (mover para `_archive/`)
- Create: `audit/screenshots-fantasy/` (resultado)

- [ ] **Step 1: Arquivar CSS antigo**

```bash
mkdir -p theme/_archive
git mv theme/assets/dropchina-vision.css theme/_archive/dropchina-vision.css.archive
```

- [ ] **Step 2: Theme check completo**

```bash
cd /home/gabfelix/dev/dropchina-shopify/theme
shopify theme check
```

Expected: 0 errors. Anotar warnings e decidir caso-a-caso.

- [ ] **Step 3: Validar via MCP Shopify**

Invocar `mcp__plugin_shopify-plugin_shopify-mcp__validate_theme` no path `theme/`. Conversation ID se necessário: `11fa8205-bda1-49c0-a810-2c81f4b40904` (do projeto).

- [ ] **Step 4: Screenshots 3 viewports**

```bash
mkdir -p audit/screenshots-fantasy-$(date +%Y%m%d)
# Usar Playwright via skill webapp-testing OR manual:
# - 1440x900 home
# - 768x1024 home tablet
# - 375x812 home mobile
```

Salvar como `audit/screenshots-fantasy-YYYYMMDD/home-{desktop,tablet,mobile}.png`.

- [ ] **Step 5: Audit visual rápido**

Rodar `/gsd-ui-review` ou comparar manualmente contra `audit/screenshots-20260516-145449/` e contra os prints do Fantasy Gaming.

Checklist mínimo:
- [ ] Header preto sem quebra visual
- [ ] Hero com 3 slides funcionando
- [ ] Faixa trust badges 4-col em desktop, 2-col tablet, 1-col mobile
- [ ] 3 promo cards lado a lado em desktop, empilhados em mobile
- [ ] 2 carrosséis de produto com setas
- [ ] Brand carousel B&W com hover colorido
- [ ] YouTube embed responsivo 16:9
- [ ] Depoimentos com aspas
- [ ] Footer preto institucional
- [ ] WhatsApp flutuante verde visível em scroll

- [ ] **Step 6: Documentar issues remanescentes**

Create: `audit/fantasy-followups.md` com lista de coisas adiadas:
- Imagens reais dos produtos (productCreateMedia)
- Logos das marcas (image upload via admin)
- ID de vídeo YouTube real
- Foto hero slides
- PDP refeito (plano separado)
- PLP refeita (plano separado)

- [ ] **Step 7: Commit final**

```bash
git add audit/ theme/_archive/
git commit -m "chore(fantasy): arquivar CSS antigo, screenshots novos, followups documentados"
```

- [ ] **Step 8: Push e PR**

```bash
git push -u origin feat/home-fantasy-look
gh pr create --title "feat: home pivotada para look Fantasy Gaming" --body "Refaz a home no estilo Fantasy Gaming (header preto, hero cinematográfico, múltiplos carrosséis, badge OFF, preço PIX azul DropChina, WhatsApp flutuante verde, depoimentos com aspas). Catálogo não muda. PDP/PLP em planos separados."
```

---

## Notas finais e suposições

- **Imagens**: este plano NÃO sobe imagens. Tudo aparece com placeholders cinza/SVG inline até upload via Shopify admin.
- **Color schemes**: o `scheme-7` foi reusado pra preto. Se houver conflito com header existente (Tinker pode já estar usando), ajustar criando `scheme-8` em vez disso.
- **Block types**: alguns nomes (`_inline-text`, `product-card-group`, `_slide`) foram inferidos da lista de blocks. Se algum não existe ou tem nome diferente, ajustar consultando `ls theme/blocks/`.
- **`!important`**: este plano adiciona ~40 novos `!important` (necessário pra overrider Tinker). Não eliminamos os do `dropchina-vision.css` porque o arquivo foi arquivado. Issue separada de manutenção.
- **A11y**: `prefers-reduced-motion`, focus rings de WhatsApp e aria-labels foram adicionados. Skip-to-content depende do Tinker (não auditado).
- **Performance**: lazy-loading aplicado em iframe YouTube, logos de marca e imagens dos promo-cards. Pesquisar se Shopify Tinker já lazy-loada cards de produto (provavelmente sim).
- **Branch**: trabalho todo em `feat/home-fantasy-look`. Merge na main só depois de visualizar + aprovar tu mesmo.
