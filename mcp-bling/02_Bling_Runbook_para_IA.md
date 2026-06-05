# Bling — Runbook de Implementação para IA

> Guia técnico **passo a passo** para uma IA (agente em VS Code, ex.: Claude Code) construir e operar a integração com o **Bling** via **API v3 / MCP**, conforme a arquitetura definida em **`01_DropChina_Projeto_e_Arquitetura.md`**.
> Leia o documento mestre **antes** de começar. Este runbook assume aquele contexto.

- **Versão:** 1.0 · Junho de 2026
- **Pré-leitura obrigatória:** `01_DropChina_Projeto_e_Arquitetura.md`
- **Referência canônica da API:** https://developer.bling.com.br/referencia (consulte sempre que precisar do detalhe exato de um campo)

---

## PARTE A — Briefing para a IA (leia primeiro)

### Sua missão
Construir uma integração local com o Bling (fonte da verdade do projeto DropChina) que permita **cadastrar categorias e produtos, controlar estoque e consultar/emitir notas fiscais de forma programática**, e expor essas capacidades como um **MCP server** reutilizável. Em seguida, **popular o Bling** com a taxonomia oficial (12 categorias) e preparar o terreno para a sincronização nativa Bling↔Shopify e Bling↔Mercado Livre.

### Contexto em uma frase
O Augusto vende suprimentos de impressão/automação no **Mercado Livre (reputação Platinum)** e terá também um **site Shopify**; o **Bling** centraliza catálogo, estoque e fiscal e distribui para os dois canais. Você opera o Bling pela **API v3**.

### Princípios e regras (não negociáveis)
1. **SKU é sagrado.** No Bling o SKU é o campo **`codigo`**. Ele deve ser **idêntico** ao SKU da Shopify e do ML. Nunca crie um produto sem `codigo`, e nunca gere `codigo` divergente de um item que já exista em outro canal — isso **duplica cadastro**.
2. **Nada destrutivo sem confirmação.** Não delete nem sobrescreva em massa sem antes rodar em **amostra pequena** e pedir validação humana. Confirme caminhos/IDs antes de qualquer `DELETE`/`PUT` em lote.
3. **Idempotência.** Antes de criar, **verifique se já existe** (busca por `codigo`). Operações devem poder rodar de novo sem duplicar.
4. **Respeite o rate limit:** máximo **3 requisições/segundo** e **120.000/dia**. Implemente um limitador e *retry* com *backoff* em 429.
5. **OAuth sempre server-side.** Nunca exponha `client_secret`, `authorization_code` ou tokens em logs, no front, ou em commits. Use `.env` + `.gitignore`.
6. **Fiscal mora no Bling.** Não tente colocar NCM/CEST/origem na Shopify. Esses campos vivem no Bling.
7. **Valide antes de emitir nota.** GTIN inválido causa rejeição **890**. Cheque GTIN/EAN antes de qualquer fluxo de NF-e.

### Definição de pronto (sucesso)
- OAuth funcionando com refresh automático de token.
- MCP server expõe, no mínimo: listar/criar/atualizar produto, listar/criar categoria, ajustar estoque, listar NF-e.
- As **12 categorias** da planilha criadas no Bling (idempotente).
- Um produto-piloto criado de ponta a ponta (com `codigo`, GTIN, preço, NCM, categoria) e validado.
- Documento de "como autorizar/rodar" no `README` do repositório.

---

## PARTE B — Pré-requisitos (executados por um humano: Gabriel/Augusto)

A IA **não** consegue fazer estes passos (exigem login e credenciais). Garanta que estejam prontos:

1. **App privado no Bling:** `Central de Extensões → Área do Integrador → Criar aplicativo → visibilidade Privada`.
2. **Dados do app:** definir **`redirect_uri`** (ex.: `http://localhost:3000/callback`), nome, e marcar os **escopos**:
   - Produtos (leitura/escrita)
   - Categorias de produtos (leitura/escrita)
   - Estoques (leitura/escrita)
   - Notas Fiscais Eletrônicas / NFC-e (leitura/escrita)
   - Pedidos de venda (leitura)
   - Contatos (leitura) — opcional, útil para destinatários de nota
