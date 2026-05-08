import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Glob } from 'bun'
import { compileMetaSpecs } from '../src/core/meta/compile.js'
import { loadAllMetaSpecs } from '../src/core/meta/load-meta.js'
import { parseFile } from '../src/core/parse.js'
import { SpecSchema } from '../src/core/schema/_bootstrap/index.js'

const collect = async (dir: string): Promise<string[]> => {
  if (!existsSync(resolve(dir))) return []
  const out: string[] = []
  const glob = new Glob('**/*.spec.md')
  for await (const rel of glob.scan({ cwd: resolve(dir) })) out.push(join(resolve(dir), rel))
  return out.sort()
}

describe('parity handwritten vs meta-derived', () => {
  test('every spec across good/bad-cross/lib/meta-specs decides identically', async () => {
    const metas = await loadAllMetaSpecs()
    const envelope = metas.find((m) => m.target_kind === 'envelope')
    expect(envelope).toBeDefined()
    if (!envelope) return
    const kindMetas = metas.filter((m) => m.target_kind !== 'envelope')
    const { union } = compileMetaSpecs(envelope, kindMetas)

    const dirs = [
      'specs/__fixtures__/good',
      'specs/__fixtures__/bad-cross',
      'specs/lib',
      'meta-specs',
    ]
    const files = (await Promise.all(dirs.map(collect))).flat()
    expect(files.length).toBeGreaterThan(0)

    const mismatches: string[] = []
    for (const f of files) {
      const r = await parseFile(f)
      if (!r.ok) continue
      const fm = r.value.frontmatter ?? {}
      const hw = SpecSchema.safeParse(fm).success
      const dv = union.safeParse(fm).success
      if (hw !== dv) mismatches.push(`${f}: hw=${hw} dv=${dv}`)
    }
    expect(mismatches).toEqual([])
  })
})
