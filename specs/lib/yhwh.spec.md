---
kind: project
id: yhwh
version: 1.0.0
status: active
owner: example
tags:
  - yhwh
  - y-hydrate-weave-hatch
  - tecnomancy
  - self-hosting
  - bootstrap-complete
  - bootstrap-complete-physical
  - bootstrap-complete-source
description: yhwh — a self-referential build model implementing the four phases Y · Hydrate · Weave · Hatch. Markdown specs hydrate into a typed semantic model, weave into a validated graph, and hatch into runtime artefacts. The Y phase is a typed metacircular fixed point proven byte-stable across sandboxes (see docs/SELF-HOST-PROOF.md). The CLI binary is `hwh` — the operational tool that drives the model.
canonical_spec: specs/lib/yhwh.spec.md
inputs:
  - id: prod-specs
    glob: specs/lib/**/*.spec.md
    kinds:
      - agent
      - skill
      - flow
      - entity
      - harness
      - ralph
      - project
  - id: meta-specs
    glob: meta-specs/**/*.spec.md
    kinds:
      - meta-spec
      - project
  - id: fixtures-good
    glob: specs/__fixtures__/good/**/*.spec.md
    kinds:
      - agent
      - skill
      - flow
      - entity
      - harness
      - ralph
validators:
  - id: parse/no-frontmatter
    layer: syntax
  - id: parse/yaml-invalid
    layer: syntax
  - id: parse/frontmatter-shape
    layer: syntax
  - id: parse/io
    layer: syntax
  - id: structural/missing-heading
    layer: structural
  - id: structural/unclosed-code-fence
    layer: structural
  - id: structural/mermaid-invalid
    layer: structural
  - id: structural/flow-needs-mermaid
    layer: structural
  - id: structural/flow-actor-not-declared
    layer: structural
  - id: schema/envelope
    layer: semantic
  - id: schema/agent
    layer: semantic
  - id: schema/skill
    layer: semantic
  - id: schema/flow
    layer: semantic
  - id: schema/entity
    layer: semantic
  - id: schema/harness
    layer: semantic
  - id: schema/ralph
    layer: semantic
  - id: schema/project
    layer: semantic
  - id: schema/meta-spec
    layer: semantic
  - id: cross/duplicate-id
    layer: cross
  - id: cross/flow-actor-not-found
    layer: cross
  - id: cross/skill-agent-not-found
    layer: cross
  - id: cross/skill-tool-not-on-agent
    layer: cross
  - id: cross/harness-skill-not-found
    layer: cross
  - id: cross/harness-dispatch-not-invocable
    layer: cross
  - id: cross/ralph-tick-not-found
    layer: cross
  - id: cross/ralph-report-not-found
    layer: cross
  - id: cross/flow-cycle
    layer: cross
  - id: cross/entity-invariant-syntax
    layer: cross
  - id: cross/entity-invariant-skill-not-found
    layer: cross
  - id: cross/entity-invariant-flow-not-found
    layer: cross
  - id: canonical/parse
    layer: fixed-point
  - id: canonical/not-fixed-point
    layer: fixed-point
generators:
  - id: registry-json
    consumes: graph
    output_path: dist/registry.json
    description: JSON dump of all parsed specs by id and by_kind
  - id: registry-ts
    consumes: graph
    output_path: dist/registry.ts
    description: Typed const literal of registry, satisfies Record<string, Spec>
  - id: types-ts
    consumes: spec
    output_path: dist/types.ts
    description: Re-export of Spec union and per-kind types
  - id: agent-md
    consumes: spec
    output_path: dist/codegen/agents/<id>.md
    description: Agent in Claude Code format with hwh:managed marker
  - id: skill-md
    consumes: spec
    output_path: dist/codegen/skills/<id>/SKILL.md
    description: Skill in Claude Code format with hwh:managed marker
  - id: diagnostics-json
    consumes: graph
    output_path: dist/diagnostics.json
    description: Watch-mode diagnostic snapshot for editor integrations
