import { existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { Glob } from 'bun'
import { compileMetaSpecs } from '../src/core/meta/compile.js'
import { loadAllMetaSpecs } from '../src/core/meta/load-meta.js'
import { parseFile } from '../src/core/parse.js'
import { SpecSchema } from '../src/core/schema/_bootstrap/index.js'

type Pair = { file: string; handwrittenOk: boolean; derivedOk: boolean }

const collect = async (dir: string): Promise<string[]> => {
  if (!existsSync(resolve(dir))) return []
  const out: string[] = []
  const glob = new Glob('**/*.spec.md')
  for await (const rel of glob.scan({ cwd: resolve(dir) })) out.push(join(resolve(dir), rel))
  return out.sort()
}

const main = async (): Promise<number> => {
  const metas = await loadAllMetaSpecs()
  const envelope = metas.find((m) => m.target_kind === 'envelope')
  const kindMetas = metas.filter((m) => m.target_kind !== 'envelope')
  if (!envelope) {
    console.error('parity: missing envelope.meta.spec.md')
    return 1
  }
  const { union } = compileMetaSpecs(envelope, kindMetas)

  const dirs = [
    'specs/__fixtures__/good',
    'specs/__fixtures__/bad-cross',
    'specs/lib',
    'meta-specs',
  ]
  const pairs: Pair[] = []
  for (const dir of dirs) {
    const files = await collect(dir)
    for (const f of files) {
      const r = await parseFile(f)
      if (!r.ok) {
        pairs.push({ file: f, handwrittenOk: false, derivedOk: false })
        continue
      }
      const fm = r.value.frontmatter ?? {}
      const hw = SpecSchema.safeParse(fm).success
      const dv = union.safeParse(fm).success
      pairs.push({ file: f, handwrittenOk: hw, derivedOk: dv })
    }
  }

  const mismatches = pairs.filter((p) => p.handwrittenOk !== p.derivedOk)
  if (mismatches.length === 0) {
    console.log(`parity OK — ${pairs.length} files agree across handwritten and derived schemas.`)
    return 0
  }
  console.log(`parity MISMATCH — ${mismatches.length}/${pairs.length} files differ:`)
  for (const p of mismatches) {
    console.log(`  ${basename(p.file)}: handwritten=${p.handwrittenOk} derived=${p.derivedOk}`)
  }
  return 1
}

process.exit(await main())
