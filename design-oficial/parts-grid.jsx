// =================
// Categories
// =================
const CategoryIcon = ({ name }) => {
  const map = {
    cartridge: <I.cartridge />,
    printer: <I.printer />,
    gpu: <I.gpu />,
    headset: <I.headset />,
    keyboard: <I.keyboard />,
    network: <I.network />,
    storage: <I.storage />,
    cable: <I.cable />,
    spark: <I.spark />,
  };
  return map[name] || <I.spark />;
};

// Visual shape for a category — a centered product silhouette with floor shadow
const CategoryArt = ({ kind }) => {
  const arts = {
    cartridge: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="56" ry="6" fill="rgba(13,17,21,0.10)" />
        <rect x="34" y="36" width="92" height="64" rx="6" fill="#2a3038" />
        <rect x="34" y="36" width="92" height="14" rx="6" fill="#3a414a" />
        <rect x="44" y="58" width="40" height="34" rx="2" fill="#0e8aa5" />
        <text x="80" y="80" textAnchor="middle" fill="white" style={{ font: "700 9px var(--font-mono)", letterSpacing: 1 }}>HP 667</text>
      </svg>
    ),
    printer: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="128" rx="60" ry="5" fill="rgba(13,17,21,0.10)" />
        <rect x="30" y="22" width="100" height="50" rx="6" fill="#e6e9ee" stroke="#c8cdd4" />
        <rect x="40" y="34" width="80" height="22" rx="2" fill="#fafbfc" />
        <rect x="38" y="68" width="84" height="50" rx="6" fill="#2a3038" />
        <rect x="46" y="80" width="68" height="20" rx="2" fill="#3a414a" />
        <circle cx="115" cy="78" r="3" fill="#22c55e" />
      </svg>
    ),
    gpu: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="64" ry="5" fill="rgba(13,17,21,0.10)" />
        <rect x="20" y="48" width="120" height="46" rx="4" fill="#1a1d20" />
        <rect x="28" y="56" width="40" height="30" rx="3" fill="#2a3038" />
        <rect x="74" y="56" width="40" height="30" rx="3" fill="#2a3038" />
        <circle cx="48" cy="71" r="10" fill="#0d1115" />
        <circle cx="94" cy="71" r="10" fill="#0d1115" />
        <circle cx="48" cy="71" r="5" fill="#22c55e" />
        <circle cx="94" cy="71" r="5" fill="#22c55e" />
        <rect x="120" y="58" width="20" height="26" rx="2" fill="#3a414a" />
      </svg>
    ),
    headset: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="126" rx="44" ry="4" fill="rgba(13,17,21,0.12)" />
        <path d="M40 70 Q40 30 80 30 Q120 30 120 70" fill="none" stroke="#2a3038" strokeWidth="9" strokeLinecap="round" />
        <rect x="28" y="64" width="22" height="36" rx="10" fill="#0d1115" />
        <rect x="110" y="64" width="22" height="36" rx="10" fill="#0d1115" />
        <rect x="32" y="68" width="14" height="28" rx="6" fill="#1a1d20" />
        <circle cx="39" cy="82" r="3" fill="#f59e0b" />
      </svg>
    ),
    keyboard: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="120" rx="64" ry="4" fill="rgba(13,17,21,0.10)" />
        <rect x="18" y="60" width="124" height="48" rx="6" fill="#1a1d20" />
        {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
          <rect key={i} x={26 + i*10} y="68" width="6" height="6" rx="1" fill="#3a414a" />
        ))}
        {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
          <rect key={i} x={26 + i*10} y="80" width="6" height="6" rx="1" fill="#3a414a" />
        ))}
        <rect x="36" y="92" width="80" height="8" rx="1" fill="#3a414a" />
      </svg>
    ),
    network: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="50" ry="5" fill="rgba(13,17,21,0.10)" />
        <rect x="36" y="50" width="88" height="48" rx="6" fill="#1a1d20" />
        <circle cx="56" cy="74" r="3" fill="#22c55e" />
        <circle cx="68" cy="74" r="3" fill="#22c55e" />
        <circle cx="80" cy="74" r="3" fill="#f59e0b" />
        <circle cx="92" cy="74" r="3" fill="#3a414a" />
        <path d="M50 38 L66 50 M80 32 L80 50 M110 38 L94 50" stroke="#0d1115" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="36" r="3" fill="#0d1115" />
        <circle cx="80" cy="30" r="3" fill="#0d1115" />
        <circle cx="110" cy="36" r="3" fill="#0d1115" />
      </svg>
    ),
    storage: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="46" ry="4" fill="rgba(13,17,21,0.10)" />
        <rect x="44" y="38" width="72" height="78" rx="6" fill="#2a3038" />
        <rect x="50" y="46" width="60" height="34" rx="2" fill="#1a1d20" />
        <rect x="56" y="52" width="48" height="3" rx="1.5" fill="#3a414a" />
        <rect x="56" y="60" width="36" height="3" rx="1.5" fill="#3a414a" />
        <rect x="56" y="68" width="42" height="3" rx="1.5" fill="#3a414a" />
        <circle cx="80" cy="98" r="6" fill="#1a1d20" />
        <circle cx="80" cy="98" r="2" fill="#22c55e" />
      </svg>
    ),
    cable: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="50" ry="4" fill="rgba(13,17,21,0.10)" />
        <rect x="40" y="42" width="22" height="34" rx="3" fill="#1a1d20" />
        <rect x="44" y="46" width="14" height="14" rx="2" fill="#3a414a" />
        <path d="M51 76 Q51 95 80 95 Q109 95 109 76" stroke="#1a1d20" strokeWidth="4" fill="none" />
        <rect x="98" y="42" width="22" height="34" rx="3" fill="#1a1d20" />
        <rect x="102" y="46" width="14" height="14" rx="2" fill="#3a414a" />
      </svg>
    ),
    spark: (
      <svg viewBox="0 0 160 140" width="100%" height="100%">
        <ellipse cx="80" cy="124" rx="44" ry="4" fill="rgba(13,17,21,0.10)" />
        <circle cx="80" cy="68" r="36" fill="#fef3c7" />
        <path d="M80 38 L85 60 L107 65 L88 78 L94 100 L80 86 L66 100 L72 78 L53 65 L75 60 Z" fill="#f59e0b" />
      </svg>
    ),
  };
  return <div className="cat-art">{arts[kind] || arts.spark}</div>;
};

