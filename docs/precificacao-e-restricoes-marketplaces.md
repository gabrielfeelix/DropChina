# Precificação por canal + produtos proibidos/restritos

> Base para a estratégia de **markup de preço por canal** (cobrir a comissão de cada marketplace) e
> para evitar listar produto proibido/restrito. Dados jun/2026 — **taxas e regras mudam; reconferir
> antes do go-live de cada canal.** A sincronização de preço é via Bling (markup % por canal) — ver
> `docs/expansao-marketplaces.md`. Use a opção "importar taxas do marketplace" do Bling pra medir a
> margem real e calibrar o markup com dado, não com estimativa.

## A — Markup por canal (nicho: toner/cartucho/papel/impressora/periférico)

Ordenado da MENOR pra MAIOR taxa (onde você precifica mais barato → mais caro):

| Canal | Comissão (nicho) | Custos extras | Markup sugerido p/ cobrir |
|---|---|---|---|
| **Amazon** | PC 12%, eletrônicos 8-10%, acessórios 10-15% | Individual R$2/item ou Pro R$19/mês; comissão mín R$1 | **+~12-18%** |
| **Mercado Livre (clássico)** | 11-14% | custo operacional variável; frete grátis obrig. ≥R$79 | **+~15-20%** |
| **Mercado Livre (premium)** | 16-19% | idem + parcelamento s/ juros 12x | **+~20-25%** |
| **Casas Bahia / Via** | 18.5% eletrônicos / 19% acessórios (promo 17%) | sem mensalidade; frete por reputação (1-3★ paga 100%, 5★ -50%) | **+~22-28%** |
| **Shopee** | 14-20% + taxa fixa R$4-26/item (faixa de preço) | frete grátis obrigatório; teto de comissão removido mar/26 | **+~22-30%** |

Notas:
- Markups são **aproximados, só pra cobrir taxa do canal** — NÃO incluem impostos (Simples/ICMS), frete real nem margem de lucro. Somar por cima.
- **Shopee faixa baixa é cara:** até R$7,99 = 50%; R$8-79,99 = 20% + R$4. Produto barato no Shopee corrói margem.
- **ML mar/2026:** taxa fixa por item de baixo valor foi para um "custo operacional variável" (Full); no Flex ainda há custo fixo. Conferir o modelo vigente.
- **Tradução prática:** mesmo produto → preço menor em Amazon/ML, maior em Casas Bahia/Shopee. Configurar markup % por canal no Bling.

Fontes (A): venda.amazon.com.br/precos · gosmarter.com.br/taxas-amazon-brasil-2026 · marketizesales.com.br/comissoes/mercado-livre · blog.arcosscale.com.br (taxa fixa ML) · blog.calcularte.com.br (Shopee 2026) · ecommercebrasil.com.br (Shopee teto) · blog.bling.com.br/marketplace-casas-bahia.

## B — Produtos proibidos / restritos (cruzado com o catálogo)

Legenda: ✅ pode · ⚠️ restrito (precisa doc/registro/marca) · ❌ não vender.

| Item do catálogo | ML | Shopee | Amazon | C.Bahia | Observação |
|---|---|---|---|---|---|
| Toner, cartucho, refil, cilindro | ✅ | ✅ | ✅ | ✅ | **núcleo — limpo em todos** |
| Papel fotográfico, impressora, scanner | ✅ | ✅ | ✅ | ✅ | ok |
| Periféricos (teclado, mouse, cabo, monitor, leitor) | ✅ | ✅ | ✅ | ✅ | ok |
| Placa de vídeo (GPU) / mini PC | ⚠️ | ✅ | ⚠️ | ⚠️ | eletrônico → INMETRO; Amazon/CB podem exigir distribuidor autorizado/marca |
| Lava-louças / eletrodoméstico | ⚠️ | ✅ | ⚠️ | ✅ | exige certificação INMETRO; marca pode ser gated |
| **Creatina / suplemento** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **exige registro ANVISA. Não vender sem.** ANVISA suspendeu marcas em 2025/26 |
| **Starlink / internet satélite** | ⚠️ | ❌ | ❌ | ❌ | serviço/hardware telecom — evitar; Amazon não permite revenda |
| **Triciclo/bike/moto elétrica** (os 12 pausados) | ⚠️ | ✅ | ❌ moto | ⚠️ | moto elétrica exige CNH/placa (CONTRAN 2026); Amazon não elegível motos; bike ok se ≤1kW/≤32km/h |
| Afiador de facas / amolador | ✅ | ✅ | ✅ | ✅ | utensílio de cozinha, ok |
| Máquina de cortar cabelo / barbear | ✅ | ✅ | ⚠️ | ✅ | Amazon pode gated se marca registrada |
| Hand grip (fitness) | ✅ | ✅ | ✅ | ✅ | ok |
| Seladora a vácuo / moedor / balança | ✅ | ✅ | ✅ | ✅ | ok |
| Figurinhas (Copa 2026) | ⚠️ | ⚠️ | ✅ | ⚠️ | **só se oficial/licenciada Panini; pirata = banido** |

Restrições gerais (todos os canais): armas/munição, tabaco/cigarro eletrônico, drogas, medicamentos com prescrição, falsificados, conteúdo adulto — proibidos. Casas Bahia tem **curadoria de seller/categoria** (aprova antes de ativar; monitora anúncios). Amazon tem categorias **gated** (beleza, automotivo, marca registrada). Eletrônicos pedem INMETRO/ANATEL conforme o caso.

Fontes (B): mercadolivre.com.br/ajuda/Produtos-proibidos_1029 · vendedores.mercadolivre.com.br (suplementos ANVISA) · help.shopee.com.br (política proibidos/restritos) · amazon.com.br help (restrições) · blog.bling.com.br/marketplace-casas-bahia · via Academy (manual de políticas).

## Conclusão estratégica

- **Núcleo (suprimentos de impressão) é limpo nos 4 canais** → expandir com ele primeiro, sem fricção.
- **Os problemas são todos itens FORA do nicho** (creatina, starlink, mobilidade elétrica, eletrodoméstico, figurinhas). Recomendado **podar/segurar** esses na expansão multicanal — alguns exigem registro (ANVISA/INMETRO), outros são inelegíveis.
- Ligar o **markup % por canal** no Bling cobrindo a tabela A; calibrar com a margem real ("importar taxas do marketplace").
