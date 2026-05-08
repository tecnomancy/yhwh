import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export type WaveStatus = 'pending' | 'in_progress' | 'done'

export type Wave = {
  number: number
  name: string
  goal: string
  status: WaveStatus
  acceptance: string[]
  validation: string
  shipped_at?: string
}

export type State = {
  generatedAt: string
  canonicalSpec: string
  waves: Wave[]
}

export const STATE_FILE = resolve('.wave', 'state.json')

const PROGRESS_RE = (n: number): string => join(resolve('.wave'), `wave-${n}-progress.md`)

export const loadState = async (): Promise<State> => {
  if (!existsSync(STATE_FILE)) throw new Error(`no .wave/state.json at ${STATE_FILE}`) // alchemy-exempt: fatal config error, fast-fail with stack
  const raw = await readFile(STATE_FILE, 'utf8')
  return JSON.parse(raw) as State
}

export const countProgress = async (
  n: number,
): Promise<{ done: number; total: number; missing: boolean }> => {
  const file = PROGRESS_RE(n)
  if (!existsSync(file)) return { done: 0, total: 0, missing: true }
  const raw = await readFile(file, 'utf8')
  const total = (raw.match(/^- \[[ x]\] /gm) ?? []).length
  const done = (raw.match(/^- \[x\] /gm) ?? []).length
  return { done, total, missing: false }
}

export const currentWave = (state: State): Wave | null => {
  const next = state.waves.find((w) => w.status !== 'done')
  return next ?? null
}

export const progressPath = (n: number): string => PROGRESS_RE(n)

export const renderTemplate = (n: number, w: Wave): string => {
  const checkboxes = w.acceptance.map((a) => `- [ ] ${a}`).join('\n')
  return `# Wave ${n} progress — ${w.name}

Coder flips \`- [ ]\` → \`- [x]\` after each acceptance criterion ships. \`hwh wave status\` counts remaining. When all ticked, run validation per \`.wave/state.json\`, then commit \`feat(wave-${n}): ${w.name}\` and flip wave ${n} status to \`done\`.

${checkboxes}

## Notes

(empty — fill as work progresses)
`
}