3. **Credenciais:** copiar **`client_id`** e **`client_secret`** (aba "Informações do app").
4. **Certificado e-CNPJ A1** instalado no Bling (para emitir NF-e).
5. Entregar à IA, via `.env` local: `BLING_CLIENT_ID`, `BLING_CLIENT_SECRET`, `BLING_REDIRECT_URI`.

---

## PARTE C — Passo a passo de implementação

### Passo 1 — Scaffold do projeto
Stack recomendada: **Node.js + TypeScript** (melhor ecossistema para MCP via `@modelcontextprotocol/sdk`). Python (FastMCP) é alternativa válida.

```
bling-mcp/
├── .env                  # credenciais (NUNCA commitar)
├── .env.example
├── .gitignore            # inclui .env e tokens.json
├── package.json
├── README.md             # como autorizar e rodar
├── src/
│   ├── auth/
│   │   ├── oauth.ts      # fluxo authorization_code + refresh
│   │   └── token-store.ts# persiste tokens em tokens.json (local)
│   ├── api/
│   │   ├── client.ts     # wrapper HTTP + rate limiter + retry
│   │   ├── produtos.ts
│   │   ├── categorias.ts
│   │   ├── estoques.ts
│   │   └── nfe.ts
│   ├── mcp/
│   │   └── server.ts     # define as ferramentas MCP
│   └── scripts/
│       ├── seed-categorias.ts  # carga das 12 categorias
│       └── import-produtos.ts  # carga/alinhamento de produtos
└── data/
    └── categorias_marcas.json  # taxonomia oficial (da planilha)
```

> Use a skill **`mcp-builder`** para gerar o esqueleto do MCP server com boas práticas.

