import { pipe } from '@tecnomancy/alchemy/composition'
import { Err, Ok, type Result, flatMap } from '@tecnomancy/alchemy/result'
import { parseMarkdownDocument } from '../ast/from-markdown.js'
import type { DocumentAst } from '../ast/types.js'
import type { Diagnostic } from '../diagnostics.js'
import { loadSpec } from '../semantic/load.js'
import { printBlock } from './block-printer.js'
import { printFrontmatter } from './frontmatter-printer.js'

export const renderDocument = (doc: DocumentAst): string => {
  if (!doc.frontmatter) return doc.raw
  const fm = printFrontmatter(doc.frontmatter.data)
  const body = doc.blocks.map(printBlock).join('\n\n')
  return `${fm}\n${body}\n`
}

export const canonicalizeSource = (
  file: string,
  raw: string,
): Result<{ canonical: string; original: string }, Diagnostic[]> => {
  const summary = parseMarkdownDocument(file, raw)
  if (!summary.hasDelim || summary.frontmatterError !== null || !summary.ast.frontmatter)
    return Err([
      {
        spec_id: null,
        file,
        line: 1,
        rule_id: 'canonical/parse',
        level: 'error',
        message: `cannot canonicalize: ${
          !summary.hasDelim
            ? 'missing frontmatter'
            : (summary.frontmatterError ?? 'frontmatter invalid')
        }`,
      },
    ])
  const loaded = loadSpec(summary.ast)
  if (!loaded.ok) return Err(loaded.error)
  const canonical = renderDocument(summary.ast)
  return Ok({ canonical, original: raw })
}

const verifyIdempotent = (
  file: string,
  r1: { canonical: string; original: string },
): Result<{ fixed: string }, Diagnostic[]> =>
  pipe(
    canonicalizeSource(file, r1.canonical),
    flatMap((r2) =>
      r2.canonical === r1.canonical
        ? Ok({ fixed: r1.canonical })
        : Err([
            {
              spec_id: null,
              file,
              line: 1,
              rule_id: 'canonical/not-fixed-point',
              level: 'error' as const,
              message: 'canonicalize is not idempotent — second pass changed bytes',
            },
          ]),
    ),
  )

export const isFixedPoint = (file: string, raw: string): Result<{ fixed: string }, Diagnostic[]> =>
  pipe(
    canonicalizeSource(file, raw),
    flatMap((r1) => verifyIdempotent(file, r1)),
  )
