# DropChina — Projeto, Arquitetura e Integração com o Bling

> Documento mestre de referência. Reúne tudo que sabemos do projeto até hoje, define as **fontes da verdade**, descreve os canais de venda (Mercado Livre, site próprio e Bling) e explica **como conectar o Bling via API** (e por que o caminho de MCP é interessante).
> Documento companheiro: **`02_Bling_Runbook_para_IA.md`** — o passo a passo técnico que uma IA executa para implementar tudo isto.

- **Versão:** 1.0
- **Data:** Junho de 2026
- **Autor:** Gabriel (UX/Design) — projeto freelance
- **Cliente:** Augusto
- **Status:** site em construção; integração com Bling em planejamento

---

## 1. Visão geral do projeto

Estamos construindo a operação digital de e-commerce do **Augusto**, um lojista do ramo de **suprimentos de impressão e automação comercial**. O catálogo é amplo e gira em torno de: impressoras, cartuchos de toner, cartuchos de tinta, refil de toner, refil de tinta, cilindros, peças e componentes, papel fotográfico, etiquetas e bobinas, ribbon, scanners e itens de informática.

> ⚠️ **Importante para qualquer IA que ler este documento:** este **não** é um negócio "gamer". É uma loja de **suprimentos/insumos de impressão e automação**. Variedade ampla de marcas e itens técnicos é normal e esperada.

**Marca / domínio:** o site está sendo construído sob a marca **DropChina** (`dropchinaoficial.com.br`). A operação no Mercado Livre pode estar sob outro nome comercial (**Creative Cópias** — a confirmar). Ver "Itens em aberto".

**Objetivo do projeto:** dar ao Augusto uma operação unificada e profissional, em que ele cadastra o produto **uma vez** e ele aparece, com estoque e preço corretos, em todos os canais — e com a parte fiscal (NF-e) resolvida automaticamente.

---

## 2. Canais de venda e situação atual

| Canal | Papel | Situação |
|---|---|---|
| **Mercado Livre** | Canal principal de vendas hoje | Operação ativa e forte. Augusto tem reputação **Platinum** (Mercado Líder Platinum — o nível mais alto de reputação do ML). Muitas vendas acontecem por aqui. |
| **Site próprio (Shopify)** | Segundo canal, em construção | Loja **Shopify** plano **Basic**, moeda **BRL**, fuso Brasil. Tema da família **Horizon**, customizado via código. Vitrine da marca, com mais controle de experiência e margem. |
| **Bling (ERP)** | Centro de operação | A conectar. Vai concentrar catálogo, estoque e fiscal, e distribuir para os dois canais acima. |

**Por que o Mercado Livre Platinum importa:** a reputação Platinum é um ativo difícil de construir e que gera confiança e volume. A estratégia **não** é migrar para fora do ML — é **manter o ML forte e somar o site próprio**, com o Bling garantindo que os dois nunca briguem por estoque ou preço.

---

## 3. Fontes da verdade (o conceito central da arquitetura)

Esta é a decisão mais importante do projeto e tudo é desenhado a partir dela:

> ### 🟢 O **Bling** é a fonte da verdade do catálogo, do estoque e do fiscal.
> Todo produto **nasce no Bling**. De lá, ele repercute para o site (Shopify) e para o Mercado Livre. O estoque é controlado pelo Bling e sincronizado para os canais. As notas fiscais são emitidas pelo Bling.

**Quem manda no quê:**

| Domínio | Fonte da verdade | Quem só recebe (espelha) |
|---|---|---|
| Cadastro do produto (nome, SKU, GTIN, NCM, preço base) | **Bling** | Shopify, Mercado Livre |
| Estoque / quantidade | **Bling** | Shopify, Mercado Livre |
| Categorias / classificação | **Bling** (com base na planilha oficial) | Shopify (coleções), Mercado Livre (categorias) |
| Dados fiscais (NCM, CEST, origem, tributação) | **Bling** | — (usados na emissão) |
| Emissão de NF-e / NFC-e | **Bling** | — |
| Pedidos | Origem é o **canal** (Shopify ou ML) → importados para o Bling | Bling consolida |
| Experiência/vitrine, conteúdo, design das páginas | **Shopify** | — |

**Consequência prática:** o site Shopify deixa de ser onde se "cadastra produto na mão". Ele vira **vitrine**. O cadastro vira responsabilidade do Bling. Isso simplifica a vida do Augusto e elimina divergências entre canais.

