import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { Glob } from 'bun'
import { canonicalizeSource, isFixedPoint } from '../src/core/canonicalize/render.js'

const collect = async (dir: string): Promise<string[]> => {
  const abs = resolve(dir)
  const out: string[] = []
  const glob = new Glob('**/*.spec.md')
  for await (const rel of glob.scan({ cwd: abs })) out.push(join(abs, rel))
  return out.sort()
}

describe('canonicalize fixed-point', () => {
  test('every good fixture reaches a fixed point in 2 passes', async () => {
    const files = await collect('specs/__fixtures__/good')
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const raw = await readFile(f, 'utf8')
      const r = isFixedPoint(f, raw)
      if (!r.ok) {
        console.error(`failed: ${basename(f)} — ${r.error[0]?.message}`)
      }
      expect(r.ok).toBe(true)
    }
  })

  test('production specs/lib/ are canonical (idempotent)', async () => {
    const files = await collect('specs/lib')
    for (const f of files) {
      const raw = await readFile(f, 'utf8')
      const r = isFixedPoint(f, raw)
      expect(r.ok).toBe(true)
    }
  })

  test('hand-mangled spec is normalized in one pass', async () => {
    const mangled = `---
id:    'einstein'
kind:    agent
status: active
owner:    example
version: 0.1.0
description: x x x x x x x x x x
tools: [Read]
model: sonnet
tags: []
---
# Einstein

x.
`
    const r1 = canonicalizeSource('m.spec.md', mangled)
    expect(r1.ok).toBe(true)
    if (!r1.ok) return
    const r2 = canonicalizeSource('m.spec.md', r1.value.canonical)
    expect(r2.ok).toBe(true)
    if (!r2.ok) return
    expect(r2.value.canonical).toBe(r1.value.canonical)
    expect(r1.value.canonical).not.toBe(mangled)
    expect(r1.value.canonical).toMatch(/^---\nkind: agent\nid: einstein\n/)
  })

  test('two semantically equivalent specs converge to identical bytes', async () => {
    const a = `---
kind: agent
id: twin
version: 0.1.0
status: active
owner: x
description: same content same content
tools: [Read]
model: sonnet
tags: [a, b]
---

# Twin

body
`
    const b = `---
id: twin
status: active
kind: agent
description: same content same content
owner: x
version: 0.1.0
model: sonnet
tools:
  - Read
tags:
  - a
  - b
---
# Twin

body
`
    const ra = canonicalizeSource('a.spec.md', a)
    const rb = canonicalizeSource('b.spec.md', b)
    expect(ra.ok).toBe(true)
    expect(rb.ok).toBe(true)
    if (!ra.ok || !rb.ok) return
    expect(ra.value.canonical).toBe(rb.value.canonical)
  })
})
