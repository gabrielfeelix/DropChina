// =================
// Header / Top / Nav
// =================
const Announce = () => {
  const items = [
    "Frete GRÁTIS em compras acima de R$ 199",
    "Até 18x sem juros no cartão",
    "10% OFF no Pix em toda a loja",
    "Garantia oficial em todos os produtos",
    "Envio em até 24h para todo o Brasil",
  ];
  return (
    <div className="announce">
      <div className="marquee">
        <div className="marquee-track">
          {[...items, ...items, ...items].map((t, i) => (
            <span key={i} className="pill">
              <span className="dot" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TopBar = () => (
  <div className="topbar">
    <div className="wrap topbar-inner">
      <div className="links">
        <a href="#">Sobre</a>
        <a href="#">Blog</a>
        <a href="#">Suporte</a>
        <a href="#">Rastrear pedido</a>
        <a href="#">Contato</a>
      </div>
      <div className="right">
        <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="flag" /> Brasil (BRL R$)
        </a>
        <a href="#">PT-BR ▾</a>
        <a href="#" style={{ color: "var(--ink)", fontWeight: 600 }}>Vender no DropChina</a>
      </div>
    </div>
  </div>
);

const Logo = () => (
  <a href="#" className="logo-link" aria-label="DropChina">
    <img src="assets/dropchina-logo.png" alt="DropChina" className="logo" />
  </a>
);

const Header = () => {
  const s = useStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFocus, setSearchFocus] = React.useState(false);
  const searchWrapRef = React.useRef(null);

  // close panel on outside click
  React.useEffect(() => {
    const onDown = (e) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target)) setSearchFocus(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="header">
      <div className="wrap header-inner">
        <Logo />
        <div ref={searchWrapRef} className={`search-wrap ${searchFocus ? "focus" : ""}`}>
          <form
            className="search"
            onSubmit={(e) => { e.preventDefault(); }}
            role="search"
          >
            <input
              placeholder="Buscar cartuchos, toners, placas de vídeo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
            />
            <button type="submit" aria-label="Buscar"><I.search /></button>
          </form>
          {searchFocus && (
            <SearchPanel
              query={searchQuery}
              onPick={(q) => { setSearchQuery(q); }}
              onClose={() => setSearchFocus(false)}
            />
          )}
        </div>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Favoritos">
            <I.heart />
            {s.favCount > 0 && <span className="badge fav">{s.favCount}</span>}
          </button>
          <button className="icon-btn" aria-label="Minha conta"><I.user /></button>
          <button className="icon-btn cart-btn" aria-label="Carrinho" onClick={() => s.setCartOpen(true)}>
            <I.cart />
            <span className="badge">{s.cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Nav = () => {
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [hoveredCat, setHoveredCat] = React.useState(0);
  const closeTimer = React.useRef(null);
  const openMega = (i) => {
    clearTimeout(closeTimer.current);
    if (typeof i === "number") setHoveredCat(i);
    setMegaOpen(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  };
  // Nav link → mega-menu category index (best-effort match)
  const linkMap = [
    { label: "Cartuchos & Toners", idx: 0 },
    { label: "Placas de Vídeo", idx: 2 },
    { label: "Impressoras", idx: 1 },
    { label: "Áudio", idx: 3 },
  ];
  return (
    <nav className="nav" onMouseLeave={closeMega}>
      <div className="wrap nav-inner">
        <div className="nav-primary">
          <button
            className={`nav-cat-trigger ${megaOpen ? "open" : ""}`}
            onMouseEnter={() => openMega(0)}
            onClick={() => setMegaOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            Todas as categorias
            <I.chevDown style={{ transform: megaOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {linkMap.map((l) => (
            <a
              key={l.label}
              href="Listagem (PLP).html"
              onMouseEnter={() => openMega(l.idx)}
            >
              {l.label}
            </a>
          ))}
          <a href="Listagem (PLP).html" onMouseEnter={() => setMegaOpen(false)}>
            Ofertas <span className="nav-tag">−40%</span>
          </a>
        </div>
        <div className="nav-secondary">
          <a href="#" onMouseEnter={() => setMegaOpen(false)}>Atacado</a>
          <a href="#" onMouseEnter={() => setMegaOpen(false)}>Para empresas</a>
          <a href="#" onMouseEnter={() => setMegaOpen(false)}>Blog</a>
          <a href="#" onMouseEnter={() => setMegaOpen(false)}>F.A.Q.</a>
        </div>
      </div>
      <MegaMenu
        open={megaOpen}
        initialIdx={hoveredCat}
        onMouseEnter={() => clearTimeout(closeTimer.current)}
        onClose={() => setMegaOpen(false)}
      />
    </nav>
  );
};

// =================
// Trust strip
// =================
const TrustStrip = () => {
  const items = [
    { icon: <I.truck />, h: "Frete grátis", p: "Em compras a partir de R$ 199" },
    { icon: <I.shield />, h: "Garantia oficial", p: "12 meses em todos os produtos" },
    { icon: <I.refresh />, h: "Troca fácil", p: "7 dias para trocar ou devolver" },
    { icon: <I.headset />, h: "Atendimento humano", p: "Seg a sáb, das 8h às 20h" },
  ];
  return (
    <div className="trust">
      <div className="wrap">
        <div className="trust-grid">
          {items.map((it, i) => (
            <div key={i} className="trust-item">
              <div className="trust-icon">{it.icon}</div>
              <div>
                <h4>{it.h}</h4>
                <p>{it.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Announce, TopBar, Header, Nav, TrustStrip });