commands:
  - name: lint
    description: 3-layer validation (schema, structural, cross-ref) with human or json output.
    args:
      - name: path
        required: true
        description: spec file or directory
    flags:
      - name: --json
        takes_value: false
  - name: build
    description: Emit dist/registry + dist/types and optional codegen.
    args:
      - name: path
        required: true
        description: spec dir to build
    flags:
      - name: --codegen
        takes_value: false
      - name: --force
        takes_value: false
  - name: new
    description: Scaffold a spec template for any kind.
    args:
      - name: kind
        required: true
        description: one of agent/skill/flow/entity/harness/ralph/project
      - name: id
        required: true
        description: kebab-case id
    flags:
      - name: --force
        takes_value: false
  - name: watch
    description: Re-lint on .spec.md change, write dist/diagnostics.json.
    args:
      - name: path
        required: true
        description: spec dir to watch
    flags:
      - name: --debounce-ms
        takes_value: true
  - name: apply
    description: Idempotent write of dist/codegen/* to ~/.claude/. Default dry-run.
    flags:
      - name: --apply
        takes_value: false
  - name: doctor
    description: Drift detection between specs and ~/.claude/{agents,skills}.
    args:
      - name: path
        required: false
        description: spec dir (defaults to specs/lib/)
  - name: wave
    description: Read SDD wave state, show progress, plan next move.
    args:
      - name: subcommand
        required: false
        description: status | next | tick (default status)
  - name: canonicalize
    description: Render each spec from its semantic model and assert idempotence (fixed point of parse∘render).
    args:
      - name: path
        required: true
        description: spec file or directory
    flags:
      - name: --check
        takes_value: false
      - name: --write
        takes_value: false
waves_state_file: .wave/state.json
---

# yhwh — Y · Hydrate · Weave · Hatch

## Mission

A self-referential build model. Author markdown specs (`Hydrate`); the engine validates and weaves them into a graph (`Weave`); the graph hatches into typed TS, registries, and Claude Code artefacts (`Hatch`). The compiler types itself (`Y`, the metacircular fixed point — proved byte-stable in `docs/SELF-HOST-PROOF.md`). Spec is the source of truth. CLI binary: `hwh`.

## Architecture (current)

```mermaid
flowchart LR
  S[*.spec.md] --> P[parse]
  P --> Z[zod schemas]
  Z --> G[graph + cross-refs]
  G --> E[emit registry / types / codegen]
  G --> H[husky pre-commit gate]
```

## SDD workflow

This project uses spec-driven development with **waves**. Single canonical spec (this file). Wave list lives in `.wave/state.json`. Per-wave progress checklist in `.wave/wave-<N>-progress.md`. Findings appended in `.wave/findings/`.

Wave loop, manual today (native CLI later):

1. `hwh wave status` — list waves, current = first not done
2. Read `.wave/wave-<N>-progress.md`, work item-by-item
3. Tick `[ ]` → `[x]` as each acceptance criterion ships
4. When all ticked: validate, run E2E, mark wave `done` in `state.json`, commit `feat(wave-<N>): <name>`
5. `hwh wave next` — bootstrap next wave's progress file

## What's done (Phases 0–8)

Bootstrap, parse, agent/skill/flow/entity/harness/ralph schemas, mermaid mini-AST, 9 cross-rules, registry+types+codegen, husky gate, GitHub Actions, `hwh new/watch/apply/doctor`, entity invariants DSL.

## What's next

This file is the canonical anchor; waves are tracked in `.wave/state.json`.

## Invariants

1. The SemanticModel is the only contract between parser and generators.
2. Canonical form is a fixed point of `parse ∘ render` (target after wave 2).
3. Refs are typed by kind in TypeScript.
4. Predicates are the only handwritten primitives.
5. Diagnostics carry source ranges.
6. `_bootstrap/` exists from wave 6 and is removable without test breakage at `bootstrap-complete` tag.
