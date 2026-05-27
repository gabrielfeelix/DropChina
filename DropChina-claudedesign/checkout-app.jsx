// =================
// Checkout — multi-section, mock state
// =================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d62828"
}/*EDITMODE-END*/;

const CheckoutHeader = () => (
  <header className="checkout-header">
    <div className="wrap">
      <a href="DropChina Homepage.html" aria-label="DropChina home">
        <img src="assets/dropchina-logo.png" alt="DropChina" style={{ height: 36 }} />
      </a>
      <div className="checkout-steps">
        <div className="checkout-step done">
          <span className="step-num"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg></span>
          <span>Carrinho</span>
        </div>
        <span className="step-sep" />
        <div className="checkout-step active">
          <span className="step-num">2</span>
          <span>Identificação & Entrega</span>
        </div>
        <span className="step-sep" />
        <div className="checkout-step">
          <span className="step-num">3</span>
          <span>Pagamento</span>
        </div>
      </div>
      <div className="checkout-secure">
        <I.shield />
        <div>
          <b>Compra 100% segura</b>
          <span>SSL · Criptografia 256 bits</span>
        </div>
      </div>
    </div>
  </header>
);

const FormSection = ({ num, title, subtitle, open, onToggle, done, children }) => (
  <section className={`co-section ${open ? "open" : ""} ${done ? "done" : ""}`}>
    <header onClick={onToggle}>
      <span className="co-num">
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
        ) : num}
      </span>
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {done && <button className="co-edit">Editar</button>}
    </header>
    <div className="co-body">{children}</div>
  </section>
);

const Field = ({ label, hint, type = "text", placeholder, value, onChange, mask, suffix, optional, ...p }) => (
  <label className="co-field">
    <span className="co-field-label">
      {label}
      {optional && <em>(opcional)</em>}
    </span>
    <div className="co-field-input">
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} {...p} />
      {suffix && <span className="co-field-suffix">{suffix}</span>}
    </div>
    {hint && <span className="co-field-hint">{hint}</span>}
  </label>
);

const ShippingOptions = ({ value, onChange }) => {
  const opts = [
    { id: "sedex", lbl: "Sedex", eta: "Receba em até 2 dias úteis", price: 0, free: true, badge: "Mais rápido" },
    { id: "pac", lbl: "PAC", eta: "Receba em 4 a 6 dias úteis", price: 14.9 },
    { id: "agendado", lbl: "Agendado", eta: "Escolha uma data — Quinta, 30/Nov", price: 22.5, badge: "Você escolhe" },
  ];
  return (
    <div className="co-ship-opts">
      {opts.map((o) => (
        <label key={o.id} className={`co-ship-opt ${value === o.id ? "active" : ""}`}>
          <input type="radio" name="ship" checked={value === o.id} onChange={() => onChange(o.id)} />
          <span className="co-ship-radio" />
          <div className="co-ship-meta">
            <div className="co-ship-name">
              {o.lbl}
              {o.badge && <span className="co-ship-badge">{o.badge}</span>}
            </div>
            <div className="co-ship-eta">{o.eta}</div>
          </div>
          <div className="co-ship-price">
            {o.free ? <span className="free">GRÁTIS</span> : `R$ ${o.price.toFixed(2).replace(".", ",")}`}
          </div>
        </label>
      ))}
    </div>
  );
};

