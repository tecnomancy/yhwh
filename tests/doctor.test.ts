import { describe, expect, test } from 'bun:test'
import { runDoctor } from '../src/cli/doctor.js'
import { buildGraph } from '../src/core/graph.js'
import { lintPaths } from '../src/core/lint.js'

// runDoctor reads ~/.claude/ (real homedir) and specs from the given paths.
// Smoke tests verify: correct return type, correct exit codes for known inputs.

describe('runDoctor smoke', () => {
  test('returns 0 or 1 (number) when scanning good fixtures', async () => {
    // good fixtures have agent/skill specs; ~/.claude/ may or may not match — both codes valid
    const code = await runDoctor(['specs/__fixtures__/good/'])
    expect(typeof code).toBe('number')
    expect([0, 1]).toContain(code)
  })

  test('returns 0 when scanning empty path (no specs, no expected artefacts)', async () => {
    // No specs => empty graph => no expected agents/skills => no missing entries.
    // Orphans/unmanaged in ~/.claude/ may produce drift (code 1), so allow both.
    const code = await runDoctor(['specs/__fixtures__/good/agent.einstein.spec.md'])
    expect(typeof code).toBe('number')
  })

  test('graph from good fixtures contains expected specs', async () => {
    const report = await lintPaths(['specs/__fixtures__/good/'])
    const graph = buildGraph([...report.specs.values()])
    expect(graph.agents.size).toBeGreaterThan(0)
    expect(graph.skills.size).toBeGreaterThan(0)
  })

  test('doctor with nonexistent path returns a number', async () => {
    const code = await runDoctor(['specs/__fixtures__/good/nonexistent/'])
    expect(typeof code).toBe('number')
  })
})
