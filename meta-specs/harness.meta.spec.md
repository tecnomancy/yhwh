---
kind: meta-spec
id: harness
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Harness specs (meta) orchestrate skills and gate flows on a cron schedule with a state file.
target_kind: harness
fields:
  - name: description
    type: string
    required: true
    description: One-line harness description (10+ chars).
  - name: cron
    type: string
    required: false
    description: Optional cron expression. If absent, harness is invoked manually.
  - name: dispatches
    type:
      array: kebab-id
    required: true
    description: Skill ids dispatched on each tick. At least one. Each must be user_invocable.
  - name: state_file
    type: string
    required: true
    description: Path to the file the harness reads/writes for tick state.
  - name: gates
    type:
      array: kebab-id
    required: false
    description: Flow ids whose canonical state determines pass/fail of the harness.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: description_long
cross_refs:
  - rule_id: cross/harness-skill-not-found
    description: Every dispatched skill id must resolve to a registered skill.
    source:
      kind: harness
      field: dispatches
    target:
      kind: skill
      field: id
    level: error
  - rule_id: cross/harness-dispatch-not-invocable
    description: "A dispatched skill must have user_invocable: true."
    source:
      kind: harness
      field: dispatches
    target:
      kind: skill
      field: id
    level: warning
examples:
  - id: hwh-ci
    raw: specs/__fixtures__/good/harness.hwh-ci.spec.md
---

# Harness meta-spec

Harnesses are the meta-layer: they describe automation that *runs* skills. The `state_file` decouples the harness from where ticks persist, so multiple harnesses can run in parallel without colliding.
