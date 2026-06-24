# HANDOFF — Estado da operação Shopify ↔ Bling (24/jun/2026)

> Leia isto primeiro. Resume a sessão de 24/jun: o que foi feito, o **bloqueio atual** (sync de
> estoque Bling→Shopify), tudo que já testamos e descartamos, e os próximos passos.
> Docs companheiros: `STATUS.md`, `fiscal-config-confirmado.md`, `ncm-gaps-contador.md`.

## TL;DR do bloqueio atual
A loja Shopify está **no ar com 62 produtos publicados**, domínio e fiscal OK. **MAS o estoque
não sincroniza do Bling pra Shopify** — todos os 62 estão com estoque 0 na Shopify. A sync do
Bling retorna **"sucesso" mas não empurra o saldo**. Plano, vínculo e SKU estão corretos.
**Suspeita nº1: token da integração Shopify no Bling sem permissão de escrita (`write_inventory`).**
**Próximo passo: reconectar/reautenticar a integração Shopify no Bling → token novo → sincronizar.**

---

## ✅ O que foi concluído nesta sessão

### Domínio + hospedagem
- `dropchinaoficial.com.br` registrado no **registro.br** (dono = cliente). DNS delegado ao **Hostinger**.
- **Apontado pra Shopify:** A `@` → `23.227.38.65`, CNAME `www` → `shops.myshopify.com`. TLS OK, domínio **Conectado**.
- **Email preservado:** MX → `mail.dropchinaoficial.com.br` (A → `109.106.250.222` Hostinger), SPF/DKIM/DMARC intactos. Email comercial@ no Hostinger.
- ⚠️ Hospedagem/cPanel são da **conta Hostinger DA AGÊNCIA** (cliente só tem cPanel). Senha do cPanel vazou no WhatsApp — trocar.

### Loja Shopify
- Loja: **`akfd19-1c.myshopify.com`** (domínio permanente) = alias `dropchina-9753.myshopify.com` = `dropchinaoficial.com.br`. **É tudo a MESMA loja.** Plano Shopify **Basic** (pago).
- Tema **DropChina** (custom, base Tinker) publicado. **`theme/` do repo = produção** (sincronizado via `shopify theme pull`). Fluxo: editar local → `shopify theme push` → `git push`.
- **28 produtos órfãos antigos APAGADOS** (backup em `catalogo/shopify-28-backup.json`).
- **62 produtos NOVOS criados** do Bling (só os com NCM confirmado), via `catalogo/upload-bling-to-shopify.mjs`:
  - SKU = código do Bling · tag `categoria-*` → smart collections · publicados na Loja Virtual · imagens · GTIN onde tinha.
  - Coleções populadas: Toners 26, Papéis 13, Periféricos 11, Cartuchos 4, Impressoras 4, Placas 2, Mini PC 1, Impressão 3D 1.
- Políticas (privacidade/troca/frete/termos) já existiam. Location: "Rua Osvaldo Cruz, 263" (Maringá).

### Fiscal (validado)
- NF-e **autorizada em homologação** (SEFAZ PR). Certificado A1 instalado (vence 29/09/2026).
- Natureza "Venda de mercadoria": série 3, CSOSN 102, CFOP 5102 (PR) / 6108 (fora), indicador 2-Internet.
- **62 NCM aplicados** no Bling (núcleo). 78 sem NCM aguardando contador (`ncm-gaps-contador.md`).
- ⚠️ Ambiente NF-e ficou em **Homologação** — voltar pra **Produção** antes de vender.

---

## ❌ BLOQUEIO: sync de estoque Bling → Shopify não funciona

### Sintoma
- Todos os 62 produtos: estoque **0 na Shopify** (Bling tem saldo real, ex: 1105 EVOLUT = 50).
- "Sincronizar estoque do sistema na loja virtual" (Bling) → retorna **"Sincronização concluída com sucesso"** mas a Shopify **não atualiza**.
- O painel do produto no Bling mostra "Nenhum canal configurado" (mas isso é a UI nova, enganosa — ver abaixo).

