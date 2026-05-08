import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'

export type MermaidKind =
  | 'flowchart'
  | 'sequenceDiagram'
  | 'stateDiagram'
  | 'stateDiagram-v2'
  | 'erDiagram'
  | 'classDiagram'

export type MermaidEdge = { from: string; to: string; label: string | null }

export type MermaidAst = {
  kind: MermaidKind
  actors: string[]
  states: string[]
  nodes: string[]
  edges: MermaidEdge[]
  raw: string
}

const KIND_HEADERS: { re: RegExp; kind: MermaidKind }[] = [
  { re: /^\s*(flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/m, kind: 'flowchart' },
  { re: /^\s*sequenceDiagram\b/m, kind: 'sequenceDiagram' },
  { re: /^\s*stateDiagram-v2\b/m, kind: 'stateDiagram-v2' },
  { re: /^\s*stateDiagram\b/m, kind: 'stateDiagram' },
  { re: /^\s*erDiagram\b/m, kind: 'erDiagram' },
  { re: /^\s*classDiagram\b/m, kind: 'classDiagram' },
]

const detectKind = (raw: string): MermaidKind | null => {
  const hit = KIND_HEADERS.find(({ re }) => re.test(raw))
  return hit ? hit.kind : null
}

export const detectMermaidKind = (raw: string): MermaidKind | null => detectKind(raw)

const parseSequenceActors = (raw: string): string[] => {
  const declared = [
    ...raw.matchAll(/^\s*(?:participant|actor)\s+([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)/gm),
  ].map((m) => m[1] ?? '')
  const fromMessages = [
    ...raw.matchAll(
      /^\s*([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*-?->>?\s*([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)/gm,
    ),
  ].flatMap((m) => [m[1] ?? '', m[2] ?? ''])
  return Array.from(new Set([...declared, ...fromMessages].filter(Boolean)))
}

const parseSequenceEdges = (raw: string): MermaidEdge[] =>
  [
    ...raw.matchAll(
      /^\s*([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*-?->>?\s*([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*:\s*(.+)$/gm,
    ),
  ].map((m) => ({ from: m[1] ?? '', to: m[2] ?? '', label: (m[3] ?? '').trim() || null }))

const parseFlowchartNodes = (raw: string): string[] => {
  const ids = [
    ...raw.matchAll(/\b([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*(?:\[[^\]]+\]|\([^)]+\))/g),
  ].map((m) => m[1] ?? '')
  const fromEdges = [
    ...raw.matchAll(
      /\b([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*-->\s*([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)/g,
    ),
  ].flatMap((m) => [m[1] ?? '', m[2] ?? ''])
  return Array.from(new Set([...ids, ...fromEdges].filter(Boolean)))
}

const parseFlowchartEdges = (raw: string): MermaidEdge[] =>
  [
    ...raw.matchAll(
      /\b([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*-->\s*(?:\|([^|]+)\|\s*)?([A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)/g,
    ),
  ].map((m) => ({ from: m[1] ?? '', to: m[3] ?? '', label: (m[2] ?? '').trim() || null }))

const parseStateNodes = (raw: string): string[] => {
  const fromEdges = [
    ...raw.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_*\[\]]*)\s*-->\s*([A-Za-z_][A-Za-z0-9_*\[\]]*)/gm),
  ].flatMap((m) => [m[1] ?? '', m[2] ?? ''])
  return Array.from(new Set(fromEdges.filter(Boolean)))
}

const parseStateEdges = (raw: string): MermaidEdge[] =>
  [
    ...raw.matchAll(
      /^\s*([A-Za-z_][A-Za-z0-9_*\[\]]*)\s*-->\s*([A-Za-z_][A-Za-z0-9_*\[\]]*)\s*(?::\s*(.+))?$/gm,
    ),
  ].map((m) => ({ from: m[1] ?? '', to: m[2] ?? '', label: (m[3] ?? '').trim() || null }))

export const parseMermaid = (raw: string): Result<MermaidAst, string> => {
  const kind = detectKind(raw)
  if (!kind)
    return Err(
      'mermaid block has no recognizable header (flowchart/sequenceDiagram/stateDiagram/erDiagram/classDiagram)',
    )

  const base: MermaidAst = { kind, actors: [], states: [], nodes: [], edges: [], raw }

  if (kind === 'sequenceDiagram') {
    return Ok({ ...base, actors: parseSequenceActors(raw), edges: parseSequenceEdges(raw) })
  }
  if (kind === 'flowchart') {
    return Ok({ ...base, nodes: parseFlowchartNodes(raw), edges: parseFlowchartEdges(raw) })
  }
  if (kind === 'stateDiagram' || kind === 'stateDiagram-v2') {
    return Ok({ ...base, states: parseStateNodes(raw), edges: parseStateEdges(raw) })
  }
  return Ok(base)
}
