# DropChina Importer — Chrome Extension

Chrome Extension MV3 que importa produtos do Mercado Livre (e outros sites) direto pra loja Shopify DropChina.

## Status

🚧 **Em desenvolvimento.** Veja [extension-prompt.md](../docs/extension-prompt.md) pra spec completa.

## Setup (3 passos)

### 1. Configurar credenciais Shopify (~3 min)

Você precisa criar uma **Custom App** no admin Shopify pra gerar o access token.

**Passo a passo:**

1. Abre: https://admin.shopify.com/store/akfd19-1c/settings/apps/development
2. Se aparecer banner "Allow custom app development" → clica **Allow** (uma vez só)
3. **Create an app** → nome: `DropChina Importer` → **Create app**
4. Aba **Configuration** → seção **Admin API integration** → **Configure**
5. Marca os scopes:
   - ☑ `write_products`, `read_products`
   - ☑ `write_inventory`, `read_inventory`
   - ☑ `write_publications`, `read_publications`
   - ☑ `write_files`, `read_files`
6. **Save**
7. Aba **API credentials** → botão **Install app** → confirma
8. Copia o **Admin API access token** (começa com `shpat_`)
   - ⚠️ Esse token só aparece **uma vez**. Guarda num password manager também.

### 2. Configurar `.env`

```bash
cd extension
# .env já foi criado a partir do .env.example
nano .env  # ou seu editor preferido
```

Cola o token no campo `SHOPIFY_ADMIN_API_TOKEN`:

```env
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Testar conexão

```bash
./scripts/test-token.sh
```

Deve retornar:

```
✅ Conectado com sucesso!
{
    "data": {
        "shop": {
            "name": "DropChina",
            "myshopifyDomain": "akfd19-1c.myshopify.com"
        }
    }
}
✅ N produtos lidos com sucesso
🎉 Token válido!
```

Se der erro, ver mensagem e ajustar scopes/token.

## Próximos passos

Veja [docs/extension-prompt.md](../docs/extension-prompt.md) na raiz do projeto pra spec completa de implementação da extension (estrutura, componentes, fluxo, segurança).

## Arquivos

- `.env.example` — template com TODAS as variáveis documentadas
- `.env` — seu arquivo local (gitignored, NUNCA committe)
- `.gitignore` — protege .env, node_modules, dist
- `scripts/test-token.sh` — valida que o token funciona

## Segurança

- ⚠️ **NUNCA** committe `.env` no Git
- ⚠️ **NUNCA** compartilhe o token em chat/email
- Se vazar: vai no admin → Apps → Uninstall → recria com novo token
- Use password manager (1Password, Bitwarden) pra backup do token
