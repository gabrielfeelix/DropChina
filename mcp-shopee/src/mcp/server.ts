import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { listAllItemIds, getItemsBaseInfo, normalizeItem } from '../api/items.js'
import { getAllCategories, getCategoryById, getCategoryAttributes } from '../api/categories.js'

const server = new McpServer({ name: 'dropchina-shopee', version: '0.1.0' })

function jsonContent(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}
function errorContent(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return { isError: true, content: [{ type: 'text' as const, text: `Erro: ${message}` }] }
}

// ---------------------------------------------------------------------------
// Tools READ-ONLY
// ---------------------------------------------------------------------------

server.registerTool(
  'shopee_list_item_ids',
  {
    title: 'Listar ids de anúncios (Shopee)',
    description:
      'Lista TODOS os item_ids da loja Shopee, paginado por offset. Somente leitura.',
    inputSchema: {
      status: z
        .enum(['NORMAL', 'BANNED', 'DELETED', 'UNLIST', 'ALL'])
        .optional()
        .describe('Status dos anúncios (padrão: NORMAL)'),
    },
  },
  async ({ status }) => {
    try {
      const ids = await listAllItemIds(status ?? 'NORMAL')
      return jsonContent({ total: ids.length, item_ids: ids })
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'shopee_get_items',
  {
    title: 'Detalhe de anúncios (Shopee)',
    description:
      'Detalhe de até 50 anúncios por chamada via get_item_base_info. Inclui estoque, SKU, preço e fotos. Somente leitura.',
    inputSchema: {
      item_ids: z
        .array(z.number().int().positive())
        .min(1)
        .max(50)
        .describe('Lista de item_ids Shopee (máx 50)'),
    },
  },
  async ({ item_ids }) => {
    try {
      const raw = await getItemsBaseInfo(item_ids)
      return jsonContent(raw.map(normalizeItem))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'shopee_get_item_raw',
  {
    title: 'Detalhe bruto de anúncios (Shopee)',
    description:
      'Igual shopee_get_items mas retorna o JSON bruto da API sem normalização. Útil para depuração. Somente leitura.',
    inputSchema: {
      item_ids: z
        .array(z.number().int().positive())
        .min(1)
        .max(50)
        .describe('Lista de item_ids Shopee (máx 50)'),
    },
  },
  async ({ item_ids }) => {
    try {
      const raw = await getItemsBaseInfo(item_ids)
      return jsonContent(raw)
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'shopee_get_categories',
  {
    title: 'Lista de categorias (Shopee)',
    description: 'Retorna todas as categorias disponíveis na Shopee. Somente leitura.',
    inputSchema: {
      language: z.string().optional().describe('Idioma (padrão: pt-br)'),
    },
  },
  async ({ language }) => {
    try {
      const cats = await getAllCategories(language ?? 'pt-br')
      return jsonContent({ total: cats.length, categories: cats })
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'shopee_get_category',
  {
    title: 'Detalhe de categoria (Shopee)',
    description: 'Retorna os dados de uma categoria pelo ID. Somente leitura.',
    inputSchema: {
      category_id: z.number().int().positive().describe('ID da categoria Shopee'),
    },
  },
  async ({ category_id }) => {
    try {
      const cat = await getCategoryById(category_id)
      if (!cat) return errorContent(new Error(`Categoria ${category_id} não encontrada`))
      return jsonContent(cat)
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'shopee_get_category_attributes',
  {
    title: 'Atributos de categoria (Shopee)',
    description:
      'Lista os atributos (ficha técnica) de uma categoria — útil para auditar o que falta preencher. Somente leitura.',
    inputSchema: {
      category_id: z.number().int().positive().describe('ID da categoria Shopee'),
      language: z.string().optional().describe('Idioma (padrão: pt-br)'),
    },
  },
  async ({ category_id, language }) => {
    try {
      const attrs = await getCategoryAttributes(category_id, language ?? 'pt-br')
      return jsonContent({ category_id, total: attrs.length, attributes: attrs })
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[dropchina-shopee] MCP server pronto (stdio). READ-ONLY.')
}

main().catch((err) => {
  console.error('[dropchina-shopee] falha ao iniciar:', err)
  process.exit(1)
})
