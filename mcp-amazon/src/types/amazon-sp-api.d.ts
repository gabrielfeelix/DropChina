/**
 * Declaracoes de modulo ambiente para dependencias nao instaladas no scaffold.
 *
 * Estas declaracoes permitem que o TypeScript compile sem erros quando os pacotes
 * npm ainda nao foram instalados (npm install nao foi rodado). Quando instalados,
 * os tipos reais dos pacotes prevalecerão sobre estas declaracoes (skipLibCheck: true).
 *
 * Remova/atualize conforme os pacotes forem instalados e os tipos reais estiverem
 * disponiveis.
 */

// ─── amazon-sp-api ───────────────────────────────────────────────────────────
// Ref: https://github.com/amz-tools/amazon-sp-api

declare module 'amazon-sp-api' {
  export interface SellingPartnerOptions {
    region: 'na' | 'eu' | 'fe'
    refresh_token: string
    credentials?: {
      SELLING_PARTNER_APP_CLIENT_ID: string
      SELLING_PARTNER_APP_CLIENT_SECRET: string
      AWS_ACCESS_KEY_ID?: string
      AWS_SECRET_ACCESS_KEY?: string
      AWS_SELLING_PARTNER_ROLE?: string
    }
    options?: {
      auto_request_tokens?: boolean
      auto_request_throttled?: boolean
      version_fallback?: boolean
      use_sandbox?: boolean
    }
  }

  export interface CallOptions {
    operation: string
    endpoint?: string
    path?: Record<string, string>
    query?: Record<string, string | string[] | number | boolean | undefined>
    body?: unknown
  }

  export class SellingPartner {
    constructor(options: SellingPartnerOptions)
    callAPI(options: CallOptions): Promise<unknown>
    refreshAccessToken(): Promise<void>
  }

  export default SellingPartner
}

// ─── @modelcontextprotocol/sdk ───────────────────────────────────────────────
// Declaracoes minimas para McpServer e StdioServerTransport

declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  import type { ZodTypeAny, ZodObject, ZodRawShape } from 'zod'

  export interface ToolRegistration {
    title?: string
    description?: string
    inputSchema?: ZodTypeAny | ZodObject<ZodRawShape> | Record<string, ZodTypeAny>
  }

  export type ToolResult = {
    content: { type: 'text'; text: string }[]
    isError?: boolean
  }

  export class McpServer {
    constructor(info: { name: string; version: string })
    registerTool(
      name: string,
      registration: ToolRegistration,
      handler: (args: Record<string, unknown>) => Promise<ToolResult>,
    ): void
    connect(transport: unknown): Promise<void>
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor()
  }
}

// ─── zod ─────────────────────────────────────────────────────────────────────
// Declaracao minima — apenas o que o server.ts usa diretamente

declare module 'zod' {
  export type ZodTypeAny = ZodType<unknown>
  export type ZodRawShape = Record<string, ZodTypeAny>

  export class ZodType<T> {
    optional(): ZodOptional<ZodType<T>>
    min(n: number): this
    max(n: number): this
    describe(desc: string): this
  }

  export class ZodString extends ZodType<string> {}
  export class ZodNumber extends ZodType<number> {}
  export class ZodArray<T extends ZodTypeAny> extends ZodType<unknown[]> {
    min(n: number): this
    max(n: number): this
  }
  export class ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number]> {}
  export class ZodOptional<T extends ZodTypeAny> extends ZodType<unknown> {}
  export class ZodObject<T extends ZodRawShape> extends ZodType<unknown> {}

  const z: {
    string(): ZodString
    number(): ZodNumber
    array<T extends ZodTypeAny>(schema: T): ZodArray<T>
    enum<T extends [string, ...string[]]>(values: T): ZodEnum<T>
    object<T extends ZodRawShape>(shape: T): ZodObject<T>
  }

  export { z }
  export default z

  // Aliases diretos que o server.ts usa via named import { z }
  export function string(): ZodString
  export function number(): ZodNumber
  export function array<T extends ZodTypeAny>(schema: T): ZodArray<T>
  export function enum_<T extends [string, ...string[]]>(values: T): ZodEnum<T>
}

// ─── dotenv ──────────────────────────────────────────────────────────────────

declare module 'dotenv' {
  const dotenv: {
    config(options?: { path?: string }): { parsed?: Record<string, string> }
  }
  export default dotenv
  export function config(options?: { path?: string }): { parsed?: Record<string, string> }
}

declare module 'dotenv/config' {
  // side-effect import — carrega .env automaticamente
}
