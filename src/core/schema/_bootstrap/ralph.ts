import { z } from 'zod'
import { Envelope, ID } from './envelope.js'

export const RalphSchema = Envelope.extend({
  kind: z.literal('ralph'),
  description: z.string().min(10),
  cadence_min: z.number().int().min(2).max(60),
  tick_skill: ID,
  report_skills: z.array(ID).default([]),
  pause_flag_path: z.string().min(1),
  circuit_breaker: z
    .object({
      max_failures: z.number().int().min(1).default(3),
      window_min: z.number().int().min(1).default(15),
    })
    .default({ max_failures: 3, window_min: 15 }),
})

export type RalphSpec = z.infer<typeof RalphSchema>
