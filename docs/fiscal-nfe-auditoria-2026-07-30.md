# Auditoria de NF-e no Bling — 30/jul/2026

> Levantamento do que está configurado hoje pra emitir NF-e. Fonte: telas do painel
> (Preferências → Notas Fiscais / Certificado Digital) + API do Bling.
> Complementa `fiscal-config-confirmado.md` (jun/2026) e `ncm-pendentes-2026-07-30.md`.

## Resumo

Certificado, naturezas e ambiente estão de pé. **Nunca foi emitida nenhuma NF-e**
(API retorna 0 notas, sem filtro e filtrando saída). O que falta é NCM em 23 produtos,
conferir a numeração/série e decidir um punhado de toggles que hoje estão desligados.

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

## ✅ Naturezas de operação (via API)

18 cadastradas e ativas. Padrões marcados:

- `Venda de mercadoria a não contribuinte` → **padrão 1** (a de venda)
- `Compra de mercadoria` → padrão 2
- `Devolução de venda` → padrão 8
- `Devolução de compra` → padrão 9

Também existem as variantes "com ST". Falta conferir **CFOP e CSOSN dentro de cada
natureza** — isso não sai pela API, é tela a tela, e é item do contador.

## ✅ Impressão

7 itens na primeira página, 47 nas demais. DANFE simplificado lista produtos e exibe total.

## ❌ Ainda não verificado

- **Configurações de controle de numeração** — série e próximo número da NF-e. Tela não capturada.
- **CFOP e CSOSN por natureza de operação** — abrir `Venda de mercadoria a não contribuinte`.
- **23 produtos sem NCM** — ver `ncm-pendentes-2026-07-30.md`.

## Ordem sugerida

1. Preencher os 23 NCM (contador) → aplicar com `npm run set:ncm`
2. Conferir série/numeração e CFOP/CSOSN da natureza padrão
3. ~~Ligar: busca automática de NF-e recebidas, somar peso, nº do pedido nas info. complementares~~ ✅ feito em 30/jul
4. Preencher remetente e e-mail de resposta da DANFE
5. Ambiente → Homologação → emitir 1 nota de teste → conferir → voltar pra Produção
6. Renovar o certificado A1 antes de 29/09/2026
