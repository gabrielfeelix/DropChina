// =================
// PLP — Listagem de Produtos por Categoria
// =================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d62828"
}/*EDITMODE-END*/;

// Selected category context (would normally come from URL)
const currentCategory = {
  slug: "cartuchos-toners",
  name: "Cartuchos & Toners",
  parent: "Impressão",
  description: "Cartuchos originais e compatíveis para HP, Canon, Epson, Brother, Samsung e mais. Tudo com garantia e envio em 24h.",
  count: 1289,
};

const Breadcrumb = () => (
  <nav className="breadcrumb">
    <div className="wrap">
      <a href="DropChina Homepage.html">Home</a>
      <span>›</span>
      <a href="#">{currentCategory.parent}</a>
      <span>›</span>
      <span className="current">{currentCategory.name}</span>
    </div>
  </nav>
);

const PageHero = () => (
  <section className="plp-hero">
    <div className="wrap">
      <p className="eyebrow">{currentCategory.parent.toUpperCase()}</p>
      <h1>{currentCategory.name}</h1>
      <p className="plp-hero-desc">{currentCategory.description}</p>
      <div className="plp-hero-meta">
        <span><b>{currentCategory.count.toLocaleString("pt-BR")}</b> produtos</span>
        <span className="dot" />
        <span>Frete grátis acima de R$ 199</span>
        <span className="dot" />
        <span>Em até 18x sem juros</span>
      </div>
    </div>
  </section>
);

// Filters
const FilterSidebar = ({ filters, setFilters }) => {
  const brands = [
    { id: "hp", name: "HP", count: 142 },
    { id: "canon", name: "Canon", count: 96 },
    { id: "epson", name: "Epson", count: 84 },
    { id: "brother", name: "Brother", count: 62 },
    { id: "evolut", name: "Evolut", count: 58 },
    { id: "samsung", name: "Samsung", count: 41 },
    { id: "pantum", name: "Pantum", count: 28 },
  ];
  const colors = [
    { id: "black", label: "Preto", hex: "#0d1115" },
    { id: "color", label: "Colorido", hex: "linear-gradient(135deg,#0ea5e9 0%,#f59e0b 50%,#d946ef 100%)" },
    { id: "ciano", label: "Ciano", hex: "#06b6d4" },
    { id: "magenta", label: "Magenta", hex: "#d946ef" },
    { id: "amarelo", label: "Amarelo", hex: "#f59e0b" },
  ];

  const togglePill = (key, value) => {
    setFilters((f) => {
      const cur = new Set(f[key] || []);
      cur.has(value) ? cur.delete(value) : cur.add(value);
      return { ...f, [key]: [...cur] };
    });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-head">
        <h3>Filtros</h3>
        <button
          className="filter-clear"
          onClick={() => setFilters({ brands: [], colors: [], rating: 0, inStock: false, price: [0, 2000] })}
        >Limpar tudo</button>
      </div>

      {/* Active filter chips */}
      {(filters.brands.length || filters.colors.length || filters.inStock || filters.rating > 0) ? (
        <div className="filter-active">
          {filters.brands.map((b) => (
            <button key={b} className="filter-chip" onClick={() => togglePill("brands", b)}>
              {brands.find((x) => x.id === b)?.name} ×
            </button>
          ))}
          {filters.colors.map((c) => (
            <button key={c} className="filter-chip" onClick={() => togglePill("colors", c)}>
              {colors.find((x) => x.id === c)?.label} ×
            </button>
          ))}
          {filters.inStock && (
            <button className="filter-chip" onClick={() => setFilters((f) => ({ ...f, inStock: false }))}>
              Pronta entrega ×
            </button>
          )}
          {filters.rating > 0 && (
            <button className="filter-chip" onClick={() => setFilters((f) => ({ ...f, rating: 0 }))}>
              {filters.rating}★ ou mais ×
            </button>
          )}
        </div>
      ) : null}

      <details className="filter-group" open>
        <summary>Categoria</summary>
        <div className="filter-body">
          <ul className="filter-tree">
            <li className="active">Cartuchos & Toners <span>1.289</span></li>
            <li>↳ Cartuchos HP <span>342</span></li>
            <li>↳ Cartuchos Canon <span>196</span></li>
            <li>↳ Toners Compatíveis <span>284</span></li>
            <li>↳ Cartuchos Epson <span>175</span></li>
          </ul>
        </div>
      </details>

      <details className="filter-group" open>
        <summary>Preço</summary>
        <div className="filter-body">
          <div className="filter-price">
            <div className="filter-price-bar">
              <div className="filter-price-fill" style={{
                left: `${(filters.price[0] / 2000) * 100}%`,
                right: `${100 - (filters.price[1] / 2000) * 100}%`,
              }} />
              <input type="range" min={0} max={2000} step={10}
                value={filters.price[0]}
                onChange={(e) => setFilters((f) => ({ ...f, price: [Math.min(+e.target.value, f.price[1] - 50), f.price[1]] }))} />
              <input type="range" min={0} max={2000} step={10}
                value={filters.price[1]}
                onChange={(e) => setFilters((f) => ({ ...f, price: [f.price[0], Math.max(+e.target.value, f.price[0] + 50)] }))} />
            </div>
            <div className="filter-price-inputs">
              <input value={`R$ ${filters.price[0]}`} readOnly aria-label="Preço mínimo" />
              <span className="filter-price-sep">—</span>
              <input value={`R$ ${filters.price[1]}`} readOnly aria-label="Preço máximo" />
            </div>
            <div className="filter-price-quick">
              {[
                { lbl: "Até R$ 50", range: [0, 50] },
                { lbl: "R$ 50 a 150", range: [50, 150] },
                { lbl: "R$ 150 a 500", range: [150, 500] },
                { lbl: "Acima R$ 500", range: [500, 2000] },
              ].map((q) => (
                <button key={q.lbl} onClick={() => setFilters((f) => ({ ...f, price: q.range }))}>
                  {q.lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>

      <details className="filter-group" open>
        <summary>Marca</summary>
        <div className="filter-body">
          {brands.map((b) => (
            <label key={b.id} className="filter-check">
              <input type="checkbox" checked={filters.brands.includes(b.id)} onChange={() => togglePill("brands", b.id)} />
              <span className="filter-check-box" />
              <span className="filter-check-lbl">{b.name}</span>
              <span className="filter-count">{b.count}</span>
            </label>
          ))}
          <button className="filter-show-more">+ Ver mais marcas</button>
        </div>
      </details>

      <details className="filter-group">
        <summary>Cor</summary>
        <div className="filter-body">
          <div className="filter-swatches">
            {colors.map((c) => (
              <button
                key={c.id}
                className={`filter-swatch ${filters.colors.includes(c.id) ? "active" : ""}`}
                onClick={() => togglePill("colors", c.id)}
                title={c.label}
                style={{ background: c.hex.startsWith("linear") ? c.hex : c.hex }}
              />
            ))}
          </div>
        </div>
      </details>

      <details className="filter-group">
        <summary>Avaliação</summary>
        <div className="filter-body">
          {[5, 4, 3, 2].map((r) => (
            <label key={r} className={`filter-check ${filters.rating === r ? "active-radio" : ""}`}>
              <input type="radio" name="rating"
                checked={filters.rating === r}
                onChange={() => setFilters((f) => ({ ...f, rating: r }))} />
              <span className="filter-check-box round" />
              <span className="filter-check-lbl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <I.star key={i} style={{ color: i < r ? "#f1a900" : "#d8d3c8" }} />
                ))}
                <span style={{ marginLeft: 6, fontSize: 13 }}>e acima</span>
              </span>
            </label>
          ))}
        </div>
      </details>

      <details className="filter-group">
        <summary>Disponibilidade</summary>
        <div className="filter-body">
          <label className="filter-check">
            <input type="checkbox" checked={filters.inStock} onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))} />
            <span className="filter-check-box" />
            <span className="filter-check-lbl">Pronta entrega</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" />
            <span className="filter-check-box" />
            <span className="filter-check-lbl">Em oferta</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" />
            <span className="filter-check-box" />
            <span className="filter-check-lbl">Frete grátis</span>
          </label>
        </div>
      </details>
    </aside>
  );
};

