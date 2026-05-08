import { describe, expect, test } from 'bun:test'
import { lintPaths } from '../src/core/lint.js'

describe('lint good fixtures', () => {
  test('zero diagnostics across full feature set', async () => {
    const report = await lintPaths(['specs/__fixtures__/good'])
    expect(report.files).toBe(8)
    expect(report.specs.size).toBe(8)
    expect(report.diagnostics).toEqual([])
  })

  test('captures all spec ids', async () => {
    const report = await lintPaths(['specs/__fixtures__/good'])
    expect([...report.specs.keys()].sort()).toEqual([
      'coordinator',
      'director',
      'einstein',
      'grant-privilege',
      'hwh-ci',
      'hwh-lint',
      'hwh-watch',
      'privilege',
    ])
  })

  test('all 6 spec kinds represented', async () => {
    const report = await lintPaths(['specs/__fixtures__/good'])
    const kinds = [...report.specs.values()].map((e) => e.spec.kind).sort()
    expect(kinds).toEqual([
      'agent',
      'agent',
      'agent',
      'entity',
      'flow',
      'harness',
      'ralph',
      'skill',
    ])
  })
})
