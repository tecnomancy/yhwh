import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { generateAllModules } from '../src/core/meta/codegen-ts.js'
import { loadAllMetaSpecs } from '../src/core/meta/load-meta.js'

const SNAP_DIR = resolve('tests/snapshots/generated-zod')

describe('codegen-ts golden snapshots', () => {
  test('every kind matches the snapshotted source byte-for-byte', async () => {
    const metas = await loadAllMetaSpecs()
    const envelope = metas.find((m) => m.target_kind === 'envelope')
    expect(envelope).toBeDefined()
    if (!envelope) return
    const kindMetas = metas.filter((m) => m.target_kind !== 'envelope')
    const modules = generateAllModules(envelope, kindMetas)
    expect(modules.length).toBeGreaterThan(0)
    for (const m of modules) {
      const snapshot = await readFile(join(SNAP_DIR, `${m.kind}.ts`), 'utf8')
      expect(m.source).toBe(snapshot)
    }
  })
})
