import type { Diagnostic } from '../../diagnostics.js'
import type { Graph } from '../../graph.js'
import { parseInvariants } from '../../invariants.js'

export const checkEntityInvariants = (g: Graph): Diagnostic[] =>
  [...g.entities.values()].flatMap((entity) => {
    const parsed = parseInvariants(entity.invariants)
    const out: Diagnostic[] = parsed.errors.map((e) => ({
      spec_id: entity.id,
      file: entity._file,
      line: 2,
      rule_id: 'cross/entity-invariant-syntax',
      level: 'error',
      message: `invariant unparseable: ${e.reason}`,
    }))
    for (const inv of parsed.ok) {
      if (!inv.via) continue
      if (inv.via.kind === 'skill' && !g.skills.has(inv.via.id))
        out.push({
          spec_id: entity.id,
          file: entity._file,
          line: 2,
          rule_id: 'cross/entity-invariant-skill-not-found',
          level: 'error',
          message: `entity "${entity.id}" invariant references unknown skill: ${inv.via.id}`,
          suggestion: `add a skill.spec.md with id: ${inv.via.id}, or change "via skill.${inv.via.id}" in: ${inv.raw}`,
        })
      if (inv.via.kind === 'flow' && !g.flows.has(inv.via.id))
        out.push({
          spec_id: entity.id,
          file: entity._file,
          line: 2,
          rule_id: 'cross/entity-invariant-flow-not-found',
          level: 'error',
          message: `entity "${entity.id}" invariant references unknown flow: ${inv.via.id}`,
        })
    }
    return out
  })
