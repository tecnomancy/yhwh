import { describe, expect, test } from 'bun:test'
import { parseInvariant } from '../src/core/invariants.js'
import { lintPaths } from '../src/core/lint.js'

describe('parseInvariant', () => {
  test('parses transition with via skill', () => {
    const r = parseInvariant('status:approved → status:active via skill.hwh-lint')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.field).toBe('status')
      expect(r.value.from).toBe('approved')
      expect(r.value.to).toBe('active')
      expect(r.value.via).toEqual({ kind: 'skill', id: 'hwh-lint' })
    }
  })

  test('parses transition with via flow', () => {
    const r = parseInvariant('phase:open -> phase:closed via flow.grant-privilege')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.via?.kind).toBe('flow')
  })

  test('parses transition without via', () => {
    const r = parseInvariant('state:a → state:b')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.via).toBeNull()
  })

  test('rejects malformed input', () => {
    const r = parseInvariant('garbage with no arrow')
    expect(r.ok).toBe(false)
  })

  test('rejects mismatched field on left/right', () => {
    const r = parseInvariant('a:1 → b:2')
    expect(r.ok).toBe(false)
  })
})

describe('cross-rule entity invariants', () => {
  test('bad-invariant fixture triggers skill-not-found and syntax errors', async () => {
    const r = await lintPaths(['specs/__fixtures__/bad-cross'])
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/entity-invariant-skill-not-found')).toBe(
      true,
    )
    expect(r.diagnostics.some((d) => d.rule_id === 'cross/entity-invariant-syntax')).toBe(true)
  })

  test('good fixtures pass invariant check (privilege has via skill.hwh-lint)', async () => {
    const r = await lintPaths(['specs/__fixtures__/good'])
    const inv = r.diagnostics.filter((d) => d.rule_id.includes('entity-invariant'))
    expect(inv).toEqual([])
  })
})
