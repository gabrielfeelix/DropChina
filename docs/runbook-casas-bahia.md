# Runbook — Casas Bahia / Via (Bling nativo)

> **Por que não tem MCP/cliente custom aqui:** a API do marketplace Casas Bahia/Via é
> **fechada/homologada**, **não tem SDK Node/TS** público, e o marketplace permite **apenas
> 1 integrador por conta**. Logo, a integração é **100% pela integração nativa do Bling** — não
> se constrói cliente próprio (ver `docs/expansao-marketplaces.md`). Este runbook é o passo a passo
> operacional pra ativar quando o Augusto topar.

## Pré-requisitos
- **CNPJ** ativo (obrigatório — não aceita CPF).
- Capacidade de emitir **NF-e** (já temos via Bling).
- **GTIN/EAN válido em TODOS os produtos** que vão pro canal (obrigatório; resolver os 71 sem GTIN antes).
- Conta aprovada no **Casas Bahia Marketplace** (cadastro grátis, ~2 dias úteis).

## Passo a passo (quando ativar)
1. **Abrir/validar conta** no Casas Bahia Marketplace (parceiro.casasbahia / portal do seller). Aguardar aprovação.
2. **Pegar o token** de integração no painel do marketplace (Casas Bahia fornece `client_id`/`access_token`).
   - ⚠️ Se já houver outro integrador ligado na conta (SkyHub/Olist/Tiny/etc.), abrir ticket pra trocar — **só 1 integrador por conta**. Contato: `integracao.mktp@viavarejo.com.br`.
3. **Reativar/conectar o canal no Bling**: o canal "DROPCHINA" (ViaVarejo) **já existe** na conta (foi desativado na limpeza de canais). Reativar e autenticar com o token.
   - Bling → Central de Extensões → Integrações → Casas Bahia/Via → autenticar.
4. **Configurar regras** (mesma lógica de ML/Shopify):
   - Estoque: depósito = **Todos os depósitos**.
   - Pedidos: importação automática, status **Pago → Em aberto** (nunca "Todos" → baixa 2×).
   - Mapear tributação/NF-e.
5. **Catálogo**: exportar do Bling. Atenção às exigências da Via:
   - título ≤ 60 caracteres; atributos obrigatórios por categoria (cor/tamanho/voltagem/dimensões/peso/marca);
   - imagens: mín 2, 900×900–1200×1200, ≤ 2 MB, JPEG, sem marca d'água;
   - **GTIN obrigatório**.
6. **Vincular** produtos por SKU/GTIN. Conferir 100%, sem órfão/duplicado.
7. **Piloto**: ativar 1 produto, testar venda + baixa de estoque + propagação pros outros canais, antes de liberar o catálogo inteiro.
8. **Go-live + monitorar**: SLA de despacho **24h** é rígido (atraso derruba reputação). Acompanhar cancelamento e reputação (nível 1-5 libera desconto de frete).

## Economia (avaliar margem antes)
- Comissão **18,5%–21%** por categoria (promo **17%** até 31/03/2026). Cancelamento do cliente em 7 dias = metade da comissão.
- Conferir se a margem dos suprimentos (toners/papéis) aguenta a comissão + frete.

## Referências
- Bling: [Auth Casas Bahia](https://ajuda.bling.com.br/hc/pt-br/articles/360044457714) · [Config](https://ajuda.bling.com.br/hc/pt-br/articles/4415802622615) · [Categorias/campos](https://ajuda.bling.com.br/hc/pt-br/articles/360044460974)
- Dev portal (referência, não usaremos direto): https://developers.grupocasasbahia.com.br/
