import { describe, expect, test } from 'bun:test'
import { classify } from '../src/core/ast/classify.js'
import { fromMarkdownBytes } from '../src/core/ast/from-markdown.js'
import { loadSpec } from '../src/core/semantic/load.js'

const FIXTURE = `---
kind: agent
id: ranger
version: 0.1.0
status: active
owner: example
description: Tracks down rogue refs across the spec graph and reports drift in real time.
tools: [Read, Grep]
model: haiku
---

# Ranger

The ranger walks the graph.

## Steps

- scan
- diff

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`
`

describe('Document AST ranges', () => {
  test('frontmatter range covers the YAML block', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    expect(doc.frontmatter).not.toBeNull()
    if (!doc.frontmatter) return
    expect(doc.frontmatter.range.start.line).toBe(1)
    expect(doc.frontmatter.range.end.line).toBeGreaterThanOrEqual(9)
  })

  test('h1 heading range starts after frontmatter', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    const h1 = doc.blocks.find((b) => b.kind === 'heading' && b.level === 1)
    expect(h1).toBeDefined()
    if (!h1 || h1.kind !== 'heading') return
    expect(h1.text).toBe('Ranger')
    expect(h1.range.start.line).toBeGreaterThan(9)
    expect(h1.range.start.column).toBe(1)
  })

  test('mermaid block range and content recovered correctly', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    const m = doc.blocks.find((b) => b.kind === 'mermaid')
    expect(m).toBeDefined()
    if (!m || m.kind !== 'mermaid') return
    expect(m.content.trim()).toBe('flowchart LR\n  A --> B')
    expect(m.mermaidKind).toBe('flowchart')
    expect(m.range.start.line).toBeGreaterThan(13)
  })

  test('list items keep ranges', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    const list = doc.blocks.find((b) => b.kind === 'list')
    expect(list).toBeDefined()
    if (!list || list.kind !== 'list') return
    expect(list.items.length).toBe(2)
    expect(list.items[0]?.range.start.line).toBeGreaterThan(13)
    expect(list.items[0]?.text).toBe('scan')
    expect(list.items[1]?.text).toBe('diff')
  })
})

describe('classify', () => {
  test('reports title, sections, mermaids, totals', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    const c = classify(doc.blocks)
    expect(c.title?.text).toBe('Ranger')
    expect(c.sections.length).toBe(1)
    expect(c.sections[0]?.heading.text).toBe('Steps')
    expect(c.mermaids.length).toBe(1)
    expect(c.totals.heading).toBeGreaterThan(0)
    expect(c.totals.list).toBe(1)
    expect(c.totals.mermaid).toBe(1)
  })
})

describe('semantic load', () => {
  test('lifts a valid agent doc to AgentSpec via existing zod', () => {
    const doc = fromMarkdownBytes('x.spec.md', FIXTURE)
    const r = loadSpec(doc)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.spec.kind).toBe('agent')
    if (r.value.spec.kind === 'agent') {
      expect(r.value.spec.id).toBe('ranger')
      expect(r.value.spec.tools).toEqual(['Read', 'Grep'])
    }
  })

  test('returns Err with diagnostics when frontmatter invalid', () => {
    const doc = fromMarkdownBytes('y.spec.md', '---\nkind: agent\nid: BAD-CAPS\n---\n# x\n')
    const r = loadSpec(doc)
    expect(r.ok).toBe(false)
  })
})
