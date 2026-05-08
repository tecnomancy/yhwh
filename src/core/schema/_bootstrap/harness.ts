import { z } from 'zod'
import { Envelope, ID } from './envelope.js'

export const HarnessSchema = Envelope.extend({
  kind: z.literal('harness'),
  description: z.string().min(10),
  cron: z.string().optional(),
  dispatches: z.array(ID).min(1),
  state_file: z.string().min(1),
  gates: z.array(ID).default([]),
})

export type HarnessSpec = z.infer<typeof HarnessSchema>