const Categories = () => {
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Nossa loja</p>
            <h2>Confira tudo o que temos pra você</h2>
          </div>
          <a href="#" className="btn btn-outline btn-sm">Ver todas <I.arrowRight /></a>
        </div>
        <div className="cats">
          {categories.map((c) => (
            <a key={c.id} href="Listagem (PLP).html" className="cat">
              <CategoryArt kind={c.icon} />
              <div className="cat-name">{c.name}</div>
              <div className="cat-count">{c.count}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// =================
// Product placeholder art (per product) — falls back when no img
// =================
const ProductArt = ({ tone, hint, img, alt }) => {
  if (img) {
    return (
      <div className="product-img-wrap">
        <img src={img} alt={alt || hint || ""} loading="lazy" />
      </div>
    );
  }
  const palette = {
    neutral: { bg: "#eeeae0", stripe: "rgba(0,0,0,0.04)", chip: "#d6d2c6", accent: "#1f7a3a" },
    blue:    { bg: "#e3edf6", stripe: "rgba(0,40,90,0.06)", chip: "#bcd0e4", accent: "#1f5fa3" },
    orange:  { bg: "#fae7d6", stripe: "rgba(120,55,10,0.06)", chip: "#e9c8a5", accent: "#d97326" },
    dark:    { bg: "#2a2e31", stripe: "rgba(255,255,255,0.04)", chip: "#3d4347", accent: "#f5c518", text: "rgba(255,255,255,0.5)" },
    cyan:    { bg: "#dff0f4", stripe: "rgba(0,80,100,0.06)", chip: "#b5dde6", accent: "#0e8aa5" },
    neon:    { bg: "#11171f", stripe: "rgba(120,255,180,0.07)", chip: "#1e2a36", accent: "#22d36b", text: "rgba(255,255,255,0.55)" },
  };
  const p = palette[tone] || palette.neutral;
  return (
    <div
      className="product-ph"
      style={{
        background: `repeating-linear-gradient(135deg, ${p.stripe} 0 2px, transparent 2px 14px), ${p.bg}`,
        color: p.text || "rgba(0,0,0,0.45)",
      }}
    >
      {/* simple stand-in box */}
      <div style={{
        width: "55%",
        aspectRatio: "1.2 / 1",
        background: p.chip,
        borderRadius: 14,
        position: "relative",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 8px 18px -10px rgba(0,0,0,0.35)",
      }}>
        <div style={{
          width: "30%", height: "8px",
          borderRadius: 4,
          background: p.accent,
          opacity: 0.85,
        }} />
        <div style={{
          position: "absolute",
          bottom: 8, right: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 9, letterSpacing: 1,
          textTransform: "uppercase",
          color: p.text || "rgba(0,0,0,0.4)",
        }}>{hint}</div>
      </div>
    </div>
  );
};

// =================
// Product card
// =================
const Stars = ({ n }) => {
  const full = Math.round(n);
  return (
    <span className="rating">
      <span className="stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <I.star key={i} style={{ opacity: i < full ? 1 : 0.25 }} />
        ))}
      </span>
      <span>{n.toFixed(1)}</span>
    </span>
  );
};

const ProductCard = ({ p }) => {
  const s = useStore();
  const isFav = s.favs.has(p.id);
  const price = formatBRL(p.price);
  const old = p.oldPrice ? `R$ ${formatBRL(p.oldPrice).reais}` : null;
  const [bump, setBump] = React.useState(false);
  const onFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    s.toggleFav(p);
    setBump(true);
    setTimeout(() => setBump(false), 380);
  };
  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    s.addToCart(p, 1);
  };
  const stock = p.stock || { qty: 12, status: "in" };
  const colors = p.colors || ["#0d1115"];
  const tags = p.tags || [];
  return (
    <a href="PDP.html" className="card">
      <div className="card-media">
        <ProductArt tone={p.tone} hint={p.hint} img={p.img} alt={p.title} />
        {p.badge && (
          <span className={`card-badge ${p.badgeStyle || ""}`}>{p.badge}</span>
        )}
        <button
          className={`card-fav ${isFav ? "active" : ""} ${bump ? "bump" : ""}`}
          onClick={onFav}
          aria-label={isFav ? "Remover dos favoritos" : "Favoritar"}
        >
          <I.heart />
        </button>
        <button className="card-quick" onClick={onAdd}>
          <I.cart /> Adicionar ao carrinho
        </button>
        <button className="card-peek" aria-label="Ver detalhes">
          Ver detalhes
        </button>
      </div>
      <div className="card-body">
        <div className="card-brand">{p.brand}</div>
        <h4 className="card-title">{p.title}</h4>

        <div className="card-price-row">
          {old && <span className="card-price-old">{old}</span>}
          <span className="card-price">
            R$ {price.reais}<span className="cents">,{price.centavos}</span>
          </span>
          {p.discount && <span className="card-discount">{p.discount}</span>}
        </div>

        <div className="card-rating-row">
          <span className="card-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <I.star key={i} style={{ opacity: i < Math.round(p.rating) ? 1 : 0.22 }} />
            ))}
          </span>
          <span className="card-rating-num">{p.rating.toFixed(1)}</span>
          <span className="card-rating-sep">·</span>
          <span className="card-reviews">{p.reviews?.toLocaleString("pt-BR") || 0}</span>
        </div>

        <div className="card-installments">
          em <b>{p.installments.count}x R$ {p.installments.value.toFixed(2).replace(".", ",")}</b>{" "}
          {p.installments.sem_juros ? "sem juros" : ""}
        </div>
      </div>
    </a>
  );
};

