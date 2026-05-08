// Hand-maintained manifest of what the yhwh runtime exposes.
// Wave 5 cross-validates this against the canonical project spec.
// Adding a new CLI verb / rule / generator without updating this file
// AND the project spec fails CI.

export const RUNTIME_COMMANDS = [
  'lint',
  'build',
  'new',
  'watch',
  'apply',
  'doctor',
  'canonicalize',
  'wave',
] as const

export const RUNTIME_GENERATORS = [
  'registry-json',
  'registry-ts',
  'types-ts',
  'agent-md',
  'skill-md',
  'diagnostics-json',
] as const

export const RUNTIME_VALIDATORS = [
  // syntax
  'parse/no-frontmatter',
  'parse/yaml-invalid',
  'parse/frontmatter-shape',
  'parse/io',
  // structural
  'structural/missing-heading',
  'structural/unclosed-code-fence',
  'structural/mermaid-invalid',
  'structural/flow-needs-mermaid',
  'structural/flow-actor-not-declared',
  // semantic / schema
  'schema/missing-frontmatter',
  // schema/<kind>/<field> — covered as prefix family below
  // cross
  'cross/duplicate-id',
  'cross/flow-actor-not-found',
  'cross/skill-agent-not-found',
  'cross/skill-tool-not-on-agent',
  'cross/harness-skill-not-found',
  'cross/harness-dispatch-not-invocable',
  'cross/ralph-tick-not-found',
  'cross/ralph-report-not-found',
  'cross/flow-cycle',
  'cross/entity-invariant-syntax',
  'cross/entity-invariant-skill-not-found',
  'cross/entity-invariant-flow-not-found',
  // canonical
  'canonical/parse',
  'canonical/not-fixed-point',
] as const

export const RUNTIME_INPUT_GLOBS = [
  'specs/lib/**/*.spec.md',
  'meta-specs/**/*.spec.md',
  'specs/__fixtures__/good/**/*.spec.md',
] as const

export type RuntimeManifest = {
  commands: readonly string[]
  generators: readonly string[]
  validators: readonly string[]
  inputs: readonly string[]
}

export const MANIFEST: RuntimeManifest = {
  commands: RUNTIME_COMMANDS,
  generators: RUNTIME_GENERATORS,
  validators: RUNTIME_VALIDATORS,
  inputs: RUNTIME_INPUT_GLOBS,
}
