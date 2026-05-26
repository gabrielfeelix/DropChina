# DropChina — UI Review

**Audited:** 2026-05-16
**Baseline:** Abstract 6-pillar standards + DropChina brand reference (VISION-style target)
**Screenshots:** captured (homepage + collection at 1440x900, 768x1024, 375x812)
**Screenshot path:** `/home/gabfelix/dev/dropchina-shopify/audit/screenshots-20260516-145449/`
**Dev server:** `http://127.0.0.1:9292` — verified 200 OK

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | PT-BR copy on-brand, specific CTAs ("Ver produtos", "Aproveitar agora"), benefit-led marquee |
| 2. Visuals | 2/4 | Hero + sections styled well, but homepage product cards render with **zero product images** (empty gray squares); urgency accent completely absent |
| 3. Color | 2/4 | Primary blue `#0F4FA8` applied correctly. **Orange `#E85D04` defined in 4 schemes but never used in active schemes** — brand 60/30/10 promise broken |
| 4. Typography | 3/4 | Inter family + consistent scale via Tinker presets. Custom CSS introduces 10 distinct font-sizes (small-text drift below 0.9375rem) |
| 5. Spacing | 3/4 | Generous section padding (64-80px) matches VISION rhythm. **19 distinct border-radius values** = inconsistent rounding language |
| 6. Experience Design | 2/4 | Quick-add + cart drawer enabled, focus rings present. No skip-to-content link visible; no reduced-motion support; 97 `!important` overrides = brittle interaction surface |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **Homepage product cards show empty gray boxes — no product images render.**
   *User impact:* The site's most important conversion surface (Mais vendidos + Acabaram de chegar on the homepage) reads as "broken store." First-time visitors will bounce. Compare `home-desktop.png` rows 4 and 8 to `collection-desktop.png` — homepage uses Tinker's demo `all` collection with old t-shirt placeholders that never resolve, while the actual catalog (cartridges/toners) lives behind `/collections/all` and **also has no images**. The image overflow fix you shipped exposed this — the cards now show their gallery container but there's no `featured_media` to render.
   *Concrete fix:* (a) Upload product images via Shopify admin for at least the 8 best-sellers and 4 new-arrivals SKUs referenced in `templates/index.json` (sections `best_sellers` and `second_collection`). (b) Until images exist, change `theme/templates/index.json:726` and `:1125` from `"collection": "all"` to a curated handle (`"collection": "best-sellers"`) so empty/imageless products don't lead the homepage. (c) Add a graceful empty fallback in `theme/assets/dropchina-vision.css` — make `.product-card-gallery__title-placeholder` more visually substantial (subtle icon + product name on a tinted background) instead of the current near-blank look at lines 63–79.

