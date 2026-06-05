# DropChina — Plano de Configuração do Bling (pré-entrega)

> Plano de ação para deixar o Bling **100% configurado e o fluxo inteiro funcionando** antes de entregar o site (go-live mês que vem). Baseado em: (1) **probe ao vivo da conta** (junho/2026, `npm run probe`), (2) pesquisa em fontes oficiais Bling (ajuda/developer/blog).
>
> Companheiros: `01_DropChina_Projeto_e_Arquitetura.md` (visão), `02_Bling_Runbook_para_IA.md` (técnico API). Este doc é o **plano operacional de configuração**.

- **Versão:** 1.0 · Junho de 2026
- **Status da conta:** parcialmente configurada — fiscal existe, ML conectado, catálogo vazio, SKUs bagunçados.

---

## 0. Diagnóstico real da conta (probe ao vivo)

| Área | Estado encontrado | Implicação |
|---|---|---|
| **Empresa** | DROPCHINA LTDA, CNPJ presente | Conta real (não demo). Regime tributário **não exposto na API** → confirmar com contador. |
| **Canais conectados** | 2× Mercado Livre + 1× ViaVarejo (Casas Bahia) | **Shopify ainda NÃO conectado.** ML já vivo. |
| **Depósitos** | 1 ("Geral", padrão) | Estoque único — bom (simplifica anti-oversell). |
| **NF-e** | 18 naturezas de operação + **2 notas já emitidas** | Fiscal **já funciona** minimamente. Provável ambiente de **produção**. |
| **Formas de pagamento** | só 2 (Dinheiro, Conta a receber) | OK para nota; pode precisar mapear formas dos canais. |
| **Categorias** | 12 (nosso seed) | ✅ pronto. |
| **Produtos** | ~2, **um com `codigo=MLB5010184890`**, sem GTIN, sem NCM | 🔴 catálogo vazio + SKU = id de anúncio = **anti-padrão que duplica cadastro**. NCM/origem ausentes **bloqueiam NF-e**. |

**Leitura:** a fundação fiscal existe, mas o catálogo precisa nascer de verdade no Bling, com SKU limpo e campos fiscais preenchidos, **antes** de ligar qualquer sincronização — senão quebra a operação Platinum.

---

## 1. Plano Bling — qual é, qual precisa

**Como o Bling cobra (descoberta que muda o dimensionamento):** não cobra por NF-e nem por nº de integrações — **ambos são ilimitados em todos os planos**. Cobra por **volume de pedidos de venda/mês** importados de **marketplaces + API** (média móvel de 3 meses).

- **Mudança abril/2026:** pedidos importados **via API agora contam** na cota (antes só marketplace). Sincronizar produto/estoque **não** cria pedido; só importar/lançar pedido conta.
- **Shopify NÃO conta** (classificada como "loja virtual", junto de Tray/WooCommerce). **Só ML + ViaVarejo consomem cota.**

| Plano | Preço/mês | Teto pedidos/mês | NF-e | Integrações | API |
|---|---|---|---|---|---|
| **Cobalto** | R$ 55 | 200 | ilimitada | ilimitadas | sim (3 req/s, 120k/dia) |
| **Titânio F1** | a partir de R$ 120 | 500 | ilimitada | ilimitadas | sim + SPED |
| Titânio F2 | (a confirmar) | 2.000 | ilimitada | ilimitadas | sim |
| Diamante | R$ 650 | 10.000 | ilimitada | ilimitadas | sim |

**Plano atual provável: Cobalto (R$ 55).** Evidência: a tela de consent mostrou que o plano tem Marketplaces/NF-e/CT-e mas **não** tem Controle de Lotes, Ordens de Produção nem módulo de Vendedor — perfil exato do plano de entrada. **Confirmar** em *Minha Conta → Plano*.

**Recomendação: subir para Titânio Faixa 1 (a partir de R$ 120, teto 500 pedidos)** — **no go-live, não agora.**

