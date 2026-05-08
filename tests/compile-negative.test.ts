import { describe, expect, test } from 'bun:test'
import { compileMetaSpecs, printSchemaDescription } from '../src/core/meta/compile.js'
import type { MetaSpec } from '../src/core/schema/index.js'

// Minimal stub — only the fields compileMetaSpecs actually reads at runtime
const baseEnvelope = {
  target_kind: 'envelope',
  fields: [
    {
      name: 'id',
      type: 'kebab-id',
      required: true,
      description: 'unique id',
      examples: [],
    },
  ],
  body_layout: [],
  cross_refs: [],
} as unknown as MetaSpec

const kindMeta = (target_kind: string, fields: MetaSpec['fields']): MetaSpec =>
  ({ target_kind, fields, body_layout: [], cross_refs: [] }) as unknown as MetaSpec

describe('compileMetaSpecs — uncovered branches', () => {
  test('predicate field with non-enum predicate (line 29)', () => {
    const meta = kindMeta('agent', [
      {
        name: 'slug',
        type: 'predicate',
        predicate: 'kebab-id',
        required: true,
        description: 'slug field',
        examples: [],
      },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [meta])
    const schema = byKind.get('agent')
    if (!schema) throw new Error('expected agent schema')
    // valid kebab value passes the refine
    const r1 = schema.safeParse({ id: 'x', kind: 'agent', slug: 'valid-slug' })
    expect(r1.success).toBe(true)
    // non-string fails the refine (unknown().refine)
    const r2 = schema.safeParse({ id: 'x', kind: 'agent', slug: 999 })
    expect(r2.success).toBe(false)
  })

  test('ref object field (lines 44-47)', () => {
    const record = kindMeta('cross-ref', [
      { name: 'target', type: 'string', required: true, description: 'target', examples: [] },
    ])
    const meta = kindMeta('agent', [
      {
        name: 'ref_field',
        type: { ref: 'cross-ref' } as unknown as string,
        required: false,
        description: 'single ref',
        examples: [],
      },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [record, meta])
    expect(byKind.has('agent')).toBe(true)
  })

  test('array of ref objects (lines 37-43)', () => {
    const record = kindMeta('cross-ref', [
      { name: 'target', type: 'string', required: true, description: 'target', examples: [] },
    ])
    const meta = kindMeta('agent', [
      {
        name: 'refs',
        type: { array: { ref: 'cross-ref' } } as unknown as string,
        required: false,
        description: 'array of refs',
        examples: [],
      },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [record, meta])
    expect(byKind.has('agent')).toBe(true)
  })

  test('target_kind not in SPEC_KINDS is excluded from byKind (line 110)', () => {
    const meta = kindMeta('cross-ref', [
      { name: 'target', type: 'string', required: true, description: 'target', examples: [] },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [meta])
    expect(byKind.has('cross-ref')).toBe(false)
  })

  test('predicate type without predicate string falls through to z.unknown (lines 30-31)', () => {
    // type === 'predicate' but predicate is undefined → falls through to return z.unknown()
    const meta = kindMeta('agent', [
      {
        name: 'loose',
        type: 'predicate',
        predicate: undefined,
        required: false,
        description: 'no predicate defined',
        examples: [],
      },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [meta])
    expect(byKind.has('agent')).toBe(true)
  })

  test('enum object type field (line 48)', () => {
    const meta = kindMeta('agent', [
      {
        name: 'status',
        type: { enum: ['active', 'inactive'] } as unknown as string,
        required: true,
        description: 'status enum',
        examples: [],
      },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [meta])
    const schema = byKind.get('agent')
    if (!schema) throw new Error('expected agent schema')
    const r = schema.safeParse({ id: 'x', kind: 'agent', status: 'active' })
    expect(r.success).toBe(true)
    const r2 = schema.safeParse({ id: 'x', kind: 'agent', status: 'other' })
    expect(r2.success).toBe(false)
  })

  test('empty kindMetas yields z.unknown() union', () => {
    const { union } = compileMetaSpecs(baseEnvelope, [])
    expect(union).toBeDefined()
  })

  test('printSchemaDescription covers lines 134-144', () => {
    const meta = kindMeta('agent', [
      { name: 'name', type: 'string', required: true, description: 'name', examples: [] },
      { name: 'count', type: 'number', required: false, description: 'count', examples: [] },
    ])
    const { byKind } = compileMetaSpecs(baseEnvelope, [meta])
    const schema = byKind.get('agent')
    if (!schema) throw new Error('expected agent schema')
    const desc = printSchemaDescription('agent', schema)
    expect(desc).toContain('schema(agent) {')
    expect(desc).toContain('}')
    expect(desc.split('\n').length).toBeGreaterThan(2)
  })
})
