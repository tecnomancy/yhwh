import { z } from 'zod'
import { Envelope } from './envelope.js'

// Wave 8: array element can itself be a primitive name (string) or a {ref: kind}
// object that resolves to a record meta-spec at compile time.
const ArrayElement: z.ZodTypeAny = z.union([
  z.string(),
  z.object({ ref: z.string() }),
  z.object({ enum: z.array(z.string()).min(1) }),
])

const MetaPrimitive = z.union([
  z.string(),
  z.object({ array: ArrayElement }),
  z.object({ ref: z.string() }),
  z.object({ enum: z.array(z.string()).min(1) }),
])

const MetaField = z.object({
  name: z.string().min(1),
  type: MetaPrimitive,
  required: z.boolean().default(true),
  default: z.unknown().optional(),
  predicate: z.string().optional(),
  description: z.string().min(1),
  examples: z.array(z.unknown()).default([]),
})

const BodySection = z.object({
  heading: z.string().min(1),
  required: z.boolean().default(false),
  reader: z.enum(['plain', 'list', 'table', 'mermaid', 'steps']),
  emits_to: z.string().min(1),
})

const MetaCrossRef = z.object({
  rule_id: z.string().min(1),
  description: z.string().min(1),
  source: z.object({ kind: z.string().min(1), field: z.string().min(1) }),
  target: z.object({ kind: z.string().min(1), field: z.literal('id') }),
  level: z.enum(['error', 'warning']).default('error'),
})

const MetaExample = z.object({ id: z.string().min(1), raw: z.string().min(1) })

export const MetaSpecSchema = Envelope.extend({
  kind: z.literal('meta-spec'),
  description: z.string().min(10),
  target_kind: z.string().min(1),
  fields: z.array(MetaField).default([]),
  body_layout: z.array(BodySection).default([]),
  cross_refs: z.array(MetaCrossRef).default([]),
  examples: z.array(MetaExample).default([]),
})

export type MetaSpec = z.infer<typeof MetaSpecSchema>