---

## 4. Arquitetura da integração

```
                         ┌─────────────────────────┐
                         │         BLING            │
                         │   (fonte da verdade)     │
                         │  catálogo · estoque ·    │
                         │     fiscal · NF-e        │
                         └───────────┬─────────────┘
              integração nativa      │      integração nativa
            ┌───────────────────────┐│┌───────────────────────┐
            ▼                        ▼ ▼                        ▼
   ┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
   │     SHOPIFY     │      │  MERCADO LIVRE  │      │   CLAUDE / IA     │
   │   (site/vitrine)│      │ (Platinum)      │      │  via API v3 /MCP  │
   │  coleções,      │      │ anúncios,       │      │  configura e      │
   │  páginas, UX    │      │ vendas, NF-e    │      │  popula o Bling   │
   └─────────────────┘      └─────────────────┘      └──────────────────┘
```

Três conexões saem do Bling:

1. **Bling ↔ Shopify** — integração **nativa** do Bling (app oficial). Sincroniza produtos, estoque, preços, pedidos, status e código de rastreio.
2. **Bling ↔ Mercado Livre** — integração **nativa** do Bling. Sincroniza anúncios/estoque e emite + envia NF-e automaticamente (regra configurável: emitir a nota só quando o ML liberar a etiqueta de envio).
3. **Bling ↔ Claude/IA** — via **API v3 (OAuth2)**. É por aqui que a IA cadastra categorias e produtos, ajusta estoque e consulta notas, de forma programática e em massa. (Detalhe técnico no doc 2.)

### A chave que liga tudo: o **SKU**

O **SKU** é o identificador universal do produto em todos os sistemas. No Bling ele se chama **`codigo`**; na Shopify é o campo **SKU**; no Mercado Livre é o código/SKU do anúncio.

> 🔑 **Regra de ouro:** o SKU precisa ser **idêntico** nos três sistemas. Se o SKU do Bling e da Shopify forem diferentes, a sincronização **duplica o cadastro**. Por isso, alinhar/limpar SKUs é o **pré-requisito número 1** antes de ligar qualquer sincronização.

---

## 5. Taxonomia oficial de categorias

A planilha enviada pelo Augusto (`categorias_marcas_creative_copias.xlsx`) é a **base oficial** da estrutura de categorias. São **12 categorias**, organizadas como uma matriz **Categoria × Marca**:

| # | Categoria | Marcas |
|---|---|---|
| 1 | **Impressoras** | Epson, HP, Brother, Canon, Ricoh, Kyocera, Lexmark, Pantum, Xerox |
| 2 | **Cartuchos de Toner** | HP, Brother, Ricoh, Lexmark |
| 3 | **Cartuchos de Tinta** | HP, Epson, Canon, Brother |
| 4 | **Refil de Toner** | HP, Brother, Canon, Ricoh, Kyocera, Samsung, Xerox |
| 5 | **Refil de Tinta** | Epson, Brother |
| 6 | **Peças e Componentes** | HP, Brother, Ricoh, Samsung, Canon |
| 7 | **Cilindros** | Brother, HP, Ricoh, Samsung |
| 8 | **Papel Fotográfico** | Diversas marcas |
| 9 | **Etiquetas e Bobinas** | Zebra, Argox, Elgin |
| 10 | **Ribbon** | Zebra, Argox, Elgin |
| 11 | **Scanner** | HP, Ricoh, Brother, Epson |
| 12 | **Informática** | Logitech, Multilaser |

**Dois eixos de classificação** — esta matriz revela que a loja precisa de duas dimensões, não uma:

- **Categoria** = o *tipo* de produto (Impressoras, Toner, Cilindro…). Vira categoria no Bling → coleção na Shopify → categoria no ML.
- **Marca / compatibilidade** = a marca do produto **ou** a marca com a qual ele é compatível (ex.: um toner compatível "para HP"). Vira o campo **marca** + tags/filtros.

> Observação: muitos itens vendidos são **compatíveis** (marcas como Evolut, Byqualy, Premium) "para" uma impressora de marca OEM (HP, Brother…). O modelo correto é: **marca = fabricante real do item**, e a **compatibilidade** ("compatível com HP") entra como atributo/filtro. Assim o cliente acha pela impressora que ele tem, sem bagunçar a marca real.

**Como a taxonomia se propaga:**

