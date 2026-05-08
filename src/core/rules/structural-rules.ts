import type { Diagnostic } from '../diagnostics.js'
import { parseMermaid } from '../mermaid.js'
import type { ParsedSpec } from '../parse.js'
import type { Spec } from '../schema/index.js'

const HEADING_RE = /^#\s+\S/m

export const checkBodyHasHeading = (parsed: ParsedSpec, spec: Spec): Diagnostic[] =>
  HEADING_RE.test(parsed.body)
    ? []
    : [
        {
          spec_id: spec.id,
          file: parsed.file,
          line: parsed.bodyStartLine,
          rule_id: 'structural/missing-heading',
          level: 'warning',
          message: 'spec body should have at least one `# Heading`',
        },
      ]

export const checkUnclosedFences = (parsed: ParsedSpec, spec: Spec): Diagnostic[] => {
  const lines = parsed.body.split('\n')
  const opens = lines.filter((l) => /^```/.test(l)).length
  return opens % 2 === 0
    ? []
    : [
        {
          spec_id: spec.id,
          file: parsed.file,
          line: parsed.bodyStartLine,
          rule_id: 'structural/unclosed-code-fence',
          level: 'error',
          message: 'odd number of ``` fences in body — at least one is unclosed',
        },
      ]
}

export const checkMermaidBlocks = (parsed: ParsedSpec, spec: Spec): Diagnostic[] =>
  parsed.mermaidBlocks.flatMap((block) => {
    const r = parseMermaid(block.content)
    return r.ok
      ? []
      : [
          {
            spec_id: spec.id,
            file: parsed.file,
            line: block.line,
            rule_id: 'structural/mermaid-invalid',
            level: 'error' as const,
            message: r.error,
          },
        ]
  })

export const checkFlowMermaidRequired = (parsed: ParsedSpec, spec: Spec): Diagnostic[] =>
  spec.kind === 'flow' && parsed.mermaidBlocks.length === 0
    ? [
        {
          spec_id: spec.id,
          file: parsed.file,
          line: parsed.bodyStartLine,
          rule_id: 'structural/flow-needs-mermaid',
          level: 'error',
          message:
            'flow specs must include at least one mermaid diagram (sequence/flowchart/state)',
        },
      ]
    : []

export const checkFlowActorsMatchMermaid = (parsed: ParsedSpec, spec: Spec): Diagnostic[] => {
  if (spec.kind !== 'flow' || parsed.mermaidBlocks.length === 0) return []
  const block = parsed.mermaidBlocks[0]
  if (!block) return []
  const r = parseMermaid(block.content)
  if (!r.ok || r.value.kind !== 'sequenceDiagram') return []
  const declared = new Set(spec.actors)
  const inDiagram = new Set(r.value.actors)
  const missing = [...inDiagram].filter((a) => !declared.has(a))
  return missing.length === 0
    ? []
    : [
        {
          spec_id: spec.id,
          file: parsed.file,
          line: block.line,
          rule_id: 'structural/flow-actor-not-declared',
          level: 'warning',
          message: `mermaid actors not declared in frontmatter.actors: ${missing.join(', ')}`,
          suggestion: `add to frontmatter.actors: [${[...declared, ...missing].join(', ')}]`,
        },
      ]
}

export const validateStructural = (parsed: ParsedSpec, spec: Spec): Diagnostic[] => [
  ...checkBodyHasHeading(parsed, spec),
  ...checkUnclosedFences(parsed, spec),
  ...checkMermaidBlocks(parsed, spec),
  ...checkFlowMermaidRequired(parsed, spec),
  ...checkFlowActorsMatchMermaid(parsed, spec),
]
