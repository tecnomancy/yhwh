// Default public API for spec types and zod schemas.
//
// Wave 8 (bootstrap-complete-source):
//   Both VALUES and TYPES come from src/core/schema/_generated/ — built from
//   meta-specs/*.meta.spec.md by `bun run hwh codegen-ts`. Every record type
//   used by the engine (Field, BodySection, CrossRef, Example, InputDecl,
//   ValidatorDecl, GeneratorDecl, CommandDecl, CommandArg, CommandFlag,
//   AgentAura) is itself a meta-spec under meta-specs/_records/.
//
//   src/core/schema/_bootstrap/ remains as the parity reference and is used
//   when RUN_FROM_BOOTSTRAP=1 (legacy fallback for the parity test). Strip
//   test (scripts/strip-bootstrap-test.ts) deletes it entirely and the
//   runtime survives.

export {
  Envelope,
  KIND,
  ID,
  SEMVER,
  STATUS,
  type Kind,
  AgentSchema,
  type AgentSpec,
  SkillSchema,
  type SkillSpec,
  FlowSchema,
  type FlowSpec,
  EntitySchema,
  type EntitySpec,
  HarnessSchema,
  type HarnessSpec,
  RalphSchema,
  type RalphSpec,
  ProjectSchema,
  type ProjectSpec,
  MetaSpecSchema,
  type MetaSpec,
  SpecSchema,
  type Spec,
} from './_generated/index.js'
