import type { AstBlock, AstRef, Position, Range } from './types.js'

const pos = (line: number, column: number, offset: number): Position => ({ line, column, offset })

export const shiftRange = (r: Range, dLine: number, dOffset: number): Range => ({
  start: pos(r.start.line + dLine, r.start.column, r.start.offset + dOffset),
  end: pos(r.end.line + dLine, r.end.column, r.end.offset + dOffset),
})

const shiftRef = (r: AstRef, dLine: number, dOffset: number): AstRef => ({
  ...r,
  range: shiftRange(r.range, dLine, dOffset),
})

export const shiftBlockLines = (b: AstBlock, dLine: number, dOffset: number): AstBlock => {
  const range = shiftRange(b.range, dLine, dOffset)
  if (b.kind === 'list')
    return {
      ...b,
      range,
      items: b.items.map((it) => ({ ...it, range: shiftRange(it.range, dLine, dOffset) })),
    }
  if (b.kind === 'paragraph')
    return {
      ...b,
      range,
      refs: b.refs.map((r: AstRef) => shiftRef(r, dLine, dOffset)),
    }
  return { ...b, range }
}
