#!/usr/bin/env bun
import { runApply } from './cli/apply.js'
import { runBuild } from './cli/build.js'
import { runCanonicalize } from './cli/canonicalize.js'
import { runCodegenTs } from './cli/codegen-ts.js'
import { runDoctor } from './cli/doctor.js'
import { runLint } from './cli/lint.js'
import { runNew } from './cli/new.js'
import { runWatch } from './cli/watch.js'
import { runWave } from './cli/wave.js'

const HELP = `hwh — yhwh CLI (Hydrate · Weave · Hatch)

usage:
  hwh lint         <path...> [--json]              validate spec markdown files
  hwh build        <path...> [--codegen] [--force] emit dist/registry + dist/types (+ codegen)
  hwh new          <kind> <id> [--force]           scaffold a spec template
  hwh watch        <path...> [--debounce-ms N]     re-lint on change, write dist/diagnostics.json
  hwh apply        [--apply]                       write dist/codegen/* to ~/.claude/ (idempotent)
  hwh doctor       [<path>...]                     diff specs vs ~/.claude/ artefacts
  hwh canonicalize <path...> [--check | --write]   render markdown from semantic model (fixed-point)
  hwh codegen-ts   [--dry-run]                     emit src/core/schema/_generated/<kind>.ts from meta-specs
  hwh wave         [status | next | tick [N]]      SDD wave coordination
  hwh --help                                       show this help
`

const main = async (): Promise<number> => {
  const [, , cmd, ...rest] = process.argv
  switch (cmd) {
    case 'lint':
      return await runLint(rest)
    case 'build':
      return await runBuild(rest)
    case 'new':
      return await runNew(rest)
    case 'watch':
      return await runWatch(rest)
    case 'apply':
      return await runApply(rest)
    case 'doctor':
      return await runDoctor(rest)
    case 'wave':
      return await runWave(rest)
    case 'canonicalize':
      return await runCanonicalize(rest)
    case 'codegen-ts':
      return await runCodegenTs(rest)
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP)
      return 0
    default:
      console.error(`unknown command: ${cmd}\n`)
      console.error(HELP)
      return 2
  }
}

process.exit(await main())
