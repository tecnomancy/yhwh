import { describe, expect, test } from 'bun:test'
import type { DocumentAst } from '../src/core/ast/types.js'
import { loadSpec } from '../src/core/semantic/load.js'

const docWithoutFrontmatter = (): DocumentAst => ({
  file: 'test.spec.md',
  raw: '# just a body\n',
  frontmatter: null,
  blocks: [],
})

describe('loadSpec', () => {
  test('returns Err with parse/no-frontmatter when frontmatter is absent', () => {
    const result = loadSpec(docWithoutFrontmatter())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toHaveLength(1)
      expect(result.error[0]?.rule_id).toBe('parse/no-frontmatter')
      expect(result.error[0]?.level).toBe('error')
    }
  })
})
