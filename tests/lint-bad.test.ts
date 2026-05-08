import { describe, expect, test } from 'bun:test'
import { lintPaths } from '../src/core/lint.js'

describe('lint bad fixtures', () => {
  test('agent-missing-tools triggers schema/agent', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad/agent-missing-tools.spec.md'])
    expect(
      r.diagnostics.some(
        (d) => d.rule_id.startsWith('schema/agent') && d.rule_id.includes('tools'),
      ),
    ).toBe(true)
  })

  test('skill-bad-id triggers envelope id regex', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad/skill-bad-id.spec.md'])
    expect(
      r.diagnostics.some((d) => d.rule_id.includes('envelope') && d.rule_id.includes('id')),
    ).toBe(true)
  })

  test('no-frontmatter triggers parse/no-frontmatter', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad/no-frontmatter.spec.md'])
    expect(r.diagnostics[0]?.rule_id).toBe('parse/no-frontmatter')
  })

  test('duplicate-id detected when both good einstein and bad duplicate are linted', async () => {
    const r = await lintPaths([
      'specs/__fixtures__/good/agent.einstein.spec.md',
      'specs/__fixtures__/bad/duplicate-id.spec.md',
    ])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/duplicate-id')).toBe(true)
  })
})