```
Planilha (oficial)  →  Categorias no Bling  →  ┬→ Coleções na Shopify (automáticas por categoria/tag)
                                               └→ Categorias do Mercado Livre (mapeadas pelo Bling)
```

---

## 6. Mapa de campos de dados

O que cada sistema guarda e para onde o dado flui. Útil para a IA saber **onde** preencher cada coisa.

| Campo | Mora no Bling? | Vai p/ Shopify? | Vai p/ ML? | Obrigatório p/ NF-e? |
|---|---|---|---|---|
| **SKU (`codigo`)** | ✅ fonte | ✅ (vínculo) | ✅ | — (mas essencial) |
| **Nome / título** | ✅ | ✅ | ✅ | ✅ |
| **GTIN / EAN (código de barras)** | ✅ | ✅ | ✅ | ✅ (GTIN inválido → rejeição 890) |
| **NCM** | ✅ | — | — | ✅ |
| **CEST** | ✅ | — | — | ⚠️ se houver Substituição Tributária |
| **Origem** (nacional/importado) | ✅ | — | — | ✅ |
| **Preço** | ✅ fonte | ✅ | ✅ | ✅ |
| **Peso e dimensões** | ✅ | ✅ | ✅ | ✅ (frete/nota) |
| **Descrição** | ✅ | ✅ | ✅ | — |
| **Imagens** | ✅/Shopify | ✅ | ✅ | — |
| **Estoque** | ✅ fonte | ✅ | ✅ | — |
| **Categoria** | ✅ | ✅ (coleção) | ✅ | — |

**Leitura prática:** a Shopify só precisa carregar **SKU limpo, GTIN, nome, descrição, preço, peso e imagem**. Os campos fiscais (**NCM, CEST, origem**) ficam **só no Bling** — inclusive o Bling consegue preencher o NCM **automaticamente** a partir da nota de entrada do fornecedor. A IA **não** precisa colocar dado fiscal na Shopify.

---

## 7. Como vamos conectar o Bling (resumo executivo)

Pesquisa concluída. Conclusões:

