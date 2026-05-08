import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const HWH_MARKER = 'hwh:managed'

const HOME_AGENTS = resolve(homedir(), '.claude', 'agents')
const HOME_SKILLS = resolve(homedir(), '.claude', 'skills')
const SRC_AGENTS = resolve('dist', 'codegen', 'agents')
const SRC_SKILLS = resolve('dist', 'codegen', 'skills')

type Action = 'create' | 'overwrite' | 'skip-no-marker' | 'skip-unchanged'

type Plan = { src: string; dst: string; action: Action; reason: string }

const planFile = async (src: string, dst: string): Promise<Plan> => {
  const newContent = await readFile(src, 'utf8')
  if (!existsSync(dst)) return { src, dst, action: 'create', reason: 'no existing file' }
  const existing = await readFile(dst, 'utf8')
  if (!existing.includes(HWH_MARKER))
    return {
      src,
      dst,
      action: 'skip-no-marker',
      reason: 'existing file lacks hwh:managed marker (user-edited)',
    }
  if (existing === newContent)
    return { src, dst, action: 'skip-unchanged', reason: 'identical content' }
  return { src, dst, action: 'overwrite', reason: 'managed file diverged from spec' }
}

const planAgents = async (): Promise<Plan[]> => {
  if (!existsSync(SRC_AGENTS)) return []
  const files = (await readdir(SRC_AGENTS)).filter((f) => f.endsWith('.md'))
  return Promise.all(files.map((f) => planFile(join(SRC_AGENTS, f), join(HOME_AGENTS, f))))
}

const planSkills = async (): Promise<Plan[]> => {
  if (!existsSync(SRC_SKILLS)) return []
  const dirs = await readdir(SRC_SKILLS)
  return Promise.all(
    dirs.map((d) => planFile(join(SRC_SKILLS, d, 'SKILL.md'), join(HOME_SKILLS, d, 'SKILL.md'))),
  )
}

const formatAction = (a: Action): string =>
  ({
    create: '[CREATE]',
    overwrite: '[OVERWRITE]',
    'skip-no-marker': '[SKIP]    ',
    'skip-unchanged': '[NOOP]    ',
  })[a]

export const runApply = async (args: string[]): Promise<number> => {
  const apply = args.includes('--apply')
  if (!existsSync(SRC_AGENTS) && !existsSync(SRC_SKILLS)) {
    console.error('no codegen found. run `hwh build <path> --codegen` first.')
    return 2
  }
  const plans = [...(await planAgents()), ...(await planSkills())]
  if (plans.length === 0) {
    console.log('nothing to apply.')
    return 0
  }

  for (const p of plans) {
    console.log(`${formatAction(p.action)} ${p.dst}\n             ${p.reason}`)
  }

  const willWrite = plans.filter((p) => p.action === 'create' || p.action === 'overwrite')
  console.log(
    `\n${plans.length} planned, ${willWrite.length} would write, ${plans.length - willWrite.length} skipped.`,
  )

  if (!apply) {
    console.log('\ndry-run (default). re-run with --apply to write to ~/.claude/.')
    return 0
  }

  await Promise.all(
    willWrite.map(async (p) => {
      await mkdir(resolve(p.dst, '..'), { recursive: true })
      await writeFile(p.dst, await readFile(p.src, 'utf8'))
    }),
  )
  console.log(`\nwrote ${willWrite.length} file(s) to ~/.claude/`)
  return 0
}
