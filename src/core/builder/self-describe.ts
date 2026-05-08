import { resolve } from 'node:path'
import { parseFile } from '../parse.js'
import { ProjectSchema, type ProjectSpec } from '../schema/index.js'
import { MANIFEST, type RuntimeManifest } from './runtime-manifest.js'

export type BuilderDiagnostic = {
  rule_id: string
  message: string
  level: 'error' | 'warning'
}

const PROJECT_SPEC_PATH = 'specs/lib/yhwh.spec.md'

export const loadProjectSpec = async (
  path: string = PROJECT_SPEC_PATH,
): Promise<ProjectSpec | null> => {
  const r = await parseFile(resolve(path))
  if (!r.ok || !r.value.frontmatter) return null
  const parsed = ProjectSchema.safeParse(r.value.frontmatter)
  return parsed.success ? (parsed.data as ProjectSpec) : null
}

const diff = (
  actual: readonly string[],
  expected: readonly string[],
): {
  missing: string[]
  extra: string[]
} => {
  const a = new Set(actual)
  const e = new Set(expected)
  return {
    missing: [...e].filter((x) => !a.has(x)),
    extra: [...a].filter((x) => !e.has(x)),
  }
}

export const crossValidate = (
  spec: ProjectSpec,
  manifest: RuntimeManifest = MANIFEST,
): BuilderDiagnostic[] => {
  const out: BuilderDiagnostic[] = []

  const cmd = diff(
    spec.commands.map((c) => c.name),
    manifest.commands,
  )
  for (const c of cmd.missing) {
    out.push({
      rule_id: 'cross/builder-command-missing',
      level: 'error',
      message: `runtime exposes CLI verb "${c}" but project spec has no commands[] entry`,
    })
  }
  for (const c of cmd.extra) {
    out.push({
      rule_id: 'cross/builder-command-orphan',
      level: 'warning',
      message: `project spec declares command "${c}" but runtime does not implement it`,
    })
  }

  const gen = diff(
    spec.generators.map((g) => g.id),
    manifest.generators,
  )
  for (const g of gen.missing) {
    out.push({
      rule_id: 'cross/builder-generator-missing',
      level: 'error',
      message: `runtime emits generator "${g}" but project spec has no generators[] entry`,
    })
  }
  for (const g of gen.extra) {
    out.push({
      rule_id: 'cross/builder-generator-orphan',
      level: 'warning',
      message: `project spec declares generator "${g}" but runtime does not emit it`,
    })
  }

  const declaredValidators = spec.validators.map((v) => v.id)
  const familySchema = manifest.validators.filter((v) => v.startsWith('schema/'))
  const checkable = manifest.validators.filter((v) => !v.startsWith('schema/missing'))
  // schema/<kind>/<field> family is satisfied if the spec has any schema/<kind> coverage
  const declaredSchemaKinds = new Set(
    declaredValidators.filter((v) => v.startsWith('schema/')).map((v) => v.split('/')[1] ?? ''),
  )

  for (const rule of checkable) {
    if (rule.startsWith('schema/')) continue
    if (!declaredValidators.includes(rule))
      out.push({
        rule_id: 'cross/builder-validator-missing',
        level: 'error',
        message: `runtime emits diagnostic "${rule}" but project spec has no validators[] entry`,
      })
  }

  // For the schema/<kind> family, just require at least one entry per kind we know about
  const knownKinds = [
    'agent',
    'skill',
    'flow',
    'entity',
    'harness',
    'ralph',
    'project',
    'envelope',
    'meta-spec',
  ]
  for (const k of knownKinds) {
    if (!declaredSchemaKinds.has(k))
      out.push({
        rule_id: 'cross/builder-validator-missing',
        level: 'warning',
        message: `project spec has no schema/${k} entry under validators[]`,
      })
  }

  void familySchema
  return out
}
