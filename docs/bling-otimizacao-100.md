# Bling 100% — o que mais configurar pra aproveitar a plataforma

> Além de catálogo/estoque/sync/NF-e (cobertos em `go-live-bling-checklist.md`), o Bling tem muito
> módulo que costuma passar batido e otimiza a operação. Mapa do que vale ligar agora vs depois,
> pra uma loja de suprimentos de impressão ML+Shopify. ⏱️ = configurar agora · 🔜 = depois · ⛔ = n/a.

## Financeiro (subaproveitado — alto valor)
| Módulo | Pra que serve | Quando |
|---|---|---|
| **Conciliação de taxas de marketplace** | importar a comissão real de cada pedido (ML/Shopee/Amazon) → ver **lucro de verdade** por venda. Vai em Financeiro > Caixas e Bancos, categoria "Taxas de Marketplace" | ⏱️ **agora** — calibra o markup por canal |
| Contas a receber | cada pedido vira recebível automático; controla o que entra | ⏱️ agora (vem dos pedidos) |
| Contas a pagar | despesas, fornecedores, custo de mercadoria | ⏱️ agora |
| Conciliação bancária (OFX) | bate extrato do banco com lançamentos | 🔜 |
| Fluxo de caixa + DRE | projeção de entradas/saídas e resultado do período | 🔜 (precisa lançar custos; planos superiores) |

## Compras / Fornecedores (resolve o NCM!)
| Módulo | Pra que serve | Quando |
|---|---|---|
| **Pedido de compra + Nota de entrada** | registrar a compra do fornecedor. **A nota de entrada preenche NCM, custo e estoque automaticamente** | ⏱️ **agora** — é o caminho permanente pro NCM (ver `ncm-por-categoria-draft.md`) |
| Cadastro de fornecedores | vincular produto↔fornecedor, custo, reposição | ⏱️ agora |
| Custo de reposição / preço de custo | base pra margem real e curva ABC | ⏱️ agora |

## Estoque / Produtos
| Módulo | Pra que serve | Quando |
|---|---|---|
| Múltiplos depósitos | já temos 1 (id 14888019804) | ✅ |
| Reserva de estoque | pedido pendente reserva; cancelado estorna (evita travar saldo) | ⏱️ conferir |
| Inventário | contagem periódica pra corrigir divergência | 🔜 |
| Composições/kits | só se kit consome de unitário — **Augusto disse que kit é estoque separado → n/a** | ⛔ |
| Curva ABC | quais produtos puxam o faturamento | 🔜 |
| Controle de lote/validade | n/a pra suprimentos | ⛔ |

## Logística / Expedição
| Módulo | Pra que serve | Quando |
|---|---|---|
| Integração de frete (Melhor Envio/Correios/transportadora) | gerar **etiqueta** e **declaração de conteúdo** centralizado no Bling | ⏱️ agora (Shopify); ML usa Mercado Envios |
| Expedição / separação (picking) | fila de pedidos a despachar, conferência | 🔜 (quando volume subir) |
| Rastreamento automático | manda o código de rastreio de volta ao canal | ⏱️ junto da sync (Fase 5) |

## Fiscal (além da NF-e básica)
| Módulo | Pra que serve | Quando |
|---|---|---|
| NF-e | nota de produto | ⏱️ **bloqueador** (falta NCM + certificado) |
| Naturezas de operação | CFOP por tipo de venda (dentro/fora do estado) | ⏱️ agora (contador) |
| NFC-e | cupom (venda presencial/PDV) | ⛔ se não tem loja física |
| MDF-e / CT-e | manifesto/conhecimento de transporte (frota própria) | ⛔ |
| NFS-e | nota de serviço | ⛔ |

## Automação (liga na Fase 5)
| Módulo | Pra que serve | Quando |
|---|---|---|
| Importação automática de pedidos | puxa venda do canal sem clique | ⏱️ Fase 5 (Pago→Em aberto) |
| Emissão automática de NF-e | emite nota ao importar/liberar etiqueta | ⏱️ Fase 5 (depois do fiscal pronto) |
| Regras/gatilhos de status | muda situação do pedido automático | 🔜 |
| E-mails automáticos ao cliente | confirmação, rastreio | 🔜 |

## Cadastros / Acesso
| Módulo | Pra que serve | Quando |
|---|---|---|
| Contatos (clientes) | vêm automático dos pedidos; base pra CRM/remarketing | ✅ automático |
| Multiusuário + permissões | se o Augusto tiver equipe (separar fiscal/expedição) | 🔜 |
| App mobile Bling | acompanhar venda/estoque pelo celular | opcional |
| Vendedores / comissão | só se tiver vendedores internos | ⛔ provável |

## Relatórios / BI
Vendas por período/canal, lucratividade, curva ABC, produtos parados, ranking. 🔜 — ativar depois que
custos + taxas estiverem lançados (senão o lucro sai errado).

## Plano do Bling (atenção)
DRE, conciliação e alguns relatórios são de **planos superiores** (Cobalto R$55 → Mercúrio R$110 →
Titânio R$185 → Platina R$450 → Diamante R$650). Conferir em qual plano o Augusto está e se cobre
o que a operação precisa (conciliação de marketplace + NF-e ilimitada conforme volume).

## Prioridade prática (o que ligar primeiro, fora o go-live)
```
1. Pedido de compra + nota de entrada  → resolve NCM permanente + custo + estoque
2. Conciliação de taxas de marketplace → lucro real por canal (calibra markup)
3. Contas a receber/pagar + custo de produto → base financeira
4. Frete no Bling (Melhor Envio) → etiqueta + declaração
5. Reserva de estoque → evita travar saldo
6. (depois) DRE, fluxo de caixa, curva ABC, relatórios
```

## Fontes
bling.com.br/funcionalidades · ajuda.bling.com.br (taxas de marketplace, relatórios) ·
blog.bling.com.br/conciliacao-financeira-marketplace · bling.com.br/planos-e-precos.
