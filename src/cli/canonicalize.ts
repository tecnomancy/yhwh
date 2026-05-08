import { existsSync, statSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Glob } from 'bun'
import { canonicalizeSource } from '../core/canonicalize/render.js'
import { formatHuman, sortDiagnostics } from '../core/diagnostics.js'

const collectSpecFiles = async (input: string): Promise<string[]> => {
  const abs = resolve(input)
  if (!existsSync(abs)) return []
  const st = statSync(abs)
  if (st.isFile()) return abs.endsWith('.spec.md') ? [abs] : []
  const glob = new Glob('**/*.spec.md')
  const out: string[] = []
  for await (const rel of glob.scan({ cwd: abs })) out.push(join(abs, rel))
  return out.sort()
}

const diff = (a: string, b: string): string => {
  if (a === b) return ''
  const al = a.split('\n')
  const bl = b.split('\n')
  const max = Math.max(al.length, bl.length)
  const lines = Array.from({ length: max }, (_, i) => {
    const x = al[i] ?? ''
    const y = bl[i] ?? ''
    if (x === y) return null
    return [x ? `- ${x}` : null, y ? `+ ${y}` : null].filter(Boolean).join('\n')
  }).filter((l): l is string => l !== null)
  return lines.slice(0, 60).join('\n')
}

export const runCanonicalize = async (args: string[]): Promise<number> => {
  const check = args.includes('--check')
  const write = args.includes('--write')
  const paths = args.filter((a) => !a.startsWith('--'))
  if (paths.length === 0) {
    console.error('usage: hwh canonicalize <path...> [--check | --write]')
    return 2
  }

  const fileLists = await Promise.all(paths.map(collectSpecFiles))
  const files = Array.from(new Set(fileLists.flat()))
  if (files.length === 0) {
    console.error('no .spec.md files found')
    return 2
  }

  const processFile = async (f: string): Promise<{ changed: number; errored: number }> => {
    const raw = await readFile(f, 'utf8')
    const r = canonicalizeSource(f, raw)
    if (!r.ok) {
      for (const d of sortDiagnostics(r.error)) {
        console.error(formatHuman(d))
      }
      return { changed: 0, errored: 1 }
    }
    if (r.value.canonical === raw) return { changed: 0, errored: 0 }
    if (write) {
      await writeFile(f, r.value.canonical)
      console.log(`canonicalized ${f}`)
    } else if (check) {
      console.log(`[DRIFT] ${f}`)
      const d = diff(raw, r.value.canonical)
      if (d) console.log(d.replace(/^/gm, '  '))
    } else {
      console.log(`[would change] ${f}`)
      const d = diff(raw, r.value.canonical)
      if (d) console.log(d.replace(/^/gm, '  '))
    }
    return { changed: 1, errored: 0 }
  }

  const totals = await files.reduce(
    async (accP, f) => {
      const acc = await accP
      const r = await processFile(f)
      return { changed: acc.changed + r.changed, errored: acc.errored + r.errored }
    },
    Promise.resolve({ changed: 0, errored: 0 }),
  )
  const { changed, errored } = totals

  console.log(`\n${files.length} file(s) checked; ${changed} would change; ${errored} error(s).`)
  if (errored > 0) return 1
  if (check && changed > 0) return 1
  return 0
}
