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
            <div className="reviews-stat-stars">
              {[0,1,2,3,4].map((i) => <I.star key={i} />)}
            </div>
            <span className="reviews-stat-num">4,9</span>
            <span className="reviews-stat-lbl">Nota média</span>
          </div>
          <div className="reviews-stat">
            <div className="reviews-stat-stars" />
            <span className="reviews-stat-num">12.480</span>
            <span className="reviews-stat-lbl">Compras avaliadas</span>
          </div>
          <div className="reviews-stat">
            <div className="reviews-stat-stars" />
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
          <div className="reviews-platform">
            <span className="reviews-platform-logo rec">ReclameAQUI</span>
            <span className="reviews-platform-meta"><b>Reputação ótima</b>8.2 / 10</span>
          </div>
          <div className="reviews-platform">
            <span className="reviews-platform-logo google">
              <span className="g-blue">G</span><span className="g-red">o</span><span className="g-yellow">o</span><span className="g-blue">g</span><span className="g-green">l</span><span className="g-red">e</span>
            </span>
            <span className="reviews-platform-meta"><b>4,8 ★</b>3.214 avaliações</span>
          </div>
          <div className="reviews-platform">
            <span className="reviews-platform-logo ml">Mercado Livre</span>
            <span className="reviews-platform-meta"><b>MercadoLíder Platinum</b>+10 mil vendas</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// =================
// Featured product showcase — PDP-style preview
// =================
const ComboBanner = () => {
  const gallery = [
    "assets/products/pcyes-gpu.png",
    "assets/products/pcyes-mini-pc.png",
    "assets/products/hp-toner-premium.png",
    "assets/products/ugreen-reader.png",
    "assets/products/hdmi-vga.png",
  ];
  const [active, setActive] = React.useState(0);
  const colors = [
    { id: "black", hex: "#0d1115", name: "Preto" },
    { id: "white", hex: "#f4f5f7", name: "Branco" },
    { id: "red", hex: "#d62828", name: "Vermelho" },
  ];
  const [color, setColor] = React.useState("black");
  const [qty, setQty] = React.useState(1);

  return (
    <section className="featured-pdp-section">
      <div className="wrap">
        <div className="featured-pdp">
          <span className="featured-pdp-eyebrow">— Produto destaque —</span>

          <div className="featured-pdp-grid">
            <div className="featured-pdp-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  className={`featured-pdp-thumb ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Foto ${i+1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>

            <div className="featured-pdp-main">
              <div className="featured-pdp-stage">
                <span className="featured-pdp-zoom" aria-label="Ampliar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M8 11h6M11 8v6" />
                  </svg>
                </span>
                <img src={gallery[active]} alt="Placa de Vídeo Pcyes RX 550" />
              </div>
            </div>

            <div className="featured-pdp-info">
              <div className="featured-pdp-brand">Pcyes</div>
              <h2 className="featured-pdp-title">Placa de Vídeo<br/>RX 550 8GB</h2>

              <div className="featured-pdp-rating">
                <span className="featured-pdp-stars">
                  {[0,1,2,3,4].map((i) => <I.star key={i} />)}
                </span>
                <b>5.0</b>
                <span className="featured-pdp-divider">·</span>
                <a href="#">870 avaliações</a>
              </div>

              <div className="featured-pdp-price-row">
                <span className="featured-pdp-price-old">R$ 1.199,00</span>
                <span className="featured-pdp-price">R$ <strong>899</strong><span className="cents">,00</span></span>
                <span className="featured-pdp-off">−25%</span>
              </div>

              <p className="featured-pdp-desc">
                A escolha gamer mais vendida da loja. 8GB GDDR5, 128-bit, suporte DirectX 12 e Display Port — pronta entrega com garantia oficial Pcyes.
              </p>

              <div className="featured-pdp-field">
                <span className="featured-pdp-field-lbl">
                  Cor: <b>{colors.find((c) => c.id === color)?.name}</b>
                </span>
                <div className="featured-pdp-swatches">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      className={`featured-pdp-swatch ${color === c.id ? "active" : ""}`}
                      style={{ background: c.hex }}
                      onClick={() => setColor(c.id)}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="featured-pdp-stock">
                <span className="featured-pdp-stock-bar"><span style={{ width: "40%" }} /></span>
                <span className="featured-pdp-stock-msg">Corre, restam apenas <b>6 unidades</b> em estoque!</span>
              </div>

              <div className="featured-pdp-actions">
                <div className="featured-pdp-qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} aria-label="Aumentar">+</button>
                </div>
                <a href="#" className="btn featured-pdp-cta">
                  Adicionar ao carrinho
                </a>
              </div>

              <ul className="featured-pdp-perks">
                <li><I.truck /> Em estoque · envio em 1-2 dias úteis</li>
                <li><I.shield /> Garantia oficial Pcyes de 12 meses</li>
                <li><I.refresh /> 7 dias para troca ou devolução</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { ProductCarousel, ReviewsSection, ComboBanner });