> ✅ **DECISÃO (jun/2026):** **NÃO subir plano durante a configuração.** Configurar não exige upgrade — o Cobalto já tem API + NF-e + integrações ilimitadas. O Titânio só importa por **volume de pedidos no go-live**. Subir apenas se/quando o volume de ML+ViaVarejo passar de 200/mês de forma sustentada.

Justificativa do upgrade futuro: operação ML Platinum + ViaVarejo + Shopify nova; o teto de 200 do Cobalto vira gargalo (Shopify não conta, mas ML+ViaVarejo sim). Titânio F1 dá folga, inclui SPED e até 3 CNPJs.

**Pegadinha:** se o app/integração começar a **lançar pedidos via API**, isso consome cota e pode forçar upgrade automático. Nosso MCP lê/cadastra catálogo — não deve lançar pedidos (pedido nasce no canal).

---

## 2. Fluxo fiscal NF-e — checklist de configuração

Cenário: **100% NF-e modelo 55** (venda online com entrega). **NFC-e não se aplica** (só venda presencial/balcão) → **não precisa configurar CSC/token**.

### 2.1 Bloqueios atuais (resolver primeiro)
1. ✅ **Regime tributário = Simples Nacional** (decidido jun/2026). Usa **CSOSN** + **CRT 1**. Bling identifica e **não envia IBS/CBS** (Reforma Tributária). Cuidado: CSOSN só vale p/ Simples — naturezas devem usar CSOSN, não CST. (Confirmar CSOSN específico por operação com o contador — ex.: 102 sem crédito, 500 com ST já recolhida.)
2. 🔴 **Certificado A1** instalado (`.pfx`/`.p12`). **A1, não A3** — A3 (token físico) inviabiliza emissão automática em servidor. Bling não aceita certificado em nuvem/RemoteID.
3. 🔴 **NCM + Origem em 100% dos produtos** — hoje ausentes → **impedem salvar/emitir nota** (NCM ausente trava; origem ausente = Rejeição 966). Importados = origem 1 ou 2 (não "0 Nacional").
   - **Atalho de carga:** importar **XML das notas de entrada** dos fornecedores → Bling **preenche NCM automaticamente** no produto. Zera o backlog sem digitar item a item.

### 2.2 Naturezas de operação / CFOP (revisar as 18 existentes)
Revenda de mercadoria de terceiros usa família **x108** (não x102) — confirmar com contador por operação:
- Venda **dentro do estado** a não contribuinte (e-commerce B2C interno): **5102/5108**.
- Venda **fora do estado** a não contribuinte: **6108** → dispara **DIFAL** (EC 87/2015, recolher via GNRE) + FCP quando aplicável.
- Operações **com ST**: já existem naturezas; itens com ST precisam de **CEST** no produto.
- CST/CSOSN é definido **dentro de cada natureza** (regras do imposto), não no produto.
- Definir a **natureza padrão** de venda.

> ⚠️ Vender em marketplace = mesma regra fiscal de vender no site. DIFAL/FCP interestadual valem igual no ML/Casas Bahia.

### 2.3 GTIN na nota
- Produtos compatíveis/importados sem código de barras: preencher GTIN = **"SEM GTIN"** (literal). **Nunca inventar EAN** nem reusar de outro fabricante → **Rejeição 890**.
- Só informar GTIN real e registrado no CCG.

### 2.4 Emissão automática (1 gatilho por canal — nunca dois)
- **Mercado Livre:** ativar "Automatizar emissão de nota fiscal" + **"Gerar e emitir NF-e ao disponibilizar o pedido para envio"** (emite só quando o ML libera a etiqueta — evita nota antecipada) + "Enviar dados fiscais ao canal ao emitir NF" (libera o repasse do ML).
- **Shopify / Casas Bahia:** sem "liberação de etiqueta" → usar **Gerenciador de Transições** (emite ao mudar para situação de expedição) ou automação na situação "Aprovado".
- 🔴 **Não combinar** automação nativa + gerenciador + integrador externo no mesmo pedido = **nota duplicada**.

