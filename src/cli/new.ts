import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Kind } from '../core/schema/index.js'

const KIND_VALUES: Kind[] = ['agent', 'skill', 'flow', 'entity', 'harness', 'ralph']

const TEMPLATES: Record<Kind, (id: string) => string> = {
  agent: (id) => `---
kind: agent
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — one-line description (10+ chars).
tools: [Read]
model: sonnet
---

# ${id}

TODO — system prompt body. Describe role, mandate, when to invoke.
`,
  skill: (id) => `---
kind: skill
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — what this skill does (10+ chars).
argument_hint: "[arg]"
user_invocable: true
requires_agents: []
requires_tools: []
---

# ${id}

TODO — bash steps or skill instructions.
`,
  flow: (id) => `---
kind: flow
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — narrative summary of the flow (10+ chars).
actors: []
triggers: []
next: []
---

# ${id}

\`\`\`mermaid
sequenceDiagram
  participant alice
  participant bob
  alice->>bob: trigger
  bob-->>alice: ack
\`\`\`

TODO — explain when each branch fires.
`,
  entity: (id) => `---
kind: entity
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — domain entity description (10+ chars).
fields:
  - { name: id, type: string }
invariants: []
---

# ${id}

TODO — invariants, transitions, ER diagram.
`,
  harness: (id) => `---
kind: harness
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — what this harness orchestrates (10+ chars).
dispatches: []
state_file: .hwh/${id}.json
gates: []
---

# ${id}

TODO — when triggered, what it dispatches, gate criteria.
`,
  ralph: (id) => `---
kind: ralph
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — auto-loop description (10+ chars).
cadence_min: 5
tick_skill: TODO
report_skills: []
pause_flag_path: /tmp/${id}.paused
---

# ${id}

TODO — tick prompt template.
`,
  project: (id) => `---
kind: project
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — high-level description of this project (10+ chars).
canonical_spec: specs/${id}.spec.md
inputs: []
validators: []
generators: []
commands: []
waves_state_file: .wave/state.json
---

# ${id}

TODO — what this project is, what it produces, who consumes it.
`,
  'meta-spec': (id) => `---
kind: meta-spec
id: ${id}
version: 0.1.0
status: draft
owner: TODO
tags: []
description: TODO — what kind this meta-spec describes (10+ chars).
target_kind: TODO
fields: []
body_layout: []
cross_refs: []
examples: []
---

# ${id}

TODO — describe the kind, its fields, body layout, and cross-references.
`,
}

const isKind = (s: string): s is Kind => (KIND_VALUES as string[]).includes(s)

export const runNew = async (args: string[]): Promise<number> => {
  const force = args.includes('--force')
  const positional = args.filter((a) => !a.startsWith('--'))
  const [kindArg, id, ...extra] = positional
  if (!kindArg || !id || extra.length > 0) {
    console.error('usage: hwh new <kind> <id> [--force]')
    console.error(`kinds: ${KIND_VALUES.join(' | ')}`)
    return 2
  }
  if (!isKind(kindArg)) {
    console.error(`unknown kind: ${kindArg}. valid: ${KIND_VALUES.join(' | ')}`)
    return 2
  }
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    console.error('id must be kebab-case lowercase, start with a letter')
    return 2
  }
  const target = resolve(`specs/${kindArg}.${id}.spec.md`)
  if (existsSync(target) && !force) {
    console.error(`refuse to overwrite ${target} — pass --force`)
    return 1
  }
  await mkdir(dirname(target), { recursive: true })
  await Bun.write(target, TEMPLATES[kindArg](id))
  console.log(`created ${target}`)
  return 0
}