2. **Urgency orange `#E85D04` is defined but never rendered — brand's 10% accent is missing.**
   *User impact:* DropChina's brand contract calls for blue primary + **orange urgency accent**. The orange exists only in `color_schemes` 3, 4, 5, 6 (`config/settings_data.json` line 1) — but the homepage only uses schemes 1, 2, 3, and 7. Scheme-3 lives on the hero, but the hero's primary CTA renders as black (#1a1a1a) because the override CSS at `theme/assets/dropchina-vision.css:529-541` forces a generic `.button` style with no orange anywhere. The promo banner ("Pague no PIX e ganhe 5% de desconto") uses scheme-3 but its "Aproveitar agora" button also renders dark, not orange — see `home-desktop.png` around y=540. Result: no urgency, no visual hierarchy between primary and "buy now" intent.
   *Concrete fix:* In `theme/assets/dropchina-vision.css` add a dedicated urgency variant:
   ```css
   .button--urgent,
   .color-scheme-3 .button--primary,
   .color-scheme-4 .button--primary,
   .announcement-bar .button {
     background: #e85d04 !important;
     border-color: #e85d04 !important;
     color: #fff !important;
   }
   .button--urgent:hover { background: #c44d03 !important; }
   ```
   Then tag the PIX-promo button (`templates/index.json:852`) with `"style_class": "button button--urgent"` and consider promoting the hero secondary CTA copy to "Cartuchos a partir de R$ 25 →" with the orange treatment to ground the urgency claim.

3. **Border-radius vocabulary has 19 distinct values — inconsistent rounding breaks the "Apple-clean" promise.**
   *User impact:* The VISION reference uses ~3 radius tokens (small for chips/inputs ~10-12px, medium for cards ~16-18px, large for hero ~24-28px). Your CSS at `theme/assets/dropchina-vision.css` ships: `10px, 12px, 16px, 18px, 20px, 24px, 28px, 50%, 999px, inherit, 0` plus compound values like `0 0 18px 18px` and `16px 16px 0 0`. Visually the cards (18px), banners (20px), testimonial cards (16px), and collection cards (20px) read as slightly-different-but-not-intentionally-different — the eye sees noise, not rhythm.
   *Concrete fix:* Define a 4-token radius scale at the top of `theme/assets/dropchina-vision.css` and replace every literal:
   ```css
   :root {
     --radius-sm: 10px;   /* inputs, chips, small buttons */
     --radius-md: 16px;   /* cards, testimonials, banner-cards */
     --radius-lg: 22px;   /* hero, promo blocks, PDP gallery */
     --radius-pill: 999px;/* buttons, badges */
   }
   ```
   Specifically: change `.product-card` (line 26) `18px` → `var(--radius-md)`; `.collection-card` (line 462) `20px` → `var(--radius-md)`; `.hero` (line 248) `28px` → `var(--radius-lg)`; `.banner-card` (line 285) `20px` → `var(--radius-md)`; `.testimonial-card` (line 682) `16px` → `var(--radius-md)`; `.product-media-gallery` (line 518) `24px` → `var(--radius-lg)`. That collapses 19 values into 4.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

The copy is the strongest pillar by a wide margin — PT-BR, brand-voiced, benefit-led.

**Evidence:**
- Hero eyebrow `"VENDEDOR PLATINUM • +50 MIL VENDAS"` (`templates/index.json:49`) — earns trust in 4 words.
- Hero headline `"Tecnologia para sua casa e escritório"` (line 75) — specific to the catalog (cartridges/toners/printers/monitors) without listing.
- Sub copy at line 101 names the real product mix.
- Primary CTA `"Ver produtos"` (line 165) and secondary `"Sobre a DropChina"` (line 179) are concrete, not generic.
- Promo banner: `"Pague no PIX e ganhe 5% de desconto"` (line 799) + `"Aproveitar agora"` CTA (line 849) is textbook urgency copy.
- Trust marquee (`★ Vendedor Platinum`, `✓ Frete grátis`, `● PIX 5%`, `↻ Troca 7 dias`, `♥ +50 mil clientes`) — 5 benefits, 1 sentence each (lines 240–296).
- Testimonials carry names + specific products: `"Comprei o cartucho HP 667 e chegou em 2 dias"` (line 1362). No lorem ipsum.
- No generic `Submit`/`Click Here`/`OK` strings detected anywhere in the customized files (`grep -rn "Submit\|Click Here" theme/sections theme/blocks` returned only the schema/system uses, not visible UI).

**Minor recommendations (not score-affecting):**
- "Sobre a DropChina" links to `shopify://pages/about` — verify that page exists or replace link target to avoid 404 (`templates/index.json:181`).
- Testimonial titles are punchy but four of four are 5-star — consider a 4-star one for credibility.

### Pillar 2: Visuals (2/4)

This is where implementation diverges sharply from intent.

**What's working:**
- Hero composition matches the VISION reference: eyebrow uppercase + big H1 + sub + 2 CTAs on the left, image right (`home-desktop.png` top).
- Trust marquee renders at line 235 in `index.json` and visually delivers the "horizontal faded gray text" pattern from the brand brief.
- Testimonials section renders as a true 4-up card grid (`sections/testimonials.liquid:85-101`) with avatars, stars, names — matches the reference.
- Footer is correctly dark (`#2d3032`) with white headings and lighter body — matches the VISION footer treatment (`dropchina-vision.css:614-678`).

**What's broken:**
- **Homepage product cards render with no images** — `home-desktop.png` rows starting at y≈460 (Mais vendidos) and y≈900 (Acabaram de chegar) show 4-up grids where each card is just a price + title on a flat gray square. The image area is preserved (mid-height of the card) but empty. Same on collection page `collection-desktop.png` — 28 products, 0 images.
- **No focal point on the bestsellers/new-arrivals rows** without images. The cards rely on the image to anchor the eye; price-first cards read as a spreadsheet.
- **Categories grid uses Tinker apparel placeholders** — `home-desktop.png` row 2 ("Categorias") shows colorful t-shirt SVGs from Tinker's default catalog rather than category imagery (cartridges, toners, printers). This breaks the brand promise of being an office-supplies B2B store from the first scroll.
- **No icon-only buttons audited as problematic**, but the cart count badge at `dropchina-vision.css:386-405` is icon-only and lacks an `aria-label` (count is decorative-looking).
- The promo banner ("Pague no PIX") at `home-desktop.png` y≈540 fills full-width with a flat blue background but a hovering "monitor" placeholder image — competing visual with no real product context.

### Pillar 3: Color (2/4)

The brand promise is **blue primary + orange urgency**. Implementation delivers blue but no orange.

**Evidence — colors used:**
```
24× #fff       (background, footer text)
13× #1a1a1a    (foreground, primary button bg)
 7× #e5e7eb    (borders)
 6× #f5f5f7    (light-gray surface)
 5× #f0f0f2    (card bg)
 5× #0f4fa8    (primary blue — focus rings, hover, accent text)
 4× #6b7280    (muted text)
 3× #4b5563    (deep gray)
 2× #f59e0b    (testimonial stars — yellow, not brand orange)
 2× #b8bbbe    (footer link)
 2× #9ca3af    (placeholder text)
 1× each: #f3f4f6, #ef4444, #ebebed, #d4d6d8, #d4d4d8, #8a8d90, #2d3032, #1f2123, #10b981
 0× #e85d04    ← brand urgency orange NEVER appears in dropchina-vision.css
```

**Findings:**
- `#E85D04` (the brand's declared 10% urgency accent) is defined in `config/settings_data.json` color schemes 3, 4, 5, 6 but the active homepage uses schemes 1, 2, 3, 7. Only scheme-3 carries the orange — and that's mapped to the **primary_button_background** for the hero/promo. Yet visually in `home-desktop.png` the hero's "Ver produtos" button reads black/dark (the `.button` override at CSS lines 528–541 doesn't honor scheme tokens — it ships a generic style).
- Star ratings use `#f59e0b` (yellow-amber, CSS lines 178, 698) — fine in isolation but adds a 4th hue (white/gray + blue + yellow + black) without contributing to the brand. Consider whether 5-star reviews really need to be yellow when they could be neutral.
- Stock indicators use `#10b981` (green) and `#ef4444` (red) at lines 226, 230 — sensible semantic colors but the green isn't from a defined palette token.
- Hardcoded hex values throughout (no `var(--color-*)` indirection except the inherited Tinker tokens at lines 453, 662, 688, 1061, 1087) — makes future palette swaps painful.
- Color contrast on `#b8bbbe` footer links over `#2d3032` background ≈ 5.8:1 — passes WCAG AA.

### Pillar 4: Typography (3/4)

Inter family, weight-pair (n4/n6/n7) is correct per brand reference.

**Evidence:**
- `config/settings_data.json:1` confirms `type_body_font: inter_n4`, `type_subheading_font: inter_n6`, `type_heading_font: inter_n7` — matches brand spec exactly.
- Tinker preset sizes: H1=64, H2=44, H3=32, H4=24, H5=18, paragraph=16 — clean modular scale.
- Hero headline uses `letter-spacing: -0.02em; line-height: 1.05;` (`templates/index.json:81-82`) — Apple-grade tight display type.
- Custom CSS letter-spacing matches Apple-clean: `-0.02em` on headings (line 14), `-0.005em` on buttons (line 534), `-0.01em` on prices (line 146).

**Findings:**
- 10 distinct font-sizes in `dropchina-vision.css`: `0.6875rem, 0.75rem, 0.8125rem, 0.875rem, 0.9rem, 0.9375rem, 1rem, 1.75rem, clamp(1.75rem,...)`. The `0.9rem` value at line 700 (`.testimonial-card__rating`) is an off-scale outlier — every other small size is `0.875rem` or smaller. Drop it to `0.875rem` for consistency.
- The custom CSS overrides `font-size` with `!important` 16+ times (lines 78, 133, 145, 152, 157, 421, 449, 622, etc.) — when Shopify's customizer ships a font-size setting, the override wins silently. Theme editors won't be able to change font sizes from the admin UI.
- No fluid type ramp for body — only the section title uses `clamp(1.75rem, 3vw, 2.5rem)` (line 871). Headlines stay fixed-large on mobile (`templates/index.json:75` is `<h1>Tecnologia para sua<br>casa e escritório</h1>` — the `<br>` forces a 2-line break at every viewport).

### Pillar 5: Spacing (3/4)

Section rhythm is good; component-level radii are noisy.

**Section padding evidence:**
- Hero: 64px block (`templates/index.json:231`)
- Categories: 64px top / 32px bottom (line 505)
- Best sellers: 32px top / 64px bottom (line 741) — note asymmetry vs categories (intentional? it stacks correctly only because categories pad-bottom 32 + bestsellers pad-top 32 = 64 combined gap)
- Promo banner: 0/0 (line 877) — relies on adjacent section padding
- New arrivals: 64/32 (line 1140)
- Testimonials: 80/80 (line 1402) — most generous, appropriate for "social proof" climax
- Story: 64/64 (line 1349)

These add up to a calm vertical rhythm: 64-80px breathing room everywhere, exactly what VISION uses.

**Findings:**
- **19 distinct border-radius values** in `dropchina-vision.css` (see Top Fix #3): `0, 10px, 12px, 16px, 18px, 20px, 24px, 28px, 50%, 999px, inherit` plus compound corner values. The brand reference calls for "12-18px" on product cards — the implementation lands at 18px (`.product-card` line 26), which is fine, but 20px on collection-cards, 16px on testimonials, 22-28px on hero creates 6 different "card roundings" within one viewport.
- Card internal padding is consistent: 12px-16px-20px-32px tier visible across `.product-card .group-block` (line 105: `12px 16px 16px`), `.collection-card__content` (line 489: `20px`), `.banner-card` (line 287: `32px`), `.testimonial-card` (line 683: `28px`). Reasonable.
- Marquee gap=56px (line 511) ties the trust-marquee tightly to the brand-reference's "generous whitespace" between icons.
- Header row top/bottom: 14px/10px (lines 309, 316) — could be 16/12 for a more Apple-generous header but acceptable.
- No arbitrary `clamp()` outliers besides the section title and section padding helpers.

### Pillar 6: Experience Design (2/4)

States are partially covered; the override-heavy CSS is a fragility risk.

**State coverage:**
- **Loading:** Not surfaced in the custom CSS. Tinker likely ships skeletons but no audit of `loading` selectors in `dropchina-vision.css`.
- **Error:** No explicit error states added. Tinker handles form errors via base CSS.
- **Empty:** `.product-card-gallery__title-placeholder` (lines 63-79) is the only added empty state — and it's the wrong direction (makes empty cards quieter, not more useful). See Top Fix #1.
- **Hover:** Strong — cards lift 4px with blue-tinted shadow (line 36-39), buttons lift 1px (line 538-541), collection cards 2px (line 472-476), images scale 1.04 (line 58-60). All using `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard easing) — feels good.
- **Focus:** Inputs get `box-shadow: 0 0 0 4px rgba(15, 79, 168, 0.1)` (lines 363, 854). Good — that's a 4px brand-blue focus ring with low alpha. **But:** buttons don't get an explicit focus-visible style — they inherit Tinker's defaults, which may not match the input ring aesthetically.
- **Disabled:** No disabled-state styling added in custom CSS.
- **Quick-add:** `quick_add: true` and `mobile_quick_add: true` are set in `settings_data.json` line 1 — confirmed working post the recent overflow fix.

**Concerns:**
- **97 `!important` declarations** in a 882-line CSS file (`grep -c '!important' dropchina-vision.css` = 97). That's 11% of lines. Every theme-editor change in Shopify admin that targets these properties will be silently overridden. When the next dev wants to tweak a font-size, they'll have to add another `!important` — the file is on a one-way ratchet toward unmaintainability.
- **No `prefers-reduced-motion` support.** Lines 27-29, 535, 805 use 200-600ms transitions and `translateY` transforms — accessible users with vestibular sensitivity have no escape hatch. Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.
- **No skip-to-content link** visible in the rendered HTML (`curl ... | grep -i "skip"` returned 0 results from the homepage). Tinker may inject one — verify with the theme-check linter.
- **Cart count badge has no `aria-label`** (lines 386-405) — screen readers read it as a number with no context. Add an `aria-label="{N} items in cart"` to the parent element in `blocks/_header-logo.liquid` or the corresponding cart-icon block.
- **Mix-blend-mode multiply** on product card images (line 56) is clever for transparent-bg product shots but will visually break the moment a product has a non-white solid background or a busy lifestyle photo — verify the upload workflow expects clean cutouts.
- Testimonial cards have `aria-label="{N} de 5 estrelas"` on the rating div (`sections/testimonials.liquid:29`) and `aria-hidden="true"` on the avatar initial — solid accessibility on that one component.

---

## Files Audited

- `theme/assets/dropchina-vision.css` (882 lines — primary override surface)
- `theme/config/settings_data.json` (color schemes, font tokens, cart settings)
- `theme/templates/index.json` (homepage section composition + copy)
- `theme/sections/testimonials.liquid` (custom testimonial section)
- `theme/sections/footer.liquid` (footer grid logic)
- `theme/sections/header.liquid`, `theme/sections/hero.liquid` (sampled)
- `theme/blocks/*.liquid` (catalogued; `_product-card.liquid`, `_product-card-gallery.liquid`, `_product-card-group.liquid` referenced)

**Rendered surfaces audited via screenshot:**
- Homepage @ 1440×900 — `screenshots-20260516-145449/home-desktop.png`
- Homepage @ 768×1024 — `screenshots-20260516-145449/home-tablet.png`
- Homepage @ 375×812 — `screenshots-20260516-145449/home-mobile.png`
- `/collections/all` @ 1440×900 — `screenshots-20260516-145449/collection-desktop.png`
- `/collections/all` @ 375×812 — `screenshots-20260516-145449/collection-mobile.png`

**Content / data observations (not scored):**
- Homepage `best_sellers` and `second_collection` are bound to `"collection": "all"` (templates/index.json:726, 1125) which currently surfaces a mix of imageless catalog products. The DropChina catalog (cartridges, toners, printers) is uploaded but lacks product images — this is content/operations work, not implementation, and was excluded from the pillar scoring per the audit brief.
