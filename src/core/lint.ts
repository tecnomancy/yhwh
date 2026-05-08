import { existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Glob } from 'bun'
import type { Diagnostic } from './diagnostics.js'
import { buildGraph } from './graph.js'
import { initRuntimeSchema } from './meta/runtime-schema.js'
import { type ParsedSpec, parseFile } from './parse.js'
import { validateCrossRefs } from './rules/cross-rules.js'
import { validateSchema } from './rules/schema-rules.js'
import { validateStructural } from './rules/structural-rules.js'
import type { Spec } from './schema/index.js'

export type LintReport = {
  files: number
  specs: Map<string, { parsed: ParsedSpec; spec: Spec }>
  diagnostics: Diagnostic[]
}

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

export const lintPaths = async (paths: string[]): Promise<LintReport> => {
  await initRuntimeSchema()
  const fileLists = await Promise.all(paths.map(collectSpecFiles))
  const files = Array.from(new Set(fileLists.flat()))

  const parsedResults = await Promise.all(files.map(parseFile))
  const specs = new Map<string, { parsed: ParsedSpec; spec: Spec }>()
  const diagnostics: Diagnostic[] = []

  for (let idx = 0; idx < parsedResults.length; idx++) {
    const res = parsedResults[idx]
    if (!res) continue
    const file = files[idx] ?? '<unknown>'
    if (!res.ok) {
      diagnostics.push(res.error)
      continue
    }
    const schemaRes = validateSchema(res.value)
    diagnostics.push(...schemaRes.diagnostics)
    if (!schemaRes.spec) continue
    const structural = validateStructural(res.value, schemaRes.spec)
    diagnostics.push(...structural)
    if (specs.has(schemaRes.spec.id)) {
      diagnostics.push({
        spec_id: schemaRes.spec.id,
        file,
        line: 2,
        rule_id: 'cross/duplicate-id',
        level: 'error',
        message: `id "${schemaRes.spec.id}" already declared in ${specs.get(schemaRes.spec.id)?.parsed.file}`,
      })
      continue
    }
    specs.set(schemaRes.spec.id, { parsed: res.value, spec: schemaRes.spec })
  }

  const graph = buildGraph([...specs.values()])
  diagnostics.push(...validateCrossRefs(graph))

  return { files: files.length, specs, diagnostics }
}
