# Conteúdo institucional — DropChina

Textos legais e institucionais prontos para publicar. Tom equilibrado (confiável + humano),
LGPD/CDC/Decreto 7.962 cobertos. **Revisar os `[CONFIRMAR: ...]` antes de publicar.**

## Onde vai cada arquivo

As **4 políticas legais são nativas da Shopify** (decisão: nativas + restyle). O conteúdo mora no
**Admin**, não no tema — não há API pública pra escrever política. Cole o HTML no editor de cada uma:

> Admin Shopify → **Configurações → Políticas** (Settings → Policies) → abre a política → clique no
> ícone **`< >` (mostrar HTML)** → cola o conteúdo do arquivo → Salvar.

| Arquivo | Política da Shopify | URL pública |
|---|---|---|
| `privacidade.html` | Política de privacidade | `/policies/privacy-policy` |
| `termos.html` | Termos de serviço | `/policies/terms-of-service` |
| `trocas-devolucoes.html` | Política de reembolso | `/policies/refund-policy` |
| `frete-entrega.html` | Política de envio | `/policies/shipping-policy` |

A **UI** dessas páginas já foi estilizada no tema (`theme/assets/base.css`, bloco
`.shopify-policy__*` — coluna de leitura 760px, título hero, tipografia premium). O texto colado
herda esse visual automaticamente.

> 🔒 **MCP também não edita política.** `shopPolicyUpdate` via MCP Shopify retorna
> `Access denied ... Required access: write_legal_policies access scope` — o connector não tem esse
> escopo. Editar as 4 políticas **só pelo Admin** (passo a passo acima). As **páginas** (Sobre,
> Rastrear, Atacado) essas sim o MCP edita via `pageUpdate`.

> ⚠️ **Estado do telefone (10/jul/2026).** As políticas e páginas vivas na Shopify estavam com um
> número errado — **(11) 93806-6545**. O correto é **(41) 99534-2751** (`wa.me/5541995342751`), o
> mesmo do header. Já corrigido via MCP nas **páginas** Sobre, Rastrear pedido e Atacado. As **3
> políticas** (Termos §7, Reembolso, Frete) continuam com o número errado na loja viva — **corrigir
> no Admin** (os `.html` deste diretório já estão certos). Privacidade não citava telefone errado.

## Páginas institucionais (no tema, não nativas)

- **Sobre nós** (`/pages/sobre`): template `theme/templates/page.sobre.json` → seção `dc-page`.
  Já vem com um texto-base desenhado (fallback). A **história do Augusto** (doença → recomeço →
  DropChina) entra depois como uma seção `<h2>Como tudo começou</h2>` quando ele mandar as infos.
- **Template reutilizável** `page.institucional` (`page.institucional.json`): aplique a Atacado,
  Rastreio ou qualquer página institucional via Admin → página → **Modelo do tema**.
- ⚠️ A Shopify **não** aplica template por handle automaticamente: no Admin, em cada página, escolha
  o "Modelo do tema" (`sobre` / `institucional`). Posso setar isso via API com seu ok.

## ✅ Dados aplicados (sem pendências)

Tudo preenchido — **zero `[CONFIRMAR]`**. Pronto pra colar.

- **Razão social:** DROPCHINA LTDA · **CNPJ:** 57.306.430/0001-53 · Ativa · Simples Nacional
- **Endereço (Receita, via CNPJ):** Rua Mandirituba, 216, Fundos — Afonso Pena, São José dos Pinhais/PR, CEP 83.045-030
- **E-mail (SAC + Encarregado LGPD):** comercial@dropchinaoficial.com.br
- **WhatsApp/Tel:** (41) 99534-2751
- **Prazos/regras** (alinhados ao FAQ da loja): frete grátis acima de R$ 199; prazos por região (capitais SP/RJ/MG 1–2, demais 2–4, interior 4–8 dias úteis); estorno Pix 1 dia útil / cartão 2 faturas / boleto 5 dias úteis; garantia 12m (6m cartucho/toner).

> ⚠️ **Correção legal aplicada:** o FAQ dizia "arrependimento = cliente paga o frete". Pela norma de
> venda online (CDC art. 49) é a **loja** que arca o frete no arrependimento. Corrigi o FAQ
> (`theme/templates/page.faq.json`) e as políticas pra ficarem coerentes e dentro da lei.
