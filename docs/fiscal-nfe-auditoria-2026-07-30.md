# Auditoria de NF-e no Bling — 30/jul/2026

> Levantamento do que está configurado hoje pra emitir NF-e. Fonte: telas do painel
> (Preferências → Notas Fiscais / Certificado Digital) + API do Bling.
> Complementa `fiscal-config-confirmado.md` (jun/2026) e `ncm-pendentes-2026-07-30.md`.

## Resumo

**A configuração fiscal está completa.** Certificado, ambiente, série, regime, CFOP,
CSOSN, naturezas e toggles: tudo conferido e de pé em 30/jul/2026.

**Nunca foi emitida nenhuma NF-e** (API retorna 0 notas, sem filtro e filtrando saída).

**O único bloqueio que resta são os 23 produtos sem NCM.** Os outros 137 já podem
emitir nota hoje.

## ✅ Certificado digital

| Item | Valor |
|---|---|
| Tipo | **A1 – Servidor** (emite de qualquer dispositivo) |
| Titular | DROPCHINA LTDA : 57306430000153 |
| Validade | **29/09/2026** |
| Cadeia | AC SyngularID Múltipla → Autoridade Certificadora Raiz Brasileira v5 |

⚠️ Vence em **~2 meses**. Renovação de A1 é anual e o certificado tem que ser reinstalado
no Bling — se vencer sem substituir, a emissão para no mesmo dia.

## ✅ Configurações de emissão

| Item | Valor |
|---|---|
| Versão do layout | 4.00 |
| Tipo de ambiente | **1 – Produção** |
| SEFAZ | PR (botão "Testar comunicação" disponível) |

⚠️ Já está em **produção** e nunca emitiu. A primeira nota vai valer de verdade.
Recomendado: trocar pra **2 – Homologação**, emitir uma nota de teste, conferir e só
então voltar pra produção.

## 🟡 Configurações gerais — o que está desligado

> Atualizado na tarde de 30/jul: os toggles recomendados foram ligados.

| Toggle | Estado | Comentário |
|---|---|---|
| Busca automática de NF-e recebidas na SEFAZ | ✅ **Ligado** (filial Matriz) | Puxa a nota de entrada do fornecedor — é dela que sai o NCM correto sem chutar. |
| Lançar estoque ao emitir ou cancelar nota | ❌ Desativado | Correto por ora. Se o pedido de venda já baixa o estoque, ligar causaria **baixa dupla**. Revisar junto com o fluxo de pedido. |
| Lançar contas ao emitir ou cancelar nota | ❌ Desativado | Sem isso o financeiro não gera contas a receber automaticamente. Decisão do Augusto. |
| Marcar envio de e-mail ao emitir nota manualmente | ✅ **Ligado** | Cliente recebe a DANFE. |
| Exibir totais em listas de NF | ✅ Ativado | ok |

## 🟡 Configurações de preenchimento

| Campo | Valor | Comentário |
|---|---|---|
| Frete por conta (padrão) | `0 – CIF (remetente)` | Confere com frete grátis. Quando o cliente paga frete, o correto costuma ser outro código — validar com contador. |
| Markup para formação de preço | 0,00 | não usado |
| Espécie (padrão) | vazio | preencher (ex.: VOLUME / CAIXA) |
| Somar peso dos produtos na nota | ✅ **Ligado** | ok |
| Calcular volume dos produtos | ❌ Desativado | opcional |
| Nº do pedido da loja virtual nas informações complementares | ✅ **Ligado** | amarra a nota ao pedido da Shopify/ML |
| Mensagem de aproveitamento de crédito do Simples Nacional | ❌ Desativado | Empresa é Simples Nacional — normalmente essa mensagem deve constar. **Perguntar ao contador.** |
| Retenção de impostos | ✅ Ativado | ok |
| Mostrar código de rastreio nas info. complementares | ✅ Ativado | ok |

## 🟡 Configurações de e-mail (DANFE pro cliente)

| Campo | Valor |
|---|---|
| Assunto padrão | `DANFE` |
| Nome do remetente | **vazio** |
| E-mail de resposta | **vazio** |
| E-mail de cópia | **vazio** |
| Cópia para transportadora | ✅ Ativado |

⚠️ DANFE sairia sem remetente identificado e sem endereço de resposta. Preencher com
`DropChina` e `comercial@dropchinaoficial.com.br`.