> 💡 **Camada de API — não reinventar a roda.** Existe um SDK comunitário maduro e mantido: [`AlexandreBellas/bling-erp-api-js`](https://github.com/AlexandreBellas/bling-erp-api-js) — TypeScript 100%, v5.8.1 (set/2025), cobre `.produtos`, `.categoriasProdutos`, `.estoques`, `.nfes` e 40+ entidades. Ele **recebe** o `access_token` mas **não faz** o handshake OAuth — então o nosso código foca em: (1) OAuth + persistência/refresh de token, (2) rate limiter, (3) as tools MCP. A chamada de API em si delega ao SDK. (O `prhost/bling-v3-sdk` citado nas fontes é uma alternativa mais simples / menos mantida.)

### Passo 2 — Implementar o OAuth 2.0 (Authorization Code)

**Endpoints:**
- **Authorize (navegador):** `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id={CLIENT_ID}&state={STATE_ALEATORIO}`
- **Token:** `POST https://api.bling.com.br/Api/v3/oauth/token`

**Fluxo:**
1. Suba um mini servidor local em `redirect_uri` (ex.: `http://localhost:3000/callback`).
2. Abra a URL de **authorize** no navegador; o Augusto autoriza; o Bling redireciona para o callback com `?code=...` (o `code` **expira em 1 minuto**).
3. Troque o `code` por tokens com **Basic Auth** no header (`Authorization: Basic base64(client_id:client_secret)`):

```bash
curl -X POST https://api.bling.com.br/Api/v3/oauth/token \
  -H "Authorization: Basic $(echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODIGO_RECEBIDO"
```

4. Retorno: JSON com `access_token`, `refresh_token` (validade **30 dias**), `expires_in`, `scope`.
5. **Persistir** os tokens em `tokens.json` (fora do git) e **renovar** automaticamente quando faltar pouco para expirar:

```bash
curl -X POST https://api.bling.com.br/Api/v3/oauth/token \
  -H "Authorization: Basic $(echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=SEU_REFRESH_TOKEN"
```

> Observação: a autenticação por *token opaco* foi descontinuada — o Bling usa **JWT**. Use sempre o token retornado como `Bearer` no header das chamadas de API.

### Passo 3 — Cliente da API (camada HTTP)
- **Base URL:** `https://api.bling.com.br/Api/v3`
- **Header de auth:** `Authorization: Bearer {access_token}`
- Implementar: **rate limiter** (≤3 req/s), **retry com backoff** (429/5xx), **paginação** (`pagina`, `limite`), e **refresh transparente** do token em 401.

> ⚠️ **Limites que vão além de "3 req/s" — respeitar para não levar bloqueio de IP** (fonte: [Bling — Limites](https://developer.bling.com.br/limites)):
> - **3 req/s** e **120.000/dia** por conta.
> - **300 erros em 10s** → IP bloqueado por **10 min**.
> - **600 requisições em 10s** → IP bloqueado por **10 min**.
> - **20 chamadas a `/oauth/token` em 60s** → IP bloqueado por **60 min**. ⬅ **cuidado redobrado:** um loop de refresh malfeito derruba o OAuth por 1 hora. Só renove o token quando faltar pouco para expirar (não a cada chamada), e serialize o refresh (evitar refresh concorrente).
> - Reincidência pode gerar bloqueio por tempo indeterminado. O estouro de limite retorna **HTTP 429**.

### Passo 4 — Construir o MCP server (ferramentas mínimas)
Exponha como tools MCP:

| Tool | Faz | Endpoint base |
|---|---|---|
| `bling_list_products` | lista/busca produtos (por `codigo`, nome) | `GET /produtos` |
| `bling_get_product` | detalhe por id | `GET /produtos/{id}` |
| `bling_create_product` | cria produto | `POST /produtos` |
| `bling_update_product` | atualiza produto | `PUT /produtos/{id}` |
| `bling_list_categories` | lista categorias de produto | `GET /categorias/produtos` |
| `bling_create_category` | cria categoria | `POST /categorias/produtos` |
| `bling_set_stock` | ajusta estoque | `POST /estoques` |
| `bling_list_nfe` | lista notas | `GET /nfe` |

> Sempre que precisar do **schema exato** de um payload, consulte a referência oficial: https://developer.bling.com.br/referencia (não invente campos).

### Passo 5 — Carga inicial das 12 categorias (idempotente)
1. Carregue `data/categorias_marcas.json` (taxonomia oficial — ver Apêndice 2).
2. Para cada categoria: `bling_list_categories` → se **não existir**, `bling_create_category`.
3. Logue o resultado (criada/já existia). Rode primeiro com 1–2 categorias para validar.

### Passo 6 — Cadastro/alinhamento de produtos
Para cada produto:
1. Buscar por `codigo` (SKU). Se existir, **atualizar**; se não, **criar**.
2. Preencher no mínimo: `nome`, `codigo` (SKU), `tipo: "P"`, `situacao: "A"`, `formato: "S"`, `preco`, `gtin` (EAN), e a **categoria** (id da categoria criada no passo 5).
3. Preencher **tributação** (NCM, origem; CEST se houver ST). Se faltar NCM, deixar para o Bling preencher via nota de entrada.
4. Validar GTIN antes de qualquer fluxo de nota.

### Passo 7 — Conectar Bling ↔ Shopify (painel do Bling, humano)
- No Bling: instalar/abrir a integração Shopify, autenticar a loja.
- Conferir o **vínculo por SKU**: produtos com `codigo` (Bling) = SKU (Shopify) casam; divergentes duplicam.
- Definir o Bling como **dono do estoque** e ativar sincronização.

### Passo 8 — Conectar Bling ↔ Mercado Livre (painel do Bling, humano)
- Vincular a conta ML do Augusto (Platinum) ao Bling.
- Configurar a regra de NF-e: **"Gerar e emitir NF-e ao disponibilizar o pedido para envio"** (emite só quando o ML libera a etiqueta — evita nota antecipada e retrabalho em cancelamento).

### Passo 9 — Testes / homologação
- Testar criação/atualização de produto e categoria pela API.
- Emitir uma NF-e em **ambiente de homologação** antes de produção.
- Validar que estoque sincroniza nos dois canais sem oversell.

### Passo 10 — Go-live (checklist)
- [ ] OAuth com refresh estável
- [ ] 12 categorias no Bling
- [ ] Produtos com SKU idêntico nos 3 sistemas
- [ ] GTIN válido em todos os itens fiscais
- [ ] Estoque centralizado no Bling, sync ativa
- [ ] NF-e validada em homologação
- [ ] Regra de emissão do ML configurada
- [ ] `README` com instruções de autorização/execução

---

## PARTE D — Referência técnica

### D.1 Endpoints principais
| Recurso | Método | URL |
|---|---|---|
| Authorize | GET | `https://www.bling.com.br/Api/v3/oauth/authorize` |
| Token / Refresh | POST | `https://api.bling.com.br/Api/v3/oauth/token` |
| Revogar token | POST | `https://api.bling.com.br/Api/v3/oauth/revoke` |
| Produtos | GET/POST/PUT/DELETE | `https://api.bling.com.br/Api/v3/produtos` |
| Categorias de produtos | GET/POST | `https://api.bling.com.br/Api/v3/categorias/produtos` |
| Estoques | GET/POST | `https://api.bling.com.br/Api/v3/estoques` |
| NF-e | GET/POST | `https://api.bling.com.br/Api/v3/nfe` |
| NFC-e | GET/POST | `https://api.bling.com.br/Api/v3/nfce` |
| Pedidos de venda | GET | `https://api.bling.com.br/Api/v3/pedidos/vendas` |

### D.2 Exemplo de payload de produto (POST /produtos)
```json
{
  "nome": "Toner Compatível HP 105A com Chip - Preto",
  "codigo": "EVO-W1105A",
  "tipo": "P",
  "situacao": "A",
  "formato": "S",
  "preco": 36.00,
  "gtin": "7891234567890",
  "pesoBruto": 0.4,
  "pesoLiquido": 0.35,
  "categoria": { "id": 0 },
  "tributacao": {
    "ncm": "84439933",
    "origem": 0,
    "cest": ""
  }
}
```
> Campos como `tipo`, `situacao`, `formato` usam códigos do Bling: `tipo:"P"` (Produto), `situacao:"A"` (Ativo), `formato:"S"` (Simples). Confirme os demais na referência oficial.

### D.3 Mapeamento planilha → Bling
| Planilha | Campo no Bling | Observação |
|---|---|---|
| Categoria | `categoria.id` (após criar em `/categorias/produtos`) | uma categoria Bling por linha-tipo da planilha |
| Marca | atributo/`marca` do produto + tag de compatibilidade | marca = fabricante real; compatibilidade = atributo |
| (SKU do item) | `codigo` | **idêntico** ao da Shopify/ML |
| (EAN do item) | `gtin` | exigido p/ NF-e |

---

## PARTE E — Glossário e fontes

**Glossário rápido:** **NCM** (classificação fiscal do produto) · **CEST** (código p/ Substituição Tributária) · **GTIN/EAN** (código de barras) · **Origem** (nacional/importado) · **NF-e** (nota fiscal eletrônica, B2B/envio) · **NFC-e** (nota ao consumidor) · **e-CNPJ A1** (certificado digital para emitir) · **SKU/`codigo`** (identificador único do item).

**Fontes:**
- [Bling — Autenticação / OAuth2](https://developer.bling.com.br/autenticacao)
- [Bling — Cadastro de aplicativos](https://developer.bling.com.br/aplicativos)
- [Bling — Referência da API](https://developer.bling.com.br/referencia)
- [Bling — Limites de requisição](https://developer.bling.com.br/limites)
- [Bling — Migração API v2 → v3](https://developer.bling.com.br/migracao-v2-v3) (a v2 está **descontinuada**; projeto novo nasce na v3)
- [Bling — Homologação](https://developer.bling.com.br/homologacao)
- [Bling — Integração Shopify](https://www.bling.com.br/integracao/shopify) · [Integração Mercado Livre](https://www.bling.com.br/integracao/mercado-livre)
- [SDK comunitário recomendado — `AlexandreBellas/bling-erp-api-js`](https://github.com/AlexandreBellas/bling-erp-api-js) (TS, v3, mantido) · alternativa: [`prhost/bling-v3-sdk`](https://github.com/prhost/bling-v3-sdk)
- [Model Context Protocol — SDK](https://github.com/modelcontextprotocol)
