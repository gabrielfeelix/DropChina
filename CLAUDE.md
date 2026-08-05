# DropChina — instruções para agentes

## Antes de qualquer coisa: leia `STATUS.md`

O arquivo **`STATUS.md`** na raiz é a fonte de verdade do estado atual do projeto. Se a pergunta é
"qual o status?", "onde paramos?" ou "o que falta?", a resposta está lá — e está datada.

Ele traz: o que está no ar (verificado por API), o que trava dinheiro, as filas do Gabriel e do
Augusto, o mapa de onde fica cada documento, as armadilhas do projeto e os números de referência.

`docs/STATUS.md` é de junho e está **superado** — não use.

## O que este repositório é

Monorepo da operação da DropChina: ERP (Bling), loja (Shopify), catálogo, marca e documentação.
A **fonte de verdade de catálogo, estoque e fiscal é o Bling**; a loja é consumidora.

## Regras que evitam estrago

- **Nada de escrita em produção sem confirmação explícita.** Loja e ERP estão vivos. Todo script de
  escrita tem `--dry`; use antes.
- **Antes de afirmar um número, verifique.** Vários documentos guardam contagens que envelheceram
  (produtos, GTIN, NCM). Os scripts de auditoria em `mcp-bling/src/scripts/` leem o estado real.
- **Leia as armadilhas em `STATUS.md`** antes de "consertar" comportamento estranho — boa parte é
  intencional e já foi decidida.
- **A API v3 do Bling mente por omissão.** Esconde produtos excluídos, ignora filtro de data
  incompleto e não devolve `tributacao` na listagem. As pegadinhas estão em `STATUS.md`.
- **Segredos** ficam em `.env` e `tokens.json`, ambos gitignored. Nunca commitar.

## Ao terminar um bloco de trabalho

Atualize `STATUS.md` — a data no topo, o que mudou de estado e as filas. Ele só serve enquanto
estiver correto. Trabalho grande merece também um `docs/handoff-AAAA-MM-DD.md`.
