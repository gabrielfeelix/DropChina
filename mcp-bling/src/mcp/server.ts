import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { listCategorias, createCategoria } from '../api/categorias.js'
import {
  listProdutos,
  getProduto,
  findProdutoByCodigo,
  createProduto,
  updateProduto,
  upsertProduto,
  type ProdutoInput,
} from '../api/produtos.js'
import { listNfes, getNfe } from '../api/nfe.js'

const server = new McpServer({
  name: 'dropchina-bling',
  version: '0.1.0',
})

function jsonContent(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorContent(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return { isError: true, content: [{ type: 'text' as const, text: `Erro: ${message}` }] }
}

server.registerTool(
  'bling_list_categories',
  {
    title: 'Listar categorias de produto',
    description:
      'Lista todas as categorias de produto cadastradas no Bling (com paginação automática).',
    inputSchema: {},
  },
  async () => {
    try {
      const categorias = await listCategorias()
      return jsonContent(categorias)
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_create_category',
  {
    title: 'Criar categoria de produto',
    description:
      'Cria uma categoria de produto no Bling. Opcionalmente sob uma categoria pai (categoriaPaiId).',
    inputSchema: {
      descricao: z.string().min(1).describe('Nome/descrição da categoria'),
      categoriaPaiId: z
        .number()
        .int()
        .optional()
        .describe('ID da categoria pai (para subcategoria). Omitir para categoria raiz.'),
    },
  },
  async ({ descricao, categoriaPaiId }) => {
    try {
      const created = await createCategoria(descricao, categoriaPaiId)
      return jsonContent(created)
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

/** Campos de produto compartilhados por create/update. */
const produtoFields = {
  codigo: z.string().min(1).optional().describe('SKU. Chave de vínculo com os canais. NUNCA usar id de anúncio (MLB...).'),
  preco: z.number().optional().describe('Preço de venda'),
  tipo: z.enum(['P', 'S', 'N']).optional().describe('P=Produto (padrão), S=Serviço, N=Serviço especial'),
  situacao: z.enum(['A', 'I']).optional().describe('A=Ativo (padrão), I=Inativo'),
  formato: z.enum(['S', 'V', 'E']).optional().describe('S=Simples (padrão), V=Com variações, E=Kit/composição'),
  unidade: z.string().optional().describe('Unidade (UN, PC, KG...)'),
  gtin: z.string().optional().describe('EAN/código de barras. Sem código real registrado, usar "SEM GTIN".'),
  marca: z.string().optional().describe('Marca = FABRICANTE REAL (Evolut, Byqualy...). Compatibilidade vai em campo customizado, não aqui.'),
  categoriaId: z.number().int().optional().describe('ID da categoria no Bling'),
  pesoBruto: z.number().optional().describe('Peso bruto (kg) — essencial p/ frete'),
  pesoLiquido: z.number().optional().describe('Peso líquido (kg)'),
  descricaoCurta: z.string().optional().describe('Descrição curta'),
  ncm: z.string().optional().describe('NCM — obrigatório p/ emitir NF-e'),
  origem: z.number().int().min(0).max(8).optional().describe('Origem fiscal (0=nacional, 1/2=importado...). Obrigatório p/ NF-e.'),
  cest: z.string().optional().describe('CEST — necessário quando o NCM tem Substituição Tributária'),
}

server.registerTool(
  'bling_list_products',
  {
    title: 'Listar produtos',
    description: 'Lista produtos do Bling (1 página, até 100). Filtros opcionais: codigo, nome, idCategoria. Somente leitura.',
    inputSchema: {
      codigo: z.string().optional().describe('Filtrar por código/SKU'),
      nome: z.string().optional().describe('Filtrar por nome'),
      idCategoria: z.number().int().optional().describe('Filtrar por categoria'),
      pagina: z.number().int().min(1).optional(),
      limite: z.number().int().min(1).max(100).optional(),
    },
  },
  async (params) => {
    try {
      return jsonContent(await listProdutos(params))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_get_product',
  {
    title: 'Detalhe de produto',
    description: 'Retorna o detalhe completo de um produto por id. Somente leitura.',
    inputSchema: { idProduto: z.number().int().describe('ID do produto no Bling') },
  },
  async ({ idProduto }) => {
    try {
      return jsonContent(await getProduto(idProduto))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_find_product_by_codigo',
  {
    title: 'Buscar produto por SKU',
    description: 'Busca exata por codigo (SKU). Retorna o produto ou null. Útil p/ checar duplicidade antes de criar.',
    inputSchema: { codigo: z.string().min(1).describe('Código/SKU exato') },
  },
  async ({ codigo }) => {
    try {
      return jsonContent(await findProdutoByCodigo(codigo))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_create_product',
  {
    title: 'Criar produto',
    description:
      'Cria um produto NOVO no Bling. Produto sem vínculo de canal NÃO repercute no Mercado Livre. Requer confirm=true.',
    inputSchema: {
      nome: z.string().min(1).describe('Nome do produto (obrigatório)'),
      ...produtoFields,
      confirm: z.boolean().describe('Deve ser true para efetivar a criação (trava de segurança).'),
    },
  },
  async ({ confirm, ...input }) => {
    try {
      if (!confirm) return errorContent('Escrita não confirmada: passe confirm=true para criar o produto.')
      return jsonContent(await createProduto(input as ProdutoInput))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_update_product',
  {
    title: 'Atualizar produto',
    description:
      'Atualiza um produto por id. ⚠️ Se o produto estiver vinculado a um anúncio com sync ligada, pode refletir no canal. Requer confirm=true.',
    inputSchema: {
      idProduto: z.number().int().describe('ID do produto a atualizar'),
      nome: z.string().optional().describe('Nome'),
      ...produtoFields,
      confirm: z.boolean().describe('Deve ser true para efetivar a atualização.'),
    },
  },
  async ({ idProduto, confirm, ...input }) => {
    try {
      if (!confirm) return errorContent('Escrita não confirmada: passe confirm=true para atualizar o produto.')
      return jsonContent(await updateProduto(idProduto, input as ProdutoInput))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_upsert_product',
  {
    title: 'Upsert de produto (idempotente por SKU)',
    description:
      'Cria se não existe ou atualiza se já existe, casando por codigo (SKU). Base da carga em massa idempotente. Requer confirm=true.',
    inputSchema: {
      ...produtoFields,
      codigo: z.string().min(1).describe('SKU — obrigatório (chave de idempotência)'),
      nome: z.string().optional().describe('Nome (obrigatório se for criar)'),
      confirm: z.boolean().describe('Deve ser true para efetivar.'),
    },
  },
  async ({ confirm, ...input }) => {
    try {
      if (!confirm) return errorContent('Escrita não confirmada: passe confirm=true.')
      return jsonContent(await upsertProduto(input as ProdutoInput))
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ---------------------------------------------------------------------------
// NF-e (leitura)
// ---------------------------------------------------------------------------

server.registerTool(
  'bling_list_nfe',
  {
    title: 'Listar NF-e',
    description: 'Lista notas fiscais (1 página). Filtros opcionais: situacao, tipo, intervalo de emissão. Somente leitura.',
    inputSchema: {
      situacao: z.number().int().optional().describe('Código da situação da nota'),
      tipo: z.number().int().optional().describe('Tipo da nota (0=entrada, 1=saída)'),
      dataEmissaoInicial: z.string().optional().describe('YYYY-MM-DD'),
      dataEmissaoFinal: z.string().optional().describe('YYYY-MM-DD'),
      pagina: z.number().int().min(1).optional(),
      limite: z.number().int().min(1).max(100).optional(),
    },
  },
  async (params) => {
    try {
      return jsonContent(await listNfes(params))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'bling_get_nfe',
  {
    title: 'Detalhe de NF-e',
    description: 'Retorna o detalhe de uma nota fiscal por id. Somente leitura.',
    inputSchema: { idNotaFiscal: z.number().int().describe('ID da nota fiscal') },
  },
  async ({ idNotaFiscal }) => {
    try {
      return jsonContent(await getNfe(idNotaFiscal))
    } catch (err) {
      return errorContent(err)
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // stdout é reservado ao protocolo MCP; logs vão para stderr.
  console.error('[dropchina-bling] MCP server pronto (stdio).')
}

main().catch((err) => {
  console.error('[dropchina-bling] falha ao iniciar:', err)
  process.exit(1)
})
