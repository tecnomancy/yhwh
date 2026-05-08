import type { z } from 'zod'
import { SpecSchema as HandwrittenSpecSchema } from '../schema/index.js'
import { compileMetaSpecs } from './compile.js'
import { loadAllMetaSpecs } from './load-meta.js'

// Wave 6 retirement contract:
//   Default mode  → schema derived from meta-specs (data-driven, self-hosted)
//   RUN_FROM_BOOTSTRAP=1 → revert to handwritten (legacy, kept for parity testing)
//   Falls back to handwritten if meta-specs/ is missing or envelope not found.

let cached: z.ZodTypeAny | null = null

export const getRuntimeSpecSchema = async (): Promise<z.ZodTypeAny> => {
  if (process.env.RUN_FROM_BOOTSTRAP === '1') return HandwrittenSpecSchema
  if (cached) return cached
  const metas = await loadAllMetaSpecs()
  const envelope = metas.find((m) => m.target_kind === 'envelope')
  if (!envelope) return HandwrittenSpecSchema
  const kindMetas = metas.filter((m) => m.target_kind !== 'envelope')
  const { union } = compileMetaSpecs(envelope, kindMetas)
  cached = union
  return cached
}

export const initRuntimeSchema = async (): Promise<void> => {
  await getRuntimeSpecSchema()
}

export const getCachedSpecSchema = (): z.ZodTypeAny =>
  process.env.RUN_FROM_BOOTSTRAP === '1' ? HandwrittenSpecSchema : (cached ?? HandwrittenSpecSchema)

export const isUsingBootstrap = (): boolean => process.env.RUN_FROM_BOOTSTRAP === '1'
