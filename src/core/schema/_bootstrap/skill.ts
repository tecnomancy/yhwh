import { z } from 'zod'
import { TOOL } from './agent.js'
import { Envelope } from './envelope.js'
import { ID } from './envelope.js'

export const SkillSchema = Envelope.extend({
  kind: z.literal('skill'),
  description: z.string().min(10),
  argument_hint: z.string().optional(),
  user_invocable: z.boolean().default(false),
  requires_agents: z.array(ID).default([]),
  requires_tools: z.array(TOOL).default([]),
})

export type SkillSpec = z.infer<typeof SkillSchema>
