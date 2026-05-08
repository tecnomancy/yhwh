import { describe, expect, test } from 'bun:test'
import { crossValidate, loadProjectSpec } from '../src/core/builder/self-describe.js'

describe('builder cross-validate', () => {
  test('project spec covers every runtime command, generator, validator', async () => {
    const spec = await loadProjectSpec()
    expect(spec).not.toBeNull()
    if (!spec) return
    const ds = crossValidate(spec)
    const errors = ds.filter((d) => d.level === 'error')
    if (errors.length > 0) {
      console.error('builder cross-validate errors:')
      for (const e of errors) console.error(`  ${e.rule_id}: ${e.message}`)
    }
    expect(errors).toEqual([])
  })

  test('returns errors when a runtime command is missing from spec', async () => {
    const spec = await loadProjectSpec()
    if (!spec) return
    const subset = { ...spec, commands: spec.commands.slice(0, 1) }
    const ds = crossValidate(subset)
    expect(ds.some((d) => d.rule_id === 'cross/builder-command-missing')).toBe(true)
  })
})
