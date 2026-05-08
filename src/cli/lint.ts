import { formatHuman, hasError, sortDiagnostics } from '../core/diagnostics.js'
import { lintPaths } from '../core/lint.js'

export const runLint = async (args: string[]): Promise<number> => {
  const json = args.includes('--json')
  const paths = args.filter((a) => !a.startsWith('--'))
  if (paths.length === 0) {
    console.error('usage: hwh lint <path...> [--json]')
    return 2
  }

  const report = await lintPaths(paths)
  const sorted = sortDiagnostics(report.diagnostics)

  if (json) {
    console.log(
      JSON.stringify(
        { files: report.files, specs: report.specs.size, diagnostics: sorted },
        null,
        2,
      ),
    )
  } else {
    if (sorted.length === 0) {
      console.log(`ok — ${report.files} file(s), ${report.specs.size} spec(s), 0 diagnostics`)
    } else {
      for (const d of sorted) {
        console.log(`${formatHuman(d)}\n`)
      }
      console.log(`${sorted.length} diagnostic(s) across ${report.files} file(s)`)
    }
  }

  return hasError(sorted) ? 1 : 0
}
