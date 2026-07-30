# NCM pendente — produtos novos (30/jul/2026)

> Auditoria via API do Bling em 30/jul/2026: **160 produtos, 137 com NCM, 23 sem**.
> Estes 23 entraram no catálogo **depois** da carga de NCM de junho, por isso ficaram de fora.
> Sem NCM a NF-e não é emitida. Complementa `ncm-gaps-contador.md` (gaps de junho).
>
> ⚠️ Não preenchemos por conta própria — NCM errado é pior que vazio.
> Este documento é para o contador devolver o NCM (e CEST, se houver ST) de cada linha.

## Informática — placas de vídeo

| SKU | Produto | NCM | CEST |
|---|---|---|---|
| `PJR7250X4GB` | Placa de Vídeo PCYES AMD Radeon R7 250 4GB GDDR5 128 Bits Single Fan | | |
| `PVGTX1050TI4GBR5128` | Placa de Vídeo PCYES GeForce GTX 1050 Ti 4GB GDDR5 128 Bits Dual Fan | | |
| `PA1660S6GR6DF` | Placa de Vídeo PCYES GeForce GTX 1660 Super 6GB GDDR6 192 Bits Dual Fan | | |
| `CLANM-GT730-4GB-12724` | Placa de Vídeo Clanm NVIDIA GeForce GT 730 4GB DDR3 128 Bits HDMI/DVI/VGA | | |

## Informática — periféricos

| SKU | Produto | NCM | CEST |
|---|---|---|---|
| `PTOSF2AB` | Teclado PCYES Soft Multimídia USB ABNT2, 107 teclas | | |
| `PEMPG3D` | Mouse Pad Gamer PCYES Obsidian G3D 500×400mm | | |
| `CLANM-HS-CYBER-12548` | Headset Gamer Cyber Clanm estéreo 40mm com microfone | | |
| `ADAPT.UGREEN` | Leitor de Cartão USB-C 3.0 Ugreen CM304 SD/TF/MicroSD | | |
| `kit gamer eg-54` | Combo Gamer 4x1 Strong Tech (teclado, mouse, headset, mousepad) | | |
| `kit gamer EVO` | Kit Gamer Evolut EG-54 (teclado, mouse, mousepad, headset) | | |

> Os dois kits gamer são **conjuntos de itens diferentes** — confirmar se vai um NCM único
> do conjunto ou NCM por item.

## Impressoras

| SKU | Produto | NCM | CEST |
|---|---|---|---|
| `PANTUM-P3305DW` | Impressora Laser Pantum P3305DW, Wi-Fi, duplex (mono) | | |
| `PANTUM-M7105DW` | Multifuncional Laser Pantum M7105DW, Wi-Fi, ADF, duplex (mono) | | |
| `PANTUM-P2509W` | Impressora Laser Pantum P2509W, Wi-Fi compacta (mono) | | |
| `HP-DJ-2975` | Multifuncional HP DeskJet Ink Advantage 2975, colorida, Wi-Fi | | |
| `EPSON-L3250` | Multifuncional Epson EcoTank L3250, colorida, Wi-Fi Direct | | |

> O catálogo já tem impressoras com NCM confirmado desde junho — provavelmente cabe o mesmo,
> mas vale a conferência: aqui tem laser mono e jato de tinta colorida misturados.

## Eletroportáteis / beleza

| SKU | Produto | NCM | CEST |
|---|---|---|---|
| `MONDIAL-SCN16-2000` | Secador de Cabelo Mondial Black Tiff SCN-16 2000W (127V) | | |
| `GAMA-MARULA-1100` | Escova Rotativa Gama Marula 1100W (bivolt) | | |
| `moedor de café` | Moedor de Café Elétrico Portátil USB recarregável | | |

## Fora do nicho — confirmar se continuam no catálogo

| SKU | Produto | NCM | CEST |
|---|---|---|---|
| `kit com 10 pacote` | Figurinhas Copa do Mundo 2026 — kit 70 figurinhas | | |
| `50 pacote de Figurinha` | Kit 350 Figurinhas Copa do Mundo 2026 — 50 envelopes | | |
| `KIT.COZINHA.12PC` | Kit 12 Utensílios de Cozinha em silicone com cabo de madeira | | |
| `kit com 2` | 2 Pulverizadores de azeite/vinagre, vidro e inox | | |
| `BOMBA.DAGUA` | Bomba Elétrica Vijodi 20L recarregável para garrafão | | |

> **Antes de mandar pro contador:** decidir com o Augusto se estes 5 ficam. São os itens
> "fora do nicho" que o `STATUS.md` já marcava para poda. Se saírem do catálogo,
> não precisam de NCM e a lista cai para 18.

## Como aplicar depois

O contador devolve a coluna NCM preenchida → adiciona ao `mcp-bling/src/scripts/ncm-map.json`
→ `npm run set:ncm`. O script grava só `tributacao.ncm`, testa origem antes/depois e aborta
se algum outro campo mudar.
