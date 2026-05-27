// =================
// Global store (cart + favorites + toast)
// =================
const StoreCtx = React.createContext(null);
const useStore = () => React.useContext(StoreCtx);

const StoreProvider = ({ children }) => {
  const [cart, setCart] = React.useState([
    { id: "hp-667-duo", qty: 1 },
    { id: "jbl-quantum", qty: 1 },
  ]);
  const [favs, setFavs] = React.useState(new Set(["gt730"]));
  const [cartOpen, setCartOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const showToast = React.useCallback((msg, opts = {}) => {
    setToast({ msg, ...opts, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), opts.duration || 2600);
  }, []);

  const addToCart = React.useCallback((product, qty = 1) => {
    setCart((prev) => {
      const i = prev.findIndex((it) => it.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, qty }];
    });
    setCartOpen(true);
    showToast(`${product.brand} adicionado ao carrinho`, { kind: "cart", img: product.tone });
  }, [showToast]);

  const removeFromCart = (id) => setCart((p) => p.filter((it) => it.id !== id));
  const updateQty = (id, qty) =>
    setCart((p) => p.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));

  const toggleFav = React.useCallback((product) => {
    setFavs((prev) => {
      const next = new Set(prev);
      const was = next.has(product.id);
      if (was) next.delete(product.id);
      else next.add(product.id);
      showToast(
        was ? "Removido dos favoritos" : "Adicionado aos favoritos ❤",
        { kind: was ? "info" : "fav" }
      );
      return next;
    });
  }, [showToast]);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const favCount = favs.size;

  return (
    <StoreCtx.Provider value={{
      cart, addToCart, removeFromCart, updateQty,
      favs, toggleFav, favCount,
      cartCount, cartOpen, setCartOpen,
      searchOpen, setSearchOpen,
      showToast,
    }}>
      {children}
      <Toast toast={toast} />
      <SideCart />
    </StoreCtx.Provider>
  );
};

// =================
// Toast (bottom-left)
// =================
const Toast = ({ toast }) => {
  return (
    <div className={`toast ${toast ? "show" : ""} ${toast ? `toast-${toast.kind || "info"}` : ""}`}>
      {toast && (
        <>
          <div className="toast-icon">
            {toast.kind === "cart" ? <I.cart /> : toast.kind === "fav" ? <I.heart /> : <I.spark />}
          </div>
          <div className="toast-msg">{toast.msg}</div>
        </>
      )}
    </div>
  );
};

