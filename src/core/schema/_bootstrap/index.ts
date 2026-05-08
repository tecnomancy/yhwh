import { z } from 'zod'
import { AgentSchema } from './agent.js'
import { EntitySchema } from './entity.js'
import { FlowSchema } from './flow.js'
import { HarnessSchema } from './harness.js'
import { MetaSpecSchema } from './meta-spec.js'
import { ProjectSchema } from './project.js'
import { RalphSchema } from './ralph.js'
import { SkillSchema } from './skill.js'

export { Envelope, type Kind } from './envelope.js'
export { AgentSchema, type AgentSpec } from './agent.js'
export { SkillSchema, type SkillSpec } from './skill.js'
export { FlowSchema, type FlowSpec } from './flow.js'
export { EntitySchema, type EntitySpec } from './entity.js'
export { HarnessSchema, type HarnessSpec } from './harness.js'
export { RalphSchema, type RalphSpec } from './ralph.js'
export { ProjectSchema, type ProjectSpec } from './project.js'
export { MetaSpecSchema, type MetaSpec } from './meta-spec.js'

export const SpecSchema = z.discriminatedUnion('kind', [
  AgentSchema,
  SkillSchema,
  FlowSchema,
  EntitySchema,
  HarnessSchema,
  RalphSchema,
  ProjectSchema,
  MetaSpecSchema,
])

export type Spec = z.infer<typeof SpecSchema>
