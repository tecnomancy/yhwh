import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'
import { parseMarkdownDocument } from './ast/from-markdown.js'
import type { AstMermaid, DocumentAst } from './ast/types.js'
import type { Diagnostic } from './diagnostics.js'
import { tryAsync } from './safe.js'

export type MermaidBlock = {
  lang: 'mermaid'
  content: string
  line: number
}

export type ParsedSpec = {
  file: string
  raw: string
  frontmatter: Record<string, unknown> | null
  frontmatterStartLine: number
  bodyStartLine: number
  body: string
  mermaidBlocks: MermaidBlock[]
  doc: DocumentAst
}

const projectMermaid = (m: AstMermaid): MermaidBlock => ({
  lang: 'mermaid',
  content: m.content,
  line: m.range.start.line,
})

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export const splitFrontmatter = (
  raw: string,
): { fmText: string | null; body: string; bodyOffset: number } => {
  const m = FRONTMATTER_RE.exec(raw)
  if (!m) return { fmText: null, body: raw, bodyOffset: 0 }
  const fmText = m[1] ?? ''
  const body = raw.slice(m[0].length)
  const bodyOffset = raw.slice(0, m[0].length).split('\n').length
  return { fmText, body, bodyOffset }
}

export const extractMermaidBlocks = (body: string, bodyStartLine: number): MermaidBlock[] => {
  const blocks: MermaidBlock[] = []
  const lines = body.split('\n')
  let i = 0
  while (i < lines.length) {
    // alchemy-exempt: stateful sliding-window over fenced blocks (legacy compat)
    const line = lines[i] ?? ''
    if (/^```mermaid\s*$/.test(line)) {
      const start = i + 1
      let j = start
      while (j < lines.length && !/^```\s*$/.test(lines[j] ?? '')) j++
      blocks.push({
        lang: 'mermaid',
        content: lines.slice(start, j).join('\n'),
        line: bodyStartLine + i,
      })
      i = j + 1
      continue
    }
    i++
  }
  return blocks
}

const projectToParsedSpec = (file: string, raw: string, doc: DocumentAst): ParsedSpec => {
  const { body, bodyOffset } = splitFrontmatter(raw)
  const bodyStartLine = doc.frontmatter ? doc.frontmatter.range.end.line + 1 : 1
  const mermaidBlocks = doc.blocks
    .filter((b): b is AstMermaid => b.kind === 'mermaid')
    .map(projectMermaid)
  void bodyOffset
  return {
    file,
    raw,
    frontmatter: doc.frontmatter ? doc.frontmatter.data : null,
    frontmatterStartLine: 2,
    bodyStartLine,
    body: doc.frontmatter ? body : raw,
    mermaidBlocks:
      mermaidBlocks.length > 0 ? mermaidBlocks : extractMermaidBlocks(body, bodyStartLine),
    doc,
  }
}

export const parseSource = (file: string, raw: string): Result<ParsedSpec, Diagnostic> => {
  const summary = parseMarkdownDocument(file, raw)
  if (!summary.hasDelim)
    return Err({
      spec_id: null,
      file,
      line: 1,
      rule_id: 'parse/no-frontmatter',
      level: 'error',
      message: 'spec is missing YAML frontmatter (must start with `---` on line 1)',
    })
  if (summary.frontmatterError === 'yaml-invalid')
    return Err({
      spec_id: null,
      file,
      line: 1,
      rule_id: 'parse/yaml-invalid',
      level: 'error',
      message: 'frontmatter YAML invalid',
    })
  if (summary.frontmatterError === 'not-mapping' || !summary.ast.frontmatter)
    return Err({
      spec_id: null,
      file,
      line: 1,
      rule_id: 'parse/frontmatter-shape',
      level: 'error',
      message: 'frontmatter must be a YAML mapping (key: value)',
    })
  return Ok(projectToParsedSpec(file, raw, summary.ast))
}

export const parseFile = async (file: string): Promise<Result<ParsedSpec, Diagnostic>> => {
  const r = await tryAsync(() => Bun.file(file).text())
  if (!r.ok)
    return Err({
      spec_id: null,
      file,
      line: 1,
      rule_id: 'parse/io',
      level: 'error',
      message: `cannot read file: ${r.error.message}`,
    })
  return parseSource(file, r.value)
}
