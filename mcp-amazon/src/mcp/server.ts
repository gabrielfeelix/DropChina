/**
 * server.ts — MCP server READ-ONLY da Amazon SP-API (stdio).
 *
 * Todas as tools são somente leitura. Nenhuma escreve na Amazon.
 *
 * Tools disponíveis:
 *   amz_search_catalog      — busca por keyword/EAN no catálogo Amazon
 *   amz_get_catalog_item    — detalhe de um ASIN no catálogo
 *   amz_get_listing         — detalhe de um listing do seller por SKU
 *   amz_list_inventory      — inventário FBA do seller (todos os SKUs)
 *
 * Uso: npm run mcp
 * Configure no Claude Desktop / claude_desktop_config.json.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchCatalogItems, getCatalogItem } from '../api/catalog.js'
import { getListingsItem } from '../api/listings.js'
import { listAllInventorySummaries } from '../api/inventory.js'

const server = new McpServer({ name: 'dropchina-amazon', version: '0.1.0' })

function jsonContent(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorContent(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return { isError: true, content: [{ type: 'text' as const, text: `Erro: ${message}` }] }
}

// ─── Tool: busca no catálogo Amazon ─────────────────────────────────────────

server.registerTool(
  'amz_search_catalog',
  {
    title: 'Buscar no catálogo Amazon',
    description:
      'Busca itens no catálogo Amazon BR por palavra-chave ou EAN/GTIN. ' +
      'Retorna lista normalizada (ASIN, título, marca, GTIN, categoria). Somente leitura.',
    inputSchema: {
      keywords: z.string().optional().describe('Palavra-chave de busca (ex.: "cartucho HP 664")'),
      identifiers: z
        .array(z.string())
        .optional()
        .describe('Lista de EAN/GTIN/ASIN para busca por código'),
      identifierType: z
        .enum(['ASIN', 'EAN', 'GTIN', 'ISBN', 'JAN', 'MINSAN', 'SKU', 'UPC'])
        .optional()
        .describe('Tipo dos identifiers (padrão: EAN)'),
      pageSize: z.number().min(1).max(20).optional().describe('Itens por página (padrão: 20)'),
    },
  },
  async (args: Record<string, unknown>) => {
    const keywords = args['keywords'] as string | undefined
    const identifiers = args['identifiers'] as string[] | undefined
    const identifierType = args['identifierType'] as
      | 'ASIN' | 'EAN' | 'GTIN' | 'ISBN' | 'JAN' | 'MINSAN' | 'SKU' | 'UPC'
      | undefined
    const pageSize = args['pageSize'] as number | undefined
    try {
      if (!keywords && (!identifiers || identifiers.length === 0)) {
        return errorContent('Informe keywords ou identifiers para buscar.')
      }
      const result = await searchCatalogItems({
        keywords,
        identifiers,
        identifierType,
        pageSize,
      })
      return jsonContent(result)
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ─── Tool: detalhe de ASIN no catálogo ──────────────────────────────────────

server.registerTool(
  'amz_get_catalog_item',
  {
    title: 'Detalhe de ASIN no catálogo Amazon',
    description:
      'Retorna detalhe completo de um ASIN no catálogo Amazon BR: título, marca, GTIN, ' +
      'categoria, imagens e rank de vendas. Somente leitura.',
    inputSchema: {
      asin: z.string().min(1).describe('ASIN do produto (ex.: B09V3KXJPB)'),
    },
  },
  async (args: Record<string, unknown>) => {
    const asin = args['asin'] as string
    try {
      return jsonContent(await getCatalogItem(asin))
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ─── Tool: detalhe de listing por SKU ───────────────────────────────────────

server.registerTool(
  'amz_get_listing',
  {
    title: 'Detalhe de listing Amazon por SKU',
    description:
      'Retorna detalhe do listing do vendedor para um SKU: preço, estoque FBA/MFN, ' +
      'status, imagem principal e pendências/erros do listing. Somente leitura.',
    inputSchema: {
      sellerId: z.string().min(1).describe('Seller ID (Merchant Token) do vendedor — ex.: A1XXXXX'),
      sku: z.string().min(1).describe('SKU do produto no cadastro do seller'),
    },
  },
  async (args: Record<string, unknown>) => {
    const sellerId = args['sellerId'] as string
    const sku = args['sku'] as string
    try {
      return jsonContent(await getListingsItem(sellerId, sku))
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ─── Tool: inventário FBA ────────────────────────────────────────────────────

server.registerTool(
  'amz_list_inventory',
  {
    title: 'Inventário FBA do seller Amazon',
    description:
      'Lista TODOS os SKUs com estoque no Amazon FBA (fulfillment pela Amazon). ' +
      'Retorna SKU, ASIN, FnSKU, quantidade disponível/total/reservado. ' +
      'Pode demorar em catálogos grandes. Somente leitura.',
    inputSchema: {},
  },
  async () => {
    try {
      const summaries = await listAllInventorySummaries()
      return jsonContent({ total: summaries.length, items: summaries })
    } catch (err) {
      return errorContent(err)
    }
  },
)

// ─── Inicialização ───────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[dropchina-amazon] MCP server pronto (stdio). READ-ONLY. SP-API Amazon BR.')
}

main().catch((err) => {
  console.error('[dropchina-amazon] falha ao iniciar:', err)
  process.exit(1)
})
