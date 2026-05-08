import type { Diagnostic } from '../../diagnostics.js'
import type { Graph } from '../../graph.js'

export const checkHarnessDispatchesSkills = (g: Graph): Diagnostic[] =>
  [...g.harnesses.values()].flatMap((h) =>
    h.dispatches
      .filter((sid) => !g.skills.has(sid))
      .map<Diagnostic>((sid) => ({
        spec_id: h.id,
        file: h._file,
        line: 2,
        rule_id: 'cross/harness-skill-not-found',
        level: 'error',
        message: `harness "${h.id}" dispatches unknown skill: ${sid}`,
      })),
  )

export const checkHarnessDispatchUserInvocable = (g: Graph): Diagnostic[] =>
  [...g.harnesses.values()].flatMap((h) =>
    h.dispatches.flatMap<Diagnostic>((sid) => {
      const sk = g.skills.get(sid)
      if (!sk) return []
      return sk.user_invocable
        ? []
        : [
            {
              spec_id: h.id,
              file: h._file,
              line: 2,
              rule_id: 'cross/harness-dispatch-not-invocable',
              level: 'warning',
              message: `harness "${h.id}" dispatches skill "${sid}" with user_invocable=false`,
              suggestion: `set user_invocable: true on skill "${sid}" if it should be triggerable`,
            },
          ]
    }),
  )
