// =================
// PDP — Product Detail Page
// =================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d62828"
}/*EDITMODE-END*/;

// Pick the featured product (could come from URL in real Shopify)
const pdpProduct = {
  id: "pcyes-rx550",
  brand: "Pcyes",
  title: "Placa de Vídeo Pcyes RX 550 8GB GDDR5",
  subtitle: "GPU gamer · 128-bit · DirectX 12",
  price: 899,
  oldPrice: 1199,
  installments: { count: 12, value: 74.92, sem_juros: true },
  rating: 4.8,
  reviews: 870,
  description:
    "A escolha gamer mais vendida da loja. 8GB GDDR5, 128-bit e suporte DirectX 12 — pronta entrega com garantia oficial Pcyes. Compatível com PCIe 3.0 e fontes a partir de 400W.",
  longDescription:
    "Projetada para entregar performance em 1080p com excelente eficiência energética, a Pcyes RX 550 8GB combina o chip AMD Radeon RX 550 com 8GB de memória GDDR5, oferecendo um excelente custo-benefício para jogos competitivos, edição de vídeo e produtividade.",
  sku: "PYS-RX550-8GB",
  gallery: [
    "assets/products/pcyes-gpu.png",
    "assets/products/pcyes-mini-pc.png",
    "assets/products/hp-toner-premium.png",
    "assets/products/ugreen-reader.png",
    "assets/products/byqualy-toner.png",
  ],
  variants: {
    color: [
      { id: "preta", label: "Preta", hex: "#0d1115" },
      { id: "vermelha", label: "Vermelha", hex: "#d62828" },
      { id: "verde", label: "Verde", hex: "#1f7a3a" },
    ],
    memory: [
      { id: "4gb", label: "4GB" },
      { id: "8gb", label: "8GB" },
    ],
  },
  tags: ["GAMER", "MAIS VENDIDO"],
  highlights: [
    { icon: "🎮", num: "8GB", lbl: "GDDR5" },
    { icon: "⚡", num: "128", lbl: "bit" },
    { icon: "🖥️", num: "DX12", lbl: "DirectX" },
    { icon: "🔌", num: "PCIe", lbl: "3.0 x16" },
    { icon: "🌡️", num: "50W", lbl: "TDP" },
  ],
};

const Breadcrumb = () => (
  <nav className="breadcrumb" aria-label="Você está aqui">
    <div className="wrap">
      <a href="DropChina Homepage.html" className="breadcrumb-home">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
        </svg>
        Home
      </a>
      <span className="breadcrumb-sep">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
      </span>
      <a href="Listagem (PLP).html" className="breadcrumb-crumb">Placas de Vídeo</a>
      <span className="breadcrumb-sep">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
      </span>
      <span className="breadcrumb-current">{pdpProduct.title}</span>
    </div>
  </nav>
);

