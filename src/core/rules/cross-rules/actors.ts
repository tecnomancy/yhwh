import type { Diagnostic } from '../../diagnostics.js'
import type { Graph } from '../../graph.js'

export const checkFlowActorsExist = (g: Graph): Diagnostic[] =>
  [...g.flows.values()].flatMap((flow) => {
    const missing = flow.actors.filter((a) => !g.agents.has(a))
    return missing.map<Diagnostic>((a) => ({
      spec_id: flow.id,
      file: flow._file,
      line: 2,
      rule_id: 'cross/flow-actor-not-found',
      level: 'error',
      message: `flow "${flow.id}" references unknown agent: ${a}`,
      suggestion: `add an agent.spec.md with id: ${a}, or remove from actors`,
    }))
  })

export const checkFlowNextNoCycles = (g: Graph): Diagnostic[] => {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const out: Diagnostic[] = []
  const dfs = (id: string, path: string[]): void => {
    if (visited.has(id)) return
    if (visiting.has(id)) {
      const flow = g.flows.get(id)
      if (flow)
        out.push({
          spec_id: id,
          file: flow._file,
          line: 2,
          rule_id: 'cross/flow-cycle',
          level: 'error',
          message: `flow cycle detected: ${[...path, id].join(' -> ')}`,
        })
      return
    }
    visiting.add(id)
    const flow = g.flows.get(id)
    if (flow) {
      for (const n of flow.next) dfs(n, [...path, id])
    }
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of g.flows.keys()) dfs(id, [])
  return out
}