### 2.5 Homologação → Produção
- A conta já emitiu 2 notas → **provavelmente em produção**. Confirmar ambiente antes de configurar automação (Vendas → NF de Saída → ambiente).
- Antes de ligar automação em massa, testar casos reais em **homologação**: venda interna, venda interestadual (checar DIFAL), item com ST (checar CEST), item importado (checar origem) — validar CST/CSOSN/CFOP/valores **com o contador**.

---

## 3. Integrações — ML + Shopify + Casas Bahia

**Conceito-chave:** dois identificadores com papéis distintos.
- **SKU (`codigo`)** = chave de **match** (vincular na import/export, achar produto no pedido).
- **ID na loja** (MLB no ML / product-id na Shopify) = vínculo de **estoque e preço** (1 produto Bling ↔ N anúncios).
- 🔴 O produto com `codigo=MLB5010184890` tem **ID de anúncio no campo de SKU** = exatamente o que duplica cadastro. **Corrigir:** `codigo` = SKU físico real; MLB vai pro vínculo "ID na loja".

### 3.1 Regra de ouro
**SKU idêntico nos 3 sistemas** (Bling `codigo` = SKU Shopify = SKU ML). Divergência → duplica cadastro.

### 3.2 Ordem de ativação (minimiza risco na operação Platinum viva)

**Fase 0 — Saneamento (antes de QUALQUER sync):**
- Padronizar SKUs nos 3 canais (ver padrão §4).
- Corrigir o produto MLB (SKU real + MLB no vínculo).
- Cadastrar o catálogo real no Bling com **estoque e preço corretos** + NCM/origem.

**Fase 1 — ML em modo "absorção" primeiro:**
- **Importar os anúncios** dos 2 canais ML pro Bling com vínculo automático por SKU/GTIN (Bling absorve MLBs + estoque atual).
- Conferir cada anúncio Platinum vinculado ao produto certo; estoque/preço do Bling batendo com o anúncio.
- **Só então** habilitar sync de estoque + preço (Bling vira dono). Janela de baixa demanda + monitorar se algum anúncio pausou/zerou.
- Configurar NF-e automática "ao disponibilizar para envio".

**Fase 2 — Shopify depois (cenário controlado, nasce do Bling):**
- Conectar Shopify (Central de Extensões → Integrações → Shopify → instalar app → configurar canal/URL).
- **Exportar** produtos do Bling (cria/atualiza por SKU). Vincular categorias→coleções **manualmente** (integração não cria coleção automática — usar Smart Collection por prefixo de SKU na Shopify).
- Ligar sync estoque/preço/status-pedido/rastreio.
- Variações >100: criar na Shopify + vínculo manual (limite de API Shopify).

### 3.3 Matriz fonte da verdade

| Campo | Dono | Observação |
|---|---|---|
| Cadastro/catálogo | **Bling** | nasce no Bling → exporta Shopify / vincula ML |
| SKU (`codigo`) | **Bling** | idêntico nos 3 canais |
| Estoque | **Bling** | depósito único "Geral" evita oversell; sync empurra pra todos |
| Preço | **Bling** (c/ ressalva) | sync sobrescreve canal — revisar preços antes de ligar |
| Pedido | **Canal → Bling** | nasce no canal, importado |
| Status/rastreio | **Bling → Canal** | Bling devolve situação + rastreio |
| Fiscal/NF-e | **Bling** | emissor único |

### 3.4 Riscos concretos
- **Despublicar anúncio Platinum:** ligar sync com Bling vazio/zerado empurra estoque 0 → ML pausa anúncio. → estoque correto ANTES.
- **Preço derrubado:** sync de preço sobrescreve canal. → revisar preços no Bling antes, ativar canal a canal.
- **Oversell:** todos os canais devem consumir o mesmo saldo do depósito "Geral".

