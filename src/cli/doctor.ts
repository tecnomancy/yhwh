import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { buildGraph } from '../core/graph.js'
import { lintPaths } from '../core/lint.js'

const HWH_MARKER = 'hwh:managed'
const HOME_AGENTS = resolve(homedir(), '.claude', 'agents')
const HOME_SKILLS = resolve(homedir(), '.claude', 'skills')

type Drift = {
  kind: 'orphan' | 'missing' | 'unmanaged'
  artifact: 'agent' | 'skill'
  id: string
  detail: string
}

const idsFromAgentsDir = async (): Promise<{ id: string; managed: boolean }[]> => {
  if (!existsSync(HOME_AGENTS)) return []
  const files = (await readdir(HOME_AGENTS)).filter((f) => f.endsWith('.md'))
  return Promise.all(
    files.map(async (f) => {
      const content = await readFile(join(HOME_AGENTS, f), 'utf8')
      return { id: f.replace(/\.md$/, ''), managed: content.includes(HWH_MARKER) }
    }),
  )
}

const idsFromSkillsDir = async (): Promise<{ id: string; managed: boolean }[]> => {
  if (!existsSync(HOME_SKILLS)) return []
  const dirs = await readdir(HOME_SKILLS)
  const candidates = await Promise.all(
    dirs.map(async (d) => {
      const skillFile = join(HOME_SKILLS, d, 'SKILL.md')
      if (!existsSync(skillFile)) return null
      const content = await readFile(skillFile, 'utf8')
      return { id: d, managed: content.includes(HWH_MARKER) }
    }),
  )
  return candidates.filter((c): c is { id: string; managed: boolean } => c !== null)
}

export const runDoctor = async (args: string[]): Promise<number> => {
  const paths = args.filter((a) => !a.startsWith('--'))
  const lintTarget = paths.length > 0 ? paths : ['specs/lib/']

  const report = await lintPaths(lintTarget)
  const graph = buildGraph([...report.specs.values()])
  const expectedAgents = new Set(graph.agents.keys())
  const expectedSkills = new Set(graph.skills.keys())

  const onDiskAgents = await idsFromAgentsDir()
  const onDiskSkills = await idsFromSkillsDir()

  const drifts: Drift[] = []

  for (const id of expectedAgents) {
    const found = onDiskAgents.find((d) => d.id === id)
    if (!found)
      drifts.push({
        kind: 'missing',
        artifact: 'agent',
        id,
        detail: `~/.claude/agents/${id}.md absent`,
      })
  }
  for (const id of expectedSkills) {
    const found = onDiskSkills.find((d) => d.id === id)
    if (!found)
      drifts.push({
        kind: 'missing',
        artifact: 'skill',
        id,
        detail: `~/.claude/skills/${id}/SKILL.md absent`,
      })
  }
  for (const d of onDiskAgents) {
    if (!d.managed) continue
    if (!expectedAgents.has(d.id))
      drifts.push({
        kind: 'orphan',
        artifact: 'agent',
        id: d.id,
        detail: 'managed file in ~/.claude/ has no spec',
      })
  }
  for (const d of onDiskSkills) {
    if (!d.managed) continue
    if (!expectedSkills.has(d.id))
      drifts.push({
        kind: 'orphan',
        artifact: 'skill',
        id: d.id,
        detail: 'managed dir in ~/.claude/ has no spec',
      })
  }
  for (const d of onDiskAgents) {
    if (d.managed) continue
    if (expectedAgents.has(d.id))
      drifts.push({
        kind: 'unmanaged',
        artifact: 'agent',
        id: d.id,
        detail: 'spec exists but ~/.claude/ file is user-edited (no marker)',
      })
  }

  console.log(
    `scanned ${report.specs.size} spec(s) (${expectedAgents.size} agents, ${expectedSkills.size} skills)`,
  )
  console.log(
    `scanned ${onDiskAgents.length} agent file(s) and ${onDiskSkills.length} skill dir(s) in ~/.claude/`,
  )
  if (drifts.length === 0) {
    console.log('no drift detected. healthy.')
    return 0
  }

  for (const d of drifts) {
    console.log(`[${d.kind.toUpperCase()}]   ${d.artifact} ${d.id}\n             ${d.detail}`)
  }
  console.log(`\n${drifts.length} drift(s).`)
  return drifts.some((d) => d.kind !== 'unmanaged') ? 1 : 0
}
