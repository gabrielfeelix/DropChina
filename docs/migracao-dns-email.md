# Migração de DNS e e-mail — tirar a DropChina da mão do revendedor

> Levantado em 04/ago/2026, **sem nenhum acesso ao painel do revendedor** — DNS é público.
> Objetivo: o domínio, o e-mail e o site deixarem de depender de terceiro.

---

## 1. Situação hoje

O domínio `dropchinaoficial.com.br` está registrado no **registro.br, pago até 24/04/2034**, e o
Gabriel tem esse acesso. **Essa é a alavanca** — quem controla o registro.br controla o NS, e o NS
manda em todo o resto.

Só que o **NS aponta para o revendedor**:

```
NS   cdns1.main-hosting.eu.
NS   cdns2.main-hosting.eu.
SOA  cdns1.main-hosting.eu. rafael.sounet.com.br. 2026072203 ...
```

O contato do SOA (`rafael.sounet.com.br`) identifica a agência: **Sounet**. O contato conhecido no
WhatsApp é o **Cleverton, +55 44 9904-3808**.

### O risco real, que é maior que o e-mail
Enquanto o NS for dele, ele controla **para onde o domínio inteiro aponta** — inclusive o registro
`A` que leva à loja Shopify. Um desligamento por falta de pagamento ou um atrito **derruba a loja**,
não só o e-mail. Não é hipótese remota: é uma conta de revenda antiga cuja cobrança ninguém sabe
explicar.

### As três portas — confirmado na prática em 04/ago
| Porta | O que é | Quem entra |
|---|---|---|
| **2083 — cPanel** ✅ | A **conta de hospedagem da DropChina** dentro do servidor. E-mails, DNS, arquivos, banco | `dropchinaoficial` + senha. **Funciona** |
| **2096 — Webmail** ✅ | Só a caixa de e-mail | e-mail completo + senha da caixa. **Funciona** |
| **2087 — WHM** ⛔ | Painel do **revendedor**, que administra as contas de todos os clientes dele | Só o Cleverton. Conta cPanel **nunca** entra aqui |

Link direto do cPanel: `https://cpl27.main-hosting.eu:2083/`

> A confusão que travou o acesso: o revendedor mandou o link com `:2087` (e ainda com
> `/xfercpanel`). Como o usuário `dropchinaoficial` é conta cPanel e não conta de revenda, o WHM
> respondia **"login inválido"** mesmo com a senha correta. Não era senha errada — era camada
> errada. **2083 é a porta certa.**

`cpl27.main-hosting.eu` é infraestrutura do **Hosting24**, a marca cPanel da mesma empresa que virou
**Hostinger** em 2011. É o produto **legado** — a Hostinger atual usa **hPanel**, que **não tem
revenda**. É por isso que a interface parece de 2010: essa conta só existe nesse stack antigo
*porque* é revenda.

> ✅ **Acesso que funciona hoje:** `https://cpl27.main-hosting.eu:2096` — login com o e-mail
> completo + senha da caixa. Não use `:2087` (WHM): conta cPanel não entra lá, dá "login inválido"
> mesmo com a senha certa.

> ⚠️ A senha do cPanel circulou por WhatsApp e apareceu em screenshot. **Trocar.**

---

## 2. Foto do DNS atual (04/ago/2026)

Reconstruída por consulta pública (DNS-over-HTTPS). **Copiar exatamente** ao recriar a zona.

| Nome | Tipo | Valor |
|---|---|---|
| `@` | A | `23.227.38.65` (Shopify) |
| `@` | MX | `0 mail.dropchinaoficial.com.br.` |
| `@` | TXT | `v=spf1 +a +mx +ip4:195.35.61.27 include:relay.mailchannels.net ~all` |
| `www` | CNAME | `shops.myshopify.com.` |
| `mail` | A | `109.106.250.222` |
| `webmail` | A | `109.106.250.222` |
| `cpanel` | A | `109.106.250.222` |
| `whm` | A | `109.106.250.222` |
| `autodiscover` | A | `109.106.250.222` |
| `autoconfig` | A | `109.106.250.222` |
| `ftp` | CNAME | `dropchinaoficial.com.br.` |
| `@` | TXT | `google-site-verification=7I4GrtrRrylIo-nCpm_eGJys_0ui5AL3AFWCfCNM4M0` (add. 23/08) |
| `_dmarc` | TXT | `v=DMARC1; p=none;` |
| `default._domainkey` | TXT | DKIM RSA — chave completa abaixo |