const PaymentMethod = ({ method, setMethod }) => {
  const methods = [
    { id: "pix", lbl: "Pix", desc: "10% OFF · aprovação imediata", icon: "⚡" },
    { id: "card", lbl: "Cartão de crédito", desc: "Até 18x sem juros", icon: "💳" },
    { id: "boleto", lbl: "Boleto", desc: "Vence em 3 dias úteis", icon: "🧾" },
  ];
  return (
    <div className="co-pay-methods">
      {methods.map((m) => (
        <button
          key={m.id}
          className={`co-pay-method ${method === m.id ? "active" : ""}`}
          onClick={() => setMethod(m.id)}
        >
          <span className="co-pay-icon">{m.icon}</span>
          <div>
            <div className="co-pay-lbl">{m.lbl}</div>
            <div className="co-pay-desc">{m.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

const OrderSummary = ({ items, shipping, discountPix, totalNoPix }) => {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal + shipping - 0;
  return (
    <aside className="co-summary">
      <h3>Resumo do pedido</h3>

      <div className="co-summary-items">
        {items.map((it) => (
          <div key={it.id} className="co-summary-item">
            <div className="co-summary-thumb">
              <ProductArt tone={it.tone} hint={it.hint} />
              <span className="co-summary-qty">{it.qty}</span>
            </div>
            <div className="co-summary-detail">
              <div className="co-summary-brand">{it.brand}</div>
              <div className="co-summary-title">{it.title}</div>
            </div>
            <div className="co-summary-price">
              R$ {(it.price * it.qty).toFixed(2).replace(".", ",")}
            </div>
          </div>
        ))}
      </div>

      <div className="co-summary-coupon">
        <input placeholder="Cupom de desconto" defaultValue="DROP10" />
        <button>Aplicar</button>
      </div>

      <div className="co-summary-rows">
        <div className="row">
          <span>Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})</span>
          <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="row">
          <span>Frete</span>
          <span>{shipping === 0 ? <b className="free">GRÁTIS</b> : `R$ ${shipping.toFixed(2).replace(".", ",")}`}</span>
        </div>
        <div className="row discount">
          <span>Cupom <code>DROP10</code></span>
          <span>−R$ {discountPix.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="row total">
          <span>Total no Pix</span>
          <span className="total-amount">R$ {(total - discountPix).toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="row installments">
          ou <b>{Math.min(12, Math.ceil(total / 60))}x R$ {(total / Math.min(12, Math.ceil(total / 60))).toFixed(2).replace(".", ",")}</b> sem juros no cartão
        </div>
      </div>

      <a href="#" className="btn btn-primary co-checkout-btn">
        Finalizar pedido
        <I.arrowRight />
      </a>

      <div className="co-summary-perks">
        <span><I.shield /> Pagamento seguro</span>
        <span><I.truck /> Frete grátis</span>
        <span><I.refresh /> Trocas em 7 dias</span>
      </div>
    </aside>
  );
};

const Checkout = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [openStep, setOpenStep] = React.useState("ident");
  const [doneSteps, setDoneSteps] = React.useState(new Set());
  const [form, setForm] = React.useState({
    email: "ana.lima@email.com.br",
    cpf: "",
    name: "",
    phone: "",
    cep: "01310-100",
    addr: "",
    num: "",
    comp: "",
    city: "São Paulo",
    state: "SP",
  });
  const [ship, setShip] = React.useState("sedex");
  const [pay, setPay] = React.useState("pix");
  const [card, setCard] = React.useState({ num: "", name: "", exp: "", cvv: "" });

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const advance = (step, next) => {
    setDoneSteps((s) => new Set([...s, step]));
    setOpenStep(next);
  };

  // Use cart items from a small mock or recovered from sessionStorage in real prod
  const items = products.slice(0, 3).map((p, i) => ({ ...p, qty: i === 0 ? 2 : 1 }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discountPix = subtotal * 0.10;

  return (
    <StoreProvider>
      <CheckoutHeader />
      <main className="checkout-main">
        <div className="wrap checkout-layout">
          <div className="checkout-forms">
            <FormSection
              num={1}
              title="Identificação"
              subtitle="Vamos começar pelo seu e-mail"
              open={openStep === "ident"}
              onToggle={() => setOpenStep("ident")}
              done={doneSteps.has("ident")}
            >
              <div className="co-grid two">
                <Field label="E-mail" type="email" value={form.email} onChange={(v) => setField("email", v)} placeholder="seu@email.com.br" />
                <Field label="CPF" value={form.cpf} onChange={(v) => setField("cpf", v)} placeholder="000.000.000-00" hint="Necessário para nota fiscal" />
                <Field label="Nome completo" value={form.name} onChange={(v) => setField("name", v)} placeholder="Como aparece no documento" />
                <Field label="Celular" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="(11) 90000-0000" hint="Para acompanhar o pedido via WhatsApp" />
              </div>

              <label className="co-consent">
                <input type="checkbox" defaultChecked />
                <span />
                <span>Quero receber ofertas exclusivas e novidades por e-mail e WhatsApp</span>
              </label>

              <div className="co-actions">
                <button className="btn btn-primary" onClick={() => advance("ident", "ship")}>
                  Continuar para entrega <I.arrowRight />
                </button>
              </div>
            </FormSection>

            <FormSection
              num={2}
              title="Entrega"
              subtitle="Onde devemos entregar seu pedido?"
              open={openStep === "ship"}
              onToggle={() => setOpenStep("ship")}
              done={doneSteps.has("ship")}
            >
              <div className="co-grid two">
                <Field label="CEP" value={form.cep} onChange={(v) => setField("cep", v)} placeholder="00000-000" hint={<a href="#">Não sei meu CEP</a>} />
                <Field label="Rua" value={form.addr} onChange={(v) => setField("addr", v)} placeholder="Av. Paulista" />
                <Field label="Número" value={form.num} onChange={(v) => setField("num", v)} placeholder="1234" />
                <Field label="Complemento" optional value={form.comp} onChange={(v) => setField("comp", v)} placeholder="Apto, bloco, sala..." />
                <Field label="Bairro" placeholder="Bela Vista" />
                <Field label="Cidade" value={form.city} onChange={(v) => setField("city", v)} />
                <Field label="Estado" value={form.state} onChange={(v) => setField("state", v)} />
              </div>

              <h4 className="co-h4" style={{ marginTop: 24 }}>Forma de envio</h4>
              <ShippingOptions value={ship} onChange={setShip} />

              <div className="co-actions">
                <button className="btn btn-outline" onClick={() => setOpenStep("ident")}>Voltar</button>
                <button className="btn btn-primary" onClick={() => advance("ship", "pay")}>
                  Ir para pagamento <I.arrowRight />
                </button>
              </div>
            </FormSection>

            <FormSection
              num={3}
              title="Pagamento"
              subtitle="Escolha como quer pagar"
              open={openStep === "pay"}
              onToggle={() => setOpenStep("pay")}
              done={doneSteps.has("pay")}
            >
              <PaymentMethod method={pay} setMethod={setPay} />

              {pay === "pix" && (
                <div className="co-pix-box">
                  <div className="co-pix-info">
                    <div>
                      <h4>Você economiza R$ {(subtotal * 0.10).toFixed(2).replace(".", ",")} pagando com Pix</h4>
                      <p>Depois de finalizar, você verá o QR Code e poderá pagar pelo seu app de banco. A aprovação é imediata.</p>
                    </div>
                    <div className="co-pix-qr">
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <rect width="80" height="80" fill="white" />
                        {Array.from({length: 64}).map((_, i) => {
                          const x = (i % 8) * 9 + 4, y = Math.floor(i / 8) * 9 + 4;
                          return Math.random() > 0.42 ? <rect key={i} x={x} y={y} width="7" height="7" fill="#0d1115" /> : null;
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {pay === "card" && (
                <div className="co-card-form">
                  <div className="co-grid two">
                    <Field label="Número do cartão" value={card.num} onChange={(v) => setCard({ ...card, num: v })} placeholder="0000 0000 0000 0000" />
                    <Field label="Nome impresso no cartão" value={card.name} onChange={(v) => setCard({ ...card, name: v })} placeholder="Como aparece no cartão" />
                    <Field label="Validade" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} placeholder="MM/AA" />
                    <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="000" />
                  </div>
                  <label className="co-field">
                    <span className="co-field-label">Parcelamento</span>
                    <select className="co-select">
                      <option>1x R$ {subtotal.toFixed(2).replace(".", ",")} sem juros</option>
                      <option>3x R$ {(subtotal / 3).toFixed(2).replace(".", ",")} sem juros</option>
                      <option>6x R$ {(subtotal / 6).toFixed(2).replace(".", ",")} sem juros</option>
                      <option>12x R$ {(subtotal / 12).toFixed(2).replace(".", ",")} sem juros</option>
                      <option>18x R$ {(subtotal / 18).toFixed(2).replace(".", ",")} sem juros</option>
                    </select>
                  </label>
                </div>
              )}

              {pay === "boleto" && (
                <div className="co-boleto">
                  <p>O boleto será gerado após a finalização do pedido e enviado para seu e-mail.</p>
                  <p>Vencimento em 3 dias úteis. A liberação acontece em até 1 dia útil após o pagamento.</p>
                </div>
              )}

              <div className="co-actions">
                <button className="btn btn-outline" onClick={() => setOpenStep("ship")}>Voltar</button>
                <a href="#" className="btn btn-primary co-finish">
                  Concluir pedido <I.arrowRight />
                </a>
              </div>

              <p className="co-fineprint">
                Ao concluir, você concorda com nossos <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>.
              </p>
            </FormSection>
          </div>

          <OrderSummary
            items={items}
            shipping={ship === "sedex" ? 0 : ship === "pac" ? 14.9 : 22.5}
            discountPix={discountPix}
          />
        </div>
      </main>

      <footer className="checkout-foot">
        <div className="wrap">
          <div>
            <img src="assets/dropchina-logo.png" alt="DropChina" style={{ height: 28 }} />
            <p>© 2025 DropChina · CNPJ 00.000.000/0001-00</p>
          </div>
          <div className="checkout-foot-pay">
            <span>Aceitamos:</span>
            {["PIX", "VISA", "MASTER", "ELO", "AMEX", "HIPER", "BOLETO"].map((p) => (
              <span key={p} className="pay-chip">{p}</span>
            ))}
          </div>
        </div>
      </footer>
    </StoreProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Checkout />);
