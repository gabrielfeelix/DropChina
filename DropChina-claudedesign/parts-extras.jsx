// =================
// Product carousel — horizontal scroll-snap with arrow nav
// =================
const ProductCarousel = ({ title, eyebrow, items, slug = "carousel" }) => {
  const scrollRef = React.useRef(null);
  const [canL, setCanL] = React.useState(false);
  const [canR, setCanR] = React.useState(true);

  const update = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);
  React.useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(280, el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2>{title}</h2>
          </div>
          <div className="carousel-controls">
            <button
              className="carousel-arrow"
              onClick={() => scroll(-1)}
              disabled={!canL}
              aria-label="Anterior"
            ><I.chevLeft /></button>
            <button
              className="carousel-arrow"
              onClick={() => scroll(1)}
              disabled={!canR}
              aria-label="Próximo"
            ><I.chevRight /></button>
          </div>
        </div>
        <div className="carousel-wrap">
          <div className="carousel-scroller" ref={scrollRef} data-slug={slug}>
            {items.map((p) => (
              <div className="carousel-item" key={p.id}>
                <ProductCard p={p} />
              </div>
            ))}
            <div className="carousel-end">
              <div>
                <h4>Quer ver mais?</h4>
                <p>Mais de 320 produtos nessa coleção</p>
                <a href="#" className="btn btn-light btn-sm" style={{ marginTop: 12 }}>
                  Ver tudo <I.arrowRight />
                </a>
              </div>
            </div>
          </div>
          <div className="carousel-fade left" style={{ opacity: canL ? 1 : 0 }} />
          <div className="carousel-fade right" style={{ opacity: canR ? 1 : 0 }} />
        </div>
      </div>
    </section>
  );
};

// =================
// Reviews — verified customer testimonials
// =================
const reviews = [
  {
    id: 1,
    name: "Mariana A.",
    initials: "MA",
    role: "Comprou Toner Evolut 105a",
    rating: 5,
    date: "há 3 dias",
    text: "Chegou em 2 dias úteis, embalagem impecável e a impressão ficou idêntica à do toner original. Já é minha 3ª compra na DropChina.",
    accent: "#1f7a3a",
    verified: true,
  },
  {
    id: 2,
    name: "Rafael S.",
    initials: "RS",
    role: "Comprou Placa de Vídeo GT 730",
    rating: 5,
    date: "há 1 semana",
    text: "Atendimento via WhatsApp foi rápido pra tirar dúvidas sobre compatibilidade. A placa veio lacrada, em perfeito estado e funcionou de primeira.",
    accent: "#7c3aed",
    verified: true,
  },
  {
    id: 3,
    name: "Carla B.",
    initials: "CB",
    role: "Comprou Headset JBL Quantum 100",
    rating: 5,
    date: "há 2 semanas",
    text: "Som muito bom, confortável pra usar o dia todo. Comprei pra empresa em quantidade e ganhei desconto de revendedor. Recomendo.",
    accent: "#d62828",
    verified: true,
  },
];

const ReviewsSection = () => (
  <section style={{ background: "var(--surface-3)" }}>
    <div className="wrap">
      <div className="reviews-head">
        <div>
          <p className="eyebrow">Avaliações verificadas</p>
          <h2>4,9 / 5 em mais de 12 mil compras</h2>
        </div>
        <div className="reviews-stats">
          <div className="reviews-stat">
            <span className="reviews-stat-num">4,9</span>
            <div className="reviews-stat-stars">
              {[0,1,2,3,4].map((i) => <I.star key={i} />)}
            </div>
            <span className="reviews-stat-lbl">Nota média</span>
          </div>
          <div className="reviews-stat">
            <span className="reviews-stat-num">12.480</span>
            <span className="reviews-stat-lbl">Compras avaliadas</span>
          </div>
          <div className="reviews-stat">
            <span className="reviews-stat-num">98%</span>
            <span className="reviews-stat-lbl">Recomendam a loja</span>
          </div>
        </div>
      </div>

      <div className="reviews-grid">
        {reviews.map((r) => (
          <article key={r.id} className="review">
            <div className="review-head">
              <div className="review-avatar" style={{ background: r.accent }}>
                {r.initials}
              </div>
              <div>
                <div className="review-name">
                  {r.name}
                  {r.verified && (
                    <span className="review-verified" title="Compra verificada">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                  )}
                </div>
                <div className="review-role">{r.role}</div>
              </div>
            </div>
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <I.star key={i} style={{ opacity: i < r.rating ? 1 : 0.2 }} />
              ))}
              <span className="review-date">· {r.date}</span>
            </div>
            <p className="review-text">"{r.text}"</p>
            <div className="review-helpful">
              <button>👍 Útil</button>
              <button>💬 Comentar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="reviews-foot">
        <div className="reviews-platforms">
          <span><b>Reclame Aqui</b> · Reputação ótima</span>
          <span><b>Google</b> · 4,8 (3.214 avaliações)</span>
          <span><b>Mercado Livre</b> · MercadoLíder Platinum</span>
        </div>
        <a href="#" className="btn btn-outline btn-sm">Ver todas as avaliações <I.arrowRight /></a>
      </div>
    </div>
  </section>
);

// =================
// Combo banner — extra commercial section after Atacado
// =================
const ComboBanner = () => (
  <section>
    <div className="wrap">
      <div className="combo">
        <div className="combo-side">
          <div className="combo-deal">
            <span className="combo-deal-tag">Combo do mês</span>
            <div className="combo-deal-price">
              <span className="combo-deal-old">de R$ 269</span>
              <div className="combo-deal-new">
                R$ <strong>189</strong><span className="cents">,90</span>
              </div>
              <span className="combo-deal-off">−30% OFF</span>
            </div>
            <ul className="combo-deal-items">
              <li><span className="combo-check">✓</span> Cartucho HP 667 Preto</li>
              <li><span className="combo-check">✓</span> Cartucho HP 667 Colorido</li>
              <li><span className="combo-check">✓</span> 200 folhas Papel Glossy A4</li>
            </ul>
            <a href="#" className="btn btn-primary">Quero esse combo <I.arrowRight /></a>
            <div className="combo-timer">
              <span className="combo-timer-lbl">Termina em</span>
              <div className="combo-timer-blocks">
                <span><b>02</b>d</span>
                <span><b>14</b>h</span>
                <span><b>37</b>m</span>
                <span><b>09</b>s</span>
              </div>
            </div>
          </div>
        </div>
        <div className="combo-art">
          <div className="combo-blob a" />
          <div className="combo-blob b" />
          <div className="combo-blob c" />
          <div className="combo-products">
            <div className="combo-product p1">
              <ProductArt tone="cyan" hint="HP 667 black" />
            </div>
            <div className="combo-product p2">
              <ProductArt tone="cyan" hint="HP 667 color" />
            </div>
            <div className="combo-product p3">
              <ProductArt tone="orange" hint="Photo paper" />
            </div>
          </div>
          <span className="combo-badge">3 itens em 1</span>
        </div>
      </div>
    </div>
  </section>
);

Object.assign(window, { ProductCarousel, ReviewsSection, ComboBanner });