DKIM atual (selector `default`, gerado pelo cPanel):
```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwsNT2QVZeXA1GhDIck+QKo/X66p6QFdRLs13pIEz81QvKur/EfWYydLkGfKSSiIvQBEOGCcsrpktxvXQL9tZ19nVi0vquyFyW+1Cg6nyxwENBlueg89GNl1VSzlaJSLYHKonjswgwqbyTemkqzUnTUKauyEfQ/P4YaeKDiNiI4py8GZ+V6gBRkkhiJpRR2mMsk1vfJ0MH5yXl9TFl0Uosadf5KclNLXCwwg1/ct6uejMFCmri8G/uUDdmiQfH//4UOQSqYZykuW+51XcnzwmH6gbbLeWXKJ3iT2APXYlZHvUyuuujuVhQzo81dFhVmZjvzMasa1MmjCBtG9WRbrefwIDAQAB;
```

### Zona completa lida do cPanel (04/ago, via UAPI)

O levantamento externo achava só os nomes que eu adivinhava. Com acesso ao painel, a zona real tem
mais coisa — e a maior parte **não deve ser copiada** na migração, porque só existe para servir o
cPanel.

**Copiar para o Cloudflare:**

| Nome | Tipo | Valor | Observação |
|---|---|---|---|
| `@` | A | `23.227.38.65` | Shopify — **crítico, é a loja** |
| `www` | CNAME | `shops.myshopify.com.` | Shopify |
| `@` | MX | `0 mail.dropchinaoficial.com.br.` | muda ao trocar de provedor |
| `@` | TXT | SPF (ver acima) | **muda** ao trocar de provedor |
| `@` | TXT | `google-site-verification=...` | **copiar** — perde a validação do Search Console se sumir |
| `_dmarc` | TXT | `v=DMARC1; p=none;` | mantém |
| `default._domainkey` | TXT | DKIM | **muda** — selector novo do provedor novo |
| `mail` | A | `109.106.250.222` | só até o e-mail sair |

**Não copiar** — são serviços do cPanel e morrem junto com ele:
`cpanel`, `whm`, `webmail`, `webdisk`, `cpcalendars`, `cpcontacts`, `autodiscover`, `autoconfig`,
`ftp`, os SRV `_caldav._tcp` / `_caldavs._tcp` / `_carddav._tcp` / `_carddavs._tcp` /
`_autodiscover._tcp`, e os TXT temporários `_cpanel-dcv-test-record` e `_acme-challenge`.

> São 31 registros na zona e só **7 importam**. O resto é entulho de painel.

### Caixas de e-mail (04/ago, via UAPI)

| Caixa | Usado | Quota |
|---|---|---|
| **`comercial@`** | **450,92 MB** | 1 GB |
| `contato@` | 129,13 KB | 1 GB |
| `natalia@` | 80,19 KB | 1 GB |
| `augusto@` | 80,19 KB | 1 GB |

**Nenhum encaminhador configurado.**

O que isso diz: só o **`comercial@` tem histórico de verdade** — 450 MB, quase metade da cota. As
outras três estão praticamente vazias (80–129 KB é caixa recém-criada, com pouco mais que a mensagem
de boas-vindas). **A migração IMAP séria é de uma caixa só**; as outras três dá para recriar do zero.

⚠️ Já perto do limite: `comercial@` está em 45% de 1 GB e não há política de arquivamento. Vale
subir a cota no provedor novo.

### Quem é o dono da conta (04/ago, via UAPI) — corrige o que se supunha

| Campo | Valor |
|---|---|
| **`owner`** | **`cloudclu`** |
| **`plan`** | **`cloudclu_basico`** |
| **`created`** | **19/01/2026 17:24 UTC** |
| `last_modified` | 19/01/2026 22:41 UTC |
| **`contact_email`** | **`contato@dropchinaoficial.com.br`** |
| `hostname` | `cpl27.main-hosting.eu` · cPanel 134.0 (build 44) |
| `mailbox_format` | `mdbox` (Dovecot) |
| `backup_enabled` | 1 |

**Três coisas mudam de figura aqui:**

1. **O revendedor é `cloudclu`, não a Sounet.** O `rafael.sounet.com.br` que aparece no SOA é só o
   contato do *template de zona* daquele servidor, não o dono da conta. O `owner` do cPanel é a
   conta WHM que criou a nossa — e é `cloudclu`, com pacote `cloudclu_basico`. O Cleverton pode ser
   o `cloudclu`, ou revender de quem é. **Vale perguntar direto a ele.**

2. **A conta foi criada em 19/01/2026** — tem cerca de seis meses, não é resquício de anos atrás.
   Isso enfraquece a hipótese de "pagaram lá atrás e ficou por isso mesmo": provavelmente **há
   contratação recente e ativa**, com alguém pagando agora.

