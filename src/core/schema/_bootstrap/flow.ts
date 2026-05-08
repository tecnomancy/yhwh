import { z } from 'zod'
import { Envelope, ID } from './envelope.js'

export const FlowSchema = Envelope.extend({
  kind: z.literal('flow'),
  description: z.string().min(10),
  actors: z.array(ID).default([]),
  triggers: z.array(z.string()).default([]),
  next: z.array(ID).default([]),
})

export type FlowSpec = z.infer<typeof FlowSchema>