---

## 4. Cadastro de produto escalável

### 4.1 Schema mínimo "completo" (API v3 `POST /produtos`)
Obrigatórios: `nome`, `tipo:"P"`, `situacao:"A"`, `formato:"S"`, `unidade`. Fiscais (p/ NF-e): `tributacao.ncm`, `tributacao.origem` (+`cest` se ST).
Essenciais pra escalar/canais/frete: `codigo` (SKU), `gtin`, `preco`, `fornecedor.precoCusto`, `pesoBruto`/`pesoLiquido`, `dimensoes` (largura/altura/profundidade/unidadeMedida), `marca`, `categoria.id`, `descricaoCurta`/`descricaoComplementar`, `midia.imagens.externas[].link`.

> ⚠️ `precoCusto` fica em `fornecedor.precoCusto` (não na raiz). `origem` é numérico.

### 4.2 Marca vs Compatibilidade (não bagunçar)
- `marca` (nativo) = **fabricante real** (Evolut, Byqualy, Premium).
- Compatibilidade → **Campos Customizados** (criar uma vez no painel, reusar `idCampoCustomizado` na API):
  - "Marca Compatível" (Lista): HP / Brother / Canon…
  - "Modelos Compatíveis" (Texto Longo): "HP 105A; W1105A; Laser 107a…"
  - "Tipo de Suprimento" (Lista), "Rendimento" (Inteiro), "Cor" (Lista).
- **Bônus:** os atributos obrigatórios do ML (Marca/Modelo/Cor) também são Campos Customizados — o Bling gera por categoria ML. Mesmo mecanismo serve taxonomia interna + ficha técnica do ML.

### 4.3 Padrão de SKU
`[CAT]-[MARCA]-[MODELO/COMPAT]-[VAR]`, só `A-Z 0-9 -`. Ex.: `TON-EVO-HP105A-PT`, `TIN-BYQ-EP664-CY`, `IMP-HP-M404DN`. Estável, independe do canal, legível, casa nos 3 sistemas. **Nunca** o MLB.

### 4.4 Simples vs Variação vs Kit
- **Simples (`S`)** — maioria dos suprimentos (SKUs compatíveis distintos = produtos separados; melhor p/ SEO/anúncio).
- **Variação (`V`)** — só quando há eixo real (kit toner CMYK, rendimento Std/XL). `cloneInfo:true` herda dados do pai.
- **Kit/Estrutura (`E`)** — "impressora + 2 toners"; baixa estoque dos componentes.

### 4.5 Carga em massa idempotente
- **Sem endpoint de lote** na API v3 — cria 1 a 1, respeitar **3 req/s** (120k/dia; cuidado bloqueio de IP).
- Idempotência: `GET /produtos?codigo=XXX` → vazio = `POST` (cria); achou = `PUT /{id}` (atualiza). Sempre lookup por código antes de criar/retry.
- Alternativa carga inicial: **importação por planilha** no painel.
- Logar `data.id` e `data.warnings[]` da resposta.

### 4.6 Frete (preencher desde o início)
Peso + dimensões em 100% dos físicos. Zerado → ML recusa/erra frete e elegibilidade Full/Flex; Shopify calcula frete errado no checkout. Corrigir retroativo em centenas de SKUs é caríssimo.

---

## 5. Roadmap de execução (ordem sugerida)

**Bloco A — Decisões humanas (destravam o resto):**
- [ ] Confirmar **plano atual** (Minha Conta) e decidir upgrade → **Titânio F1**.
- [ ] Confirmar **regime tributário** com contador (Simples vs Normal).
- [ ] Garantir **certificado A1** instalado.
- [ ] Confirmar **ambiente** atual (homologação vs produção).

