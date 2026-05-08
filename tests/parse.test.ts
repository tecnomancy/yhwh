import { describe, expect, test } from 'bun:test'
import { extractMermaidBlocks, parseSource, splitFrontmatter } from '../src/core/parse.js'

describe('splitFrontmatter', () => {
  test('extracts frontmatter and body', () => {
    const r = splitFrontmatter('---\nkind: agent\n---\n# body\ntext\n')
    expect(r.fmText).toBe('kind: agent')
    expect(r.body).toBe('# body\ntext\n')
  })

  test('returns null fmText when no frontmatter', () => {
    const r = splitFrontmatter('# just body\n')
    expect(r.fmText).toBeNull()
  })
})

describe('extractMermaidBlocks', () => {
  test('captures fenced mermaid blocks with line numbers', () => {
    const body = '# x\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\nafter\n'
    const blocks = extractMermaidBlocks(body, 5)
    expect(blocks.length).toBe(1)
    expect(blocks[0]?.content).toBe('flowchart LR\n  A --> B')
    expect(blocks[0]?.line).toBeGreaterThan(5)
  })
})

describe('parseSource', () => {
  test('returns Ok for valid frontmatter', () => {
    const r = parseSource('x.spec.md', '---\nkind: agent\nid: x\n---\n# x\n')
    expect(r.ok).toBe(true)
    if (r.ok) expect((r.value.frontmatter as { kind: string }).kind).toBe('agent')
  })

  test('returns Err for missing frontmatter', () => {
    const r = parseSource('x.spec.md', '# only body\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.rule_id).toBe('parse/no-frontmatter')
  })

  test('returns Err for malformed YAML', () => {
    const r = parseSource('x.spec.md', '---\nkind: [unclosed\n---\n# body\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.rule_id).toBe('parse/yaml-invalid')
  })
})
