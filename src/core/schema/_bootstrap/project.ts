import { z } from 'zod'
import { Envelope } from './envelope.js'

const InputDecl = z.object({
  id: z.string().min(1),
  glob: z.string().min(1),
  kinds: z.array(z.string().min(1)).default([]),
})

const GeneratorDecl = z.object({
  id: z.string().min(1),
  consumes: z.enum(['spec', 'graph', 'meta']),
  output_path: z.string().min(1),
  description: z.string().min(1),
})

const CommandFlag = z.object({
  name: z.string().min(1),
  takes_value: z.boolean().default(false),
})

const CommandArg = z.object({
  name: z.string().min(1),
  required: z.boolean().default(false),
  description: z.string().default(''),
})

const CommandDecl = z.object({
  name: z.string().min(1),
  args: z.array(CommandArg).default([]),
  flags: z.array(CommandFlag).default([]),
  description: z.string().default(''),
})

const ValidatorDecl = z.object({
  id: z.string().min(1),
  layer: z.enum(['syntax', 'structural', 'semantic', 'meta-conformance', 'cross', 'fixed-point']),
})

export const ProjectSchema = Envelope.extend({
  kind: z.literal('project'),
  description: z.string().min(10),
  canonical_spec: z.string().optional(),
  inputs: z.array(InputDecl).default([]),
  validators: z.array(ValidatorDecl).default([]),
  generators: z.array(GeneratorDecl).default([]),
  commands: z.array(CommandDecl).default([]),
  waves_state_file: z.string().default('.wave/state.json'),
})

export type ProjectSpec = z.infer<typeof ProjectSchema>