**Bloco B — Catálogo no Bling (onde o MCP entra forte):**
- [ ] Construir tools MCP de **produtos** (`list/get/create/update`) + **estoque** + **NF-e** (continuação do v0.1).
- [ ] Definir padrão de SKU e **planilha-mestra** do catálogo real.
- [ ] Criar Campos Customizados (compatibilidade) no painel; pegar os `idCampoCustomizado`.
- [ ] Carga idempotente dos produtos (NCM/origem via XML de entrada; peso/dimensões; marca; categoria; imagens).
- [ ] Corrigir o produto `MLB...` (SKU real).

**Bloco C — Fiscal:**
- [ ] Revisar 18 naturezas (CFOP/CST/CSOSN por dentro-fora/contribuinte; DIFAL nas 6108).
- [ ] Testar NF-e em homologação (casos reais) com o contador.
- [ ] Configurar emissão automática (1 gatilho/canal).

**Bloco D — Integrações (na ordem da §3.2):**
- [ ] Fase 0 saneamento SKU → Fase 1 ML absorção+sync → Fase 2 Shopify export.
- [ ] Validar anti-oversell (depósito único) e preços antes de ligar sync.

**Bloco E — Go-live:**
- [ ] Checklist final (SKU idêntico 3 sistemas, GTIN válido/"SEM GTIN", estoque centralizado, NF-e homologada, regra ML configurada).

---

## 6. Itens a confirmar (humano/contador)
1. Plano Bling atual + decisão de upgrade.
2. Regime tributário (define CSOSN vs CST).
3. CFOP exato por operação + classificação de origem por item importado.
4. DIFAL/FCP por UF de destino.
5. Onde estão os dados fiscais reais (planilha do contador vs XML de entrada dos fornecedores).
6. Catálogo real a subir (fonte: ML atual? planilha? fornecedores?).

---

## Fontes
Pesquisa consolidada de fontes oficiais Bling (ajuda.bling.com.br, developer.bling.com.br, blog.bling.com.br) — links detalhados nos relatórios de pesquisa que originaram este plano. Principais:
- [Planos e Preços](https://www.bling.com.br/planos-e-precos) · [Alteração de planos abr/2026](https://ajuda.bling.com.br/hc/pt-br/articles/30224184866583) · [Adequação de plano (marketplaces+API)](https://ajuda.bling.com.br/hc/pt-br/articles/19966749418391)
- [API v3 — Referência](https://developer.bling.com.br/referencia) · [Limites](https://developer.bling.com.br/limites) · [Boas práticas](https://developer.bling.com.br/boas-praticas)
- NF-e: [Deixe tudo pronto p/ emitir](https://ajuda.bling.com.br/hc/pt-br/articles/10448080778007) · [Certificado](https://ajuda.bling.com.br/hc/pt-br/articles/360036460334) · [Natureza de Operação](https://ajuda.bling.com.br/hc/pt-br/articles/360034982693) · [Rejeição 890 GTIN](https://ajuda.bling.com.br/hc/pt-br/articles/10298581819927) · [Rejeição 966 origem](https://ajuda.bling.com.br/hc/pt-br/articles/29775262640023) · [NF auto pós-etiqueta ML](https://ajuda.bling.com.br/hc/pt-br/articles/34188805749399)
- Integrações: [Produtos ML](https://ajuda.bling.com.br/hc/pt-br/articles/360040356713) · [Trazer anúncios ML](https://ajuda.bling.com.br/hc/pt-br/articles/34130380190743) · [Sync estoque ML](https://ajuda.bling.com.br/hc/pt-br/articles/360041377893) · [Integração Shopify](https://www.bling.com.br/integracao/shopify) · [Exportação Shopify](https://ajuda.bling.com.br/hc/pt-br/articles/4418759748503)
- Cadastro: [SKU no ML](https://blog.bling.com.br/codigo-sku-mercado-livre/) · [Campos customizados](https://ajuda.bling.com.br/hc/pt-br/articles/360039489234) · [Schema produto (SDK espelho)](https://github.com/AlexandreBellas/bling-erp-api-js/blob/main/src/entities/produtos/interfaces/create.interface.ts)
