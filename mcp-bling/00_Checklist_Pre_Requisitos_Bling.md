# Checklist de Pré-requisitos — Bling (passos humanos)

> Estes passos **só uma pessoa logada na conta do Bling** consegue fazer (a IA não cria credenciais nem loga). Sem eles, nenhuma linha de código do MCP server roda.
> Responsável: **Augusto** (dono da conta) com apoio do **Gabriel**.
> Tempo estimado: ~15-20 min.
> Companheiro técnico: [`02_Bling_Runbook_para_IA.md`](02_Bling_Runbook_para_IA.md).

---

## ⚠️ Antes de tudo: qual conta Bling usar

- [ ] Confirmar que vamos usar a **conta REAL do Augusto** — a que tem **CNPJ**, **certificado e-CNPJ A1** instalado e o **Mercado Livre já vinculado**. É nela que a "fonte da verdade" precisa morar. Não criar conta nova.

---

## Passo 1 — Criar o aplicativo privado

No painel do Bling:

- [ ] Ir em **Central de Extensões → Área do Integrador → Criar aplicativo**.
- [ ] Na primeira tela, escolher visibilidade **Privada**.
  - *Por quê privada:* uso interno nosso, **não exige homologação** nem aprovação do Bling. App público iria pro catálogo e precisaria de revisão.

### Campos que o Bling vai pedir
- [ ] **Nome** do app — ex.: `DropChina Integração` (qualquer nome interno serve).
- [ ] **Categoria / descrição / versão** — pode ser genérico (uso interno).
- [ ] **Link de redirecionamento (`redirect_uri`)** — usar exatamente:
  ```
  http://localhost:3000/callback
  ```
  ⚠️ Tem que ser **idêntico** ao que o código vai usar. Se mudar aqui, mudar no `.env` também. Anotar o valor exato.
- [ ] Demais campos (logo, homepage, vídeo, dados do desenvolvedor) — preencher o mínimo; não bloqueiam.

---

## Passo 2 — Marcar os escopos (permissões)

Na janela de seleção de escopos (tem filtro por módulo/nome), marcar **leitura E escrita** onde indicado:

- [ ] **Produtos** — leitura + escrita
- [ ] **Categorias de produtos** — leitura + escrita
- [ ] **Estoques** — leitura + escrita
- [ ] **Notas Fiscais Eletrônicas (NF-e)** — leitura + escrita
- [ ] **NFC-e** — leitura + escrita
- [ ] **Pedidos de venda** — leitura
- [ ] **Contatos** — leitura *(opcional, útil pra destinatário de nota)*

> O botão de salvar o app **só ativa depois de marcar pelo menos um escopo**. Marcar todos os acima de uma vez.

---

## Passo 3 — Pegar as credenciais

Depois de salvar o app:

- [ ] Abrir a aba **"Informações do app"**.
- [ ] Copiar o **`Client ID`**.
- [ ] Clicar no **ícone de olho 👁** pra revelar e copiar o **`Client Secret`**.

> 🔒 O `Client Secret` é segredo. **Nunca** colar em chat, commit, print ou e-mail aberto. Entregar pro Gabriel por canal seguro (gerenciador de senhas, mensagem efêmera). Pode ser redefinido a qualquer momento se vazar.

---

## Passo 4 — Entregar pro Gabriel (vira o `.env`)

Passar estes três valores:

| Variável | Valor |
|---|---|
| `BLING_CLIENT_ID` | *(o Client ID copiado)* |
| `BLING_CLIENT_SECRET` | *(o Client Secret copiado)* |
| `BLING_REDIRECT_URI` | `http://localhost:3000/callback` |

O Gabriel cria o arquivo `.env` local (fora do git) com isso. **Nunca** commitar.

---

## Passo 5 — Autorização OAuth (1 vez, junto com o Augusto)

Este é o único passo que precisa do **Augusto logado no navegador**, e acontece **depois** do código pronto:

- [ ] Gabriel roda o fluxo de autorização → abre uma URL do Bling no navegador.
- [ ] **Augusto faz login** e clica em **Autorizar**.
- [ ] O Bling redireciona pro `localhost:3000/callback` e o código captura o token automaticamente.
  - ⚠️ O `code` da autorização **expira em 1 minuto** — fazer o login sem demora.
- [ ] A partir daí o token renova sozinho (refresh de 30 dias). Não precisa repetir, a menos que fique 30 dias sem uso.

---

## Pré-requisito fiscal (paralelo, pra emitir NF-e depois)

- [ ] Confirmar que o **certificado e-CNPJ A1** está instalado no Bling.
- [ ] Decidir a origem dos dados fiscais: Augusto fornece **NCM/EAN** em planilha, **ou** deixamos o **Bling preencher o NCM** automaticamente via nota de entrada do fornecedor?

---

## Definição de "desbloqueado" ✅

Quando estes itens estiverem prontos, o Gabriel/IA consegue tocar o resto sozinho:

- [ ] App privado criado, escopos marcados.
- [ ] `Client ID` + `Client Secret` + `redirect_uri` entregues e no `.env`.
- [ ] Augusto disponível por ~5 min pra fazer o login do OAuth quando o código estiver pronto.

> Depois disso, a IA: faz o scaffold do MCP server → roda o OAuth → semeia as 12 categorias → cria produto-piloto → e aí parte pra ligar as integrações nativas Bling↔Shopify e Bling↔Mercado Livre (essas também no painel, descritas nos Passos 7-8 do runbook).