3. **O e-mail de contato da conta é `contato@dropchinaoficial.com.br`** — ou seja, os avisos de
   cota, expiração e alteração vão para uma caixa **que vocês controlam**, não para o revendedor.
   Vale abrir essa caixa e procurar: cobrança, aviso de renovação ou mensagem de boas-vindas da
   criação em 19/01 costumam estar lá, e podem responder de vez quem paga.

### Quem mais tem acesso

| Verificação | Resultado |
|---|---|
| Contas de FTP | Só as 2 padrão (`dropchinaoficial`, `dropchinaoficial_logs`) — nenhum acesso estranho |
| Encaminhadores de e-mail | Nenhum — nada sendo copiado para fora |
| Filtros de e-mail | Nenhum |
| Respondedores automáticos | Nenhum |
| Subdomínios / domínios adicionais | Nenhum — só `dropchinaoficial.com.br` |
| Tokens de API existentes | ⚠️ **não verificável** |
| Usuários de equipe | ⚠️ **não verificável** |

⚠️ **Limitação real:** o provedor removeu os módulos `APITokens`, `CustInfo`, `Team` e `Cron` desta
instalação do cPanel (retornam "módulo não encontrado"). Então **não dá para listar por API se
existem outros tokens ou usuários com acesso**. Conferir na interface, em
*Segurança → Manage API Tokens* e *Preferências → Manage Team*.

O que dá para afirmar: **não há FTP, encaminhador, filtro ou domínio estranho na conta.** O
revendedor mantém acesso pelo WHM dele de qualquer forma — isso é inerente à revenda e não tem como
remover; só migrando.

### Conta de hospedagem
`209,51 MB de 20.240 MB` usados · `738 de 500.000` inodes · **0 bancos de dados** · 0 subdomínios.

Ou seja: **não há site nenhum hospedado ali.** Nem WordPress, nem banco, nem arquivo relevante.
A conta serve **exclusivamente e-mail**. Isso simplifica muito — não há o que migrar além das caixas
e do DNS.

(O disco da conta marca 209 MB enquanto o `comercial@` sozinho tem 450 MB: nesse servidor a cota de
e-mail é contabilizada à parte da cota de arquivos.)

Notas de leitura:
- `109.106.250.222` e `195.35.61.27` são o **mesmo servidor** (`cpl27.main-hosting.eu`) — Hostinger
  usa IPs distintos para entrada e saída. Por isso o SPF libera o `195.35.61.27`.
- Site (Shopify) e e-mail (Hostinger) são **independentes**. Mexer num não afeta o outro.
- `mail`, `webmail`, `cpanel`, `whm`, `autodiscover`, `autoconfig` e `ftp` só existem por causa da
  hospedagem antiga. Depois da migração, a maioria some.
- DNS público não permite listar a zona inteira — só consultar nome a nome. A tabela cobre os nomes
  usuais e tudo que está em uso. Se existir um subdomínio exótico esquecido, pode não aparecer.

---

## 3. Plano — ordem importa

> **Nenhum passo precisa do revendedor.** Ele não é bloqueio em lugar nenhum.

| # | Passo | Precisa dele? |
|---|---|---|
| 1 | Inventariar o DNS | ❌ público — **feito, é a tabela acima** |
| 2 | Criar a zona no Cloudflare (grátis) com os registros **idênticos** | ❌ |
| 3 | Trocar o NS no **registro.br** para o Cloudflare | ❌ só registro.br |
| 4 | Assinar o plano de e-mail novo e criar as caixas | ❌ |
| 5 | Migrar as mensagens por **IMAP** da caixa antiga para a nova | ❌ só a senha da caixa |
| 6 | Trocar **MX**, **SPF** e **DKIM** para o provedor novo | ❌ o DNS já é seu |
| 7 | Desplugar o revendedor | — |

Do passo 3 em diante o controle é de vocês. Os passos 2 e 3 **não derrubam nada**, desde que os
registros sejam copiados exatamente — o domínio continua resolvendo para os mesmos lugares, só que
por outro servidor de DNS.

### Antes do passo 3
Baixar o **TTL** dos registros para ~300s com alguns dias de antecedência, se o painel permitir.
Reduz a janela de propagação e o tamanho do estrago se algo sair errado.

---

## 4. Armadilhas

**Migrar as mensagens antes de desligar.** Cortar primeiro perde o histórico do `comercial@` — e
ali provavelmente há conversa fiscal e de fornecedor. IMAP dos dois lados, copiar, conferir, só
então desligar.

