import { describe, expect, test } from 'bun:test'
import { parseMermaid } from '../src/core/mermaid.js'

describe('parseMermaid', () => {
  test('parses sequenceDiagram and extracts actors + edges', () => {
    const raw = 'sequenceDiagram\n  participant A\n  participant B\n  A->>B: hi\n  B-->>A: ack\n'
    const r = parseMermaid(raw)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.kind).toBe('sequenceDiagram')
      expect(r.value.actors.sort()).toEqual(['A', 'B'])
      expect(r.value.edges.length).toBe(2)
    }
  })

  test('parses flowchart and lists nodes', () => {
    const r = parseMermaid('flowchart LR\n  A[start] --> B[end]\n')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.kind).toBe('flowchart')
      expect(r.value.nodes.includes('A')).toBe(true)
      expect(r.value.nodes.includes('B')).toBe(true)
    }
  })

  test('parses stateDiagram-v2 transitions', () => {
    const r = parseMermaid('stateDiagram-v2\n  [*] --> requested\n  requested --> approved\n')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.kind).toBe('stateDiagram-v2')
      expect(r.value.edges.length).toBeGreaterThan(0)
    }
  })

  test('rejects content without recognizable header', () => {
    const r = parseMermaid('this is not mermaid')
    expect(r.ok).toBe(false)
  })
})
