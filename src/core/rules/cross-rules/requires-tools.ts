import type { Diagnostic } from '../../diagnostics.js'
import type { Graph } from '../../graph.js'

export const checkSkillRequiredAgents = (g: Graph): Diagnostic[] =>
  [...g.skills.values()].flatMap((skill) => {
    const missing = skill.requires_agents.filter((a) => !g.agents.has(a))
    return missing.map<Diagnostic>((a) => ({
      spec_id: skill.id,
      file: skill._file,
      line: 2,
      rule_id: 'cross/skill-agent-not-found',
      level: 'error',
      message: `skill "${skill.id}" requires unknown agent: ${a}`,
    }))
  })

export const checkSkillToolsSubsetOfAgents = (g: Graph): Diagnostic[] =>
  [...g.skills.values()].flatMap((skill) => {
    if (skill.requires_agents.length === 0 || skill.requires_tools.length === 0) return []
    const requiredTools = new Set(skill.requires_tools)
    return skill.requires_agents.flatMap<Diagnostic>((aid) => {
      const agent = g.agents.get(aid)
      if (!agent) return []
      const ownedTools = new Set(agent.tools)
      const missing = [...requiredTools].filter((t) => !ownedTools.has(t))
      return missing.map<Diagnostic>((t) => ({
        spec_id: skill.id,
        file: skill._file,
        line: 2,
        rule_id: 'cross/skill-tool-not-on-agent',
        level: 'error',
        message: `skill "${skill.id}" requires tool "${t}" not granted to agent "${aid}"`,
        suggestion: `either add "${t}" to ${aid}.tools, or drop "${t}" from skill.requires_tools`,
      }))
    })
  })
