/**
 * Dados e descrições dos filamentos Bambu (compartilhado entre os scripts de Bling e Shopify).
 * Fonte: catalogo/filamentos-bambu-2026-09.json + catalogo/filamentos-bambu/descricoes.md
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CAT_DIR = join(__dirname, '..', '..', '..', 'catalogo')
// --dados <arquivo.json> troca o lote (ex.: PETG); padrão = PLA de 29/09.
const iDados = process.argv.indexOf('--dados')
export const JSON_IN = iDados >= 0 ? resolve(process.argv[iDados + 1]) : join(CAT_DIR, 'filamentos-bambu-2026-09.json')
const MD_IN = join(CAT_DIR, 'filamentos-bambu', 'descricoes.md')
/** SKU → URLs da galeria na CDN da Shopify (gerado pelos scripts de Shopify). */
export const IMAGENS_MAP = join(CAT_DIR, 'filamentos-bambu', 'shopify-imagens.json')

const slugCor = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-')

/** Imagens oficiais Bambu por linha (PLA Lite: render Bambu da cor; sem foto oficial acessível). */
export function imagensDe(it: Item): { galeria: string[]; cor: string; rfid: string; extra: string } {
  const pasta = `${slugCor(it.linha)}-${slugCor(it.cor)}`
  if (it.linha === 'PLA Lite') {
    const temVaso = !['Preto', 'Azul'].includes(it.cor)
    return {
      galeria: temVaso ? [`${pasta}/01.webp`, `${pasta}/02.webp`] : [`${pasta}/01.webp`],
      cor: temVaso ? `${pasta}/02.webp` : `${pasta}/01.webp`,
      rfid: '_shared-pla-basic/oficial-shared-03.jpg',
      extra: '_shared-pla-basic/oficial-shared-04.jpg', // não usado: template do Lite não tem {IMG_EXTRA}
    }
  }
  if (it.linha === 'PLA Basic') {
    return {
      galeria: [`${pasta}/oficial-01.jpg`, `${pasta}/02.webp`, '_shared-pla-basic/oficial-shared-04.jpg'],
      cor: `${pasta}/oficial-01.jpg`,
      rfid: '_shared-pla-basic/oficial-shared-03.jpg',
      extra: '_shared-pla-basic/oficial-shared-04.jpg',
    }
  }
  if (it.linha === 'PETG Basic') {
    return {
      galeria: [`${pasta}/oficial-01.jpg`, '_shared-petg-basic/oficial-shared-02.jpg', '_shared-petg-basic/oficial-shared-01.jpg'],
      cor: `${pasta}/oficial-01.jpg`,
      rfid: '_shared-petg-basic/oficial-shared-03.jpg',
      extra: '_shared-petg-basic/oficial-shared-02.jpg',
    }
  }
  throw new Error(`${it.sku}: sem mapa de imagens para a linha "${it.linha}"`)
}

export interface Item { nome: string; linha: string; cor: string; preco: number; custo: number | null; sku: string; gtin: string; imagens?: string[] }
export interface Desc { curta: string; html: string }

/** Extrai o 1º bloco ```html e o texto entre a marca "curta" e "completa" de uma seção do md. */
function parseSecao(secao: string): Desc {
  const curta = secao.match(/\*\*Descri[çc][ãa]o curta[^*]*\*\*\s*\n([\s\S]*?)\n\s*\n\*\*Descri/)?.[1]?.replace(/\s*\n\s*/g, ' ').trim()
  const html = secao.match(/```html\n([\s\S]*?)```/)?.[1]?.trim()
  if (!curta || !html) throw new Error('Não consegui parsear descrição curta/HTML no descricoes.md')
  return { curta, html }
}

/**
 * Seções do md: "## <Linha> — template" (texto com {COR}/{FRASE_COR} + tabela SKU|frase)
 * e seções de produto único "## <Nome> — <SKU>" (texto fixo).
 */
export function lerDescricoes(): { templates: Map<string, Desc>; frases: Map<string, string>; unicos: Map<string, Desc> } {
  const md = readFileSync(MD_IN, 'utf8')
  const templates = new Map<string, Desc>(), frases = new Map<string, string>(), unicos = new Map<string, Desc>()
  for (const sec of md.split(/\n(?=## )/).filter((s) => s.startsWith('## '))) {
    const titulo = sec.split('\n')[0].slice(3).trim()
    const tpl = titulo.match(/^(.+?) — template$/)
    const unico = titulo.match(/— ([A-Z0-9-]+-BAMBU)$/)
    if (tpl) {
      templates.set(tpl[1], parseSecao(sec))
      for (const l of sec.split('\n')) {
        const m = l.match(/^\|\s*([A-Z0-9-]+-BAMBU)\s*\|\s*(.+?)\s*\|\s*$/)
        if (m) frases.set(m[1], m[2])
      }
    } else if (unico) unicos.set(unico[1], parseSecao(sec))
  }
  return { templates, frases, unicos }
}

export function descricaoDe(it: Item, d: ReturnType<typeof lerDescricoes>): Desc {
  const unico = d.unicos.get(it.sku)
  if (unico) return comImagens(it, unico)
  const tpl = d.templates.get(it.linha)
  if (!tpl) throw new Error(`${it.sku}: sem template de descrição para linha "${it.linha}"`)
  const frase = d.frases.get(it.sku)
  if (!frase) throw new Error(`${it.sku}: sem FRASE_COR no descricoes.md`)
  const sub = (s: string) => s.replaceAll('{COR}', it.cor.toLowerCase()).replaceAll('{FRASE_COR}', frase)
  return comImagens(it, { curta: sub(tpl.curta), html: sub(tpl.html) })
}

/**
 * Troca {IMG_*}: foto da cor = imagem da galeria do produto na CDN (shopify-imagens.json);
 * banners compartilhados = assets do tema (src="dc-asset:..." resolvido em dc-pdp-story.liquid).
 * Sem a galeria no mapa, deixa os marcadores (modo offline / antes do upload).
 */
const ASSETS: Record<string, { rfid: string; extra: string }> = {
  'PLA Lite': { rfid: 'dc-fil-rfid-pla.webp', extra: '' },
  'PLA Basic': { rfid: 'dc-fil-rfid-pla.webp', extra: 'dc-fil-pla-casa.webp' },
  'PETG Basic': { rfid: 'dc-fil-rfid-petg.webp', extra: 'dc-fil-petg-pecas.webp' },
}
function comImagens(it: Item, d: Desc): Desc {
  if (!d.html.includes('{IMG_')) return d
  let gal: Record<string, string[]> = {}
  try { gal = JSON.parse(readFileSync(IMAGENS_MAP, 'utf8')) } catch { return d }
  const urls = gal[it.sku]
  if (!urls?.length) return d
  const im = imagensDe(it)
  const cor = urls[Math.max(0, im.galeria.indexOf(im.cor))] ?? urls[0]
  const a = ASSETS[it.linha]
  const html = d.html.replaceAll('{IMG_COR}', cor).replaceAll('{IMG_RFID}', `dc-asset:${a.rfid}`).replaceAll('{IMG_EXTRA}', `dc-asset:${a.extra}`)
  return { ...d, html }
}
