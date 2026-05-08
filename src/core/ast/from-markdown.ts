import type {
  Code,
  Heading,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Table,
  ThematicBreak,
} from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type { Position as MdastPosition } from 'unist'
import { detectMermaidKind } from '../mermaid.js'
import { shiftBlockLines } from './normalize.js'
import type { AstBlock, AstFrontmatter, AstRef, DocumentAst, Position, Range } from './types.js'
import { isReserved } from './types.js'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const REF_RE = /\[ref:([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)\]/g

const pos = (line: number, column: number, offset: number): Position => ({ line, column, offset })

const fallbackRange = (line: number): Range => ({
  start: pos(line, 1, 0),
  end: pos(line, 1, 0),
})

type WithPosition = { position?: MdastPosition | undefined }

const liftPosition = (node: WithPosition, fallbackLine = 1): Range => {
  const p = node.position
  if (!p) return fallbackRange(fallbackLine)
  return {
    start: pos(p.start.line, p.start.column, p.start.offset ?? 0),
    end: pos(p.end.line, p.end.column, p.end.offset ?? 0),
  }
}

const flattenInline = (children: PhrasingContent[]): string =>
  children
    .map((c) => {
      if (c.type === 'text') return c.value
      if (c.type === 'inlineCode') return `\`${c.value}\``
      if (c.type === 'html') return c.value
      if (c.type === 'break') return '\n'
      if (c.type === 'emphasis') return `*${flattenInline(c.children as PhrasingContent[])}*`
      if (c.type === 'strong') return `**${flattenInline(c.children as PhrasingContent[])}**`
      if (c.type === 'delete') return `~~${flattenInline(c.children as PhrasingContent[])}~~`
      if (c.type === 'link') return `[${flattenInline(c.children as PhrasingContent[])}](${c.url})`
      if (c.type === 'image') return `![${c.alt ?? ''}](${c.url})`
      return ''
    })
    .join('')

const extractRefs = (text: string, baseLine: number, baseOffset: number): AstRef[] => {
  const refs: AstRef[] = []
  const matches = [...text.matchAll(REF_RE)]
  for (const m of matches) {
    const offset = m.index ?? 0
    refs.push({
      kind: 'ref',
      targetKind: m[1] ?? '',
      targetId: m[2] ?? '',
      range: {
        start: pos(baseLine, offset + 1, baseOffset + offset),
        end: pos(
          baseLine,
          offset + (m[0]?.length ?? 0) + 1,
          baseOffset + offset + (m[0]?.length ?? 0),
        ),
      },
    })
  }
  return refs
}

const projectHeading = (h: Heading): AstBlock => {
  const text = flattenInline(h.children)
  const range = liftPosition(h)
  const reserved = isReserved(text) ? text.trim().toLowerCase() : null
  return reserved
    ? { kind: 'heading', level: h.depth, text, range, reservedName: reserved }
    : { kind: 'heading', level: h.depth, text, range }
}

const projectParagraph = (p: Paragraph): AstBlock => {
  const text = flattenInline(p.children)
  const range = liftPosition(p)
  return {
    kind: 'paragraph',
    text,
    range,
    refs: extractRefs(text, range.start.line, range.start.offset),
  }
}

const projectCode = (c: Code): AstBlock => {
  const range = liftPosition(c)
  if (c.lang === 'mermaid')
    return {
      kind: 'mermaid',
      content: c.value,
      range,
      mermaidKind: detectMermaidKind(c.value),
    }
  return {
    kind: 'code',
    lang: c.lang ?? null,
    meta: c.meta ?? null,
    content: c.value,
    range,
  }
}

const projectList = (l: List): AstBlock => {
  const items = (l.children as ListItem[]).map((li) => {
    const text = li.children
      .filter((c): c is Paragraph => c.type === 'paragraph')
      .map((p) => flattenInline(p.children))
      .join('\n')
    return { text, range: liftPosition(li) }
  })
  return { kind: 'list', ordered: Boolean(l.ordered), items, range: liftPosition(l) }
}

const projectTable = (t: Table): AstBlock => {
  const rows = t.children.map((row) =>
    row.children.map((cell) => flattenInline(cell.children as PhrasingContent[])),
  )
  const [headerRow, ...rest] = rows
  return { kind: 'table', header: headerRow ?? [], rows: rest, range: liftPosition(t) }
}

const projectThematic = (b: ThematicBreak): AstBlock => ({
  kind: 'thematicBreak',
  range: liftPosition(b),
})

const projectBlock = (n: RootContent): AstBlock | null => {
  switch (n.type) {
    case 'heading':
      return projectHeading(n)
    case 'paragraph':
      return projectParagraph(n)
    case 'code':
      return projectCode(n)
    case 'list':
      return projectList(n)
    case 'table':
      return projectTable(n)
    case 'thematicBreak':
      return projectThematic(n)
    default:
      return null
  }
}

export type FrontmatterParseError = 'yaml-invalid' | 'not-mapping'

const parseFrontmatter = (
  raw: string,
): {
  fm: AstFrontmatter | null
  bodyOffset: number
  bodyLine: number
  error: FrontmatterParseError | null
  hasDelim: boolean
} => {
  const m = FRONTMATTER_RE.exec(raw)
  if (!m) return { fm: null, bodyOffset: 0, bodyLine: 1, error: null, hasDelim: false }
  const fmText = m[1] ?? ''
  const consumed = m[0].length
  const linesBefore = raw.slice(0, consumed).split('\n').length
  const bodyLine = linesBefore
  const range: Range = {
    start: pos(1, 1, 0),
    end: pos(linesBefore, 1, consumed),
  }
  let parsed: unknown
  try {
    // alchemy-exempt: YAML parse is the boundary; structured failure surfaced via error field
    parsed = require('yaml').parse(fmText) as unknown
  } catch {
    return { fm: null, bodyOffset: consumed, bodyLine, error: 'yaml-invalid', hasDelim: true }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    return { fm: null, bodyOffset: consumed, bodyLine, error: 'not-mapping', hasDelim: true }
  const data = parsed as Record<string, unknown>
  return {
    fm: { kind: 'frontmatter', range, raw: fmText, data, rawKeyOrder: Object.keys(data) },
    bodyOffset: consumed,
    bodyLine,
    error: null,
    hasDelim: true,
  }
}

export type ParseSummary = {
  ast: DocumentAst
  frontmatterError: FrontmatterParseError | null
  hasDelim: boolean
}

export const fromMarkdownBytes = (file: string, raw: string): DocumentAst => {
  const summary = parseMarkdownDocument(file, raw)
  return summary.ast
}

export const parseMarkdownDocument = (file: string, raw: string): ParseSummary => {
  const { fm, bodyOffset, bodyLine, error, hasDelim } = parseFrontmatter(raw)
  const body = raw.slice(bodyOffset)
  const tree = fromMarkdown(body) as Root
  const blocks: AstBlock[] = []
  for (const child of tree.children) {
    // alchemy-exempt: AST walk is iterative by nature; map+filter would obscure the projection
    const block = projectBlock(child)
    if (!block) continue
    const shifted: AstBlock = shiftBlockLines(block, bodyLine - 1, bodyOffset)
    blocks.push(shifted)
  }
  return {
    ast: { file, raw, frontmatter: fm, blocks },
    frontmatterError: error,
    hasDelim,
  }
}
