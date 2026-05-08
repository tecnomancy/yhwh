import type { MermaidKind } from '../mermaid.js'

export type Position = { line: number; column: number; offset: number }
export type Range = { start: Position; end: Position }

export type AstHeading = {
  kind: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  range: Range
  reservedName?: string
}

export type AstParagraph = {
  kind: 'paragraph'
  text: string
  range: Range
  refs: AstRef[]
}

export type AstListItem = { text: string; range: Range }

export type AstList = {
  kind: 'list'
  ordered: boolean
  items: AstListItem[]
  range: Range
}

export type AstCode = {
  kind: 'code'
  lang: string | null
  meta: string | null
  content: string
  range: Range
}

export type AstMermaid = {
  kind: 'mermaid'
  content: string
  range: Range
  mermaidKind: MermaidKind | null
}

export type AstTable = {
  kind: 'table'
  header: string[]
  rows: string[][]
  range: Range
}

export type AstThematicBreak = { kind: 'thematicBreak'; range: Range }

export type AstBlock =
  | AstHeading
  | AstParagraph
  | AstList
  | AstCode
  | AstMermaid
  | AstTable
  | AstThematicBreak

export type AstRef = {
  kind: 'ref'
  targetKind: string
  targetId: string
  range: Range
}

export type AstFrontmatter = {
  kind: 'frontmatter'
  range: Range
  raw: string
  data: Record<string, unknown>
  rawKeyOrder: string[]
}

export type DocumentAst = {
  file: string
  raw: string
  frontmatter: AstFrontmatter | null
  blocks: AstBlock[]
}

export const RESERVED_HEADINGS = new Set([
  'fields',
  'steps',
  'invariants',
  'actors',
  'tools',
  'examples',
])

export const isReserved = (text: string): boolean =>
  RESERVED_HEADINGS.has(text.trim().toLowerCase())
