# NCM faltante — produtos pro contador validar

> A planilha de NCM cobriu o núcleo (toner, cartucho, papel, impressora, fone). Estes produtos
> de **eletrônico/informática** ficaram **sem NCM** porque a categoria não estava na planilha.
> Abaixo, agrupados com uma **sugestão de NCM** (pesquisa nossa) pra o contador **confirmar ou corrigir**.
> Nada destes foi gravado no Bling ainda (exceto onde indicado). Atualizado 24/jun/2026.

> ⚠️ As sugestões são ponto de partida — **a classificação fiscal final é do contador.**

## Gaps do nicho (validar NCM)

| Família | Produtos (exemplos) | NCM sugerido (validar) |
|---|---|---|
| **Power bank / carregador portátil** (bateria de lítio) | Power Bank Pineng, KA-9595, 10000mAh, kit 34 peças | **8507.60.00** |
| **Carregador de parede / cabo** (sem bateria) | Carregador iOS 30w 6A | **8504.40.90** |
| **Suporte para notebook** (alumínio/plástico, dobrável) | Suporte 4you, base ergonômica | **8473.30.99** |
| **Filamento 3D PETG 1,75mm** | Masterprint PETG preto/branco 1kg | **3916.90.90** (monofilamento plástico) |
| **Monitor** | Skul 19,5" Office; Pcyes Z-max 49" curvo | **8528.52.20** |
| **SSD SATA 2,5"** | Patriot Burst 240GB / Burst Elite 480GB | **8471.70.00** |
| **Placa de vídeo** | Pcyes RTX 3060 12GB | **8473.30.99** (obs: GT730 a planilha pôs em 84715090 e 85423190 — inconsistente, alinhar) |
| **Cabo/adaptador HDMI→VGA** | conversor HDMI-VGA, kit 50 peças | **8544.42.00** |
| **Seladora a vácuo** | máquina seladora de embalagem | **8422.30.29** |
| **Partes de impressora** (cilindro/drum, cabeça de impressão, chip de fusor, correia) | DR3440, cabeça Canon MB5410, chip fusor, correia Epson C5210 | **8443.99.90** |
| **Impressora de etiqueta térmica** | Maxtop térmica portátil | **8443.32.99** |
| **Impressora laser mono (função única)** | Pantum P2509W | **8443.31.xx / 8443.32.xx** (definir) |
| **Impressora 3D (FDM)** | Bambu Lab A1 Combo*, Snapmaker U1 | **8485.20.00** (fabricação aditiva) |
| **TV stick / media streaming 4K** | TV Stick 4K Android | a definir (**8528.71** ou **8517.62**) |

\* **Bambu A1 (`A1 mini`)**: gravamos **84852000** provisório no Bling (estava como 84433111, errado). Validar.
Snapmaker está sem NCM (aguardando validação desta linha).

## Fora do nicho — Augusto decide se mantém ou poda (não classificados)
Afiador de facas, balança de cozinha, hand grip, moedor de café, escova rotativa Marula, creatina
(Universal Nutrition), figurinhas Copa 2026, bomba d'água p/ galão, pulverizador de azeite, utensílios
de cozinha. Se forem manter, o contador precisa do NCM de cada um também.

## Pergunta extra pro contador
- **CFOP fora do estado: 6106 vs 6108** — quando usar cada um? (e-commerce B2C consumidor final = 6108).

---

### Como aplicar quando o contador devolver
Adicionar `sku → ncm` em `mcp-bling/src/scripts/ncm-map.json` com `"confidence":"HIGH"` e rodar
`npm run set:ncm` (valida 8 dígitos, testa origem, grava só HIGH).
