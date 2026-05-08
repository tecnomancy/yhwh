import { watch } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { sortDiagnostics } from '../core/diagnostics.js'
import { lintPaths } from '../core/lint.js'

const DIST = resolve('dist')

const writeFile = async (path: string, content: string): Promise<void> => {
  await mkdir(resolve(path, '..'), { recursive: true })
  await Bun.write(path, content)
}

const lintOnce = async (paths: string[]): Promise<{ count: number; errors: number }> => {
  const report = await lintPaths(paths)
  const sorted = sortDiagnostics(report.diagnostics)
  const errors = sorted.filter((d) => d.level === 'error').length
  await writeFile(
    join(DIST, 'diagnostics.json'),
    JSON.stringify(
      {
        ts: new Date().toISOString(),
        files: report.files,
        specs: report.specs.size,
        diagnostics: sorted,
      },
      null,
      2,
    ),
  )
  return { count: sorted.length, errors }
}

export const runWatch = async (args: string[]): Promise<number> => {
  const debounceIdx = args.indexOf('--debounce-ms')
  const debounceMs = debounceIdx >= 0 && args[debounceIdx + 1] ? Number(args[debounceIdx + 1]) : 200
  const paths = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--debounce-ms')
  if (paths.length === 0) {
    console.error('usage: hwh watch <path...> [--debounce-ms N]')
    return 2
  }

  const initial = await lintOnce(paths)
  console.log(`[hwh watch] initial: ${initial.count} diagnostic(s), ${initial.errors} error(s)`)

  let pending: ReturnType<typeof setTimeout> | null = null
  const schedule = (): void => {
    if (pending) clearTimeout(pending)
    pending = setTimeout(async () => {
      const start = Date.now()
      const r = await lintOnce(paths)
      const ms = Date.now() - start
      console.log(
        `[hwh watch] re-lint ${ms}ms — ${r.count} diagnostic(s), ${r.errors} error(s)${r.errors === 0 ? ' OK' : ''}`,
      )
      pending = null
    }, debounceMs)
  }

  for (const p of paths) {
    watch(resolve(p), { recursive: true }, (_event, filename) => {
      if (!filename || !filename.endsWith('.spec.md')) return
      schedule()
    })
  }

  console.log(
    `[hwh watch] watching ${paths.length} path(s) (debounce ${debounceMs}ms). Ctrl-C to stop.`,
  )
  await new Promise<void>(() => undefined)
  return 0
}