// =================
// Bestsellers (with tab filters)
// =================
const BestSellers = () => {
  const tabs = ["Mais vendidos", "Cartuchos", "Toners", "Placas de vídeo", "Áudio", "Ofertas"];
  const [active, setActive] = React.useState(0);
  // Simple filter mapping (decorative).
  const filtered = React.useMemo(() => {
    if (active === 0) return products;
    const keys = ["", "cartucho|tinta", "toner", "placa", "headset|fone", "off|oferta|sale"];
    const re = new RegExp(keys[active], "i");
    const list = products.filter((p) =>
      re.test(p.title) || re.test(p.brand) || re.test(p.discount || "") || re.test(p.badge || "")
    );
    return list.length ? list : products;
  }, [active]);

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Top dessa semana</p>
            <h2>Mais vendidos</h2>
          </div>
          <div className="pill-tabs">
            {tabs.map((t, i) => (
              <button key={t} className={i === active ? "active" : ""} onClick={() => setActive(i)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="products">
          {filtered.slice(0, 10).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <a href="#" className="btn btn-outline">Ver todos os produtos <I.arrowRight /></a>
        </div>
      </div>
    </section>
  );
};

// =================
// Coupon strip
// =================
const CouponStrip = () => (
  <section className="tight" style={{ paddingTop: 12 }}>
    <div className="wrap">
      <div className="coupon-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22 }}>🎟️</span>
          <div>
            <b style={{ color: "var(--ink)" }}>Primeira compra?</b> Use o cupom{" "}
            <code>DROP10</code> e ganhe 10% OFF. Frete grátis acima de R$ 199.
          </div>
        </div>
        <a href="#" className="btn btn-sm btn-primary">Resgatar agora <I.arrowRight /></a>
      </div>
    </div>
  </section>
);

Object.assign(window, { Categories, CategoryIcon, ProductCard, BestSellers, CouponStrip, ProductArt });
