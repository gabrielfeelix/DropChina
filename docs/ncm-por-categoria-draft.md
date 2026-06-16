# NCM por categoria — DRAFT para validação do contador

> ⚠️ **DRAFT. NÃO aplicar sem o contador validar.** NCM errado = imposto errado = problema fiscal.
> Objetivo: desbloquear a emissão de NF-e (hoje 0% dos produtos têm NCM no Bling). Depois de o
> contador aprovar, o Claude aplica nos 136 produtos via API (idempotente por SKU/categoria).
>
> Legenda confiança: ✓ confirmado em fonte fiscal · ⚠️ provável, conferir · 🔶 fora do nicho (definir caso a caso).
>
> 💡 **Melhor caminho permanente:** deixar o Bling preencher o NCM automaticamente a partir da
> **nota de entrada do fornecedor** (Pedido de Compra → entrada). Este draft é a ponte pra emitir
> agora; a nota de entrada mantém certo daqui pra frente.

## Núcleo (suprimentos de impressão)

| Categoria Bling | Produto | NCM sugerido | Conf. |
|---|---|---|---|
| Cartuchos de Toner | cartucho toner laser | **8443.99.33** (cartuchos de revelador/toners) | ✓ |
| Cartuchos de Tinta | cartucho tinta jato | **8443.99.23** (cartuchos de tinta) | ✓ |
| Refil de Tinta | garrafa/refil tinta ecotank | **8443.99.23** ou tinta 3215.90 | ⚠️ |
| Peças e Componentes | cilindro/drum fotocondutor | **8443.99.39** (unidades fotocondutoras) | ✓ |
| Peças e Componentes | toner em pó refil | 3707.90.21 (preparações p/ toner) | ⚠️ |
| Peças e Componentes | chip / outras peças de impressora | 8443.99.90 (outras partes) | ⚠️ |
| Impressoras | impressora jato de tinta | **8443.31.11** / máquina 8443.39.10 | ✓/⚠️ |
| Impressoras | impressora laser / multifuncional | 8443.31.99 ou 8443.32.xx | ⚠️ |
| Impressoras | impressora térmica cupom/etiqueta | 8443.32.99 | ⚠️ |
| Papéis para Impressão | papel fotográfico (inkjet, revestido) | 4811.90.90 (papel revestido) | ⚠️ |
| Scanner | scanner de mesa | 8471.60.90 | ⚠️ |
| Embalagem e Etiquetagem | etiqueta térmica (rolo) | 4821.10.00 (etiquetas de papel) | ⚠️ |
| Embalagem e Etiquetagem | ribbon (fita de impressão) | 9612.10.xx (fitas p/ impressora) | ⚠️ |

## Informática / periféricos

| Categoria Bling | Produto | NCM sugerido | Conf. |
|---|---|---|---|
| Periféricos PC | teclado | 8471.60.52 | ⚠️ |
| Periféricos PC | mouse | 8471.60.53 | ⚠️ |
| Periféricos PC | leitor de cartão USB | 8471.70.x / 8473.30 | ⚠️ |
| Monitores | monitor LED (p/ PC) | 8528.52.20 | ⚠️ |
| Computadores e Componentes | placa de vídeo (GPU) | 8473.30.49 (partes p/ máquina 8471) | ⚠️ |
| Computadores e Componentes | mini PC / computador | 8471.50.10 | ⚠️ |
| Computadores e Componentes | gabinete | 8473.30.x | ⚠️ |
| Cabos e Adaptadores | cabo HDMI/VGA c/ conector | 8544.42.00 | ⚠️ |
| Áudio e Fones | fone/headset | 8518.30.00 | ⚠️ |
| Impressão 3D | filamento PETG | 3916.90.90 (monofilamento plástico) | ⚠️ |

## Fora do nicho (🔶 definir só se mantiver na operação — ver restrições)

| Categoria | Item | Nota |
|---|---|---|
| Saúde e Suplementos | creatina | 2106.90.30 ⚠️ — **só com registro ANVISA** |
| Mobilidade Elétrica | triciclo/bike/moto elétrica | 8711.60 / 8712 ⚠️ — restrição legal (CNH/placa) |
| Eletrodomésticos e Cozinha | lava-louças, seladora, balança, moedor | varia 8422/8509/8423… ⚠️ |
| Beleza e Cuidado Pessoal | máq. cortar cabelo, escova | 8510.20 / 8516.32 ⚠️ |
| Fitness e Esporte | hand grip | 9506.91 ⚠️ |
| Conectividade e Redes | Starlink/antena | 8517.62 ⚠️ — restrição telecom |
| Outros | figurinhas | 4911.91 ⚠️ |

## Sobre ST / CEST
NCMs da família 8443 (toners, cartuchos, partes) e eletrônicos **podem ter Substituição Tributária**
dependendo do estado e do CEST. O contador define CEST + se há ST por NCM/UF. O Claude aplica o CEST
junto do NCM quando validado.

## Fontes
- taxpratico.com.br/ncm/84439933 · ncm.fazcomex.com.br · systax.com.br · cosmos.bluesoft.com.br · tabelas.maino.com.br (consultas NCM 8443.99.33 / .23 / .39, 8443.31.11, 8443.39.10).
