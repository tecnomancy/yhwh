import type { AstBlock, AstHeading, AstMermaid } from './types.js'

export type Classification = {
  title: AstHeading | null
  sections: { heading: AstHeading; blocks: AstBlock[] }[]
  mermaids: AstMermaid[]
  totals: Record<AstBlock['kind'], number>
}

export const classify = (blocks: AstBlock[]): Classification => {
  const totals: Record<AstBlock['kind'], number> = {
    heading: 0,
    paragraph: 0,
    code: 0,
    mermaid: 0,
    list: 0,
    table: 0,
    thematicBreak: 0,
  }
  for (const b of blocks) {
    totals[b.kind] = (totals[b.kind] ?? 0) + 1
  }

  const title =
    (blocks.find((b): b is AstHeading => b.kind === 'heading' && b.level === 1) as AstHeading) ??
    null

  const sections: { heading: AstHeading; blocks: AstBlock[] }[] = []
  let current: { heading: AstHeading; blocks: AstBlock[] } | null = null
  for (const b of blocks) {
    if (b.kind === 'heading' && b.level === 2) {
      current = { heading: b, blocks: [] }
      sections.push(current)
      continue
    }
    if (current) current.blocks.push(b)
  }

  const mermaids = blocks.filter((b): b is AstMermaid => b.kind === 'mermaid')

  return { title, sections, mermaids, totals }
}
