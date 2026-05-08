import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Glob } from 'bun'
import { parseFile } from '../parse.js'
import { type MetaSpec, MetaSpecSchema } from '../schema/index.js'

export const loadAllMetaSpecs = async (dir = 'meta-specs'): Promise<MetaSpec[]> => {
  const abs = resolve(dir)
  if (!existsSync(abs)) return []
  const out: MetaSpec[] = []
  const glob = new Glob('**/*.meta.spec.md')
  for await (const rel of glob.scan({ cwd: abs })) {
    const file = join(abs, rel)
    const r = await parseFile(file)
    if (!r.ok) continue
    const fm = r.value.frontmatter
    if (!fm || fm.kind !== 'meta-spec') continue
    const parsed = MetaSpecSchema.safeParse(fm)
    if (parsed.success) out.push(parsed.data as MetaSpec)
  }
  return out
}
