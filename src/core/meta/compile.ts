import { z } from 'zod'
import type { MetaSpec } from '../schema/index.js'
import { resolvePredicate } from './predicates.js'

// Wave 8: a `{ref: <kind>}` resolves to the *record schema* of that kind —
// i.e. the kind's fields without the universal envelope. Records and primary
// spec kinds share the same compilation path; refs are just a way for one
// meta-spec to embed another's structural shape.

type RecordRegistry = Map<string, z.ZodObject<z.ZodRawShape>>

const fieldToZod = (
  type: unknown,
  predicate: string | undefined,
  records: RecordRegistry,
): z.ZodTypeAny => {
  if (typeof type === 'string') {
    if (type === 'string') return z.string()
    if (type === 'number') return z.number()
    if (type === 'boolean') return z.boolean()
    if (type === 'kebab-id') return z.string().regex(/^[a-z][a-z0-9-]*$/)
    if (type === 'semver') return z.string().regex(/^\d+\.\d+\.\d+$/)
    if (type === 'iso8601') return z.string()
    if (type === 'glob') return z.string()
    if (type === 'predicate' && predicate) {
      const p = resolvePredicate(predicate)
      if (predicate.startsWith('enum:'))
        return z.enum(predicate.slice(5).split('|') as [string, ...string[]])
      return z.unknown().refine((v) => p(v).ok, { message: `predicate "${predicate}" failed` })
    }
    return z.unknown()
  }
  if (type && typeof type === 'object') {
    const o = type as Record<string, unknown>
    if (typeof o.array === 'string') return z.array(fieldToZod(o.array, undefined, records))
    if (
      o.array &&
      typeof o.array === 'object' &&
      typeof (o.array as Record<string, unknown>).ref === 'string'
    ) {
      const ref = String((o.array as Record<string, unknown>).ref)
      return z.array(z.lazy(() => records.get(ref) ?? z.unknown()))
    }
    if (typeof o.ref === 'string') {
      const ref = o.ref
      return z.lazy(() => records.get(ref) ?? z.unknown())
    }
    if (Array.isArray(o.enum) && o.enum.length > 0) return z.enum(o.enum as [string, ...string[]])
  }
  return z.unknown()
}

const isArrayType = (type: unknown): boolean =>
  typeof type === 'object' && type !== null && 'array' in (type as Record<string, unknown>)

const wrap = (
  field: { type?: unknown; required: boolean; default?: unknown },
  base: z.ZodTypeAny,
): z.ZodTypeAny => {
  if (field.required) return base
  if (field.default !== undefined) return base.default(field.default as never)
  if (isArrayType(field.type)) return base.default([] as never)
  return base.optional()
}

const buildRecordShape = (meta: MetaSpec, records: RecordRegistry): z.ZodObject<z.ZodRawShape> => {
  const shape: z.ZodRawShape = {}
  for (const f of meta.fields) {
    shape[f.name] = wrap(f, fieldToZod(f.type, f.predicate, records))
  }
  return z.object(shape) as z.ZodObject<z.ZodRawShape>
}

export type CompiledSchemas = {
  byKind: Map<string, z.ZodObject<z.ZodRawShape>>
  records: RecordRegistry
  union: z.ZodTypeAny
}

const SPEC_KINDS = new Set([
  'agent',
  'skill',
  'flow',
  'entity',
  'harness',
  'ralph',
  'project',
  'meta-spec',
])

export const compileMetaSpecs = (envelope: MetaSpec, kindMetas: MetaSpec[]): CompiledSchemas => {
  const records: RecordRegistry = new Map()

  // Pre-register every kind's record shape (closed under ref resolution via z.lazy)
  for (const meta of kindMetas) {
    records.set(meta.target_kind, buildRecordShape(meta, records))
  }

  // Envelope record (no kind literal, used inside spec kinds)
  const envelopeShape: z.ZodRawShape = {}
  for (const f of envelope.fields) {
    envelopeShape[f.name] = wrap(f, fieldToZod(f.type, f.predicate, records))
  }
  records.set('envelope', z.object(envelopeShape))

  const byKind = new Map<string, z.ZodObject<z.ZodRawShape>>()
  const variants: z.ZodObject<z.ZodRawShape>[] = []

  for (const meta of kindMetas) {
    if (!SPEC_KINDS.has(meta.target_kind)) continue
    const shape: z.ZodRawShape = { ...envelopeShape, kind: z.literal(meta.target_kind) }
    for (const f of meta.fields) {
      shape[f.name] = wrap(f, fieldToZod(f.type, f.predicate, records))
    }
    const obj = z.object(shape) as z.ZodObject<z.ZodRawShape>
    byKind.set(meta.target_kind, obj)
    variants.push(obj)
  }

  const union =
    variants.length > 0
      ? z.discriminatedUnion(
          'kind',
          variants as never as readonly [
            z.ZodDiscriminatedUnionOption<'kind'>,
            ...z.ZodDiscriminatedUnionOption<'kind'>[],
          ],
        )
      : z.unknown()

  return { byKind, records, union }
}

export const printSchemaDescription = (kind: string, obj: z.ZodObject<z.ZodRawShape>): string => {
  const lines = [`schema(${kind}) {`]
  for (const [key, def] of Object.entries(obj.shape).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`  ${key}: ${zDescribe(def)}`)
  }
  lines.push('}')
  return lines.join('\n')
}

const zDescribe = (s: z.ZodTypeAny): string => {
  const def = (s as { _def: { typeName: string } })._def
  return def.typeName
}