const Toolbar = ({ sort, setSort, view, setView, count }) => {
  const sorts = [
    { v: "relevance", lbl: "Mais relevantes" },
    { v: "best", lbl: "Mais vendidos" },
    { v: "price-asc", lbl: "Menor preço" },
    { v: "price-desc", lbl: "Maior preço" },
    { v: "rating", lbl: "Melhor avaliados" },
    { v: "newest", lbl: "Lançamentos" },
  ];
  return (
    <div className="plp-toolbar">
      <div className="plp-count">
        <b>{count}</b> resultados em <b>{currentCategory.name}</b>
      </div>
      <div className="plp-toolbar-right">
        <label className="plp-sort">
          <span>Ordenar por:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {sorts.map((s) => <option key={s.v} value={s.v}>{s.lbl}</option>)}
          </select>
        </label>
        <div className="plp-view">
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grade">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>
          </button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="Lista">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ page, total, onPick }) => (
  <div className="pagination">
    <button disabled={page === 1} onClick={() => onPick(page - 1)}><I.chevLeft /> Anterior</button>
    <div className="pagination-pages">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} className={i + 1 === page ? "active" : ""} onClick={() => onPick(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
    <button disabled={page === total} onClick={() => onPick(page + 1)}>Próximo <I.arrowRight /></button>
  </div>
);

const InlineBanner = () => (
  <div className="plp-inline-banner">
    <div>
      <p className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>Cupom especial</p>
      <h3>Use <code>CART15</code> e ganhe<br />15% OFF em cartuchos</h3>
    </div>
    <a href="#" className="btn btn-light">Resgatar <I.arrowRight /></a>
  </div>
);

// Main PLP App
const PLP = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [filters, setFilters] = React.useState({
    brands: [], colors: [], rating: 0, inStock: false, price: [0, 2000],
  });
  const [sort, setSort] = React.useState("relevance");
  const [view, setView] = React.useState("grid");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  // Filter + sort
  const filtered = React.useMemo(() => {
    let arr = [...allProducts];
    if (filters.brands.length) {
      arr = arr.filter((p) => filters.brands.some((b) =>
        new RegExp(b, "i").test(p.brand)
      ));
    }
    if (filters.rating > 0) arr = arr.filter((p) => p.rating >= filters.rating);
    arr = arr.filter((p) => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    if (sort === "best") arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    return arr;
  }, [filters, sort]);

  return (
    <StoreProvider>
      <Announce />
      <TopBar />
      <Header />
      <Nav />
      <Breadcrumb />
      <PageHero />

      <main className="plp-main">
        <div className="wrap plp-layout">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <div className="plp-content">
            <Toolbar sort={sort} setSort={setSort} view={view} setView={setView} count={filtered.length} />

            <div className={`plp-grid ${view === "list" ? "list" : ""}`}>
              {filtered.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
              <InlineBanner />
              {filtered.slice(8).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>

            <Pagination page={page} total={8} onPick={setPage} />
          </div>
        </div>
      </main>

      <BrandStrip />
      <Newsletter />
      <Footer />
    </StoreProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<PLP />);
