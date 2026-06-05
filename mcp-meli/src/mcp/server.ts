import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { getMyUserId, listAllItemIds, getItems, extractSku } from '../api/items.js'
import { getCategory, getCategoryAttributes } from '../api/categories.js'

const server = new McpServer({ name: 'dropchina-meli', version: '0.1.0' })

function jsonContent(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}
function errorContent(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return { isError: true, content: [{ type: 'text' as const, text: `Erro: ${message}` }] }
}

server.registerTool(
  'meli_whoami',
  { title: 'Quem sou eu (ML)', description: 'Retorna o user_id do dono do token. Somente leitura.', inputSchema: {} },
  async () => {
    try {
      return jsonContent({ user_id: await getMyUserId() })
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'meli_list_item_ids',
  {
    title: 'Listar ids de anúncios',
    description: 'Lista TODOS os ids (MLB...) dos anúncios do vendedor (scan). Somente leitura.',
    inputSchema: {},
  },
  async () => {
    try {
      const userId = await getMyUserId()
      const ids = await listAllItemIds(userId)
      return jsonContent({ total: ids.length, ids })
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'meli_get_items',
  {
    title: 'Detalhe de anúncios',
    description: 'Detalhe de até 20 anúncios por chamada (multiget). Inclui SKU extraído. Somente leitura.',
    inputSchema: { ids: z.array(z.string()).min(1).max(20).describe('Lista de MLB ids (máx 20)') },
  },
  async ({ ids }) => {
    try {
      const items = await getItems(ids)
      return jsonContent(items.map((i) => ({ ...i, _sku: extractSku(i) })))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'meli_get_category',
  {
    title: 'Categoria ML',
    description: 'Detalhe de uma categoria (com path). Somente leitura.',
    inputSchema: { categoryId: z.string().min(1).describe('Ex.: MLB1648') },
  },
  async ({ categoryId }) => {
    try {
      return jsonContent(await getCategory(categoryId))
    } catch (err) {
      return errorContent(err)
    }
  },
)

server.registerTool(
  'meli_get_category_attributes',
  {
    title: 'Atributos da categoria',
    description: 'Lista os atributos (ficha técnica) de uma categoria ML — útil pra auditar o que falta. Somente leitura.',
    inputSchema: { categoryId: z.string().min(1).describe('Ex.: MLB1648') },
  },
  async ({ categoryId }) => {
    try {
      return jsonContent(await getCategoryAttributes(categoryId))
    } catch (err) {
      return errorContent(err)
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[dropchina-meli] MCP server pronto (stdio). READ-ONLY.')
}

main().catch((err) => {
  console.error('[dropchina-meli] falha ao iniciar:', err)
  process.exit(1)
})
