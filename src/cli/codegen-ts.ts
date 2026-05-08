import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { generateAllModules } from '../core/meta/codegen-ts.js'
import { loadAllMetaSpecs } from '../core/meta/load-meta.js'

const OUT_DIR = resolve('src', 'core', 'schema', '_generated')

export const runCodegenTs = async (args: string[]): Promise<number> => {
  const dryRun = args.includes('--dry-run')
  const metas = await loadAllMetaSpecs()
  const envelope = metas.find((m) => m.target_kind === 'envelope')
  if (!envelope) {
    console.error('codegen-ts: missing meta-specs/envelope.meta.spec.md')
    return 1
  }
  const kindMetas = metas.filter((m) => m.target_kind !== 'envelope')
  const modules = generateAllModules(envelope, kindMetas)

  if (dryRun) {
    for (const m of modules) {
      console.log(`[would write] ${join(OUT_DIR, `${m.kind}.ts`)}  (${m.source.length} bytes)`)
    }
    return 0
  }

  await mkdir(OUT_DIR, { recursive: true })
  for (const m of modules) {
    const path = join(OUT_DIR, `${m.kind}.ts`)
    await Bun.write(path, m.source)
    console.log(`wrote ${path}`)
  }
  return 0
}
