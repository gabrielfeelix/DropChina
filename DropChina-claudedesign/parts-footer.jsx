// =================
// BannerPromos (replaces text-heavy "Curadoria")
// Image-led category banners — each card is a visual ad
// =================
const BannerPromos = () => {
  const banners = [
    {
      kicker: "Mês da impressão",
      title: "Toners e cartuchos premium",
      cta: "Comprar agora",
      img: "assets/banner-toner.png",
      tone: "blue",
      big: true,
    },
    {
      kicker: "Edição limitada",
      title: "Pacotes Panini World Cup 2026",
      cta: "Ver coleção",
      img: "assets/banner-worldcup.png",
      tone: "dark",
    },
    {
      kicker: "Setup gamer",
      title: "Placas de vídeo a partir de R$ 293",
      cta: "Montar setup",
      img: "assets/banner-gpu.png",
      tone: "neon",
    },
  ];
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Em destaque</p>
            <h2>Compre por linha</h2>
          </div>
          <a href="#" className="btn btn-outline btn-sm">Ver todas <I.arrowRight /></a>
        </div>

        <div className="banner-promos">
          {banners.map((b, i) => (
            <a key={i} href="#" className={`banner-promo ${b.big ? "big" : ""} tone-${b.tone}`}>
              <div className="banner-bg" style={{ backgroundImage: `url('${b.img}')` }} />
              <div className="banner-overlay" />
              <div className="banner-content">
                <span className="banner-kicker">{b.kicker}</span>
                <h3 className="banner-title">{b.title}</h3>
                <span className="banner-cta">
                  {b.cta} <I.arrowRight />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// =================
// Atacado / CNPJ — single split banner with handshake hero image
// =================
const Editorial = () => (
  <section>
    <div className="wrap">
      <div className="atacado">
        <div className="atacado-bg" style={{ backgroundImage: "url('assets/atacado-bg.png')" }} />
        <div className="atacado-overlay" />
        <div className="atacado-content">
          <div className="atacado-body">
            <p className="atacado-eyebrow">Atacado · CNPJ</p>
            <h2 className="atacado-title">Compre como revendedor e pague menos</h2>
            <p className="atacado-lead">
              Tabela exclusiva para CNPJ a partir de 10 unidades, com nota fiscal,
              entrega em todo o Brasil e gerente de conta dedicado.
            </p>
            <ul className="atacado-perks">
              <li>
                <span className="atacado-perk-num">−15%</span>
                <span className="atacado-perk-lbl">Desconto progressivo<br />a partir de 10 un.</span>
              </li>
              <li>
                <span className="atacado-perk-num">24h</span>
                <span className="atacado-perk-lbl">Envio para todo<br />o Brasil</span>
              </li>
              <li>
                <span className="atacado-perk-num">NF</span>
                <span className="atacado-perk-lbl">Nota fiscal<br />sempre</span>
              </li>
            </ul>
            <div className="atacado-cta">
              <a href="#" className="btn btn-light">Cadastrar CNPJ <I.arrowRight /></a>
              <a href="#" className="atacado-secondary">
                <span className="wpp-dot" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// =================
// Brand marquee (rotates)
// =================
const BrandStrip = () => {
  const brands = ["HP", "Canon", "Epson", "Samsung", "Brother", "Pantum", "Evolut", "JBL", "NVIDIA", "Logitech", "TP-Link", "Multilaser", "Kingston", "WD", "Intel", "AMD", "Razer"];
  return (
    <section className="tight">
      <div className="wrap">
        <div className="brand-marquee-head">
          <p className="eyebrow">Marcas oficiais</p>
          <h3>+50 marcas que você confia</h3>
        </div>
      </div>
      <div className="brand-marquee">
        <div className="brand-marquee-track">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="brand-marquee-cell">{b}</span>
          ))}
        </div>
        <div className="brand-marquee-fade left" />
        <div className="brand-marquee-fade right" />
      </div>
    </section>
  );
};

// =================
// Newsletter
// =================
const Newsletter = () => (
  <section className="tight">
    <div className="wrap">
      <div className="newsletter">
        <div>
          <p className="eyebrow" style={{ color: "var(--dc-yellow)" }}>Newsletter DropChina</p>
          <h2>Ofertas direto no seu e-mail toda terça</h2>
          <p>Receba antes os cupons exclusivos, lançamentos e os melhores preços em tech.</p>
          <div className="newsletter-perks">
            <span>✓ Cupom de boas-vindas</span>
            <span>✓ Sem spam</span>
            <span>✓ Cancele quando quiser</span>
          </div>
        </div>
        <div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="seu@email.com.br" />
            <button type="submit" className="btn" style={{ background: "var(--dc-yellow)", color: "#2a2410" }}>
              Inscrever-me
            </button>
          </form>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 14 }}>
            Ao se inscrever você concorda com nossa Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// =================
// Footer
// =================
const Footer = () => (
  <footer className="footer">
    <div className="wrap">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="assets/dropchina-logo.png" alt="DropChina" style={{ height: 36 }} />
          <p>Tech direto de quem importa. Cartuchos, toners, placas de vídeo e periféricos com garantia oficial.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram"><I.instagram /></a>
            <a href="#" aria-label="Facebook"><I.facebook /></a>
            <a href="#" aria-label="TikTok"><I.tiktok /></a>
            <a href="#" aria-label="YouTube"><I.youtube /></a>
            <a href="#" aria-label="WhatsApp"><I.whatsapp /></a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Loja</h5>
          <ul>
            <li><a href="#">Cartuchos & Tintas</a></li>
            <li><a href="#">Toners</a></li>
            <li><a href="#">Placas de Vídeo</a></li>
            <li><a href="#">Áudio & Headsets</a></li>
            <li><a href="#">Periféricos</a></li>
            <li><a href="#">Impressoras</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Suporte</h5>
          <ul>
            <li><a href="#">Central de ajuda</a></li>
            <li><a href="#">Rastrear pedido</a></li>
            <li><a href="#">Trocas & devoluções</a></li>
            <li><a href="#">Política de garantia</a></li>
            <li><a href="#">Frete & prazos</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>DropChina</h5>
          <ul>
            <li><a href="#">Sobre nós</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Para empresas</a></li>
            <li><a href="#">Atacado · CNPJ</a></li>
            <li><a href="#">Trabalhe conosco</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Contato</h5>
          <ul>
            <li><a href="#">Fale conosco</a></li>
            <li><a href="#">WhatsApp comercial</a></li>
            <li><a href="#">Suporte técnico</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
          <p style={{ marginTop: 18, fontSize: 12, color: "var(--muted)" }}>
            Atendimento<br />
            Seg–Sáb · 8h às 20h
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2025 DropChina · CNPJ 00.000.000/0001-00 — Todos os direitos reservados.</div>
        <div className="payments">
          {["PIX", "VISA", "MASTER", "ELO", "AMEX", "HIPER", "BOLETO"].map((p) => (
            <span key={p} className="pay-chip">{p}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

Object.assign(window, { BannerPromos, BrandStrip, Editorial, Newsletter, Footer });
