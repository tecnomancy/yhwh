import type { Diagnostic } from '../../diagnostics.js'
import type { Graph } from '../../graph.js'

const ralphTickDiag = (r: { id: string; _file: string; tick_skill: string }): Diagnostic[] => [
  {
    spec_id: r.id,
    file: r._file,
    line: 2,
    rule_id: 'cross/ralph-tick-not-found',
    level: 'error' as const,
    message: `ralph "${r.id}" tick_skill "${r.tick_skill}" not registered`,
  },
]

const ralphReportDiag = (r: { id: string; _file: string }, s: string): Diagnostic => ({
  spec_id: r.id,
  file: r._file,
  line: 2,
  rule_id: 'cross/ralph-report-not-found',
  level: 'error',
  message: `ralph "${r.id}" report skill "${s}" not registered`,
})

export const checkRalphTickAndReports = (g: Graph): Diagnostic[] =>
  [...g.ralphs.values()].flatMap((r) => [
    ...(g.skills.has(r.tick_skill) ? [] : ralphTickDiag(r)),
    ...r.report_skills.filter((s) => !g.skills.has(s)).map((s) => ralphReportDiag(r, s)),
  ])
