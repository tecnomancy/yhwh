import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import {
  countProgress,
  currentWave,
  loadState,
  progressPath,
  renderTemplate,
} from '../core/wave.js'

const status = async (): Promise<number> => {
  const state = await loadState()
  console.log(`canonical: ${state.canonicalSpec}`)
  console.log(`generated: ${state.generatedAt}`)
  console.log()
  for (const w of state.waves) {
    const tag =
      w.status === 'done'
        ? '[done]      '
        : w.status === 'in_progress'
          ? '[in_progress]'
          : '[pending]   '
    const p = await countProgress(w.number)
    const progressBit = p.missing
      ? '(no progress file)'
      : `${p.done}/${p.total} acceptance items checked`
    console.log(`  ${tag} wave ${w.number} — ${w.name}`)
    console.log(`              ${progressBit}`)
  }
  const cur = currentWave(state)
  console.log()
  if (!cur) {
    console.log('all waves shipped. nothing to do.')
    return 0
  }
  console.log(`current: wave ${cur.number} (${cur.status}) — ${cur.name}`)
  return 0
}

const next = async (): Promise<number> => {
  const state = await loadState()
  const cur = currentWave(state)
  if (!cur) {
    console.log('all waves shipped.')
    return 0
  }
  const path = progressPath(cur.number)
  if (existsSync(path)) {
    console.log(`wave ${cur.number} progress file already exists: ${path}`)
    const p = await countProgress(cur.number)
    console.log(`  ${p.done}/${p.total} ticked`)
    return 0
  }
  await writeFile(path, renderTemplate(cur.number, cur))
  console.log(`bootstrapped ${path} (${cur.acceptance.length} acceptance items)`)
  return 0
}

const tick = async (args: string[]): Promise<number> => {
  const arg = args[0]
  const state = await loadState()
  const target = arg ? state.waves.find((w) => w.number === Number(arg)) : currentWave(state)
  if (!target) {
    console.error(`no wave matches ${arg ?? '<current>'}`)
    return 1
  }
  const p = await countProgress(target.number)
  if (p.missing) {
    console.error(`no progress file for wave ${target.number} — run hwh wave next`)
    return 1
  }
  console.log(`wave ${target.number} — ${target.name}`)
  console.log(
    `  ${p.done}/${p.total} acceptance items ticked (${Math.round((p.done / Math.max(p.total, 1)) * 100)}%)`,
  )
  if (p.done === p.total && p.total > 0)
    console.log(`  ALL DONE → run validation: ${target.validation}`)
  return 0
}

export const runWave = async (args: string[]): Promise<number> => {
  const sub = args[0] ?? 'status'
  switch (sub) {
    case 'status':
      return status()
    case 'next':
      return next()
    case 'tick':
      return tick(args.slice(1))
    default:
      console.error(`unknown subcommand: ${sub}`)
      console.error('usage: hwh wave [status | next | tick [N]]')
      return 2
  }
}
