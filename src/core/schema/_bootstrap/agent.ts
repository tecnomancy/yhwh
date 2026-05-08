import { z } from 'zod'
import { Envelope } from './envelope.js'

export const TOOL = z.string().min(1)
export const MODEL = z.enum(['opus', 'sonnet', 'haiku'])

export const Aura = z.object({
  doctrine: z.string().optional(),
  resonance: z.array(z.string()).optional(),
  index: z.array(z.number()).optional(),
})

export const AgentSchema = Envelope.extend({
  kind: z.literal('agent'),
  description: z.string().min(10),
  tools: z.array(TOOL).min(1),
  model: MODEL,
  aura: Aura.optional(),
})

export type AgentSpec = z.infer<typeof AgentSchema>
