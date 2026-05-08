import { readFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { Glob } from 'bun'
import { canonicalizeSource } from '../src/core/canonicalize/render.js'

const collect = async (dir: string): Promise<string[]> => {
  const out: string[] = []
  const glob = new Glob('**/*.spec.md')
  for await (const rel of glob.scan({ cwd: resolve(dir) })) out.push(join(resolve(dir), rel))
  return out.sort()
}

for (const f of [...(await collect('specs/__fixtures__/good')), ...(await collect('specs/lib'))]) {
  const raw = await readFile(f, 'utf8')
  const r1 = canonicalizeSource(f, raw)
  if (!r1.ok) {
    console.log(`ERR1 ${basename(f)}: ${r1.error[0]?.message}`)
    continue
  }
  const r2 = canonicalizeSource(f, r1.value.canonical)
  if (!r2.ok) {
    console.log(`ERR2 ${basename(f)}`)
    continue
  }
  if (r1.value.canonical !== r2.value.canonical) {
    console.log(`NOT FIXED: ${basename(f)}`)
    const a = r1.value.canonical.split('\n')
    const b = r2.value.canonical.split('\n')
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        console.log(`  line ${i + 1}:`)
        console.log(`    pass1: ${JSON.stringify(a[i] ?? '<eof>')}`)
        console.log(`    pass2: ${JSON.stringify(b[i] ?? '<eof>')}`)
      }
    }
    process.exit(0)
  } else {
    console.log(`ok ${basename(f)}`)
  }
}