// =================
// Image Gallery — left column
// =================
const Gallery = ({ active, setActive }) => {
  const scrollRef = React.useRef(null);
  return (
    <div className="pdp-gallery">
      <div className="pdp-thumbs">
        {pdpProduct.gallery.map((src, i) => (
          <button
            key={i}
            className={`pdp-thumb ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Foto ${i+1}`}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
      <div className="pdp-stage" ref={scrollRef}>
        <button
          className="pdp-stage-nav prev"
          onClick={() => setActive((active - 1 + pdpProduct.gallery.length) % pdpProduct.gallery.length)}
          aria-label="Anterior"
        ><I.chevLeft /></button>
        <button
          className="pdp-stage-nav next"
          onClick={() => setActive((active + 1) % pdpProduct.gallery.length)}
          aria-label="Próxima"
        ><I.chevRight /></button>
        <button className="pdp-stage-zoom" aria-label="Ampliar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" />
          </svg>
        </button>
        <img className="pdp-stage-img" src={pdpProduct.gallery[active]} alt={pdpProduct.title} />
      </div>
    </div>
  );
};

// =================
// Info column — right
// =================
const PdpInfo = ({ color, setColor, memory, setMemory, qty, setQty, onAdd }) => {
  const price = formatBRL(pdpProduct.price);
  return (
    <div className="pdp-info">
      <div className="pdp-info-tags">
        {pdpProduct.tags.map((t) => (
          <span key={t} className={`pdp-tag ${t === "MAIS VENDIDO" ? "best" : ""}`}>{t}</span>
        ))}
      </div>
      <div className="pdp-brand">{pdpProduct.brand}</div>
      <h1 className="pdp-title">{pdpProduct.title}</h1>
      <p className="pdp-subtitle">{pdpProduct.subtitle}</p>

      <div className="pdp-rating">
        <span className="pdp-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <I.star key={i} style={{ opacity: i < Math.round(pdpProduct.rating) ? 1 : 0.2 }} />
          ))}
        </span>
        <b>{pdpProduct.rating.toFixed(1)}</b>
        <span className="pdp-rating-dot">·</span>
        <a href="#reviews">{pdpProduct.reviews.toLocaleString("pt-BR")} avaliações</a>
        <span className="pdp-rating-dot">·</span>
        <span className="pdp-sku">SKU {pdpProduct.sku}</span>
      </div>

      <div className="pdp-price">
        <span className="pdp-price-old">R$ {formatBRL(pdpProduct.oldPrice).reais},{formatBRL(pdpProduct.oldPrice).centavos}</span>
        <span className="pdp-price-new">
          R$ <strong>{price.reais}</strong><span className="cents">,{price.centavos}</span>
        </span>
        <span className="pdp-price-off">−25%</span>
      </div>
      <div className="pdp-installments">
        em <b>{pdpProduct.installments.count}x R$ {pdpProduct.installments.value.toFixed(2).replace(".", ",")}</b> sem juros
        <span className="pix-pill">ou <b>R$ {(pdpProduct.price * 0.9).toFixed(2).replace(".", ",")}</b> no Pix · <b>10% OFF</b></span>
      </div>

      <p className="pdp-desc-short">{pdpProduct.description}</p>

      <div className="pdp-field">
        <div className="pdp-field-head">
          <span>Cor: <b>{pdpProduct.variants.color.find((c) => c.id === color)?.label}</b></span>
        </div>
        <div className="pdp-swatches">
          {pdpProduct.variants.color.map((c) => (
            <button
              key={c.id}
              className={`pdp-swatch ${color === c.id ? "active" : ""}`}
              style={{ background: c.hex }}
              onClick={() => setColor(c.id)}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="pdp-field">
        <div className="pdp-field-head">
          <span>Memória: <b>{pdpProduct.variants.memory.find((m) => m.id === memory)?.label}</b></span>
          <a href="#" className="pdp-field-help"><I.spark style={{width:14,height:14}} /> Guia de memória</a>
        </div>
        <div className="pdp-pills">
          {pdpProduct.variants.memory.map((m) => (
            <button
              key={m.id}
              className={`pdp-pill ${memory === m.id ? "active" : ""}`}
              onClick={() => setMemory(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pdp-ship-calc">
        <div className="pdp-ship-calc-head">
          <I.truck /> Calcular frete e prazo
        </div>
        <div className="pdp-ship-calc-row">
          <input placeholder="00000-000" defaultValue="01310-100" />
          <button>Calcular</button>
        </div>
      </div>

      <div className="pdp-actions">
        <div className="pdp-qty">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="Aumentar">+</button>
        </div>
        <button className="btn pdp-add" onClick={onAdd}>
          <I.cart /> Adicionar ao carrinho
        </button>
      </div>
      <a href="Checkout.html" className="btn pdp-buy" style={{ display: "none" }}>Comprar agora</a>

      <div className="pdp-trust">
        <div className="pdp-trust-item">
          <I.truck />
          <div>
            <b>Frete grátis</b>
            <span>Em compras acima de R$ 199</span>
          </div>
        </div>
        <div className="pdp-trust-item">
          <I.shield />
          <div>
            <b>Garantia oficial</b>
            <span>12 meses Pcyes</span>
          </div>
        </div>
        <div className="pdp-trust-item">
          <I.refresh />
          <div>
            <b>Troca fácil</b>
            <span>7 dias para devolução</span>
          </div>
        </div>
      </div>

      <div className="pdp-payment-card">
        <div className="pdp-payment-row">
          <span className="pdp-payment-lbl">Pagamento</span>
          <div className="pdp-payment-icons">
            {["PIX", "VISA", "MASTER", "ELO", "AMEX", "BOLETO"].map((p) => (
              <span key={p} className="pay-chip small">{p}</span>
            ))}
          </div>
        </div>
        <div className="pdp-payment-row">
          <span className="pdp-payment-lbl">Segurança</span>
          <div className="pdp-payment-icons">
            <span className="pdp-secure-chip"><I.shield /> SSL 256</span>
            <span className="pdp-secure-chip">LGPD</span>
            <span className="pdp-secure-chip">Cloudflare</span>
          </div>
        </div>
      </div>

      <div className="pdp-share">
        <span>Compartilhar:</span>
        <a href="#" aria-label="Facebook"><I.facebook /></a>
        <a href="#" aria-label="Instagram"><I.instagram /></a>
        <a href="#" aria-label="WhatsApp"><I.whatsapp /></a>
        <a href="#" aria-label="Copiar link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        </a>
      </div>
    </div>
  );
};

// =================
// Description sections — replicable editorial blocks
// =================
const DescriptionEditorial = () => (
  <section className="pdp-desc">
    <div className="wrap">
      {/* HERO BLOCK */}
      <div className="desc-block desc-hero">
        <span className="desc-eyebrow">— Placas de Vídeo —</span>
        <h2 className="desc-title">Pcyes RX 550 8GB</h2>
        <p className="desc-subtitle">Performance que acompanha seu ritmo</p>
        <div className="desc-hero-art">
          <img src="assets/products/pcyes-gpu.png" alt="Pcyes RX 550" />
        </div>
      </div>

      {/* INTRO BLOCK */}
      <div className="desc-block desc-intro">
        <h3 className="desc-h3">A RX 550</h3>
        <p className="desc-intro-text">
          {pdpProduct.longDescription}
        </p>
      </div>

      {/* 3-UP IMAGE GRID */}
      <div className="desc-block desc-grid">
        <div className="desc-grid-cell big">
          <img src="assets/products/pcyes-gpu.png" alt="" />
          <div className="desc-grid-cap">
            <h4>Design próprio Pcyes</h4>
            <p>Nossa GPU foi projetada para refrigeração eficiente, com duas fans em paralelo e dissipador de cobre.</p>
          </div>
        </div>
        <div className="desc-grid-cell">
          <img src="assets/products/pcyes-gpu.png" alt="" />
        </div>
        <div className="desc-grid-cell">
          <img src="assets/products/pcyes-gpu.png" alt="" />
        </div>
      </div>

      {/* VARIANT BLOCK */}
      <div className="desc-block desc-variants">
        <h3 className="desc-h3">Estilo pra todos os gostos</h3>
        <p className="desc-subtitle small">Outras versões estão disponíveis, elaboradas para todos os perfis de setup</p>
        <div className="desc-variants-row">
          <div className="desc-variant-card">
            <img src="assets/products/pcyes-gpu.png" alt="RX 550 Preta" />
            <span className="desc-variant-lbl">RX 550 — Preta</span>
          </div>
          <div className="desc-variant-card">
            <img src="assets/products/pcyes-gpu.png" alt="RX 550 Vermelha" />
            <span className="desc-variant-lbl">RX 550 — Vermelha</span>
          </div>
          <div className="desc-variant-card">
            <img src="assets/products/pcyes-gpu.png" alt="RX 550 Branca" />
            <span className="desc-variant-lbl">RX 550 — Branca</span>
          </div>
        </div>
      </div>

      {/* SPECS BLOCK */}
      <div className="desc-block desc-specs">
        <span className="desc-eyebrow small">— Raio-X do produto —</span>
        <h3 className="desc-h3">Especificações técnicas</h3>
        <div className="desc-specs-grid">
          <div className="desc-specs-table">
            <div className="spec-row"><span>Tipo</span><b>Placa de vídeo discreta</b></div>
            <div className="spec-row"><span>Chip</span><b>AMD Radeon RX 550</b></div>
            <div className="spec-row"><span>Memória</span><b>8GB GDDR5</b></div>
            <div className="spec-row"><span>Interface</span><b>128-bit</b></div>
            <div className="spec-row"><span>Barramento</span><b>PCIe 3.0 x16</b></div>
            <div className="spec-row"><span>Saídas</span><b>DisplayPort, HDMI, DVI</b></div>
            <div className="spec-row"><span>Resolução máx.</span><b>4K @ 60Hz (HDMI)</b></div>
            <div className="spec-row"><span>DirectX</span><b>12</b></div>
            <div className="spec-row"><span>Fonte recomendada</span><b>400W</b></div>
            <div className="spec-row"><span>TDP</span><b>50W</b></div>
            <div className="spec-row"><span>Garantia</span><b>12 meses Pcyes</b></div>
          </div>
          <div className="desc-specs-img">
            <img src="assets/products/pcyes-gpu.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// =================
// Pros & cons
// =================
const ProsAndCons = () => (
  <section className="pdp-pros-cons">
    <div className="wrap">
      <h3 className="desc-h3">Prós e contras</h3>
      <div className="proscons-grid">
        <div className="proscons-col pro">
          <h4>O que adoramos</h4>
          <ul>
            <li><span className="proscons-icon plus">+</span>8GB de GDDR5 — desempenho com folga em 1080p</li>
            <li><span className="proscons-icon plus">+</span>Baixo consumo (50W) e compatível com fontes a partir de 400W</li>
            <li><span className="proscons-icon plus">+</span>Suporta DirectX 12 e até 4 monitores simultâneos</li>
          </ul>
        </div>
        <div className="proscons-col con">
          <h4>Bom saber</h4>
          <ul>
            <li><span className="proscons-icon minus">−</span>Não recomendada para jogos em 1440p ou 4K em alta</li>
            <li><span className="proscons-icon minus">−</span>Requer 1 slot PCIe 3.0 x16 livre na placa-mãe</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// =================
// PDP Reviews — full reviews section
// =================
const pdpReviews = [
  {
    id: 1, name: "Rafael S.", initials: "RS", verified: true,
    rating: 5, date: "há 1 semana", role: "Comprou em 14/11/2025",
    title: "Excelente custo-benefício",
    text: "Comprei pra montar um setup gamer básico e a placa entregou tudo que prometia. Roda CS2 e Valorant em alto sem engasgar. Embalagem chegou lacrada, frete grátis e em 2 dias úteis.",
    accent: "#7c3aed",
    images: ["assets/products/pcyes-gpu.png", "assets/products/pcyes-mini-pc.png"],
  },
  {
    id: 2, name: "Mariana A.", initials: "MA", verified: true,
    rating: 5, date: "há 3 dias", role: "Comprou em 22/11/2025",
    title: "Funcionou de primeira",
    text: "Atendimento via WhatsApp foi rápido pra tirar dúvidas sobre compatibilidade com minha fonte. A placa veio nova, lacrada e funcionou de primeira. Recomendo a loja.",
    accent: "#1f7a3a",
  },
  {
    id: 3, name: "Carlos B.", initials: "CB", verified: true,
    rating: 4, date: "há 2 semanas", role: "Comprou em 08/11/2025",
    title: "Boa pra o que se propõe",
    text: "Não é uma placa pra jogos pesados em 1440p, mas pra produtividade, edição de vídeo leve e games online em 1080p resolve muito bem. Custo-benefício imbatível.",
    accent: "#0e8aa5",
  },
  {
    id: 4, name: "Júlia P.", initials: "JP", verified: true,
    rating: 5, date: "há 3 semanas", role: "Comprou em 03/11/2025",
    title: "Já é minha 2ª compra na DropChina",
    text: "Sempre tudo certo. Produto original, garantia oficial e entrega rápida. A placa instalou bem na minha placa-mãe ASRock e está rodando perfeitamente.",
    accent: "#d62828",
  },
];

const PdpReviews = () => {
  const [filter, setFilter] = React.useState("all");
  const [sort, setSort] = React.useState("recent");

  const distribution = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 16 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  const filtered = filter === "all"
    ? pdpReviews
    : pdpReviews.filter((r) => r.rating === parseInt(filter));

  return (
    <section className="pdp-reviews" id="reviews">
      <div className="wrap">
        <div className="pdp-reviews-head">
          <div>
            <p className="eyebrow">O que os clientes dizem</p>
            <h2>Avaliações verificadas</h2>
          </div>
          <a href="#" className="btn btn-outline btn-sm">Escrever avaliação</a>
        </div>

        <div className="pdp-reviews-summary">
          <div className="pdp-reviews-score">
            <div className="pdp-reviews-score-num">{pdpProduct.rating.toFixed(1)}</div>
            <div className="pdp-reviews-score-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <I.star key={i} style={{ opacity: i < Math.round(pdpProduct.rating) ? 1 : 0.2 }} />
              ))}
            </div>
            <div className="pdp-reviews-score-lbl">
              de {pdpProduct.reviews.toLocaleString("pt-BR")} avaliações
            </div>
          </div>
          <div className="pdp-reviews-dist">
            {distribution.map((d) => (
              <button
                key={d.stars}
                className={`pdp-reviews-dist-row ${filter === String(d.stars) ? "active" : ""}`}
                onClick={() => setFilter(filter === String(d.stars) ? "all" : String(d.stars))}
              >
                <span className="pdp-reviews-dist-stars">
                  {d.stars} <I.star />
                </span>
                <span className="pdp-reviews-dist-bar">
                  <span style={{ width: `${d.pct}%` }} />
                </span>
                <span className="pdp-reviews-dist-pct">{d.pct}%</span>
              </button>
            ))}
          </div>
          <div className="pdp-reviews-tags">
            <p className="eyebrow small">O que costuma ser destacado:</p>
            <div className="pdp-reviews-tag-pills">
              {[
                { lbl: "Custo-benefício", n: 142 },
                { lbl: "Embalagem segura", n: 98 },
                { lbl: "Entrega rápida", n: 87 },
                { lbl: "Funciona perfeitamente", n: 64 },
                { lbl: "Garantia oficial", n: 41 },
              ].map((t) => (
                <button key={t.lbl} className="pdp-reviews-tag-pill">
                  {t.lbl} <span>{t.n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pdp-reviews-toolbar">
          <div className="pdp-reviews-filters">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
              Todas ({pdpReviews.length})
            </button>
            <button className={filter === "5" ? "active" : ""} onClick={() => setFilter("5")}>
              5★
            </button>
            <button className={filter === "4" ? "active" : ""} onClick={() => setFilter("4")}>
              4★
            </button>
            <button className={filter === "3" ? "active" : ""} onClick={() => setFilter("3")}>
              3★ ou menos
            </button>
            <button>Com fotos</button>
          </div>
          <label className="pdp-reviews-sort">
            <span>Ordenar por:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Mais recentes</option>
              <option value="helpful">Mais úteis</option>
              <option value="rating-high">Maior nota</option>
              <option value="rating-low">Menor nota</option>
            </select>
          </label>
        </div>

        <div className="pdp-reviews-list">
          {filtered.map((r) => (
            <article key={r.id} className="pdp-review">
              <div className="pdp-review-head">
                <div className="pdp-review-avatar" style={{ background: r.accent }}>
                  {r.initials}
                </div>
                <div className="pdp-review-meta">
                  <div className="pdp-review-name">
                    {r.name}
                    {r.verified && (
                      <span className="pdp-review-verified" title="Compra verificada">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <div className="pdp-review-role">{r.role}</div>
                </div>
                <div className="pdp-review-stars-row">
                  <span className="pdp-review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <I.star key={i} style={{ opacity: i < r.rating ? 1 : 0.2 }} />
                    ))}
                  </span>
                  <span className="pdp-review-date">{r.date}</span>
                </div>
              </div>
              {r.title && <h4 className="pdp-review-title">{r.title}</h4>}
              <p className="pdp-review-text">{r.text}</p>
              {r.images && (
                <div className="pdp-review-images">
                  {r.images.map((img, i) => (
                    <div key={i} className="pdp-review-image">
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              )}
              <div className="pdp-review-actions">
                <button>👍 Útil <span>(24)</span></button>
                <button>💬 Responder</button>
                <button className="pdp-review-share">Compartilhar</button>
              </div>
            </article>
          ))}
        </div>

        <div className="pdp-reviews-more">
          <button className="btn btn-outline">Carregar mais avaliações <I.arrowRight /></button>
        </div>
      </div>
    </section>
  );
};
// =================
// You may also like
// =================
const RelatedProducts = () => {
  const related = products.slice(0, 5);
  return (
    <section className="pdp-related" id="related">
      <div className="wrap">
        <div className="pdp-related-head">
          <h2>Combina com</h2>
          <p>Produtos da mesma família</p>
        </div>
        <div className="products">
          {related.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
};

// =================
// Sticky quick-buy card (appears on scroll) — click chevron scrolls to top
// =================
const StickyBuy = ({ onAdd }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const trigger = 700;
      setShow(window.scrollY > trigger);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;
  return (
    <div className="sticky-buy">
      <button className="sticky-buy-toggle" onClick={scrollToTop} aria-label="Voltar ao topo do produto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <div className="sticky-buy-thumb">
        <img src={pdpProduct.gallery[0]} alt="" />
      </div>
      <div className="sticky-buy-meta">
        <div className="sticky-buy-title">{pdpProduct.title}</div>
        <div className="sticky-buy-price">
          <span className="strike">R$ {formatBRL(pdpProduct.oldPrice).reais}</span>
          <span className="now">R$ {formatBRL(pdpProduct.price).reais},{formatBRL(pdpProduct.price).centavos}</span>
        </div>
      </div>
      <button className="sticky-buy-add" onClick={onAdd}>
        <I.cart /> Adicionar
      </button>
    </div>
  );
};

// =================
// Main PDP App
// =================
const PDP = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = React.useState(0);
  const [color, setColor] = React.useState("preta");
  const [memory, setMemory] = React.useState("8gb");
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  // Add-to-cart wrapper that uses the store
  const handleAdd = () => {
    const s = window.__store;
    if (s) s.addToCart(pdpProduct, qty);
  };

  return (
    <StoreProvider>
      <Announce />
      <TopBar />
      <Header />
      <Nav />
      <Breadcrumb />

      <main className="pdp-main">
        <div className="wrap">
          <div className="pdp-layout">
            <Gallery active={active} setActive={setActive} />
            <StoreConsumer>
              {(s) => (
                <PdpInfo
                  color={color} setColor={setColor}
                  memory={memory} setMemory={setMemory}
                  qty={qty} setQty={setQty}
                  onAdd={() => s.addToCart(pdpProduct, qty)}
                />
              )}
            </StoreConsumer>
          </div>
        </div>
      </main>

      <DescriptionEditorial />
      <ProsAndCons />
      <PdpReviews />
      <RelatedProducts />
      <Newsletter />
      <Footer />

      <StoreConsumer>
        {(s) => <StickyBuy onAdd={() => s.addToCart(pdpProduct, qty)} />}
      </StoreConsumer>
    </StoreProvider>
  );
};

// Helper to access store inside StoreProvider's tree
const StoreConsumer = ({ children }) => {
  const s = useStore();
  return children(s);
};

ReactDOM.createRoot(document.getElementById("root")).render(<PDP />);
