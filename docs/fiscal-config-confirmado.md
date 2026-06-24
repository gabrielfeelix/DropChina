# Config fiscal CONFIRMADA pelo contador — DropChina (Simples Nacional)

> Respostas do contador (24/jun/2026) + planilha de NCM (`DROPCHINA.xlsx`, 67 produtos).
> Esta é a fonte de verdade fiscal pra configurar o Bling. Substitui o draft `ncm-por-categoria-draft.md`.

## Parâmetros da empresa
| Item | Valor |
|---|---|
| Regime tributário | **Simples Nacional** |
| Substituição Tributária / CEST | **Não tem** (nenhuma categoria) |
| CSOSN (todos os produtos) | **102** (sem permissão de crédito, sem ST) |
| Natureza de operação | **Venda de mercadoria** |

> ⚠️ A config de NF-e do Mercado Livre **não dá pra replicar** (sistema diferente). Bling é setup do zero.

## CFOP por destino
| Operação | CFOP |
|---|---|
| Venda **dentro** do estado (internet) | **5102** |
| Venda **fora** do estado (internet) | **6106** e **6108** |

> 6108 = venda a consumidor final não-contribuinte fora do estado (caso típico e-commerce B2C);
> 6106 também informado. Bling escolhe pela operação; confirmar regra de uso 6106 vs 6108 com contador na config.

## NF-e / série
| Item | Valor |
|---|---|
| Série da NF-e no Bling | **Série nova = 3** (não continuar a sequência atual) |
| Numeração | começa nova na série 3 |
| Ambiente | produção |

## Certificado digital
- Arquivo: e-CNPJ **A1**, formato PKCS#12 (`.pfx`), na raiz do projeto (fora do git).
- Senha do certificado: **com o Gabriel** (não documentar aqui — é segredo).
- ⚠️ **NÃO versionar** (gitignored: `*.pfx`, `*senha*`). É chave privada que assina nota legalmente.
- Instalação no Bling = ação no navegador (Gabriel) — ver passo a passo abaixo.

## NCM — planilha do contador (67 produtos)
CSOSN 102 em todos. NCMs usados (resumo por família):
| NCM | Família de produto |
|---|---|
| 48114110 / 48115123 / 48115129 / 48115929 / 48209000 | Papel fotográfico A4 (130/180/230g, glossy/matte/adesivo) |
| 84221100 | Lava-louças (Midea) |
| 84433111 | Impressora multifuncional jato de tinta (Epson WF-C5890) |
| 84433223 / 84433232 / 84433299 | Impressora de cupom/etiqueta térmica (ISD-12) |
| 84439923 | Cartucho de **tinta** HP 667 (e kits) |
| 84439933 | **Toner** (compatível/remanufaturado) + alguns acessórios de impressão |
| 84715010 / 84715090 | Mini PC / componentes |
| 84716052 | Teclado gamer |
| 85176264 | Starlink (internet via satélite) |
| 85183000 | Fones/headsets (JBL, HP) |
| 85423190 | Placa de vídeo (GT 730 Clanm) |
| 85444200 | Cabo/leitor (Ugreen 80191) |

> NCM exato POR produto está na planilha. Aplicação no Bling = via API (script `set:ncm`,
> casando nome→SKU), igual fizemos com GTIN. Mapa a montar: `mcp-bling/src/scripts/ncm-map.json`.

## Pendência aberta
- Confirmar com contador a regra **6106 vs 6108** (ambos citados pra fora do estado).
- A planilha tem 67 linhas; catálogo tem 195 SKUs. Produtos sem linha na planilha herdam NCM da
  mesma família (ex: todo toner compatível = 84439933). Itens fora das famílias listadas → confirmar.

---

## Passo a passo — instalar certificado A1 no Bling (navegador, Gabriel)
1. Bling → **Configurações** (engrenagem) → **Certificado digital** (ou "Nota Fiscal" → Certificado).
2. **Enviar/Importar certificado** → selecionar o arquivo `.pfx`.
3. Senha do certificado (a que o Gabriel tem).
4. Salvar. Bling valida e mostra **validade** do certificado (A1 vale 1 ano).
5. Em **Configurações de NF-e**: definir **série = 3**, ambiente **produção**, natureza **Venda de mercadoria**.
6. Vincular CSOSN 102 + CFOP (5102 dentro / 6108 fora) na regra tributária / no cadastro dos produtos.
7. Teste: emitir 1 NF-e de homologação/produção com 1 produto antes de ligar emissão automática.

## Passo a passo — emissão automática (depois do certificado + NCM)
- Bling → integração ML/Shopify → **emitir NF-e automaticamente** quando pedido entra (ou quando ML libera etiqueta).
- Enviar DANFE + XML por e-mail ao cliente (config no Bling).
