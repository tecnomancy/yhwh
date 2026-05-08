import { describe, expect, test } from 'bun:test'
import { lintPaths } from '../src/core/lint.js'

describe('cross-ref rules', () => {
  test('flow with unknown actor triggers cross/flow-actor-not-found', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad-cross'])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/flow-actor-not-found')).toBe(true)
  })

  test('skill requiring tool not on agent triggers cross/skill-tool-not-on-agent', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad-cross'])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/skill-tool-not-on-agent')).toBe(true)
  })

  test('harness with unknown dispatch triggers cross/harness-skill-not-found', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad-cross'])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/harness-skill-not-found')).toBe(true)
  })

  test('ralph with unknown tick_skill triggers cross/ralph-tick-not-found', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad-cross'])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/ralph-tick-not-found')).toBe(true)
  })

  test('good fixtures have zero cross diagnostics', async () => {
    const r = await lintPaths(['specs/__fixtures__/good'])
    const cross = r.diagnostics.filter((d) => d.rule_id.startsWith('cross/'))
    expect(cross).toEqual([])
  })
})
