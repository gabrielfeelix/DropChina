# DropChina · MCP Bling

MCP server local para a **API v3 do Bling**, a fonte da verdade de catálogo, estoque e fiscal do projeto DropChina. Expõe o Bling como ferramentas (tools) reutilizáveis para a IA e traz scripts de carga em massa.

> Contexto e arquitetura: [`01_DropChina_Projeto_e_Arquitetura.md`](01_DropChina_Projeto_e_Arquitetura.md) · Runbook técnico: [`02_Bling_Runbook_para_IA.md`](02_Bling_Runbook_para_IA.md) · Pré-requisitos no painel do Bling: [`00_Checklist_Pre_Requisitos_Bling.md`](00_Checklist_Pre_Requisitos_Bling.md)

## Estado atual (v0.1)

Primeira leva: **OAuth + categorias**. Já funciona:

- OAuth 2.0 (Authorization Code) com **refresh automático** e tokens persistidos em `tokens.json`.
- Rate limiter (≤3 req/s) respeitando os limites do Bling.
- MCP server (stdio) com as tools `bling_list_categories` e `bling_create_category`.
- Script idempotente de **seed das 12 categorias** oficiais.

Produtos, estoque e NF-e vêm nas próximas levas.

## Pré-requisitos

- Node.js ≥ 20.
- App privado criado no Bling e `.env` preenchido (ver [checklist](00_Checklist_Pre_Requisitos_Bling.md)).
  Copie `.env.example` → `.env` e preencha `BLING_CLIENT_ID`, `BLING_CLIENT_SECRET`, `BLING_REDIRECT_URI`.

## Instalação

```bash
npm install
```

## 1. Autorizar (uma vez, com o Augusto logado)

```bash
npm run authorize
```

O script sobe um servidor em `http://localhost:3000/callback`, imprime a **URL de autorização** e aguarda. O Augusto abre a URL no navegador, faz login e clica em **Autorizar**.

> ⚠️ O `code` do Bling **expira em ~1 minuto** — faça o login sem demora.

Ao final, os tokens ficam em `tokens.json` (fora do git). O `access_token` renova sozinho via `refresh_token` (validade de 30 dias). Só é preciso repetir se ficar 30 dias sem uso.

## 2. Semear as 12 categorias

```bash
npm run seed:categorias -- --dry   # mostra o que faria, sem criar
npm run seed:categorias            # cria o que faltar (idempotente)
```

Cada linha-tipo da taxonomia (`categorias_marcas.json`) vira **uma** categoria no Bling. A **marca** não vira categoria — vira atributo/tag do produto (decisão da arquitetura).

## 3. Rodar o MCP server

```bash
npm run mcp
```

Comunica via **stdio**. Para usar no Claude Code, registre em `.mcp.json` / configuração de MCP:

```json
{
  "mcpServers": {
    "dropchina-bling": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/home/gabfelix/dev/dropchina-shopify/mcp-bling"
    }
  }
}
```

### Tools disponíveis

| Tool | Faz |
|---|---|
| `bling_list_categories` | Lista todas as categorias de produto (paginação automática). |
| `bling_create_category` | Cria categoria (`descricao`, `categoriaPaiId` opcional). |

## Estrutura

```
src/
├── config.ts              # lê o .env, endpoints, porta do callback
├── auth/
│   ├── oauth.ts           # authorize URL, troca de code, refresh serializado
│   └── token-store.ts     # persiste/lê tokens.json (modo 0600)
├── api/
│   ├── rate-limiter.ts    # janela deslizante ≤3 req/s
│   ├── client.ts          # injeta token válido + rate limit no SDK bling-erp-api
│   └── categorias.ts      # list/create/ensure (idempotente)
├── mcp/
│   └── server.ts          # MCP server (stdio) + tools
└── scripts/
    ├── authorize.ts       # fluxo OAuth (npm run authorize)
    └── seed-categorias.ts # carga das 12 categorias
```

## Segurança

- `.env` e `tokens.json` **nunca** vão para o git (`.gitignore`).
- O `refresh` é serializado e só dispara perto de expirar — o endpoint `/oauth/token` bloqueia o IP por 1h após 20 chamadas/min.
- `client_secret` nunca aparece em logs.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run authorize` | Fluxo OAuth (1ª vez). |
| `npm run seed:categorias` | Cria as 12 categorias (idempotente). `-- --dry` para simular. |
| `npm run mcp` | Sobe o MCP server (stdio). |
| `npm run typecheck` | Checagem de tipos. |
| `npm run build` | Compila para `dist/`. |
