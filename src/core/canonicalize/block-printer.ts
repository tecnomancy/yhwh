import type { AstBlock } from '../ast/types.js'
import { printMermaidContent } from './mermaid-printer.js'

const printList = (b: Extract<AstBlock, { kind: 'list' }>): string => {
  const marker = b.ordered ? (i: number) => `${i + 1}.` : (_: number) => '-'
  return b.items.map((it, i) => `${marker(i)} ${it.text}`).join('\n')
}

const printTable = (b: Extract<AstBlock, { kind: 'table' }>): string => {
  const cols = Math.max(b.header.length, ...b.rows.map((r) => r.length))
  const widths: number[] = []
  for (let c = 0; c < cols; c++) {
    const cells = [b.header[c] ?? '', ...b.rows.map((r) => r[c] ?? '')]
    widths[c] = Math.max(3, ...cells.map((s) => s.length))
  }
  const fmtRow = (row: string[]) =>
    `| ${Array.from({ length: cols }, (_, c) => (row[c] ?? '').padEnd(widths[c] ?? 0)).join(' | ')} |`
  const sep = `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`
  return [fmtRow(b.header), sep, ...b.rows.map(fmtRow)].join('\n')
}

export const printBlock = (b: AstBlock): string => {
  switch (b.kind) {
    case 'heading':
      return `${'#'.repeat(b.level)} ${b.text}`
    case 'paragraph':
      return b.text
    case 'list':
      return printList(b)
    case 'code':
      return `\`\`\`${b.lang ?? ''}${b.meta ? ` ${b.meta}` : ''}\n${b.content}\n\`\`\``
    case 'mermaid':
      return `\`\`\`mermaid\n${printMermaidContent(b.content)}\n\`\`\``
    case 'table':
      return printTable(b)
    case 'thematicBreak':
      return '---'
  }
}