Relacionado: o **e-mail cadastrado da empresa no Bling é `fgrepresentacoes.sc@gmail.com`**,
não o `comercial@dropchinaoficial.com.br`. Vale alinhar.

## ✅ Naturezas de operação

18 cadastradas e ativas. Padrões marcados:

- `Venda de mercadoria a não contribuinte` → **padrão venda** (é a que sai nas vendas)
- `Compra de mercadoria` → padrão compra
- `Devolução de venda` → devolução (entrada)
- `Devolução de compra` → devolução (saída)

Também existem as variantes "com ST".

### Natureza padrão de venda — conteúdo conferido (30/jul)

`Venda de mercadoria a não contribuinte`:

| Campo | Valor |
|---|---|
| Série | **1** |
| Tipo | Saída |
| Código de regime tributário | **Simples Nacional** (bate com o CRT 1 decidido em jun) |
| Indicador de presença | **2 – Operação não presencial, pela Internet** (correto p/ e-commerce) |
| Faturada | ✅ |
| Consumidor final | ✅ |
| Operação de devolução | ❌ (correto) |

Regras de tributação — aba ICMS:

| # | Destino | Produto | CFOP | Situação tributária |
|---|---|---|---|---|
| 1 | Qualquer | Qualquer | `x108` → **6108** fora do estado | **102** – Tributada sem permissão de crédito |
| 2 | **PR** | Qualquer | `x102` → **5102** dentro do estado | **102** – Tributada sem permissão de crédito |

O `x` é curinga: o Bling troca por `5` (operação dentro do estado) ou `6` (fora).

➡️ **Isso responde a dúvida "CFOP 6106 vs 6108" que estava aberta no `handoff-shopify-bling-sync.md` desde junho: é 6108.**

## ✅ Controle de numeração

Tabela (CNPJ / Série / Próximo número) **vazia** — é o esperado. O próprio Bling avisa:
*"O controle do próximo número da nota irá aparecer aqui após novas notas serem criadas."*

A série vem da natureza de operação (**Série 1**), então a primeira nota sai como número **1**.
Não há nada a configurar aqui.

## ✅ Impressão

7 itens na primeira página, 47 nas demais. DANFE simplificado lista produtos e exibe total.

## ❌ O que ainda bloqueia

Só uma coisa: **23 produtos sem NCM** — ver `ncm-pendentes-2026-07-30.md`.
Os outros 137 produtos já estão aptos a emitir.

Itens menores, não bloqueantes:
- Campo `Espécie` padrão está vazio (ex.: VOLUME / CAIXA)
- Mensagem de aproveitamento de crédito do Simples Nacional desligada — perguntar ao contador
- E-mail cadastrado da empresa é `fgrepresentacoes.sc@gmail.com`, não o comercial

## Ordem sugerida

1. ~~Ligar busca automática de NF-e recebidas, somar peso, nº do pedido nas info. complementares~~ ✅ 30/jul
2. ~~Preencher remetente e e-mail de resposta da DANFE~~ ✅ 30/jul (`DropChina` / `comercial@dropchinaoficial.com.br`)
3. ~~Conferir série/numeração e CFOP/CSOSN da natureza padrão~~ ✅ 30/jul
4. Ambiente → **2 – Homologação** → emitir 1 nota de teste com produto que já tem NCM → conferir DANFE → voltar pra **1 – Produção**
5. Preencher os 23 NCM (contador) → aplicar com `npm run set:ncm`
6. Renovar o certificado A1 antes de **29/09/2026**

## Onde fica cada coisa no painel

Base: **⚙️ (topo direito) → Preferências**.

| O que | Caminho |
|---|---|
| Certificado A1 | menu esquerdo → `Certificado Digital` |
| Ambiente, layout | `Notas Fiscais` → `Configurações de NF-e` → 1. Configurações de emissão |
| Toggles de estoque/contas/e-mail/SEFAZ | idem → 2. Configurações gerais |
| Peso, nº do pedido, frete por conta, espécie | idem → 3. Configurações de preenchimento |
| Série e próximo número | idem → 4. Configurações de controle de numeração |
| DANFE (itens por página) | idem → 5. Configurações de impressão |
| Remetente e e-mail da DANFE | idem → 6. Configurações de email |
| CFOP e CSOSN | `Notas Fiscais` → `Naturezas de operação` (último item do painel direito) |
