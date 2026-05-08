import type { ParsedSpec } from './parse.js'
import type {
  AgentSpec,
  EntitySpec,
  FlowSpec,
  HarnessSpec,
  MetaSpec,
  ProjectSpec,
  RalphSpec,
  SkillSpec,
  Spec,
} from './schema/index.js'

export type SpecEntry = { parsed: ParsedSpec; spec: Spec }

export type Graph = {
  byId: Map<string, SpecEntry>
  agents: Map<string, AgentSpec & { _file: string }>
  skills: Map<string, SkillSpec & { _file: string }>
  flows: Map<string, FlowSpec & { _file: string }>
  entities: Map<string, EntitySpec & { _file: string }>
  harnesses: Map<string, HarnessSpec & { _file: string }>
  ralphs: Map<string, RalphSpec & { _file: string }>
  projects: Map<string, ProjectSpec & { _file: string }>
  metaSpecs: Map<string, MetaSpec & { _file: string }>
}

const registerEntry =
  (g: Graph) =>
  (e: SpecEntry): void => {
    g.byId.set(e.spec.id, e)
    const tagged = { ...e.spec, _file: e.parsed.file }
    if (e.spec.kind === 'agent') g.agents.set(e.spec.id, tagged as AgentSpec & { _file: string })
    if (e.spec.kind === 'skill') g.skills.set(e.spec.id, tagged as SkillSpec & { _file: string })
    if (e.spec.kind === 'flow') g.flows.set(e.spec.id, tagged as FlowSpec & { _file: string })
    if (e.spec.kind === 'entity')
      g.entities.set(e.spec.id, tagged as EntitySpec & { _file: string })
    if (e.spec.kind === 'harness')
      g.harnesses.set(e.spec.id, tagged as HarnessSpec & { _file: string })
    if (e.spec.kind === 'ralph') g.ralphs.set(e.spec.id, tagged as RalphSpec & { _file: string })
    if (e.spec.kind === 'project')
      g.projects.set(e.spec.id, tagged as ProjectSpec & { _file: string })
    if (e.spec.kind === 'meta-spec')
      g.metaSpecs.set(e.spec.id, tagged as MetaSpec & { _file: string })
  }

export const buildGraph = (entries: SpecEntry[]): Graph => {
  const g: Graph = {
    byId: new Map(),
    agents: new Map(),
    skills: new Map(),
    flows: new Map(),
    entities: new Map(),
    harnesses: new Map(),
    ralphs: new Map(),
    projects: new Map(),
    metaSpecs: new Map(),
  }
  entries.forEach(registerEntry(g))
  return g
}