**SPF e DKIM não são opcionais.** O SPF atual libera o servidor antigo (`195.35.61.27` + MailChannels).
Ao trocar de provedor, ele precisa passar a liberar o novo, e o DKIM ganha outro selector. Se
esquecer, **nada quebra na hora** — o e-mail começa a cair em spam semanas depois e ninguém liga uma
coisa na outra. É o erro mais comum e o mais difícil de diagnosticar depois.

**O `A` da Shopify não pode piscar.** É a loja. Confere antes e depois da troca de NS.

**Copiar exatamente.** Um TXT faltando não dá erro visível.

---

## 5. Rollback

Se algo quebrar depois do passo 3, **voltar o NS no registro.br** para `cdns1.main-hosting.eu` e
`cdns2.main-hosting.eu`. A zona antiga continua existindo no painel do revendedor enquanto a conta
estiver ativa, então a volta é imediata — limitada só pela propagação.

Por isso: **não cancelar a hospedagem antiga** antes de tudo estar funcionando e verificado por
alguns dias.

---

## 6. Provedor de e-mail — a decidir

Sem cotação de preço feita. Ordem de grandeza a confirmar antes de prometer:

| Opção | Nota |
|---|---|
| **Hostinger** (conta própria, hPanel) | sai do stack legado, painel moderno |
| **Zoho Mail** | tem plano gratuito com domínio próprio |
| **Google Workspace** | mais fácil de usar, mais caro |

Critério que passa por cima do preço: a caixa **`comercial@dropchinaoficial.com.br` vai virar a
identidade da empresa** — é ela que deve ser dona do GA4, Meta Pixel, Clarity, Search Console e da
própria loja Shopify. Hoje essas contas não existem ou estão em e-mail pessoal, o que repete o
mesmo problema de dependência em outra camada.

---

## 7. "Quando expira esse plano?" — não existe essa data

Pergunta feita ao Cleverton em 04/ago. A resposta dele: *"não é provedor, é a central do servidor
dele"*. Está correta, e é exatamente o problema.

Como funciona o modelo de revenda:

```
Hostinger  ──vende plano de revenda──►  Cleverton / Sounet  ──cria contas cPanel──►  DropChina
   (quem cobra dele)                        (quem cobra do Augusto, se cobra)          (nós)
```

A DropChina **não tem contrato com a Hostinger**. Tem uma conta dentro do servidor que o Cleverton
aluga. Consequências práticas:

- **Não existe data de expiração visível pra vocês.** O cPanel não mostra vencimento porque
  vencimento é um conceito de cobrança, e a cobrança está uma camada acima, entre Cleverton e
  Hostinger.
- **A conta vive enquanto ele pagar.** Se ele parar — por esquecimento, briga, ou por fechar a
  empresa — o servidor cai e **a DropChina descobre pelo site fora do ar**, sem aviso e sem poder
  fazer nada.
- **Vocês não têm como monitorar isso.** É deliberado: revenda é white-label.

Ou seja: a resposta para "tem prazo?" é **"tem, mas não é seu, e você não consegue ver"**. Esse é o
argumento inteiro para migrar — não é economia de mensalidade, é parar de ter um ponto único de
falha operado por terceiro.

Único jeito de saber algo: **perguntar direto** — "essa hospedagem tem mensalidade? quem paga? está
em dia?" — e conferir o extrato do Augusto atrás de cobrança recorrente da Sounet.

## 8. Auditar de novo

O levantamento acima saiu de `scripts/cpanel-audit.py` — read-only, via UAPI do cPanel. Lê a zona
DNS completa, as caixas com uso de disco, encaminhadores e a quota.

```bash
python3 scripts/cpanel-audit.py
```

Precisa de `CPANEL_TOKEN` no `.env` da raiz (gitignored). O token se cria em
*cPanel → Segurança → Manage API Tokens*. **Token de cPanel dá acesso total à conta** — criar,
usar e revogar na mesma tela.

## 9. Pendências

- [ ] **Revogar o token de API** usado nesta auditoria
- [ ] **Abrir a caixa `contato@`** — é o e-mail de contato da conta. A criação em 19/01/2026 e qualquer aviso de cobrança/renovação devem estar lá. É o caminho mais rápido para descobrir quem paga
- [ ] **Perguntar ao Cleverton quem é o `cloudclu`** — é o dono real da conta, e o pacote chama `cloudclu_basico`
- [ ] Conferir na interface se há **outros tokens de API ou usuários de equipe** (a API não permite listar nesta instalação)
- [ ] Trocar a senha do cPanel exposta + ligar 2FA
- [ ] Decidir o provedor de e-mail e cotar (cota maior que 1 GB para o `comercial@`)
- [ ] Executar os passos 2 a 7
