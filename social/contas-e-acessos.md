# Contas & Acessos — rastreador

> Fonte única de verdade das contas, handles, links e IDs da frente de crescimento.
> Preencher conforme criar/confirmar. Marcar ⬜ pendente · 🟡 em andamento · ✅ pronto.
> Última atualização: 2026-08-23.
>
> 🔐 **Senhas não entram aqui.** Só login/handle/ID. As senhas ficam em `senhas.local.md` na raiz
> (gitignored, só na máquina do Gabriel).

## E-mail da empresa — a identidade de tudo

**Todas as contas novas são criadas com `contato@dropchinaoficial.com.br`**, nunca em e-mail
pessoal. Regra de `../marketing/plano-fundacao-marca.md`: se a conta nasce em e-mail do prestador,
a posse do ativo sai junto com ele.

| Caixa | Uso |
|---|---|
| **`contato@`** | ✅ **escolhida em 23/08** — dona das contas sociais, Google, GA4, Pixel, Clarity, Search Console. Também é o `contact_email` da hospedagem |
| `comercial@` | caixa com histórico real (450 MB), assina a NF-e como remetente de resposta |
| `augusto@` · `natalia@` | caixas pessoais, quase vazias |

⚠️ As 4 caixas rodam no cPanel do revendedor `cloudclu`, que é ponto único de falha
(ver `../docs/migracao-dns-email.md`). O endereço sobrevive à migração de provedor — o domínio está
no registro.br até 2034 e é nosso —, mas até lá vale ter recuperação secundária nas contas novas.

## Logins das plataformas
> Senha em `senhas.local.md` (raiz, gitignored).

| Plataforma | URL de login | Usuário |
|---|---|---|
| **Bling** (ERP) | `bling.com.br` | `Fgrepresentacoes.sc@gmail.com` |
| **cPanel** (hospedagem/e-mail) | `https://cpl27.main-hosting.eu:2083` | `dropchinaoficial` |
| **Webmail** | `https://webmail.dropchinaoficial.com.br` | e-mail completo da caixa |
| **Shopify** | `akfd19-1c.myshopify.com/admin` | ✅ **owner = `contato@dropchinaoficial.com.br`** (transferido 23/08) · Gabriel acessa como colaborador 4YU MKT |

⛔ **Nunca usar a porta `:2087`** (WHM do revendedor) — conta cPanel não entra lá e devolve
"login inválido" mesmo com a senha certa.

## Redes sociais
| Plataforma | Status | Handle / URL | Observação |
|---|---|---|---|
| Instagram Business | ✅ | **@dropchinaoficial** · instagram.com/dropchinaoficial | **criada 23/08** com `contato@` · conta **Comercial** (categoria Produto/serviço) · **vinculada à Página do Facebook** |
| Página Facebook | ✅ | **facebook.com/dropchinaoficial** · id `61593372286423` | criada 23/08 pelo **perfil pessoal real do Gabriel** — o perfil com nome de empresa foi desativado em definitivo pelo Facebook. Nome de usuário definido e **Instagram vinculado**. ⚠️ categoria ainda "Tecnologia", trocar por Loja de informática. ⚠️ falta dar acesso ao Augusto |
| WhatsApp Business | ⬜ | +55 41 99534-2751 | número oficial (header produção) ✅ |
| TikTok | ⬜ | @dropchinaoficial (só reservar) | Fase 2 — **não criar perfil ativo agora** |
| YouTube | ✅ | **@Dropchinaoficial** · `youtube.com/channel/UCUkLOO3Nq…` | canal criado 23/08, avatar com o monograma DC · acessa via conta Google `contato@` · publicar só na Fase 5 |
| Kwai | ⬜ | — | opcional |

## Meta / anúncios
| Item | Status | Valor | Observação |
|---|---|---|---|
| Meta Business Manager | 🟡 | — | guarda-chuva de tudo · e-mail `contato@`. Página FB exige perfil pessoal por trás |
| Domínio verificado no Meta | ⬜ | dropchinaoficial.com.br | pré-req de catálogo + Pixel |
| Conta de anúncio DropChina | ⬜ | — | login atual é agência (BRIC/Avanti/V4…), **nenhuma é DropChina**. Criar nova ou apontar uma? |
| Meta Pixel ID | ⬜ | — | eu gero → chat Shopify liga no tema |
| Catálogo Meta (Commerce) | ⬜ | — | depende de export Shopify + domínio verificado |

## Google
| Item | Status | Valor | Observação |
|---|---|---|---|
| GA4 Measurement ID | ✅ | **`G-KZ4CGVHY7X`** · propriedade `551149346` | ligado pelo app **Google & YouTube** e confirmado no ar. ⚠️ **não** colar no campo do tema (contaria dobrado) |
| Google Tag | ✅ | **`GT-KDQF3CD7`** | instalada junto com o GA4 pelo app Google & YouTube |
| Search Console | ✅ | propriedade de **domínio** `dropchinaoficial.com.br` | validado 23/08 por TXT no DNS · **sitemap enviado**, lido com sucesso |
| Google Meu Negócio | 🟡 | ficha **própria criada 23/08** · `DropChina` · Loja de Informática | verificação por correspondência, **até 5 dias**. Endereço: Rua Mandirituba 216, Fundos — Afonso Pena, São José dos Pinhais/PR, 83045-030 (o fiscal, da Receita). Cobertura: Brasil. Falta corrigir o **horário**, que está "Fechado" — o site diz Seg-Sáb 8h-20h |
| ⚠️ Ficha FALSA no Google | 🚨 | `DropChina — R. Santo Inácio de Loyola, Guabirotuba, Curitiba-PR, 81520-250` · gerenciada por `co…@gmail.com` | **Não é do Augusto e não é de agência antiga: é alguém se passando pela empresa.** Denunciar em Maps → Sugerir uma edição → Fechar ou remover, e pelo *Business Redressal Complaint Form*. Guardar print antes |
| Merchant Center | ✅ | conta **`5843491607`** | criada 23/08 e **Active**. ⚠️ O domínio estava reivindicado por outra conta — resolvido com **"Transfer my domain"**, que funcionou porque o Search Console já validava a `contato@`. Feed ainda com 0 produtos (sincroniza em horas) |
| **Microsoft Clarity ID** | ✅ | **`y70lfm3dio`** | projeto `Dropchina` criado 23/08 · app instalado na Shopify, ligar o embed `Clarity JS` no tema |