### O que JÁ testamos e DESCARTAMOS (tudo OK)
| Verificação | Resultado |
|---|---|
| SKU Bling = SKU Shopify | ✅ idênticos (criamos a Shopify com o SKU do Bling) |
| Produtos publicados na Loja Virtual | ✅ sim (corrigido via `publishablePublish`) |
| Canal Shopify "Dropchina oficial" (id **206107628**) ativo | ✅ situacao 1 |
| "Testar" autenticação da integração | ✅ Sucesso |
| Vínculo do produto (produtosLojas) | ✅ existe; `codigo` = ID do produto Shopify (ex: 9380934844635) |
| **Plano Bling** | ✅ **Cobalto** — e Cobalto JÁ inclui sync multiloja (página oficial). NÃO é limitação de plano. |
| Export de produtos Bling→Shopify (UI) | ❌ **erro 500 do Bling** (bug recorrente deles, não nosso) |
| Vínculo via API `produtosLojas.create` | cria, mas a UI/sync não reconhece pra empurrar |

### Diagnóstico (suspeita nº1)
A integração "Dropchina oficial" foi configurada **mês passado**. O **"Testar" só valida LEITURA**.
Provável: o **token Shopify guardado no Bling não tem permissão de ESCREVER estoque**
(`write_inventory`). Por isso lê ok, reporta "sucesso", mas não grava o saldo.

### PRÓXIMOS PASSOS (em ordem)
1. **Reconectar/reautenticar a integração Shopify no Bling** (Central de Extensões → "Dropchina oficial"
   → reconectar/reautenticar OAuth). Gera token novo com permissão completa. Depois sincronizar estoque de novo.
2. Se não resolver: testar o **ID da VARIAÇÃO** Shopify como "ID na loja" (Shopify controla estoque por
   variação). Ex: 1105 EVOLUT variação = `48905410904283`, inventoryItem = `51116490359003`.
3. Se nem isso: **abrir chamado no suporte Bling** — "sync de estoque retorna sucesso mas não atualiza
   Shopify; produto vinculado; plano Cobalto; canal ativo". É bug do backend deles.

### Quando a sync funcionar → vincular os 62 de uma vez
- **Vínculo manual** (jeito que funciona, burla o export 500): Cadastros → Produtos → ícone **carrinho verde**
  → marca "Dropchina oficial" → preenche **"ID na loja"** com o ID Shopify → Salvar.
- Em massa: usar a **"planilha de vínculo"** do Bling com **`catalogo/vinculo-shopify-bling.csv`**
  (SKU → ID do produto Shopify, os 62 já mapeados).

---

## Arquivos/scripts criados nesta sessão
- `catalogo/upload-bling-to-shopify.mjs` — cria os produtos do Bling na Shopify (via `shopify store execute`). Idempotente, publica, GTIN. Precisa `shopify store auth --store=akfd19-1c.myshopify.com`.
- `catalogo/vinculo-shopify-bling.csv` — de-para SKU → ID produto Shopify (62 produtos).
- `catalogo/shopify-28-backup.json` — backup dos 28 produtos órfãos apagados.
- `mcp-bling/src/scripts/set-ncm.ts`, `set-gtin.ts`, `set-short-desc.ts` — gravam NCM/GTIN/descrição no Bling.
- `docs/fiscal-config-confirmado.md`, `docs/ncm-gaps-contador.md`.

## IDs e dados úteis
- Loja Shopify permanente: `akfd19-1c.myshopify.com` · Publication "Loja Virtual": `gid://shopify/Publication/196225990875`.
- Canal Bling Shopify: id **206107628** ("Dropchina oficial"). CNPJ: 57.306.430/0001-53 (DROPCHINA LTDA).
- Bling produtosLojas: `codigo` = ID do produto Shopify (formato confirmado). Loja em produtosLojas tem só vínculos criados manualmente.
- Shopify CLI autenticada (theme + store). MCP Shopify conectado à loja.

## Pendências paralelas (não bloqueiam a sync)
- Contador: 33 NCM de nicho + confirmar CFOP 6106 vs 6108 + origem (importado vs nacional 0).
- Voltar NF-e pra **Produção**. Ligar emissão automática.
- Pagamento Shopify (Mercado Pago/Pix), frete (Melhor Envio).
- Os 78 produtos sem NCM entram na Shopify quando contador soltar (rodar `upload-bling-to-shopify.mjs` de novo — já pula os existentes).
