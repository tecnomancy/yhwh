import { describe, expect, test } from 'bun:test'
import { join, resolve } from 'node:path'
import { Glob } from 'bun'
import { parseFile } from '../src/core/parse.js'

describe('parse perf', () => {
  test('parsing all good fixtures completes under 200ms', async () => {
    const dir = resolve('specs/__fixtures__/good')
    const files: string[] = []
    const glob = new Glob('**/*.spec.md')
    for await (const f of glob.scan({ cwd: dir })) files.push(join(dir, f))
    expect(files.length).toBeGreaterThan(0)
    const start = performance.now()
    await Promise.all(files.map(parseFile))
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(200)
  })
})
