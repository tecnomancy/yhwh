import { z } from 'zod'

export const KIND = z.enum([
  'agent',
  'skill',
  'flow',
  'entity',
  'harness',
  'ralph',
  'project',
  'meta-spec',
])
export type Kind = z.infer<typeof KIND>

export const ID = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z][a-z0-9-]*$/, 'id must be kebab-case lowercase, start with letter')

export const SEMVER = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'version must be semver MAJOR.MINOR.PATCH')

export const STATUS = z.enum(['draft', 'active', 'deprecated'])

export const Envelope = z.object({
  kind: KIND,
  id: ID,
  version: SEMVER,
  status: STATUS,
  owner: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export type EnvelopeShape = z.infer<typeof Envelope>
