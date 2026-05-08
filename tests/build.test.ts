import { describe, expect, test } from 'bun:test'
import { renderAgentMd, renderSkillMd } from '../src/core/emit/codegen.js'
import { buildRegistryJson } from '../src/core/emit/registry.js'
import { buildGraph } from '../src/core/graph.js'
import { lintPaths } from '../src/core/lint.js'

describe('emit registry', () => {
  test('produces registry indexed by id with by_kind groupings', async () => {
    const r = await lintPaths(['specs/__fixtures__/good'])
    const g = buildGraph([...r.specs.values()])
    const json = buildRegistryJson(g)
    expect(Object.keys(json.specs).length).toBe(8)
    expect(json.by_kind.agent?.length).toBe(3)
    expect(json.by_kind.skill?.length).toBe(1)
    expect(json.by_kind.flow?.length).toBe(1)
    expect(json.by_kind.entity?.length).toBe(1)
    expect(json.by_kind.harness?.length).toBe(1)
    expect(json.by_kind.ralph?.length).toBe(1)
  })
})

describe('codegen', () => {
  test('agent .md round-trips frontmatter and body with managed marker', async () => {
    const r = await lintPaths(['specs/__fixtures__/good/agent.einstein.spec.md'])
    const entry = r.specs.get('einstein')
    if (!entry || entry.spec.kind !== 'agent') throw new Error('einstein not parsed')
    const md = renderAgentMd(entry.spec, entry.parsed.body)
    expect(md.startsWith('---\n')).toBe(true)
    expect(md.includes('name: einstein')).toBe(true)
    expect(md.includes('tools: Read, Write, Edit, Bash, Grep, Glob')).toBe(true)
    expect(md.includes('model: opus')).toBe(true)
    expect(md.includes('<!-- hwh:managed:')).toBe(true)
  })

  test('skill .md uses Claude Code argument-hint key', async () => {
    const r = await lintPaths(['specs/__fixtures__/good/skill.hwh-lint.spec.md'])
    const entry = r.specs.get('hwh-lint')
    if (!entry || entry.spec.kind !== 'skill') throw new Error('hwh-lint not parsed')
    const md = renderSkillMd(entry.spec, entry.parsed.body)
    expect(md.includes('argument-hint:')).toBe(true)
    expect(md.includes('user_invocable: true')).toBe(true)
  })
})