- **SSH não se aplica.** O Bling é um SaaS — não há servidor para acessar por SSH.
- **Não existe um MCP pronto do Bling** (reconfirmado em jun/2026 no registro de conectores e no GitHub; só há bibliotecas soltas de apoio ao OAuth e SDKs). Por isso construímos o nosso.
- **API v3 vs v2 — usamos a v3, decisão fechada.** A **v2 está descontinuada** e não recebe mais suporte (a própria Bling mantém uma [página de migração v2→v3](https://developer.bling.com.br/migracao-v2-v3)). Projeto novo nasce na v3.
- **O caminho real é a API v3 oficial do Bling.** É REST, usa **OAuth 2.0** (fluxo *Authorization Code*), com `access_token` (Bearer/JWT) e `refresh_token` de 30 dias. Limite de **3 requisições/segundo** e **120 mil/dia** — folgado para o nosso uso. Além disso há regras de **bloqueio de IP** (ex.: só **20 chamadas a `/oauth/token` por minuto** antes de bloquear o IP por 1h) — detalhadas no runbook (doc 2).

**Recomendação de arquitetura de conexão:** construir um **MCP server local do Bling** dentro de um repositório versionado (rodando na máquina do Gabriel, via VS Code/WSL). Vantagens:

- Vira uma **conexão por MCP de verdade**: a IA passa a ter ferramentas nativas do Bling (criar categoria, criar/atualizar produto, ajustar estoque, consultar NF-e) reutilizáveis em qualquer sessão.
- O **mesmo repositório** serve de base para **scripts de carga em massa** (ex.: subir as 12 categorias e todos os produtos de uma vez), com código auditável.
- Os **tokens OAuth ficam persistidos localmente** — a sandbox temporária não segura o OAuth entre sessões; rodar local resolve.

> O passo a passo técnico completo (OAuth, endpoints, payloads, estrutura do MCP, carga inicial) está em **`02_Bling_Runbook_para_IA.md`**.

---

## 8. Pré-requisitos e responsabilidades

Há partes que **só o Gabriel/Augusto** conseguem fazer (a IA não cria credenciais nem loga na conta):

1. **Conta Bling do Augusto** — a conta **real**, com CNPJ, certificado e Mercado Livre já vinculados. É nela que a fonte da verdade precisa morar.
2. **App privado** criado no Bling (Central de Extensões → Área do Integrador → Criar aplicativo, visibilidade **privada** — não exige homologação).
3. **`client_id`, `client_secret`, `redirect_uri`** definidos, e os **escopos** corretos marcados (produtos, categorias, estoques, NF-e/NFC-e, pedidos, contatos).
4. **Autorização OAuth feita uma vez** no navegador (login do Augusto) para gerar o primeiro token.
5. **Certificado e-CNPJ A1** instalado no Bling para emissão de NF-e (setup fiscal do Augusto).
6. **Dados fiscais** (NCM, EAN/GTIN) — ou fornecidos em planilha, ou deixados para o Bling preencher via nota de entrada.

---

## 9. Estado atual da loja Shopify (diagnóstico)

Levantamento feito ao vivo na loja conectada (`dropchina-9753.myshopify.com`):

- **28 produtos ativos** e **9 coleções**. A base parece ser **material de demonstração/montagem** — as marcas reais da planilha (Lexmark, Pantum, Kyocera, Canon, Ricoh, Xerox, Zebra, Argox, Elgin, Logitech, Multilaser) quase não aparecem; o que está lá inclui itens fora da lista (placa de vídeo, mini PC, monitor, Starlink, escova). Provável que sejam substituídos quando o Bling despejar o catálogo real.
- **Estoque zerado em 100% dos produtos** — coerente com a ideia de o Bling assumir o estoque, mas a loja hoje exibe tudo esgotado.
- **Sem GTIN/EAN aparente** nos produtos — lacuna a resolver (exigido para NF-e e ML).
- **Categorização ainda não reflete a planilha** — hoje há um "Toners" genérico misturando cartucho de toner, refil e cilindro, que a taxonomia oficial separa.
- **Pontos bons:** as coleções já são **automáticas por tag** (`categoria-x`), o `vendor` é usado como marca, e os SKUs seguem um padrão de prefixo. Boa fundação para reorganizar.

---

## 10. Riscos e cuidados

| Risco | Impacto | Mitigação |
|---|---|---|
| SKU divergente entre Bling e Shopify | Duplicação de cadastro na sincronização | Alinhar/limpar SKUs **antes** de ligar a sync. SKU idêntico nos 3 sistemas. |
| GTIN ausente ou inválido | Rejeição de NF-e (erro **890** — GTIN inexistente no CCG) | Validar GTIN/EAN antes de emitir. Sem GTIN, usar "SEM GTIN" conforme regra fiscal. |
| Estoque não centralizado | Venda sem estoque (oversell) em um canal | Bling como dono único do estoque, com sync ativa nos dois canais. |
| Ligar a integração antes de organizar | Bagunça difícil de reverter | Seguir a ordem do runbook: organizar → conectar → validar → go-live. |
| Operação em massa sem revisão | Erro propagado em muitos itens | Toda carga em massa roda primeiro em pequena amostra e com confirmação. |

---

## 11. Itens em aberto (a confirmar com o Augusto)

1. **Nome da loja/marca:** o site é "DropChina" (`dropchinaoficial.com.br`), mas a planilha e a operação do ML sugerem "**Creative Cópias**". São duas marcas? Vamos unificar? Isso afeta identidade, anúncios e a forma de casar o catálogo do ML.
2. **Conta Bling:** confirmar que usaremos a conta real do Augusto (com CNPJ, certificado e ML já ligados).
3. **Origem dos dados fiscais:** o Augusto fornece NCM/EAN em planilha, ou deixamos o Bling preencher via nota de entrada?
4. **Destino dos 28 produtos demo** da Shopify: substituir pela carga real vinda do Bling?
5. **Versão final da lista de categorias:** usar a do arquivo (12 categorias) como definitiva.

---

## Fontes

- [Bling — Autenticação (API v3 / OAuth2)](https://developer.bling.com.br/autenticacao)
- [Bling — Cadastro de aplicativos](https://developer.bling.com.br/aplicativos)
- [Bling — Integração com Shopify](https://www.bling.com.br/integracao/shopify)
- [Bling — Integração com Mercado Livre](https://www.bling.com.br/integracao/mercado-livre)
- [Shopify — Standard Product Taxonomy](https://help.shopify.com/en/manual/products/details/product-category)
- Dados ao vivo da loja Shopify `dropchina-9753.myshopify.com` (via MCP Shopify)
- Planilha do cliente: `categorias_marcas_creative_copias.xlsx`