## Dados oficiais da empresa (confirmados no schema do tema)
- **Razão social:** DROPCHINA LTDA
- **CNPJ:** 57.306.430/0001-53
- **Endereço:** Rua Mandirituba, 216, Fundos — Afonso Pena, São José dos Pinhais/PR, 83045-030
  (endereço da Receita, o mesmo do schema do tema e dos termos. O "Maringá" registrado até 23/08
  era **errado**, veio de nota velha)
- **Horário de atendimento:** Seg a Sex 9h–19h · Sáb 9h–13h · Dom fechado (confirmado pelo Augusto em 23/08 — o site dizia Seg-Sáb 8h-20h, estava errado)
- **Site:** dropchinaoficial.com.br
- **Loja Shopify:** akfd19-1c.myshopify.com (plano Basic, BRL)

## ✅ Decisões do Gabriel (06/jul/2026)
- **Contas sociais:** começar do **zero** (nenhuma existe) → planejar criação IG Business + Página FB + WhatsApp Business.
- **Número WhatsApp oficial:** **41 99534-2751** (confirmado no header da produção; variante -2451 foi revertida).
- **Primeiro alvo Fase 0:** **Tagueamento** (GA4/GTM/Pixel/Clarity/LGPD) → ver `../marketing/setup-tagueamento.md`.
- **Budget ferramentas:** **só grátis** por enquanto (Canva grátis, Meta Business Suite, GA4, Clarity, Search Console). Sem mLabs/Canva Pro por ora.

## ✅ Resolvido desde então (verificado 04/ago)
- **Cupom BEMVINDO10:** **criado e ATIVO** no Shopify. Existe também um `DROP10`. Pode divulgar.
- **Estoque:** sincronizado Bling↔Shopify, 0 divergências. Deixou de ser bloqueador.
- **Blog:** 10+ artigos publicados desde 07/jul.

## 📓 Log
- **2026-08-23** — **Search Console validado** (propriedade de domínio, TXT no cPanel) e
  `https://dropchinaoficial.com.br/sitemap.xml` enviado com sucesso. ⚠️ Em propriedade de domínio
  o campo de sitemap exige a **URL completa** — só `sitemap.xml` é rejeitado. Os 5 sub-sitemaps
  foram lidos com sucesso no mesmo dia: **76 produtos**, 25 coleções, 18 blogs, 5 páginas.
  **Clarity** criado (`y70lfm3dio`) e script confirmado no ar. **GA4** criado (`G-KZ4CGVHY7X`).
  **Judge.me** instalado e ativo, com seção própria no tema (`dc-judgeme-reviews`).
  **Merchant Center** criado (`5843491607`) com o domínio recuperado de outra conta.
  **Página do Facebook** e **canal do YouTube** criados. **Google Meu Negócio próprio** criado e
  em verificação. Descobertas: **Reclame Aqui e Google Meu Negócio já existem** e
  não estão sob nosso controle. Detalhe completo em `../docs/handoff-2026-08-23.md`. YouTube criado (via conta Google `contato@`). **Titularidade da loja Shopify transferida** de Gabriel para
  `contato@dropchinaoficial.com.br` (conta criada como "Augusto Dropchina"). Caminho usado:
  *Configurações → Geral → Organizações e transferências de loja → Transferir para novo
  proprietário fora da empresa* — não passa pelo limite de usuários do plano Basic.
  Instagram **@dropchinaoficial** criado. Criação das contas com `contato@dropchinaoficial.com.br` (os docs sugeriam
  `comercial@`; Gabriel optou por `contato@`). Registrados os
  logins de Bling e cPanel. Criado `senhas.local.md` (gitignored) para as senhas.

## Prova social
| Item | Status | Valor | Observação |
|---|---|---|---|
| Judge.me | ✅ | app instalado + App Embed ativo (23/08) | widget "Avaliações verificadas" no ar na página de produto, ainda sem avaliação |
| Reclame Aqui | ⏸️ | **página já existe** — `DROPCHINA LTDA`, criada há 2 anos | 1.250 visualizações/12 meses · **1 reclamação** · sem selo · 0/7 do cadastro. Assumir exige validação por `fiscal@descontabilidade.com.br` (contabilidade) **ou** biometria da responsável legal **NATALIA W\*\*\* P\*\*\* S\*\*\*** na Receita Federal |

## ⚠️ Ainda pendente
- **Conta de anúncio Meta:** login atual é agência (nenhuma é DropChina). Decidir criar/apontar — só urge quando abrir mídia paga.
- ~~**Acesso à loja**~~ ✅ **resolvido em 23/08** — owner agora é `contato@dropchinaoficial.com.br`.
  Gabriel segue com acesso pelo colaborador **4YU MKT** (não consome vaga de staff).
