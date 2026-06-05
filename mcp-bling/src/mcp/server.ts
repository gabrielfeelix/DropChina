import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { listCategorias, createCategoria } from '../api/categorias.js'

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
