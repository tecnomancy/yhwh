// Wave 8 strip test (full retirement):
// Proves the runtime can validate, lint, and canonicalize with the entire
// src/core/schema/_bootstrap/ tree DELETED. Public src/core/schema/index.ts
// already routes everything through _generated/, so the only callers that
// still reach into _bootstrap/ are:
//   - src/core/meta/runtime-schema.ts (RUN_FROM_BOOTSTRAP=1 fallback)
//   - scripts/parity-handwritten-vs-meta.ts + tests/parity.test.ts
// The strip script patches those three files to import from _generated/
// instead, deletes _bootstrap/ entirely, and runs:
//   bun run hwh lint specs/__fixtures__/good/
//   bun run hwh canonicalize specs/__fixtures__/good/ --check
// Both must exit 0. Cleanup the temp dir on success.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const REPO = resolve('.')

const log = (msg: string): void => console.log(`[strip] ${msg}`)

const run = (cmd: string, args: string[], cwd: string): { code: number; out: string } => {
  const r = spawnSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8', env: { ...process.env } })
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

const patchFile = async (
  file: string,
  replacements: { from: string; to: string }[],
): Promise<void> => {
  const original = await readFile(file, 'utf8')
  const patched = replacements.reduce((acc, r) => acc.split(r.from).join(r.to), original)
  await writeFile(file, patched)
}

const main = async (): Promise<number> => {
  const tmp = await mkdtemp(join(tmpdir(), 'yhwh-strip-'))
  log(`copying repo to ${tmp}`)
  await cp(REPO, tmp, {
    recursive: true,
    filter: (src) => !/\b(node_modules|\.git|dist)\b/.test(src),
  })

  const bootstrap = join(tmp, 'src/core/schema/_bootstrap')
  if (!existsSync(bootstrap)) {
    log('no _bootstrap/ in copy; nothing to strip — ABORT')
    return 1
  }

  log('patch runtime-schema.ts to read from _generated/ instead of _bootstrap/')
  await patchFile(join(tmp, 'src/core/meta/runtime-schema.ts'), [
    {
      from: "from '../schema/_bootstrap/index.js'",
      to: "from '../schema/_generated/index.js'",
    },
  ])

  log(
    'patch parity script + test to compare against _generated/ (after strip, parity is trivially OK)',
  )
  await patchFile(join(tmp, 'scripts/parity-handwritten-vs-meta.ts'), [
    {
      from: "from '../src/core/schema/_bootstrap/index.js'",
      to: "from '../src/core/schema/_generated/index.js'",
    },
  ])
  await patchFile(join(tmp, 'tests/parity.test.ts'), [
    {
      from: "from '../src/core/schema/_bootstrap/index.js'",
      to: "from '../src/core/schema/_generated/index.js'",
    },
  ])

  log('rm -rf src/core/schema/_bootstrap/')
  await rm(bootstrap, { recursive: true, force: true })

  log('install (frozen, no scripts — skips husky prepare)')
  const inst = run('bun', ['install', '--frozen-lockfile', '--ignore-scripts'], tmp)
  if (inst.code !== 0) {
    log(`install failed:\n${inst.out}`)
    await rm(tmp, { recursive: true, force: true })
    return 1
  }

  log('run hwh lint specs/__fixtures__/good/')
  const lint = run('bun', ['run', 'src/index.ts', 'lint', 'specs/__fixtures__/good/'], tmp)
  log(lint.out.trim().split('\n').slice(-3).join('\n'))
  if (lint.code !== 0) {
    log(`lint failed exit=${lint.code}\n${lint.out}`)
    await rm(tmp, { recursive: true, force: true })
    return 1
  }

  log('run hwh canonicalize specs/__fixtures__/good/ --check')
  const can = run(
    'bun',
    ['run', 'src/index.ts', 'canonicalize', 'specs/__fixtures__/good/', '--check'],
    tmp,
  )
  log(can.out.trim().split('\n').slice(-3).join('\n'))
  if (can.code !== 0) {
    log(`canonicalize failed exit=${can.code}\n${can.out}`)
    await rm(tmp, { recursive: true, force: true })
    return 1
  }

  log('OK — runtime survives src/core/schema/_bootstrap/ deleted entirely')
  await rm(tmp, { recursive: true, force: true })
  return 0
}

process.exit(await main())
