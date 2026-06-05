# Checklist — Criar o app no DevCenter do Mercado Livre

> Passo a passo pra gerar as credenciais do cliente **read-only** do ML. É um passo humano (login na conta). Leva ~5 min. Baseado na doc oficial (developers.mercadolivre.com.br), jun/2026.

## Antes de começar
- Logar com a conta **dona** da operação (o dono/PJ da DropChina — idealmente o Augusto, conta administradora; **operador/colaborador não serve**, o ML rejeita).
- Os **dados do titular** precisam estar preenchidos e validados no DevCenter, batendo com o cadastro da conta — senão o ML não deixa criar app.

## Passo a passo

1. Acesse o painel de aplicações direto (logado): **https://developers.mercadolivre.com.br/devcenter** (a home não tem link óbvio — o card "Gestão de aplicações" é só documentação; o painel real é o `/devcenter`).
2. Clique em **"Criar aplicação"** (ou atalho direto: **https://developers.mercadolivre.com.br/devcenter/create-app**).
3. Preencha:
   | Campo | O que pôr |
   |---|---|
   | **Nome** | `DropChina Integração` (único na plataforma) |
   | **Descrição** | `Integração de catálogo e gestão DropChina` (≤150 caracteres; aparece na tela de autorização) |
   | **Logo** | logo da DropChina (opcional p/ funcionar; PNG quadrado) |
   | **URI de redirect** | `https://dropchinaoficial.com.br/oauth/meli` ⚠️ **TEM que ser HTTPS** e **idêntica** à do `.env`. A página não precisa existir — só lemos o `code` da barra de URL. |
   | **Usar PKCE** | **deixar DESMARCADO** (nosso fluxo não usa) |
   | **Device Grant** | desmarcado |
   | **Scopes / Permissões** | marcar **Leitura (read)** e **offline_access**. **NÃO marcar Escrita (write)** — é read-only. |
   | **Tópicos / Notificações** | pode deixar vazio (não usamos webhook agora) |
4. Salvar. O app aparece na lista com **App ID** e **Secret Key**.
5. Copiar:
   - **App ID** → vai em `MELI_CLIENT_ID`
   - **Secret Key** → vai em `MELI_CLIENT_SECRET`
   (ficam também em **Configurar → Application settings**.)

## Preencher o .env

```bash
cd mcp-meli
cp .env.example .env
# editar .env:
#   MELI_CLIENT_ID=<App ID>
#   MELI_CLIENT_SECRET=<Secret Key>
#   MELI_REDIRECT_URI=https://dropchinaoficial.com.br/oauth/meli   (IDÊNTICA à registrada)
npm install
```

## Autorizar (1 vez)

```bash
npm run authorize                      # imprime a URL de autorização
# → abrir a URL no navegador (logado como dono) → Autorizar
# → o ML redireciona pra redirect_uri com ?code=... na barra (página pode dar erro, tudo bem)
# → copiar o code e rodar:
npm run authorize -- --code=SEU_CODE   # (ou cole a URL inteira em --code="...")
```

Tokens salvos em `tokens.json` (fora do git). `access_token` dura 6h; o refresh renova sozinho depois (refresh é **rotativo** — o cliente já persiste o novo a cada uso). O `refresh_token` expira em ~6 meses sem uso.

> ⚠️ O `code` expira em poucos minutos e é de **uso único**. Se demorar, rode `npm run authorize` de novo pra gerar outra URL.

## Pronto → puxar o catálogo

```bash
npm run pull
# gera out/catalogo.json + out/auditoria.md (sem SKU, sem GTIN, por categoria)
```

## Observações
- **Tudo read-only:** o cliente só faz GET. Não altera, não pausa, não vincula anúncio — **zero risco** pra operação Platinum.
- Se preferir um redirect "de verdade" com callback automático (sem colar code), dá pra usar um túnel HTTPS (cloudflared/ngrok) apontando pro localhost — mas o fluxo de colar o code é mais simples pra autorização única.

## Fontes
- [Criar aplicação (DevCenter)](https://developers.mercadolivre.com.br/en_us/register-your-application)
- [Autenticação e Autorização (OAuth)](https://developers.mercadolivre.com.br/en_us/authentication-and-authorization)
- [Itens e buscas](https://developers.mercadolivre.com.ar/en_us/items-and-searches)
