// =================
// Main App
// =================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d62828",
  "showAnnouncement": true,
  "showCoupon": true,
  "showBrandStrip": true
}/*EDITMODE-END*/;

// =================
// Hero — full-bleed banner carousel using real product art
// =================
const Hero = () => {
  const slides = [
    { src: "assets/banner-worldcup.png", alt: "Pacotes Panini World Cup 2026", href: "#", label: "Pacotes Panini" },
    { src: "assets/banner-toner.png", alt: "Toner Evolut — Impressões que elevam seu negócio", href: "#", label: "Toner Evolut" },
    { src: "assets/banner-gpu.png", alt: "Placa de Vídeo GT 730 — Desempenho que acompanha seu ritmo", href: "#", label: "Placa GT 730" },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides.length]);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  return (
    <section className="tight" style={{ paddingTop: 18 }}>
      <div className="wrap">
        <div className="hero-banner">
          {slides.map((s, i) => (
            <a key={i} href={s.href} className={`hero-slide ${i === idx ? "active" : ""}`} aria-hidden={i !== idx}>
              <img src={s.src} alt={s.alt} draggable="false" />
            </a>
          ))}
          <button className="hero-arrow left" onClick={prev} aria-label="Anterior"><I.chevLeft /></button>
          <button className="hero-arrow right" onClick={next} aria-label="Próximo"><I.chevRight /></button>
          <div className="hero-banner-dots">
            {slides.map((_, i) => (
              <button key={i} className={i === idx ? "active" : ""} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`} />
            ))}
          </div>
          <div className="hero-banner-count">
            <span>{String(idx + 1).padStart(2, "0")}</span>
            <span className="sep">/</span>
            <span className="total">{String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  return (
    <StoreProvider>
      {t.showAnnouncement && <Announce />}
      <TopBar />
      <Header />
      <Nav />

      <main>
        <Hero />
        <TrustStrip />
        <Categories />
        {t.showCoupon && <CouponStrip />}
        <BestSellers />
        <BannerPromos />
        <ProductCarousel
          eyebrow="Ofertas-relâmpago"
          title="Aproveite antes que acabe"
          items={[...products].reverse()}
          slug="flash"
        />
        <ComboBanner />
        <ReviewsSection />
        {t.showBrandStrip && <BrandStrip />}
        <Newsletter />
      </main>

      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Cor de destaque (CTA)">
          <TweakColor
            label="Accent"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#d62828", "#1f7a3a", "#f5c518", "#0d1115", "#0e8aa5"]}
          />
        </TweakSection>

        <TweakSection label="Componentes">
          <TweakToggle
            label="Barra de avisos"
            value={t.showAnnouncement}
            onChange={(v) => setTweak("showAnnouncement", v)}
          />
          <TweakToggle
            label="Cupom de boas-vindas"
            value={t.showCoupon}
            onChange={(v) => setTweak("showCoupon", v)}
          />
          <TweakToggle
            label="Faixa de marcas"
            value={t.showBrandStrip}
            onChange={(v) => setTweak("showBrandStrip", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </StoreProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
