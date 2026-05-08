import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { formatHuman, hasError, sortDiagnostics } from '../core/diagnostics.js'
import { renderAgentMd, renderSkillMd } from '../core/emit/codegen.js'
import { buildRegistryJson, emitRegistryTs } from '../core/emit/registry.js'
import { TYPES_TS } from '../core/emit/types.js'
import { buildGraph } from '../core/graph.js'
import { lintPaths } from '../core/lint.js'

const DIST = resolve('dist')

const writeFile = async (path: string, content: string): Promise<void> => {
  await mkdir(resolve(path, '..'), { recursive: true })
  await Bun.write(path, content)
}

export const runBuild = async (args: string[]): Promise<number> => {
  const codegen = args.includes('--codegen')
  const force = args.includes('--force')
  const paths = args.filter((a) => !a.startsWith('--'))
  if (paths.length === 0) {
    console.error('usage: hwh build <path...> [--codegen] [--force]')
    return 2
  }

  const report = await lintPaths(paths)
  const sorted = sortDiagnostics(report.diagnostics)

  if (hasError(sorted) && !force) {
    for (const d of sorted) {
      console.error(formatHuman(d))
    }
    console.error(`\nbuild aborted: ${sorted.length} diagnostic(s). use --force to emit anyway.`)
    return 1
  }

  const graph = buildGraph([...report.specs.values()])
  const json = buildRegistryJson(graph)

  await writeFile(join(DIST, 'registry.json'), JSON.stringify(json, null, 2))
  await writeFile(join(DIST, 'registry.ts'), emitRegistryTs(json))
  await writeFile(join(DIST, 'types.ts'), TYPES_TS)

  console.log(`emitted dist/registry.json (${graph.byId.size} specs)`)
  console.log('emitted dist/registry.ts')
  console.log('emitted dist/types.ts')

  if (codegen) {
    const agentWrites = [...graph.agents.values()].map((agent) => {
      const body = report.specs.get(agent.id)?.parsed.body ?? ''
      return writeFile(
        join(DIST, 'codegen', 'agents', `${agent.id}.md`),
        renderAgentMd(agent, body),
      )
    })
    const skillWrites = [...graph.skills.values()].map((skill) => {
      const body = report.specs.get(skill.id)?.parsed.body ?? ''
      return writeFile(
        join(DIST, 'codegen', 'skills', skill.id, 'SKILL.md'),
        renderSkillMd(skill, body),
      )
    })
    await Promise.all([...agentWrites, ...skillWrites])
    const count = graph.agents.size + graph.skills.size
    console.log(`emitted dist/codegen/{agents,skills} — ${count} artefact(s)`)
  }

  return hasError(sorted) ? 1 : 0
}