// =================
// SideCart drawer
// =================
const SideCart = () => {
  const s = useStore();
  const items = s.cart.map((it) => {
    const p = products.find((p) => p.id === it.id);
    return p ? { ...p, qty: it.qty } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const freeShippingTarget = 199;
  const remaining = Math.max(0, freeShippingTarget - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingTarget) * 100);
  const pixDiscount = subtotal * 0.10;

  return (
    <>
      <div
        className={`sidecart-backdrop ${s.cartOpen ? "open" : ""}`}
        onClick={() => s.setCartOpen(false)}
      />
      <aside className={`sidecart ${s.cartOpen ? "open" : ""}`} aria-hidden={!s.cartOpen}>
        <header className="sidecart-head">
          <div>
            <h3>Seu carrinho</h3>
            <span className="sidecart-count">{s.cartCount} {s.cartCount === 1 ? "item" : "itens"}</span>
          </div>
          <button className="icon-btn" onClick={() => s.setCartOpen(false)} aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        {items.length > 0 && (
          <div className="sidecart-shipping">
            {remaining > 0 ? (
              <>
                <div className="sidecart-shipping-msg">
                  Faltam <b>R$ {remaining.toFixed(2).replace(".", ",")}</b> para <b>frete grátis</b>
                </div>
              </>
            ) : (
              <div className="sidecart-shipping-msg success">
                <I.truck /> Você ganhou <b>frete grátis</b>!
              </div>
            )}
            <div className="sidecart-progress">
              <div className="sidecart-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="sidecart-items">
          {items.length === 0 ? (
            <div className="sidecart-empty">
              <div className="sidecart-empty-icon"><I.cart /></div>
              <h4>Seu carrinho está vazio</h4>
              <p>Comece adicionando produtos da nossa loja.</p>
              <button className="btn btn-primary" onClick={() => s.setCartOpen(false)}>
                Ver produtos <I.arrowRight />
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div className="sidecart-item" key={it.id}>
                <div className="sidecart-thumb">
                  <ProductArt tone={it.tone} hint={it.hint} />
                </div>
                <div className="sidecart-detail">
                  <div className="sidecart-brand">{it.brand}</div>
                  <div className="sidecart-title">{it.title}</div>
                  <div className="sidecart-bottom">
                    <div className="sidecart-qty">
                      <button onClick={() => s.updateQty(it.id, it.qty - 1)} aria-label="Diminuir">−</button>
                      <span>{it.qty}</span>
                      <button onClick={() => s.updateQty(it.id, it.qty + 1)} aria-label="Aumentar">+</button>
                    </div>
                    <div className="sidecart-price">
                      R$ {(it.price * it.qty).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>
                <button className="sidecart-remove" onClick={() => s.removeFromCart(it.id)} aria-label="Remover">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="sidecart-foot">
            <div className="sidecart-coupon">
              <span>Cupom <code>DROP10</code></span>
              <span className="sidecart-discount">−R$ {pixDiscount.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="sidecart-totals">
              <div className="sidecart-row">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="sidecart-row pix">
                <span>No Pix (10% OFF)</span>
                <strong>R$ {(subtotal - pixDiscount).toFixed(2).replace(".", ",")}</strong>
              </div>
              <div className="sidecart-row installments">
                ou em até <b>12x R$ {(subtotal / 12).toFixed(2).replace(".", ",")}</b> sem juros
              </div>
            </div>
            <a href="Checkout.html" className="btn btn-primary sidecart-checkout">
              Finalizar compra <I.arrowRight />
            </a>
            <button className="sidecart-continue" onClick={() => s.setCartOpen(false)}>
              Continuar comprando
            </button>
            <div className="sidecart-perks">
              <span><I.shield /> Compra 100% segura</span>
              <span><I.truck /> Envio em 24h</span>
              <span><I.refresh /> 7 dias para troca</span>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
};

// =================
// Mega-menu — flyout panel below "Categorias" nav button
// =================
const megaCats = [
  {
    name: "Cartuchos & Tintas",
    icon: "cartridge",
    items: ["HP 667 Original", "HP 664XL", "Canon PG-145", "Epson 664", "Brother LC3019", "Recargas universais"],
  },
  {
    name: "Toners",
    icon: "printer",
    items: ["Compatível Samsung", "HP CF283A", "Brother TN-1060", "Pantum PD-219", "Evolut Premium", "Kit revendedor"],
  },
  {
    name: "Placas de Vídeo",
    icon: "gpu",
    items: ["NVIDIA GT 730", "GeForce GTX 1650", "RX 550 4GB", "GT 1030", "Para escritório", "Para games"],
  },
  {
    name: "Áudio & Headsets",
    icon: "headset",
    items: ["JBL Quantum", "HyperX Cloud", "HP Office", "Logitech H111", "Headsets gamer", "Fones bluetooth"],
  },
  {
    name: "Periféricos",
    icon: "keyboard",
    items: ["Teclados mecânicos", "Mouses gamer", "Mousepads XL", "Combos teclado+mouse", "Webcams Full HD", "Microfones"],
  },
];

const MegaMenu = ({ open, initialIdx = 0, onClose, onMouseEnter }) => {
  const [hovered, setHovered] = React.useState(initialIdx);
  React.useEffect(() => { setHovered(initialIdx); }, [initialIdx]);
  const cat = megaCats[hovered];
  const previews = products.filter((p) =>
    new RegExp(cat.name.split(/[ &]/)[0], "i").test(p.title + p.brand)
  ).slice(0, 3);
  const fallback = products.slice(hovered * 2, hovered * 2 + 3);
  const shown = previews.length ? previews : fallback;
  return (
    <div
      className={`megamenu ${open ? "open" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      <div className="megamenu-inner wrap">
        <div className="megamenu-list">
          {megaCats.map((m, i) => (
            <a
              key={m.name}
              href="Listagem (PLP).html"
              className={`megamenu-item ${i === hovered ? "active" : ""}`}
              onMouseEnter={() => setHovered(i)}
            >
              <span className="megamenu-icon"><CategoryIcon name={m.icon} /></span>
              <span className="megamenu-name">{m.name}</span>
              <I.chevRight />
            </a>
          ))}
          <a href="Listagem (PLP).html" className="megamenu-all">
            Ver todas as categorias <I.arrowRight />
          </a>
        </div>
        <div className="megamenu-panel">
          <div className="megamenu-panel-head">
            <span className="eyebrow" style={{ margin: 0 }}>{cat.name}</span>
            <a href="#">Ver tudo →</a>
          </div>
          <div className="megamenu-cols">
            <ul className="megamenu-sub">
              {cat.items.map((s) => (
                <li key={s}><a href="#">{s}</a></li>
              ))}
            </ul>
            <div className="megamenu-products">
              {shown.map((p) => (
                <a key={p.id} href="#" className="megamenu-product">
                  <div className="megamenu-product-art">
                    <ProductArt tone={p.tone} hint={p.hint} />
                  </div>
                  <div>
                    <div className="megamenu-product-brand">{p.brand}</div>
                    <div className="megamenu-product-title">{p.title}</div>
                    <div className="megamenu-product-price">
                      R$ {formatBRL(p.price).reais},{formatBRL(p.price).centavos}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================
// Search panel (focus dropdown)
// =================
const popularSearches = [
  "Cartucho HP 667", "Toner Samsung", "Placa de vídeo GT 730",
  "Headset gamer", "Multifuncional", "Cabo HDMI",
];
const recentSearches = ["HP 664", "Toner Pantum", "JBL Quantum"];

const SearchPanel = ({ query, onPick, onClose }) => {
  const filtered = React.useMemo(() => {
    if (!query.trim()) return products.slice(0, 4);
    const re = new RegExp(query.trim().replace(/\s+/g, ".*"), "i");
    return products.filter((p) => re.test(p.title + " " + p.brand)).slice(0, 4);
  }, [query]);
  return (
    <div className="searchpanel" onMouseDown={(e) => e.preventDefault()}>
      <div className="searchpanel-grid">
        <div className="searchpanel-col">
          <h5>Buscas recentes</h5>
          <ul>
            {recentSearches.map((r) => (
              <li key={r}>
                <button onClick={() => onPick(r)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  {r}
                </button>
              </li>
            ))}
          </ul>

          <h5 style={{ marginTop: 18 }}>Em alta</h5>
          <div className="searchpanel-chips">
            {popularSearches.map((t) => (
              <button key={t} className="chip" onClick={() => onPick(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="searchpanel-col results">
          <h5>{query.trim() ? `Resultados para "${query}"` : "Sugestões pra você"}</h5>
          <div className="searchpanel-results">
            {filtered.length === 0 ? (
              <div className="searchpanel-empty">
                Nenhum produto encontrado para "{query}".
              </div>
            ) : (
              filtered.map((p) => (
                <a key={p.id} href="#" className="searchpanel-result">
                  <div className="searchpanel-thumb">
                    <ProductArt tone={p.tone} hint={p.hint} />
                  </div>
                  <div className="searchpanel-meta">
                    <div className="megamenu-product-brand">{p.brand}</div>
                    <div className="megamenu-product-title">{p.title}</div>
                    <div className="megamenu-product-price">
                      R$ {formatBRL(p.price).reais},{formatBRL(p.price).centavos}
                    </div>
                  </div>
                  <I.arrowRight />
                </a>
              ))
            )}
          </div>
          <a href="#" className="searchpanel-all">
            Ver todos os resultados <I.arrowRight />
          </a>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  StoreCtx, useStore, StoreProvider, Toast, SideCart, MegaMenu, SearchPanel,
});
