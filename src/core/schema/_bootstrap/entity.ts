import { z } from 'zod'
import { Envelope } from './envelope.js'

const Field = z.object({
  name: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  type: z.string().min(1),
  required: z.boolean().default(true),
})

export const EntitySchema = Envelope.extend({
  kind: z.literal('entity'),
  description: z.string().min(10),
  fields: z.array(Field).min(1),
  invariants: z.array(z.string()).default([]),
})

export type EntitySpec = z.infer<typeof EntitySchema>
