import type { z } from 'zod'
import type { Diagnostic } from '../diagnostics.js'
import { getCachedSpecSchema } from '../meta/runtime-schema.js'
import type { ParsedSpec } from '../parse.js'
import { Envelope } from '../schema/_generated/envelope.js'
import type { Spec } from '../schema/index.js'

export type SchemaResult = { spec: Spec | null; diagnostics: Diagnostic[] }

const issueToDiagnostic = (
  spec_id: string | null,
  file: string,
  rule_prefix: string,
  iss: z.ZodIssue,
): Diagnostic => ({
  spec_id,
  file,
  line: 2,
  rule_id: `schema/${rule_prefix}/${iss.path.join('.') || '<root>'}`,
  level: 'error',
  message: iss.message,
})

export const validateSchema = (parsed: ParsedSpec): SchemaResult => {
  const fm = parsed.frontmatter
  if (!fm) {
    return {
      spec: null,
      diagnostics: [
        {
          spec_id: null,
          file: parsed.file,
          line: 1,
          rule_id: 'schema/missing-frontmatter',
          level: 'error',
          message: 'frontmatter required',
        },
      ],
    }
  }

  const env = Envelope.partial({ tags: true }).safeParse(fm)
  const candidateId = typeof fm.id === 'string' ? fm.id : null

  if (!env.success) {
    return {
      spec: null,
      diagnostics: env.error.issues.map((iss) =>
        issueToDiagnostic(candidateId, parsed.file, 'envelope', iss),
      ),
    }
  }

  const schema = getCachedSpecSchema()
  const full = schema.safeParse(fm)
  if (!full.success) {
    return {
      spec: null,
      diagnostics: full.error.issues.map((iss: z.ZodIssue) =>
        issueToDiagnostic(candidateId, parsed.file, env.data.kind, iss),
      ),
    }
  }
  return { spec: full.data as Spec, diagnostics: [] }
}
