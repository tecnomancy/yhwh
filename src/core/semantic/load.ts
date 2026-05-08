import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'
import type { DocumentAst } from '../ast/types.js'
import type { Diagnostic } from '../diagnostics.js'
import { type Spec, SpecSchema } from '../schema/index.js'

export type Loaded = { spec: Spec; doc: DocumentAst }

export const loadSpec = (doc: DocumentAst): Result<Loaded, Diagnostic[]> => {
  if (!doc.frontmatter)
    return Err([
      {
        spec_id: null,
        file: doc.file,
        line: 1,
        rule_id: 'parse/no-frontmatter',
        level: 'error',
        message: 'spec is missing YAML frontmatter (must start with `---` on line 1)',
      },
    ])
  const parsed = SpecSchema.safeParse(doc.frontmatter.data)
  if (!parsed.success) {
    const candidateId = typeof doc.frontmatter.data.id === 'string' ? doc.frontmatter.data.id : null
    const kindStr =
      typeof doc.frontmatter.data.kind === 'string' ? doc.frontmatter.data.kind : 'envelope'
    return Err(
      parsed.error.issues.map<Diagnostic>((iss) => ({
        spec_id: candidateId,
        file: doc.file,
        line: 2,
        rule_id: `schema/${kindStr}/${iss.path.join('.') || '<root>'}`,
        level: 'error',
        message: iss.message,
      })),
    )
  }
  return Ok({ spec: parsed.data as Spec, doc })
}
